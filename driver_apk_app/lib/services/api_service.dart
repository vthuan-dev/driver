import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/driver.dart';
import '../models/request.dart';
import '../models/user.dart';
import '../utils/provinces.dart';

/// API Service for communicating with backend
class ApiService {
  static const String baseUrl = 'https://180-93-35-55.sslip.io/api';
  
  String? _token;
  
  void setToken(String? token) {
    _token = token;
  }

  /// Check registration status by phone
  Future<Map<String, dynamic>> checkUserStatus(String phone) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/status/$phone'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        return {'success': true, ...jsonDecode(response.body)};
      }
      return {'success': false, 'message': 'Không tìm thấy tài khoản'};
    } catch (e) {
      return {'success': false, 'message': 'Lỗi kết nối: $e'};
    }
  }
  
  Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }
  
  // ========== AUTH ==========
  
  Future<Map<String, dynamic>> register({
    required String name,
    required String phone,
    required String password,
    required String carType,
    required String carYear,
  }) async {
    print('DEBUG: ApiService.register calling API for $phone');
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'password': password,
        'carType': carType,
        'carYear': carYear,
      }),
    ).timeout(const Duration(seconds: 15));
    
    Map<String, dynamic> data;
    try {
      data = jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Lỗi server (Invalid JSON)'};
    }

    if (response.statusCode == 201) {
      return {'success': true, 'user': User.fromJson(data['user'])};
    }
    
    final message = data['message'] ?? data['error'] ?? 'Lỗi đăng ký';
    return {'success': false, 'message': message};
  }
  
  /// Login user
  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  }) async {
    try {
      final url = '$baseUrl/auth/login';
      print('DEBUG: [ApiService] URL: $url');
      print('DEBUG: [ApiService] Payload: {"phone": "$phone", "password": "..." }');
      
      final response = await http.post(
        Uri.parse(url),
        headers: _headers,
        body: jsonEncode({
          'phone': phone,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 15));
      
      print('DEBUG: [ApiService] Status Code: ${response.statusCode}');
      print('DEBUG: [ApiService] Raw Body: ${response.body}');
      
      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body);
      } catch (e) {
        print('DEBUG: [ApiService] JSON Decode Error: $e');
        return {'success': false, 'message': 'Server error: Invalid response format'};
      }

      if (response.statusCode == 200) {
        _token = data['token'];
        print('DEBUG: [ApiService] Login successful, token received');
        return {
          'success': true,
          'token': data['token'],
          'user': User.fromJson(data['user']),
        };
      }
      
      final message = data['message'] ?? data['error'] ?? 'Lỗi không xác định (${response.statusCode})';
      print('DEBUG: [ApiService] Returning error message: $message');
      return {'success': false, 'message': message};
    } catch (e) {
      print('DEBUG: ApiService.login request failed: $e');
      return {'success': false, 'message': 'Lỗi kết nối hoặc hết thời gian'};
    }
  }
  
  // ========== DRIVERS ==========
  
  /// Get list of drivers, optionally filtered by region
  Future<List<Driver>> getDrivers({Region? region}) async {
    String url = '$baseUrl/drivers';
    if (region != null) {
      url += '?region=${region.name}';
    }
    
    try {
      print('DEBUG: getDrivers calling $url');
      print('DEBUG: Region filter: ${region?.name ?? 'all'}');
      
      final response = await http.get(
        Uri.parse(url), 
        headers: _headers
      ).timeout(const Duration(seconds: 15));
      
      print('DEBUG: getDrivers response status: ${response.statusCode}');
      print('DEBUG: getDrivers response body: ${response.body}');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Handle both {drivers: [...]} and direct array [...]
        List<dynamic> driversJson;
        if (data is List) {
          driversJson = data;
        } else {
          driversJson = data['drivers'] ?? data['data'] ?? [];
        }
        print('DEBUG: Raw drivers count: ${driversJson.length}');
        
        if (driversJson.isEmpty) {
          print('DEBUG: No drivers returned from API for region: ${region?.name ?? 'all'}');
          return [];
        }
        
        final drivers = driversJson.map((json) {
          print('DEBUG: Driver JSON: ${json['name']} - region: ${json['region']}');
          return Driver.fromJson(json);
        }).toList();
        
        print('DEBUG: Successfully parsed ${drivers.length} drivers');
        
        // Debug region distribution
        final regionCounts = <String, int>{};
        for (final driver in drivers) {
          final regionName = driver.region.name;
          regionCounts[regionName] = (regionCounts[regionName] ?? 0) + 1;
        }
        print('DEBUG: Drivers by region: $regionCounts');
        
        return drivers;
      } else {
        print('DEBUG: getDrivers failed with status ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('DEBUG: getDrivers error: $e');
      return [];
    }
  }
  
  // ========== REQUESTS ==========
  
  /// Get all ride requests with pagination
  Future<Map<String, dynamic>> getRequests({
    String? status, 
    int? limit, 
    int page = 1,
    String? region
  }) async {
    String url = '$baseUrl/requests';
    final params = <String>[];
    if (status != null) params.add('status=$status');
    if (limit != null) params.add('limit=$limit');
    if (page > 1) params.add('page=$page');
    if (region != null) params.add('region=$region');
    if (params.isNotEmpty) {
      url += '?${params.join('&')}';
    }
    
    try {
      print('DEBUG: getRequests calling $url');
      final response = await http.get(
        Uri.parse(url), 
        headers: _headers
      ).timeout(const Duration(seconds: 15));
      
      print('DEBUG: getRequests response status: ${response.statusCode}');
      print('DEBUG: getRequests response body length: ${response.body.length}');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Handle pagination response
        if (data is Map && data.containsKey('requests')) {
          final requestsJson = data['requests'] as List<dynamic>;
          final requests = requestsJson.map((json) => RideRequest.fromJson(json)).toList();
          
          return {
            'requests': requests,
            'totalCount': data['totalCount'] ?? requests.length,
            'currentPage': data['currentPage'] ?? page,
            'totalPages': data['totalPages'] ?? 1,
            'hasMore': data['hasMore'] ?? false,
          };
        } else {
          // Fallback for direct array response
          List<dynamic> requestsJson = data is List ? data : [];
          final requests = requestsJson.map((json) => RideRequest.fromJson(json)).toList();
          
          return {
            'requests': requests,
            'totalCount': requests.length,
            'currentPage': 1,
            'totalPages': 1,
            'hasMore': false,
          };
        }
      } else {
        print('DEBUG: getRequests failed with status ${response.statusCode}');
        return {
          'requests': <RideRequest>[],
          'totalCount': 0,
          'currentPage': 1,
          'totalPages': 1,
          'hasMore': false,
        };
      }
    } catch (e) {
      print('DEBUG: getRequests error: $e');
      return {
        'requests': <RideRequest>[],
        'totalCount': 0,
        'currentPage': 1,
        'totalPages': 1,
        'hasMore': false,
      };
    }
  }
  
  /// Create new ride request
  Future<Map<String, dynamic>> createRequest({
    required String name,
    required String phone,
    required String startPoint,
    required String endPoint,
    required int price,
    String? note,
    required Region region,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/requests'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'startPoint': startPoint,
        'endPoint': endPoint,
        'price': price,
        'note': note,
        'region': region.name,
      }),
    );
    
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) {
      return {'success': true, 'request': RideRequest.fromJson(data['request'])};
    }
    return {'success': false, 'message': data['message'] ?? 'Lỗi tạo yêu cầu'};
  }
  
  /// Get current user's requests
  Future<List<RideRequest>> getMyRequests() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/requests/my-requests'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> requestsJson = data['requests'] ?? [];
        return requestsJson.map((json) => RideRequest.fromJson(json)).toList();
      }
    } catch (e) {
      print('DEBUG: getMyRequests error: $e');
    }
    return [];
  }

  // ========== FAKE NOTIFICATIONS ==========

  /// Get fake notifications for driver (requires auth token)
  Future<Map<String, dynamic>> getFakeNotifications({required String region}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/driver/fake-notifications?region=$region'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data['data'] ?? [],
          'settings': data['settings'] ?? {'minInterval': 15, 'maxInterval': 30},
        };
      }
      return {'success': false, 'data': [], 'settings': {}};
    } catch (e) {
      print('DEBUG: getFakeNotifications error: $e');
      return {'success': false, 'data': [], 'settings': {}};
    }
  }

  /// Accept fake notification (always returns error - it's fake)
  Future<Map<String, dynamic>> acceptFakeNotification(String id) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/driver/fake-notifications/$id/accept'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 200,
        'message': data['message'] ?? 'Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo',
      };
    } catch (e) {
      return {'success': false, 'message': 'Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo'};
    }
  }
}

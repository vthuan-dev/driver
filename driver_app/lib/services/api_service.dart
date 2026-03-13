import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/driver.dart';
import '../models/request.dart';
import '../models/user.dart';
import '../utils/provinces.dart';

/// API Service for communicating with backend
class ApiService {
  static const String baseUrl = 'https://driver-ahv6.onrender.com/api';
  
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
      final response = await http.get(Uri.parse(url), headers: _headers);
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
        print('DEBUG: Found ${driversJson.length} drivers');
        return driversJson.map((json) => Driver.fromJson(json)).toList();
      }
    } catch (e) {
      print('DEBUG: getDrivers error: $e');
    }
    return [];
  }
  
  // ========== REQUESTS ==========
  
  /// Get all ride requests
  Future<List<RideRequest>> getRequests({String? status, int? limit}) async {
    String url = '$baseUrl/requests';
    final params = <String>[];
    if (status != null) params.add('status=$status');
    if (limit != null) params.add('limit=$limit');
    if (params.isNotEmpty) {
      url += '?${params.join('&')}';
    }
    
    try {
      final response = await http.get(Uri.parse(url), headers: _headers);
      print('DEBUG: getRequests response status: ${response.statusCode}');
      print('DEBUG: getRequests response body: ${response.body}');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Handle both {requests: [...]} and direct array [...]
        List<dynamic> requestsJson;
        if (data is List) {
          requestsJson = data;
        } else {
          requestsJson = data['requests'] ?? data['data'] ?? [];
        }
        print('DEBUG: Found ${requestsJson.length} requests');
        return requestsJson.map((json) => RideRequest.fromJson(json)).toList();
      }
    } catch (e) {
      print('DEBUG: getRequests error: $e');
    }
    return [];
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
    final response = await http.get(
      Uri.parse('$baseUrl/requests/my-requests'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> requestsJson = data['requests'] ?? [];
      return requestsJson.map((json) => RideRequest.fromJson(json)).toList();
    }
    return [];
  }
}

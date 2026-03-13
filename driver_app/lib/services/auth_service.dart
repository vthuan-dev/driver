import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import 'api_service.dart';

/// Auth service for managing user authentication state
class AuthService extends ChangeNotifier {
  final ApiService _apiService;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  User? _user;
  String? _token;
  String? _registeredPhone;
  bool _isRegistered = false;
  bool _isLoading = true;
  
  User? get user => _user;
  String? get token => _token;
  String? get registeredPhone => _registeredPhone;
  bool get isLoggedIn => _user != null && _token != null;
  bool get isRegistered => _isRegistered;
  bool get isLoading => _isLoading;
  
  AuthService(this._apiService) {
    _loadStoredAuth();
  }
  
  /// Load stored authentication data
  Future<void> _loadStoredAuth() async {
    try {
      // Add timeout to prevent hanging on emulator
      final token = await _storage.read(key: 'token').timeout(
        const Duration(seconds: 3),
        onTimeout: () => null,
      );
      final userJson = await _storage.read(key: 'user').timeout(
        const Duration(seconds: 3),
        onTimeout: () => null,
      );
      
      if (token != null && userJson != null) {
        _token = token;
        _user = User.fromJson(jsonDecode(userJson));
        _apiService.setToken(token);
        _isRegistered = true;
      } else {
        // Also check for registration flag and phone if not logged in
        final regFlag = await _storage.read(key: 'is_registered').timeout(
          const Duration(seconds: 3),
          onTimeout: () => null,
        );
        _registeredPhone = await _storage.read(key: 'registered_phone').timeout(
          const Duration(seconds: 3),
          onTimeout: () => null,
        );
        _isRegistered = regFlag == 'true';
      }
    } catch (e) {
      debugPrint('Error loading stored auth: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /* 
  Registration is now handled exclusively on the web. 
  The register method is removed to prevent mobile-initiated registration.
  */
  
  /// Login user
  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  }) async {
    final result = await _apiService.login(
      phone: phone,
      password: password,
    );
    
    if (result['success'] == true) {
      _token = result['token'];
      _user = result['user'];
      _isRegistered = true;
      _apiService.setToken(_token);
      
      // Store credentials
      await _storage.write(key: 'token', value: _token);
      await _storage.write(key: 'user', value: jsonEncode(_user!.toJson()));
      await _storage.write(key: 'is_registered', value: 'true');
      await _storage.write(key: 'registered_phone', value: phone);
      
      notifyListeners();
    }
    
    return result;
  }
  
  /// Logout user (full reset)
  Future<void> logout() async {
    _token = null;
    _user = null;
    _registeredPhone = null;
    _isRegistered = false;
    _apiService.setToken(null);
    
    await _storage.deleteAll();
    
    notifyListeners();
  }

  /// Completely clear all local data (for testing or full reset)
  Future<void> clearAll() async {
    await logout();
  }

  /// Manually check registration status
  Future<Map<String, dynamic>> checkStatus() async {
    if (_registeredPhone == null) {
      return {'success': false, 'message': 'Không tìm thấy thông tin đăng ký'};
    }

    final result = await _apiService.checkUserStatus(_registeredPhone!);
    
    if (result['success'] == true) {
      final status = result['status'];
      if (status == 'rejected') {
        _isRegistered = false;
        await _storage.write(key: 'is_registered', value: 'false');
      } else if (status == 'approved') {
        // Status is approved, we can signal the UI but user still needs to login to get token
      }
      notifyListeners();
    }
    
    return result;
  }
}

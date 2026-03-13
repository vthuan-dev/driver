import 'package:flutter/material.dart';
import '../models/driver.dart';
import '../models/request.dart';
import '../services/api_service.dart';
import '../utils/provinces.dart';

class DataProvider extends ChangeNotifier {
  final ApiService apiService;

  List<Driver> _drivers = [];
  List<RideRequest> _requests = [];
  
  bool _isLoading = false;
  DateTime? _lastFetchTime;
  
  // Cache duration: 5 minutes
  static const Duration cacheDuration = Duration(minutes: 5);

  DataProvider({required this.apiService});

  List<Driver> get drivers => _drivers;
  List<RideRequest> get requests => _requests;
  bool get isLoading => _isLoading;

  List<Driver> getFilteredDrivers(Region region) {
    return _drivers.where((d) => d.region == region).toList();
  }

  List<RideRequest> getFilteredRequests(Region region, String? province) {
    var filtered = _requests.where((r) => r.region == region).toList();
    if (province != null) {
      filtered = filtered.where((r) =>
          r.startPoint == province ||
          r.endPoint == province).toList();
    }
    return filtered;
  }

  Future<void> loadData({bool forceRefresh = false}) async {
    // If not force refreshing and cache is still valid, don't fetch
    if (!forceRefresh && _lastFetchTime != null && 
        DateTime.now().difference(_lastFetchTime!) < cacheDuration && 
        _drivers.isNotEmpty) {
      return;
    }

    // Only show loading spinner if it's the first time or a force refresh
    if (_drivers.isEmpty || forceRefresh) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      // Parallel fetch for better performance
      final results = await Future.wait([
        apiService.getDrivers(),
        apiService.getRequests(status: 'waiting'),
      ]);

      _drivers = results[0] as List<Driver>;
      _requests = (results[1] as List<RideRequest>)
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      _lastFetchTime = DateTime.now();
    } catch (e) {
      debugPrint('Error loading data in DataProvider: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Silently refresh data in the background
  Future<void> silentRefresh() async {
    try {
      final results = await Future.wait([
        apiService.getDrivers(),
        apiService.getRequests(status: 'waiting'),
      ]);

      _drivers = results[0] as List<Driver>;
      _requests = (results[1] as List<RideRequest>)
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      _lastFetchTime = DateTime.now();
      notifyListeners();
    } catch (e) {
      debugPrint('Error during silent refresh: $e');
    }
  }
}

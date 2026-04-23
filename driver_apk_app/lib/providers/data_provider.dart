import 'package:flutter/material.dart';
import '../models/driver.dart';
import '../models/request.dart';
import '../services/api_service.dart';
import '../utils/provinces.dart';
import '../utils/avatar_utils.dart';

class DataProvider extends ChangeNotifier {
  final ApiService apiService;

  List<Driver> _drivers = [];
  List<RideRequest> _requests = [];
  
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasMoreRequests = true;
  int _currentPage = 1;
  int _totalCount = 0;
  
  DateTime? _lastFetchTime;
  
  // Cache duration: 5 minutes
  static const Duration cacheDuration = Duration(minutes: 5);
  static const int pageSize = 20; // Load 20 requests per page

  DataProvider({required this.apiService});

  List<Driver> get drivers => _drivers;
  List<RideRequest> get requests => _requests;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  bool get hasMoreRequests => _hasMoreRequests;
  int get totalCount => _totalCount;

  List<Driver> getFilteredDrivers(Region region) {
    print('DEBUG: getFilteredDrivers for region: ${region.name}');
    print('DEBUG: Total drivers: ${_drivers.length}');
    
    final filtered = _drivers.where((d) {
      return d.region == region;
    }).toList();
    
    print('DEBUG: Filtered drivers for ${region.name}: ${filtered.length}');
    
    // If no drivers found and we haven't loaded this region yet, try loading
    if (filtered.isEmpty && !_loadedRegions.contains(region)) {
      _loadDriversForRegion(region);
    }
    
    return filtered;
  }

  final Set<Region> _loadedRegions = {Region.north}; // Track loaded regions

  /// Load drivers for specific region
  Future<void> _loadDriversForRegion(Region region) async {
    if (_loadedRegions.contains(region)) return;
    
    try {
      print('DEBUG: Loading drivers for region: ${region.name}');
      final regionDrivers = await apiService.getDrivers(region: region);
      
      _drivers.addAll(regionDrivers);
      _loadedRegions.add(region);
      
      print('DEBUG: Loaded ${regionDrivers.length} drivers for ${region.name}');
      notifyListeners();
    } catch (e) {
      print('DEBUG: Error loading drivers for ${region.name}: $e');
    }
  }

  List<RideRequest> getFilteredRequests(Region region, String? province) {
    var filtered = _requests.where((r) => r.region == region).toList();
    if (province != null) {
      filtered = filtered.where((r) =>
          r.startPoint.contains(province) ||
          r.endPoint.contains(province)).toList();
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

    // Reset pagination on refresh
    if (forceRefresh) {
      _requests.clear();
      _currentPage = 1;
      _hasMoreRequests = true;
    }

    // Only show loading spinner if it's the first time or a force refresh
    if (_drivers.isEmpty || forceRefresh) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      print('DEBUG: DataProvider.loadData starting...');
      
      // Reset avatar cache for fresh assignment
      AvatarUtils.resetCache();
      
      // Fetch ALL drivers first (API filtering seems not working)
      print('DEBUG: Fetching ALL drivers...');
      _drivers = await apiService.getDrivers(); // No region filter
      print('DEBUG: Got ${_drivers.length} total drivers');
      
      // Fetch first page of requests
      await _loadRequestsPage(1);
      
      _lastFetchTime = DateTime.now();
      print('DEBUG: DataProvider.loadData completed successfully');
    } catch (e) {
      print('DEBUG: Error loading data in DataProvider: $e');
      debugPrint('Error loading data in DataProvider: $e');
    } finally {
      _isLoading = false;
      print('DEBUG: Setting isLoading = false');
      notifyListeners();
    }
  }

  /// Load more requests (pagination)
  Future<void> loadMoreRequests() async {
    if (_isLoadingMore || !_hasMoreRequests) return;

    _isLoadingMore = true;
    notifyListeners();

    try {
      await _loadRequestsPage(_currentPage + 1);
    } catch (e) {
      print('DEBUG: Error loading more requests: $e');
    } finally {
      _isLoadingMore = false;
      notifyListeners();
    }
  }

  /// Internal method to load a specific page
  Future<void> _loadRequestsPage(int page) async {
    print('DEBUG: Loading requests page $page...');
    
    final result = await apiService.getRequests(
      status: 'waiting', 
      limit: pageSize,
      page: page
    );
    
    final newRequests = result['requests'] as List<RideRequest>;
    _totalCount = result['totalCount'] as int;
    _hasMoreRequests = result['hasMore'] as bool;
    _currentPage = result['currentPage'] as int;
    
    if (page == 1) {
      _requests = newRequests;
    } else {
      _requests.addAll(newRequests);
    }
    
    // Sort by date
    _requests.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    print('DEBUG: Loaded ${newRequests.length} requests, total: ${_requests.length}/$_totalCount');
  }

  /// Silently refresh data in the background
  Future<void> silentRefresh() async {
    try {
      final drivers = await apiService.getDrivers();
      
      // Only refresh first page silently
      final result = await apiService.getRequests(
        status: 'waiting', 
        limit: pageSize,
        page: 1
      );
      
      _drivers = drivers;
      
      // Update first page data
      final newRequests = result['requests'] as List<RideRequest>;
      if (newRequests.isNotEmpty) {
        // Replace first page data
        final remainingRequests = _requests.skip(pageSize).toList();
        _requests = [...newRequests, ...remainingRequests];
        _requests.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      }
      
      _lastFetchTime = DateTime.now();
      notifyListeners();
    } catch (e) {
      debugPrint('Error during silent refresh: $e');
    }
  }
}

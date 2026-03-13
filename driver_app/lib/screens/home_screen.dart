import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../config/theme.dart';
import '../models/driver.dart';
import '../models/request.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../utils/provinces.dart';
import '../widgets/auth_box.dart';
import '../widgets/driver_card.dart';
import '../widgets/province_dropdown.dart';
import '../widgets/region_tab_bar.dart';
import '../widgets/request_card.dart';
import '../widgets/login_modal.dart';
import '../widgets/create_request_modal.dart';

/// Home screen - main app screen
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  Region _requestRegion = Region.north;
  Region _driverRegion = Region.north;
  String? _selectedProvince;
  String? _regStatus;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    
    // Schedule data loading after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().loadData();
      _checkRegistrationStatus();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Silently refresh data when user returns to app
      context.read<DataProvider>().silentRefresh();
      _checkRegistrationStatus();
    }
  }

  Future<void> _checkRegistrationStatus() async {
    final authService = context.read<AuthService>();
    if (authService.isRegistered && !authService.isLoggedIn) {
      final result = await authService.checkStatus();
      if (mounted && result['success'] == true) {
        setState(() {
          _regStatus = result['status'];
        });
      }
    }
  }

  void _navigateToLogin() async {
    final authService = context.read<AuthService>();
    await showLoginModal(context, authService);
  }

  void _navigateToCreateRequest() async {
    final apiService = context.read<ApiService>();
    final result = await showCreateRequestModal(context, apiService);
    if (result == true) {
      context.read<DataProvider>().loadData(forceRefresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    
    final user = authService.user;
    final isLoggedIn = authService.isLoggedIn;
    
    final filteredRequests = dataProvider.getFilteredRequests(_requestRegion, _selectedProvince);
    final filteredDrivers = dataProvider.getFilteredDrivers(_driverRegion);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: const Text(
          'Driver App',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 22,
            color: AppColors.primary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          // Subtle notification or menu icon could go here
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textSecondary),
            onPressed: () {},
          ),
        ],
      ),
      body: dataProvider.isLoading && dataProvider.drivers.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: () => dataProvider.loadData(forceRefresh: true),
              color: AppColors.primary,
              child: ListView(
                padding: const EdgeInsets.only(bottom: 100),
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  // Auth box (for non-logged users)
                  if (!isLoggedIn)
                    AuthBox(
                      isRegistered: authService.isRegistered,
                      status: _regStatus,
                      onLoginPressed: _navigateToLogin,
                      onCheckStatus: _checkRegistrationStatus,
                      onReset: () async {
                        await authService.logout();
                        setState(() {
                          _regStatus = null;
                        });
                      },
                    ),

                  // User info card (Premium version)
                  if (isLoggedIn && user != null)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                        border: Border.all(color: Colors.grey.shade100),
                      ),
                      child: Row(
                        children: [
                          // Avatar with pulse effect border
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 2),
                            ),
                            child: CircleAvatar(
                              radius: 28,
                              backgroundColor: AppColors.buttonPressed,
                              child: Text(
                                user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 22,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Name and Phone
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Tài xế',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary.withOpacity(0.7),
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                Text(
                                  user.phone,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textSecondary.withOpacity(0.8),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Logout ghost button
                          Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () async {
                                await authService.logout();
                                setState(() {
                                  _regStatus = null;
                                });
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.red.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.logout_rounded,
                                  color: AppColors.red,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 8),

                  // Requests section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 4,
                              height: 18,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Yêu cầu chờ cuốc xe',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        RegionTabBar(
                          selectedRegion: _requestRegion,
                          onRegionChanged: (region) {
                            setState(() {
                              _requestRegion = region;
                              _selectedProvince = null;
                            });
                          },
                        ),
                        const SizedBox(height: 12),
                        ProvinceDropdown(
                          region: _requestRegion,
                          selectedProvince: _selectedProvince,
                          onChanged: (province) {
                            setState(() => _selectedProvince = province);
                          },
                        ),
                        const SizedBox(height: 12),
                        if (filteredRequests.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(AppRadius.medium),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.info_outline_rounded, color: AppColors.textMuted.withOpacity(0.5), size: 32),
                                const SizedBox(height: 8),
                                Text(
                                  'Chưa có yêu cầu nào trong ${_requestRegion.label}.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: AppColors.textMuted),
                                ),
                              ],
                            ),
                          )
                        else
                          ...filteredRequests.map((r) => RequestCard(
                                request: r,
                                isLoggedIn: isLoggedIn,
                              )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Drivers section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 4,
                              height: 18,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Danh sách tài xế',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        RegionTabBar(
                          selectedRegion: _driverRegion,
                          onRegionChanged: (region) {
                            setState(() => _driverRegion = region);
                          },
                        ),
                        const SizedBox(height: 12),
                        if (filteredDrivers.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(AppRadius.medium),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.people_outline_rounded, color: AppColors.textMuted.withOpacity(0.5), size: 32),
                                const SizedBox(height: 8),
                                const Text(
                                  'Chưa có tài xế trong nhóm này.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppColors.textMuted),
                                ),
                              ],
                            ),
                          )
                        else
                          ...filteredDrivers.map((d) => DriverCard(
                                driver: d,
                                isLoggedIn: isLoggedIn,
                                onCallPressed: isLoggedIn
                                    ? null
                                    : () => _navigateToLogin(),
                              )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: Container(
        width: MediaQuery.of(context).size.width - 32,
        height: 60,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _navigateToCreateRequest,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'ĐĂNG KÝ CHỜ CUỐC XE',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  letterSpacing: 1.1,
                ),
              ),
              SizedBox(width: 8),
              Icon(Icons.arrow_forward_ios_rounded, size: 18),
            ],
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

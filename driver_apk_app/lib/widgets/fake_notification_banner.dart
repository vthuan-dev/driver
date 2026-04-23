import 'dart:async';
import 'package:flutter/material.dart';
import '../models/fake_notification.dart';
import '../services/api_service.dart';
import '../utils/provinces.dart';
import '../config/theme.dart';

/// Fake notification banner for approved drivers
class FakeNotificationBanner extends StatefulWidget {
  final ApiService apiService;
  final Region region;

  const FakeNotificationBanner({
    super.key,
    required this.apiService,
    required this.region,
  });

  @override
  State<FakeNotificationBanner> createState() => _FakeNotificationBannerState();
}

class _FakeNotificationBannerState extends State<FakeNotificationBanner> {
  FakeNotification? _currentNotification;
  Timer? _fetchTimer;
  Timer? _hideTimer;
  bool _isAccepting = false;
  bool _showError = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  @override
  void didUpdateWidget(FakeNotificationBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Re-fetch when region changes
    if (oldWidget.region != widget.region) {
      _fetchTimer?.cancel();
      _hideTimer?.cancel();
      setState(() => _currentNotification = null);
      _fetchNotifications();
    }
  }

  @override
  void dispose() {
    _fetchTimer?.cancel();
    _hideTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchNotifications() async {
    try {
      final result = await widget.apiService.getFakeNotifications(
        region: widget.region.name,
      );

      if (!mounted) return;

      final List<dynamic> data = result['data'] ?? [];
      if (data.isNotEmpty) {
        final notifications = data.map((j) => FakeNotification.fromJson(j)).toList();
        notifications.shuffle();
        setState(() => _currentNotification = notifications.first);

        // Auto-hide after 30 seconds
        _hideTimer?.cancel();
        _hideTimer = Timer(const Duration(seconds: 30), () {
          if (mounted) setState(() => _currentNotification = null);
        });
      }

      // Schedule next fetch
      final settings = result['settings'] ?? {};
      final minInterval = (settings['minInterval'] ?? 15) as int;
      final maxInterval = (settings['maxInterval'] ?? 30) as int;
      final randomMinutes = minInterval + (DateTime.now().millisecond % (maxInterval - minInterval + 1));

      _fetchTimer?.cancel();
      _fetchTimer = Timer(Duration(minutes: randomMinutes), _fetchNotifications);
    } catch (e) {
      debugPrint('FakeNotificationBanner error: $e');
    }
  }

  Future<void> _accept() async {
    if (_currentNotification == null) return;
    setState(() => _isAccepting = true);

    final result = await widget.apiService.acceptFakeNotification(_currentNotification!.id);

    if (!mounted) return;
    setState(() {
      _isAccepting = false;
      _currentNotification = null;
      _errorMessage = result['message'] ?? 'Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo';
      _showError = true;
    });

    // Auto-hide error after 4 seconds
    Timer(const Duration(seconds: 4), () {
      if (mounted) setState(() => _showError = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showError) {
      return _buildErrorBanner();
    }
    if (_currentNotification == null) return const SizedBox.shrink();
    return _buildNotificationCard(_currentNotification!);
  }

  Widget _buildNotificationCard(FakeNotification notif) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.06),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                const Text('🔔', style: TextStyle(fontSize: 18)),
                const SizedBox(width: 8),
                const Text(
                  'Cuốc xe dành riêng cho bạn',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Text(
                  '🕐 ${notif.displayTime}',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '🚗 Có tài xế bắn cuốc ${notif.carType} chỗ',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${notif.startPoint} → ${notif.endPoint}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  notif.formattedPrice,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.red,
                  ),
                ),

                // Note (if exists)
                if (notif.note != null && notif.note!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEA),
                      borderRadius: BorderRadius.circular(8),
                      border: const Border(
                        left: BorderSide(color: Color(0xFFF39C12), width: 3),
                      ),
                    ),
                    child: Text(
                      '📝 ${notif.note}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF7D6608),
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // Accept button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isAccepting ? null : _accept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _isAccepting ? 'Đang xử lý...' : 'Nhận chuyến ngay',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.red.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.red.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Text('⚠️', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage,
              style: const TextStyle(
                color: AppColors.red,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, color: AppColors.red, size: 18),
            onPressed: () => setState(() => _showError = false),
          ),
        ],
      ),
    );
  }
}

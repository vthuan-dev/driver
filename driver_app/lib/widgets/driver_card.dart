import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../models/driver.dart';
import '../utils/phone_mask.dart';

/// Driver card widget
class DriverCard extends StatelessWidget {
  final Driver driver;
  final bool isLoggedIn;
  final VoidCallback? onCallPressed;

  const DriverCard({
    super.key,
    required this.driver,
    this.isLoggedIn = false,
    this.onCallPressed,
  });

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return 'TX';
    final first = parts[0].isNotEmpty ? parts[0][0] : '';
    final last = parts.length > 1 && parts.last.isNotEmpty ? parts.last[0] : '';
    return (first + last).toUpperCase();
  }

  Future<void> _makeCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16, left: 16, right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        children: [
          // Avatar with premium border
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primary.withOpacity(0.1), width: 2),
            ),
            child: CircleAvatar(
              radius: 26,
              backgroundColor: AppColors.buttonPressed,
              child: driver.avatar != null && driver.avatar!.isNotEmpty
                  ? ClipOval(
                      child: Image.network(
                        driver.avatar!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildInitialAvatar(),
                      ),
                    )
                  : _buildInitialAvatar(),
            ),
          ),
          const SizedBox(width: 16),
          
          // Driver Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  maskPhone(driver.phone, isLoggedIn: isLoggedIn),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.directions_car_filled_rounded, size: 14, color: AppColors.primary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        driver.route,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary.withOpacity(0.8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Call Button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                if (onCallPressed != null) {
                  onCallPressed!();
                } else if (isLoggedIn) {
                  _makeCall(driver.phone);
                }
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.phone_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInitialAvatar() {
    return Text(
      _getInitials(driver.name),
      style: const TextStyle(
        color: AppColors.primary,
        fontWeight: FontWeight.w900,
        fontSize: 16,
      ),
    );
  }
}

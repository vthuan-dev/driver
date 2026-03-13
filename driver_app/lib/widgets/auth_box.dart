import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Auth promotion box (for non-logged users)
class AuthBox extends StatelessWidget {
  final bool isRegistered;
  final String? status;
  final VoidCallback onLoginPressed;
  final VoidCallback? onCheckStatus;
  final VoidCallback? onReset;

  const AuthBox({
    super.key,
    this.isRegistered = false,
    this.status,
    required this.onLoginPressed,
    this.onCheckStatus,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    String title = isRegistered ? '⏳ Đang chờ phê duyệt' : '🚗 Tham gia nhóm tài xế';
    String subtitle = isRegistered
        ? 'Tài khoản của bạn đang được admin xem xét'
        : 'Hãy đăng nhập để tiếp tục. Nếu chưa có tài khoản, vui lòng đăng ký trên trang web.';
    
    if (isRegistered && status == 'approved') {
      title = '✅ Tài khoản đã được duyệt';
      subtitle = 'Chào mừng bạn! Hãy đăng nhập để bắt đầu';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.primary.withBlue(150), // Subtle shift
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.35),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Status Check / Reset Button
          if (isRegistered)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      if (status != 'approved' && onCheckStatus != null) ...[
                        GestureDetector(
                          onTap: onCheckStatus,
                          child: const Row(
                            children: [
                              Icon(Icons.refresh_rounded, color: Colors.white, size: 14),
                              SizedBox(width: 4),
                              Text(
                                'Cập nhật',
                                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        if (onReset != null) ...[
                          const SizedBox(width: 8),
                          Container(width: 1, height: 10, color: Colors.white.withOpacity(0.2)),
                          const SizedBox(width: 8),
                        ],
                      ],
                      if (onReset != null)
                        GestureDetector(
                          onTap: onReset,
                          child: Row(
                            children: [
                              const Icon(Icons.delete_forever_rounded, color: Colors.white, size: 14),
                              if (status == 'approved') ...[
                                const SizedBox(width: 4),
                                const Text(
                                  'Làm lại',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          
          const SizedBox(height: 8),
          // Icon or Illustration could go here
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isRegistered ? Icons.access_time_filled_rounded : Icons.local_taxi_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          // Title
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          // Subtitle
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.85),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 24),
          // Buttons
          Row(
            children: [
              // Login button
              Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: onLoginPressed,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Text(
                        'ĐĂNG NHẬP',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

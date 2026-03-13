import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/auth_service.dart';

/// Show login modal
Future<bool?> showLoginModal(BuildContext context, AuthService authService) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => LoginModal(authService: authService),
  );
}

/// Login modal widget
class LoginModal extends StatefulWidget {
  final AuthService authService;

  const LoginModal({super.key, required this.authService});

  @override
  State<LoginModal> createState() => _LoginModalState();
}

class _LoginModalState extends State<LoginModal> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() => _isLoading = true);

    try {
      debugPrint('DEBUG: LoginModal starting login...');
      final result = await widget.authService.login(
        phone: _phoneController.text.trim(),
        password: _passwordController.text,
      ).timeout(const Duration(seconds: 16));

      debugPrint('DEBUG: LoginModal result: $result');
      
      if (!mounted) return;
      
      setState(() => _isLoading = false);

      if (result['success'] == true) {
        // Show success message BEFORE closing modal
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đăng nhập thành công!'),
            backgroundColor: AppColors.primary,
            duration: Duration(seconds: 2),
          ),
        );
        // Wait a bit for animation then close
        await Future.delayed(const Duration(milliseconds: 300));
        if (mounted) Navigator.pop(context, true);
      } else {
        final message = result['message'] ?? 'Lỗi đăng nhập';
        debugPrint('DEBUG: Login failed showing dialog with message: $message');
        // Use Dialog instead of SnackBar in modal for better visibility
        if (mounted) {
          showDialog(
            context: context,
            useRootNavigator: true,
            builder: (context) => AlertDialog(
              title: const Text('Thông báo'),
              content: Text(message),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Đóng'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('DEBUG: LoginModal caught exception: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        showDialog(
          context: context,
          useRootNavigator: true,
          builder: (context) => AlertDialog(
            title: const Text('Lỗi kết nối'),
            content: Text(e.toString()),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Đóng'),
              ),
            ],
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Đăng nhập',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                    color: AppColors.textSecondary,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Phone
              Text(
                'Số điện thoại',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  hintText: '0901234567',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập số điện thoại';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Password
              Text(
                'Mật khẩu',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  hintText: '••••••',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập mật khẩu';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              // Submit button
              ElevatedButton(
                onPressed: _isLoading ? null : _login,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Đăng nhập',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

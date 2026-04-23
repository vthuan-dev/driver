import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/api_service.dart';
import '../utils/provinces.dart';

/// Show create request modal
Future<bool?> showCreateRequestModal(BuildContext context, ApiService apiService) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => CreateRequestModal(apiService: apiService),
  );
}

/// Create ride request modal
class CreateRequestModal extends StatefulWidget {
  final ApiService apiService;

  const CreateRequestModal({super.key, required this.apiService});

  @override
  State<CreateRequestModal> createState() => _CreateRequestModalState();
}

class _CreateRequestModalState extends State<CreateRequestModal> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _priceController = TextEditingController();
  final _noteController = TextEditingController();

  Region _selectedRegion = Region.north;
  String? _startPoint;
  String? _endPoint;
  bool _isLoading = false;

  Future<void> _createRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startPoint == null || _endPoint == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn điểm đi và điểm đến'),
          backgroundColor: AppColors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final price = int.tryParse(
            _priceController.text.replaceAll(RegExp(r'[^0-9]'), '')) ??
        0;

    final result = await widget.apiService.createRequest(
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      startPoint: _startPoint!,
      endPoint: _endPoint!,
      price: price,
      note: _noteController.text.trim(),
      region: _selectedRegion,
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (result['success'] == true) {
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã tạo yêu cầu thành công!'),
          backgroundColor: AppColors.primary,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Lỗi tạo yêu cầu'),
          backgroundColor: AppColors.red,
        ),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _priceController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provinces = provincesByRegion[_selectedRegion] ?? [];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Styled Header like Web
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFE9FBF0), // Light green background
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Đăng ký chờ cuốc xe',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF007F3B), // Dark green text
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Icon(
                    Icons.close_rounded,
                    size: 20,
                    color: Color(0xFF007F3B),
                  ),
                ),
              ],
            ),
          ),
          
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Họ và tên
                    _buildFieldLabel('Họ và tên'),
                    TextFormField(
                      controller: _nameController,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      decoration: _buildInputDecoration('VD: Nguyễn Văn A'),
                      validator: (v) => v?.isEmpty == true ? 'Vui lòng nhập họ tên' : null,
                    ),
                    const SizedBox(height: 16),

                    // Số điện thoại
                    _buildFieldLabel('Số điện thoại'),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      decoration: _buildInputDecoration('VD: 09xxxxxxxx'),
                      validator: (v) => v?.isEmpty == true ? 'Vui lòng nhập số điện thoại' : null,
                    ),
                    const SizedBox(height: 16),

                    // Miền đăng ký (Dropdown instead of tabs to match web)
                    _buildFieldLabel('Miền đăng ký'),
                    DropdownButtonFormField<Region>(
                      value: _selectedRegion,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                      decoration: _buildInputDecoration('Chọn miền'),
                      items: Region.values.map((r) => DropdownMenuItem(
                        value: r, 
                        child: Text(r.label),
                      )).toList(),
                      onChanged: (v) {
                        if (v != null) {
                          setState(() {
                            _selectedRegion = v;
                            _startPoint = null;
                            _endPoint = null;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    // Start & End Points in a Row
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildFieldLabel('Điểm xuất phát'),
                              DropdownButtonFormField<String>(
                                value: _startPoint,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                                decoration: _buildInputDecoration('Chọn tỉnh/thành'),
                                items: provinces.map((p) => DropdownMenuItem(
                                  value: p, 
                                  child: Text(p, style: const TextStyle(fontSize: 13)),
                                )).toList(),
                                onChanged: (v) => setState(() => _startPoint = v),
                                validator: (v) => v == null ? 'Vui lòng chọn' : null,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildFieldLabel('Điểm đến'),
                              DropdownButtonFormField<String>(
                                value: _endPoint,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                                decoration: _buildInputDecoration('Chọn tỉnh/thành'),
                                items: provinces.where((p) => p != _startPoint).map((p) => DropdownMenuItem(
                                  value: p, 
                                  child: Text(p, style: const TextStyle(fontSize: 13)),
                                )).toList(),
                                onChanged: (v) => setState(() => _endPoint = v),
                                validator: (v) => v == null ? 'Vui lòng chọn' : null,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Giá dự kiến
                    _buildFieldLabel('Giá dự kiến (VND)'),
                    TextFormField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      decoration: _buildInputDecoration('VD: 800000'),
                      validator: (v) {
                        if (v?.isEmpty == true) return 'Vui lòng nhập giá';
                        final price = int.tryParse(v!.replaceAll(RegExp(r'[^0-9]'), ''));
                        if (price == null || price <= 0) return 'Giá không hợp lệ';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Ghi chú
                    _buildFieldLabel('Ghi chú'),
                    TextFormField(
                      controller: _noteController,
                      maxLines: 4,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      decoration: _buildInputDecoration('Giờ giấc, loại xe...'),
                    ),
                    const SizedBox(height: 32),

                    // Submit Button
                    Container(
                      height: 54,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.2),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _createRequest,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text(
                                'GỬI ĐĂNG KÝ',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 15,
                                  letterSpacing: 0.5,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFFA0AEC0), fontSize: 13, fontWeight: FontWeight.w400),
      fillColor: Colors.white,
      filled: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
      ),
    );
  }

  Widget _buildFieldLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6, left: 2),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF4A5568),
        ),
      ),
    );
  }
}

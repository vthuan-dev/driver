import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../utils/provinces.dart';

/// Province dropdown selector
class ProvinceDropdown extends StatelessWidget {
  final Region region;
  final String? selectedProvince;
  final ValueChanged<String?> onChanged;

  const ProvinceDropdown({
    super.key,
    required this.region,
    required this.selectedProvince,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final provinces = provincesByRegion[region] ?? [];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(AppRadius.medium),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String?>(
          value: selectedProvince,
          isExpanded: true,
          hint: Text('Tất cả tỉnh/thành (${region.label})'),
          icon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
          items: [
            DropdownMenuItem<String?>(
              value: null,
              child: Text('Tất cả tỉnh/thành (${region.label})'),
            ),
            ...provinces.map((province) => DropdownMenuItem<String>(
                  value: province,
                  child: Text(province),
                )),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }
}

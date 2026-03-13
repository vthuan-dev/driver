import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../utils/provinces.dart';

/// Region tab bar for switching between North, Central, South
class RegionTabBar extends StatelessWidget {
  final Region selectedRegion;
  final ValueChanged<Region> onRegionChanged;

  const RegionTabBar({
    super.key,
    required this.selectedRegion,
    required this.onRegionChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: Region.values.map((region) {
        final isActive = region == selectedRegion;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              left: region == Region.north ? 0 : 4,
              right: region == Region.south ? 0 : 4,
            ),
            child: GestureDetector(
              onTap: () => onRegionChanged(region),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary : AppColors.divider,
                  borderRadius: BorderRadius.circular(AppRadius.medium),
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.2),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          )
                        ]
                      : null,
                ),
                child: Text(
                  region.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: isActive ? Colors.white : AppColors.textPrimary,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

import '../utils/provinces.dart';

/// Driver model
class Driver {
  final String id;
  final String name;
  final String phone;
  final String route;
  final String? avatar;
  final Region region;
  final bool isActive;
  final DateTime createdAt;

  Driver({
    required this.id,
    required this.name,
    required this.phone,
    required this.route,
    this.avatar,
    required this.region,
    required this.isActive,
    required this.createdAt,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      route: json['route'] ?? '',
      avatar: json['avatar'],
      region: Region.fromString(json['region'] ?? 'north'),
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}

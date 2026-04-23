import '../utils/provinces.dart';

/// Fake notification model
class FakeNotification {
  final String id;
  final Region region;
  final String startPoint;
  final String endPoint;
  final String displayTime;
  final String carType;
  final int price;
  final String? note;
  final bool isActive;

  FakeNotification({
    required this.id,
    required this.region,
    required this.startPoint,
    required this.endPoint,
    required this.displayTime,
    required this.carType,
    required this.price,
    this.note,
    required this.isActive,
  });

  factory FakeNotification.fromJson(Map<String, dynamic> json) {
    return FakeNotification(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      region: Region.fromString(json['region'] ?? 'north'),
      startPoint: json['startPoint'] ?? '',
      endPoint: json['endPoint'] ?? '',
      displayTime: json['displayTime'] ?? '08:00',
      carType: json['carType']?.toString() ?? '7',
      price: json['price'] is int ? json['price'] : int.tryParse(json['price']?.toString() ?? '0') ?? 0,
      note: json['note'],
      isActive: json['isActive'] ?? true,
    );
  }

  String get formattedPrice {
    return '${price.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        )}đ';
  }
}

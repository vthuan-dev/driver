import '../utils/provinces.dart';

/// Ride request model
class RideRequest {
  final String id;
  final String? userId;
  final String name;
  final String phone;
  final String startPoint;
  final String endPoint;
  final int price;
  final String? note;
  final String status;
  final Region region;
  final DateTime createdAt;

  RideRequest({
    required this.id,
    this.userId,
    required this.name,
    required this.phone,
    required this.startPoint,
    required this.endPoint,
    required this.price,
    this.note,
    required this.status,
    required this.region,
    required this.createdAt,
  });

  factory RideRequest.fromJson(Map<String, dynamic> json) {
    // userId can be null, string, or an object with _id
    String? userId;
    if (json['userId'] != null) {
      if (json['userId'] is String) {
        userId = json['userId'];
      } else if (json['userId'] is Map) {
        userId = json['userId']['_id']?.toString();
      }
    }
    
    return RideRequest(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userId: userId,
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      startPoint: json['startPoint']?.toString() ?? '',
      endPoint: json['endPoint']?.toString() ?? '',
      price: json['price'] is int ? json['price'] : int.tryParse(json['price']?.toString() ?? '0') ?? 0,
      note: json['note']?.toString(),
      status: json['status']?.toString() ?? 'waiting',
      region: Region.fromString(json['region']?.toString() ?? 'north'),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'startPoint': startPoint,
      'endPoint': endPoint,
      'price': price,
      'note': note,
      'region': region.name,
    };
  }

  /// Format price for display
  String get formattedPrice {
    return '${price.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        )} VND';
  }
}

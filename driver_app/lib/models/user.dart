/// User model
class User {
  final String id;
  final String name;
  final String phone;
  final String carType;
  final String carYear;
  final String? carImage;
  final String status;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.carType,
    required this.carYear,
    this.carImage,
    required this.status,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      carType: json['carType'] ?? '',
      carYear: json['carYear'] ?? '',
      carImage: json['carImage'],
      status: json['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'carType': carType,
      'carYear': carYear,
      'carImage': carImage,
      'status': status,
    };
  }
}

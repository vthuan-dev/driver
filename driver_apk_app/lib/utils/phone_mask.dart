/// Phone number utilities

/// Mask phone number for privacy (for non-logged users)
/// Shows first 3 digits + xxxx + last 3 digits
String maskPhone(String phone, {bool isLoggedIn = false}) {
  if (isLoggedIn) return phone;
  if (phone.length >= 10) {
    final first3 = phone.substring(0, 3);
    final last3 = phone.substring(phone.length - 3);
    return '$first3 xxxx $last3';
  }
  return phone;
}

/// Format phone number for display (with spaces)
String formatPhone(String phone) {
  if (phone.length == 10) {
    return '${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}';
  }
  return phone;
}

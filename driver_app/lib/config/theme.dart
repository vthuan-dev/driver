import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// App color palette based on design system
class AppColors {
  // Primary - Green
  static const primary = Color(0xFF00B14F);
  static const primaryDark = Color(0xFF0A8F43);
  static const primaryLight = Color(0xFF007F3B);

  // Background
  static const background = Color(0xFFF6F7F8);
  static const surface = Color(0xFFFFFFFF);
  static const cardBg = Color(0xFFFFFFFF);

  // Text
  static const textPrimary = Color(0xFF111827);
  static const textSecondary = Color(0xFF5B6B72);
  static const textMuted = Color(0xFF64748B);
  static const textDark = Color(0xFF334155);

  // Accent
  static const amber = Color(0xFFF59E0B);
  static const amberDark = Color(0xFFFBBF24);
  static const red = Color(0xFFEF4444);
  static const redDark = Color(0xFFDC2626);

  // Borders & Dividers
  static const border = Color(0xFFE5E7EB);
  static const borderLight = Color(0xFFEEF0F2);
  static const divider = Color(0xFFE2E8F0);

  // Ticker
  static const tickerBg = Color(0xFFE9FBF0);
  static const tickerBorder = Color(0xFFD6F5E3);
  static const tickerText = Color(0xFF007F3B);

  // Interaction
  static const buttonPressed = Color(0xFFE9FBF0);
}

/// App gradients
class AppGradients {
  static const primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00B14F), Color(0xFF0A8F43)],
  );
}

/// Border radius constants
class AppRadius {
  static const double small = 10.0;
  static const double medium = 12.0;
  static const double large = 14.0;
  static const double xl = 16.0;
  static const double xxl = 20.0;
  static const double circle = 999.0;
}

/// Spacing constants
class AppSpacing {
  static const double xs = 6.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
}

/// Box shadows
class AppShadows {
  static final card = BoxShadow(
    color: Colors.black.withOpacity(0.06),
    blurRadius: 18,
    offset: const Offset(0, 6),
  );

  static final button = BoxShadow(
    color: const Color(0xFF00B14F).withOpacity(0.35),
    blurRadius: 18,
    offset: const Offset(0, 8),
  );

  static final modal = BoxShadow(
    color: Colors.black.withOpacity(0.25),
    blurRadius: 60,
    offset: const Offset(0, 24),
  );
}

/// App theme configuration
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        surface: AppColors.surface,
      ),
      scaffoldBackgroundColor: AppColors.background,
      textTheme: GoogleFonts.robotoTextTheme().copyWith(
        headlineLarge: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
        ),
        headlineMedium: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
        ),
        bodyLarge: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        bodyMedium: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
        labelLarge: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.large),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.medium),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.textMuted),
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }
}

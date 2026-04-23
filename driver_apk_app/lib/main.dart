import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'providers/data_provider.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  final apiService = ApiService();
  final authService = AuthService(apiService);
  
  runApp(
    MultiProvider(
      providers: [
        Provider.value(value: apiService),
        ChangeNotifierProvider.value(value: authService),
        ChangeNotifierProvider(
          create: (_) => DataProvider(apiService: apiService),
        ),
      ],
      child: const DriverApp(),
    ),
  );
}

class DriverApp extends StatelessWidget {
  const DriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);

    if (authService.isLoading) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const Scaffold(
          body: Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
            ),
          ),
        ),
      );
    }

    return MaterialApp(
      title: 'Driver App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}

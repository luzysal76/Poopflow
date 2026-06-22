import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'models/poop_record.dart';
import 'models/water_record.dart';
import 'providers/poop_provider.dart';
import 'providers/water_provider.dart';
import 'screens/home_screen.dart';
import 'screens/poop_screen.dart';
import 'screens/water_screen.dart';
import 'screens/calendar_screen.dart';
import 'screens/analysis_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ko', null);

  await Hive.initFlutter();
  Hive.registerAdapter(PoopRecordAdapter());
  Hive.registerAdapter(WaterRecordAdapter());

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  final poopProvider = PoopProvider();
  final waterProvider = WaterProvider();
  await poopProvider.init();
  await waterProvider.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: poopProvider),
        ChangeNotifierProvider.value(value: waterProvider),
      ],
      child: const PoopflowApp(),
    ),
  );
}

class PoopflowApp extends StatelessWidget {
  const PoopflowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '물한잔똥한번',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final _screens = const [
    HomeScreen(),
    PoopScreen(),
    WaterScreen(),
    CalendarScreen(),
    AnalysisScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Color(0x1A5D4037), blurRadius: 16, offset: Offset(0, -4))],
        ),
        child: SafeArea(
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (i) => setState(() => _currentIndex = i),
            elevation: 0,
            backgroundColor: Colors.transparent,
            items: const [
              BottomNavigationBarItem(icon: Text('🏠', style: TextStyle(fontSize: 22)), label: '홈'),
              BottomNavigationBarItem(icon: Text('🚽', style: TextStyle(fontSize: 22)), label: '배변'),
              BottomNavigationBarItem(icon: Text('💧', style: TextStyle(fontSize: 22)), label: '물'),
              BottomNavigationBarItem(icon: Text('📅', style: TextStyle(fontSize: 22)), label: '캘린더'),
              BottomNavigationBarItem(icon: Text('📊', style: TextStyle(fontSize: 22)), label: '분석'),
            ],
          ),
        ),
      ),
    );
  }
}

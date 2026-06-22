import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/water_record.dart';

class WaterProvider extends ChangeNotifier {
  static const _boxName = 'waterRecords';
  static const _settingsBox = 'settings';
  late Box<WaterRecord> _box;
  late Box _settings;
  final _uuid = const Uuid();

  int get dailyGoal => _settings.get('waterGoal', defaultValue: 2000) as int;

  Future<void> init() async {
    _box = await Hive.openBox<WaterRecord>(_boxName);
    _settings = await Hive.openBox(_settingsBox);
  }

  List<WaterRecord> get allRecords {
    final list = _box.values.toList();
    list.sort((a, b) => b.dateTime.compareTo(a.dateTime));
    return list;
  }

  List<WaterRecord> get todayRecords {
    final now = DateTime.now();
    return allRecords.where((r) {
      return r.dateTime.year == now.year &&
          r.dateTime.month == now.month &&
          r.dateTime.day == now.day;
    }).toList();
  }

  List<WaterRecord> recordsForDate(DateTime date) {
    return allRecords.where((r) {
      return r.dateTime.year == date.year &&
          r.dateTime.month == date.month &&
          r.dateTime.day == date.day;
    }).toList();
  }

  int get todayIntakeMl =>
      todayRecords.fold(0, (sum, r) => sum + r.amountMl);

  double get todayProgress => (todayIntakeMl / dailyGoal).clamp(0.0, 1.0);

  bool get todayGoalAchieved => todayIntakeMl >= dailyGoal;

  int intakeForDate(DateTime date) =>
      recordsForDate(date).fold(0, (sum, r) => sum + r.amountMl);

  bool goalAchievedForDate(DateTime date) =>
      intakeForDate(date) >= dailyGoal;

  Future<void> addWater(int amountMl) async {
    final record = WaterRecord(
      id: _uuid.v4(),
      dateTime: DateTime.now(),
      amountMl: amountMl,
    );
    await _box.add(record);
    notifyListeners();
  }

  Future<void> deleteRecord(String id) async {
    final key = _box.keys.firstWhere(
      (k) => _box.get(k)?.id == id,
      orElse: () => null,
    );
    if (key != null) {
      await _box.delete(key);
      notifyListeners();
    }
  }

  Future<void> setDailyGoal(int goal) async {
    await _settings.put('waterGoal', goal);
    notifyListeners();
  }

  // Weekly stats for analysis (last 7 days)
  List<int> get weeklyIntakes {
    final now = DateTime.now();
    return List.generate(7, (i) {
      final date = now.subtract(Duration(days: 6 - i));
      return intakeForDate(date);
    });
  }

  int get streak {
    int count = 0;
    DateTime date = DateTime.now();
    while (true) {
      if (!goalAchievedForDate(date)) break;
      count++;
      date = date.subtract(const Duration(days: 1));
    }
    return count;
  }
}

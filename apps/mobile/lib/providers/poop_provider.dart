import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/poop_record.dart';

class PoopProvider extends ChangeNotifier {
  static const _boxName = 'poopRecords';
  late Box<PoopRecord> _box;
  final _uuid = const Uuid();

  Future<void> init() async {
    _box = await Hive.openBox<PoopRecord>(_boxName);
  }

  List<PoopRecord> get allRecords {
    final list = _box.values.toList();
    list.sort((a, b) => b.dateTime.compareTo(a.dateTime));
    return list;
  }

  List<PoopRecord> get todayRecords {
    final now = DateTime.now();
    return allRecords.where((r) {
      return r.dateTime.year == now.year &&
          r.dateTime.month == now.month &&
          r.dateTime.day == now.day;
    }).toList();
  }

  List<PoopRecord> recordsForDate(DateTime date) {
    return allRecords.where((r) {
      return r.dateTime.year == date.year &&
          r.dateTime.month == date.month &&
          r.dateTime.day == date.day;
    }).toList();
  }

  int get todayCount => todayRecords.length;

  DateTime? get lastPoopTime =>
      todayRecords.isNotEmpty ? todayRecords.first.dateTime : null;

  int get streak {
    int count = 0;
    DateTime date = DateTime.now();
    while (true) {
      final records = recordsForDate(date);
      if (records.isEmpty) break;
      count++;
      date = date.subtract(const Duration(days: 1));
    }
    return count;
  }

  Future<void> addRecord({
    required int bristolType,
    required String amount,
    required String color,
    String memo = '',
  }) async {
    final record = PoopRecord(
      id: _uuid.v4(),
      dateTime: DateTime.now(),
      bristolType: bristolType,
      amount: amount,
      color: color,
      memo: memo,
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

  Map<DateTime, List<PoopRecord>> get recordsByDay {
    final map = <DateTime, List<PoopRecord>>{};
    for (final r in allRecords) {
      final day = DateTime(r.dateTime.year, r.dateTime.month, r.dateTime.day);
      map[day] = (map[day] ?? [])..add(r);
    }
    return map;
  }

  // Weekly stats for analysis (last 7 days)
  List<int> get weeklyPoopCounts {
    final now = DateTime.now();
    return List.generate(7, (i) {
      final date = now.subtract(Duration(days: 6 - i));
      return recordsForDate(date).length;
    });
  }
}

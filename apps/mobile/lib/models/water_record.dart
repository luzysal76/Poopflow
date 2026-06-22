import 'package:hive/hive.dart';

part 'water_record.g.dart';

@HiveType(typeId: 1)
class WaterRecord extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late DateTime dateTime;

  @HiveField(2)
  late int amountMl;

  WaterRecord({
    required this.id,
    required this.dateTime,
    required this.amountMl,
  });
}

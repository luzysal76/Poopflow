import 'package:hive/hive.dart';

part 'poop_record.g.dart';

@HiveType(typeId: 0)
class PoopRecord extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late DateTime dateTime;

  @HiveField(2)
  late int bristolType; // 1-7

  @HiveField(3)
  late String amount; // small, medium, large

  @HiveField(4)
  late String color; // brown, dark-brown, yellow, green, black, red

  @HiveField(5)
  late String memo;

  PoopRecord({
    required this.id,
    required this.dateTime,
    required this.bristolType,
    required this.amount,
    required this.color,
    this.memo = '',
  });
}

// Bristol scale info
class BristolInfo {
  final int type;
  final String emoji;
  final String name;
  final String description;
  final bool isHealthy;

  const BristolInfo({
    required this.type,
    required this.emoji,
    required this.name,
    required this.description,
    required this.isHealthy,
  });
}

const bristolTypes = [
  BristolInfo(type: 1, emoji: '🪨', name: '토끼똥', description: '딱딱한 덩어리 (변비)', isHealthy: false),
  BristolInfo(type: 2, emoji: '🍫', name: '울퉁불퉁', description: '딱딱한 소시지 (변비)', isHealthy: false),
  BristolInfo(type: 3, emoji: '🌭', name: '금이 간 소시지', description: '약간 딱딱 (정상 범위)', isHealthy: true),
  BristolInfo(type: 4, emoji: '🍌', name: '부드러운 소시지', description: '매끈한 소시지 (이상적!)', isHealthy: true),
  BristolInfo(type: 5, emoji: '🌊', name: '부드러운 덩어리', description: '경계가 뚜렷한 덩어리', isHealthy: true),
  BristolInfo(type: 6, emoji: '💧', name: '흐물흐물', description: '경계가 없는 묽음 (설사)', isHealthy: false),
  BristolInfo(type: 7, emoji: '💦', name: '물설사', description: '완전 액체 (심한 설사)', isHealthy: false),
];

const poopColors = [
  {'id': 'brown', 'label': '갈색', 'color': 0xFF8D6E63},
  {'id': 'dark-brown', 'label': '진갈색', 'color': 0xFF4E342E},
  {'id': 'yellow', 'label': '노란색', 'color': 0xFFFFD54F},
  {'id': 'green', 'label': '녹색', 'color': 0xFF81C784},
  {'id': 'black', 'label': '검은색', 'color': 0xFF424242},
  {'id': 'red', 'label': '붉은색', 'color': 0xFFE57373},
];

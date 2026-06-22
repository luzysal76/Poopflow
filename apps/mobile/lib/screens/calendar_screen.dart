import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import '../providers/poop_provider.dart';
import '../providers/water_provider.dart';
import '../models/poop_record.dart';
import '../theme/app_theme.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    final poopProvider = context.watch<PoopProvider>();
    final waterProvider = context.watch<WaterProvider>();
    final selected = _selectedDay ?? DateTime.now();

    return Scaffold(
      appBar: AppBar(title: const Text('📅 캘린더')),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 3))],
            ),
            child: TableCalendar(
              locale: 'ko_KR',
              firstDay: DateTime.utc(2024, 1, 1),
              lastDay: DateTime.utc(2030, 12, 31),
              focusedDay: _focusedDay,
              selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
              onDaySelected: (selected, focused) {
                setState(() {
                  _selectedDay = selected;
                  _focusedDay = focused;
                });
              },
              calendarBuilders: CalendarBuilders(
                markerBuilder: (context, day, events) {
                  final poops = poopProvider.recordsForDate(day);
                  final hasWater = waterProvider.goalAchievedForDate(day);
                  if (poops.isEmpty && !hasWater) return null;

                  return Positioned(
                    bottom: 4,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (poops.isNotEmpty)
                          Container(width: 6, height: 6,
                            decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle)),
                        if (poops.isNotEmpty && hasWater) const SizedBox(width: 3),
                        if (hasWater)
                          Container(width: 6, height: 6,
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                      ],
                    ),
                  );
                },
              ),
              calendarStyle: CalendarStyle(
                outsideDaysVisible: false,
                todayDecoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                todayTextStyle: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700),
                selectedDecoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                defaultTextStyle: const TextStyle(color: AppColors.textDark),
                weekendTextStyle: const TextStyle(color: AppColors.accent),
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
                titleTextStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark),
                leftChevronIcon: Icon(Icons.chevron_left_rounded, color: AppColors.textMedium),
                rightChevronIcon: Icon(Icons.chevron_right_rounded, color: AppColors.textMedium),
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Legend
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                _legend(AppColors.accent, '🚽 배변 기록'),
                const SizedBox(width: 16),
                _legend(AppColors.primary, '💧 물 목표 달성'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Selected day records
          Expanded(
            child: _buildDayDetail(selected, poopProvider, waterProvider),
          ),
        ],
      ),
    );
  }

  Widget _legend(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMedium)),
      ],
    );
  }

  Widget _buildDayDetail(DateTime date, PoopProvider poopProvider, WaterProvider waterProvider) {
    final poops = poopProvider.recordsForDate(date);
    final water = waterProvider.intakeForDate(date);
    final goalAchieved = waterProvider.goalAchievedForDate(date);
    final dateStr = DateFormat('M월 d일 EEEE', 'ko').format(date);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(dateStr, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textDark)),
          const SizedBox(height: 12),

          // Water summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: goalAchieved ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: goalAchieved ? AppColors.primary : AppColors.background),
            ),
            child: Row(
              children: [
                const Text('💧', style: TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('물 섭취: ${water}ml',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                    Text(goalAchieved ? '🎉 목표 달성!' : '목표 미달성',
                        style: TextStyle(fontSize: 12, color: goalAchieved ? AppColors.primary : AppColors.textMedium)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Poop records
          if (poops.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
              child: const Row(
                children: [
                  Text('🚽', style: TextStyle(fontSize: 24)),
                  SizedBox(width: 12),
                  Text('배변 기록 없음', style: TextStyle(color: AppColors.textMedium)),
                ],
              ),
            )
          else
            ...poops.map((p) {
              final bristol = bristolTypes.firstWhere((b) => b.type == p.bristolType);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.background),
                ),
                child: Row(
                  children: [
                    Text(bristol.emoji, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(bristol.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textDark)),
                          if (p.memo.isNotEmpty) Text(p.memo, style: const TextStyle(fontSize: 12, color: AppColors.textMedium)),
                        ],
                      ),
                    ),
                    Text(DateFormat('a h:mm', 'ko').format(p.dateTime),
                        style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/poop_provider.dart';
import '../providers/water_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/add_poop_dialog.dart';
import '../models/poop_record.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final poopProvider = context.watch<PoopProvider>();
    final waterProvider = context.watch<WaterProvider>();
    final now = DateTime.now();
    final dateStr = DateFormat('M월 d일 EEEE', 'ko').format(now);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('물한잔똥한번 💧🚽',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textDark)),
                      Text(dateStr,
                          style: const TextStyle(fontSize: 13, color: AppColors.textMedium)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Text('👋', style: TextStyle(fontSize: 24)),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Streak card
              if (poopProvider.streak > 0) ...[
                _streakCard(poopProvider.streak),
                const SizedBox(height: 16),
              ],

              // Water card
              _waterCard(waterProvider),
              const SizedBox(height: 16),

              // Poop card
              _poopCard(poopProvider),
              const SizedBox(height: 28),

              // Quick actions
              const Text('빠른 기록', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _quickWaterButton(context, waterProvider),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _quickPoopButton(context),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Today's records
              if (poopProvider.todayRecords.isNotEmpty) ...[
                const Text('오늘의 기록', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                const SizedBox(height: 12),
                ...poopProvider.todayRecords.take(3).map((r) => _recordTile(r)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _streakCard(int streak) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF8C42), Color(0xFFFFB74D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppColors.accent.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 36)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$streak일 연속 기록 중!',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
              const Text('오늘도 잊지 말고 기록해요 💪',
                  style: TextStyle(fontSize: 12, color: Colors.white70)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _waterCard(WaterProvider provider) {
    final intake = provider.todayIntakeMl;
    final goal = provider.dailyGoal;
    final progress = provider.todayProgress;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 16, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [
                const Text('💧', style: TextStyle(fontSize: 24)),
                const SizedBox(width: 8),
                const Text('오늘 물 섭취', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
              ]),
              Text('${intake}ml / ${goal}ml',
                  style: const TextStyle(fontSize: 13, color: AppColors.textMedium, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(height: 12, decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(6))),
              FractionallySizedBox(
                widthFactor: progress,
                child: Container(
                  height: 12,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF4FC3F7), Color(0xFF29B6F6)]),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            progress >= 1.0 ? '🎉 목표 달성!' : '목표까지 ${goal - intake}ml 남았어요',
            style: TextStyle(
              fontSize: 12,
              color: progress >= 1.0 ? AppColors.success : AppColors.textMedium,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _poopCard(PoopProvider provider) {
    final count = provider.todayCount;
    final lastTime = provider.lastPoopTime;
    final timeStr = lastTime != null ? DateFormat('a h:mm', 'ko').format(lastTime) : '아직 없음';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 16, offset: Offset(0, 4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Text('🚽', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 8),
                  const Text('오늘 배변', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                ]),
                const SizedBox(height: 8),
                Text(
                  '$count회',
                  style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.accent),
                ),
                Text('마지막: $timeStr', style: const TextStyle(fontSize: 12, color: AppColors.textMedium)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: count > 0 ? AppColors.accent.withOpacity(0.1) : AppColors.background,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              count > 0 ? '😊' : '😢',
              style: const TextStyle(fontSize: 40),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickWaterButton(BuildContext context, WaterProvider provider) {
    return GestureDetector(
      onTap: () => _showWaterPicker(context, provider),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF4FC3F7), Color(0xFF29B6F6)]),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: const Column(
          children: [
            Text('💧', style: TextStyle(fontSize: 32)),
            SizedBox(height: 6),
            Text('물 마셨어요', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  Widget _quickPoopButton(BuildContext context) {
    return GestureDetector(
      onTap: () => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => const AddPoopDialog(),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFFFFB74D), Color(0xFFFF8F00)]),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: AppColors.accent.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: const Column(
          children: [
            Text('🚽', style: TextStyle(fontSize: 32)),
            SizedBox(height: 6),
            Text('배변했어요', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  Widget _recordTile(record) {
    final bristol = bristolTypes.firstWhere((b) => b.type == record.bristolType);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.background, width: 1),
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
                if (record.memo.isNotEmpty)
                  Text(record.memo, style: const TextStyle(fontSize: 12, color: AppColors.textMedium)),
              ],
            ),
          ),
          Text(
            DateFormat('a h:mm', 'ko').format(record.dateTime),
            style: const TextStyle(fontSize: 12, color: AppColors.textLight),
          ),
        ],
      ),
    );
  }

  void _showWaterPicker(BuildContext context, WaterProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('💧 물 마신 양', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textDark)),
            const SizedBox(height: 20),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.5,
              physics: const NeverScrollableScrollPhysics(),
              children: [100, 200, 300, 500].map((ml) => GestureDetector(
                onTap: () {
                  provider.addWater(ml);
                  Navigator.pop(context);
                },
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF4FC3F7), Color(0xFF29B6F6)]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text('+${ml}ml', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                  ),
                ),
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

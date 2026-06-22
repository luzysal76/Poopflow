import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/water_provider.dart';
import '../theme/app_theme.dart';
import 'dart:math' as math;

class WaterScreen extends StatefulWidget {
  const WaterScreen({super.key});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  final _customController = TextEditingController();

  @override
  void dispose() {
    _customController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<WaterProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('💧 물 마시기'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => _showGoalSetting(context, provider),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Circular Progress
            _buildCircularProgress(provider),
            const SizedBox(height: 32),

            // Quick add buttons
            const Text('빠른 추가', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.2,
              children: [100, 200, 300, 500].map((ml) => _quickAddButton(provider, ml)).toList(),
            ),
            const SizedBox(height: 20),

            // Custom amount
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _customController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      hintText: '직접 입력 (ml)',
                      suffixText: 'ml',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () {
                    final val = int.tryParse(_customController.text);
                    if (val != null && val > 0) {
                      provider.addWater(val);
                      _customController.clear();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('추가', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Today's records
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('오늘의 기록', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
            ),
            const SizedBox(height: 12),
            ...provider.todayRecords.map((r) => _waterTile(r, provider)),
            if (provider.todayRecords.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Text('아직 기록이 없어요 💧', style: TextStyle(color: AppColors.textMedium)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircularProgress(WaterProvider provider) {
    final progress = provider.todayProgress;
    final intake = provider.todayIntakeMl;
    final goal = provider.dailyGoal;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 16, offset: Offset(0, 4))],
      ),
      child: Column(
        children: [
          SizedBox(
            width: 180,
            height: 180,
            child: Stack(
              children: [
                CustomPaint(
                  size: const Size(180, 180),
                  painter: _CircleProgressPainter(progress: progress),
                ),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('💧', style: TextStyle(fontSize: 36)),
                      Text(
                        '${intake}ml',
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.primary),
                      ),
                      Text(
                        '/ ${goal}ml',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            provider.todayGoalAchieved ? '🎉 오늘 목표 달성!' : '목표까지 ${goal - intake}ml 더 마셔요',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: provider.todayGoalAchieved ? AppColors.success : AppColors.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${(progress * 100).toInt()}% 달성',
            style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
          ),
        ],
      ),
    );
  }

  Widget _quickAddButton(WaterProvider provider, int ml) {
    return GestureDetector(
      onTap: () => provider.addWater(ml),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF4FC3F7), Color(0xFF29B6F6)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 3))],
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('+${ml}ml', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
              Text(_mlLabel(ml), style: const TextStyle(fontSize: 11, color: Colors.white70)),
            ],
          ),
        ),
      ),
    );
  }

  String _mlLabel(int ml) {
    if (ml == 100) return '☕ 한 모금';
    if (ml == 200) return '🥤 반 컵';
    if (ml == 300) return '🥛 한 컵';
    return '🍶 큰 컵';
  }

  Widget _waterTile(record, WaterProvider provider) {
    return Dismissible(
      key: Key(record.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(color: Colors.red.shade400, borderRadius: BorderRadius.circular(14)),
        child: const Icon(Icons.delete_rounded, color: Colors.white),
      ),
      onDismissed: (_) => provider.deleteRecord(record.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.background),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('💧', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text('+${record.amountMl}ml',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ),
            Text(
              DateFormat('a h:mm', 'ko').format(record.dateTime),
              style: const TextStyle(fontSize: 12, color: AppColors.textLight),
            ),
          ],
        ),
      ),
    );
  }

  void _showGoalSetting(BuildContext context, WaterProvider provider) {
    final controller = TextEditingController(text: provider.dailyGoal.toString());
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('💧 목표 설정', style: TextStyle(fontWeight: FontWeight.w800)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: '하루 목표 (ml)', suffixText: 'ml'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('취소')),
          ElevatedButton(
            onPressed: () {
              final val = int.tryParse(controller.text);
              if (val != null && val > 0) {
                provider.setDailyGoal(val);
                Navigator.pop(context);
              }
            },
            child: const Text('저장'),
          ),
        ],
      ),
    );
  }
}

class _CircleProgressPainter extends CustomPainter {
  final double progress;
  _CircleProgressPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 12;

    // Background
    canvas.drawCircle(center, radius, Paint()
      ..color = AppColors.background
      ..style = PaintingStyle.stroke
      ..strokeWidth = 16);

    // Progress
    final sweepAngle = 2 * math.pi * progress;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      Paint()
        ..color = AppColors.primary
        ..style = PaintingStyle.stroke
        ..strokeWidth = 16
        ..strokeCap = StrokeCap.round
        ..shader = const LinearGradient(
          colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
        ).createShader(Rect.fromCircle(center: center, radius: radius)),
    );
  }

  @override
  bool shouldRepaint(_CircleProgressPainter old) => old.progress != progress;
}

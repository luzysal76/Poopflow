import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../providers/poop_provider.dart';
import '../providers/water_provider.dart';
import '../theme/app_theme.dart';
import 'dart:math' as math;

class AnalysisScreen extends StatelessWidget {
  const AnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final poopProvider = context.watch<PoopProvider>();
    final waterProvider = context.watch<WaterProvider>();
    final totalDays = poopProvider.allRecords
        .map((r) => DateTime(r.dateTime.year, r.dateTime.month, r.dateTime.day))
        .toSet()
        .length;

    return Scaffold(
      appBar: AppBar(title: const Text('📊 분석')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            if (totalDays < 7)
              _notEnoughDataCard(totalDays)
            else ...[
              _healthScoreCard(poopProvider, waterProvider),
              const SizedBox(height: 16),
            ],

            // Weekly charts always shown
            _weeklyWaterChart(waterProvider),
            const SizedBox(height: 16),
            _weeklyPoopChart(poopProvider),
            const SizedBox(height: 16),

            if (totalDays >= 7) ...[
              _insightsCard(poopProvider, waterProvider),
            ],
          ],
        ),
      ),
    );
  }

  Widget _notEnoughDataCard(int days) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.primary.withOpacity(0.1), AppColors.secondary.withOpacity(0.1)]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text('📊', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          const Text('AI 분석 준비 중', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textDark)),
          const SizedBox(height: 8),
          Text(
            '7일 이상 기록하면 AI 분석을 볼 수 있어요!\n현재: $days일 기록됨',
            style: const TextStyle(fontSize: 14, color: AppColors.textMedium, height: 1.6),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            value: days / 7,
            backgroundColor: AppColors.background,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 6),
          Text('${7 - days}일 더 기록하면 분석 시작!',
              style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
        ],
      ),
    );
  }

  Widget _healthScoreCard(PoopProvider poop, WaterProvider water) {
    final waterScore = (water.weeklyIntakes.where((i) => i >= water.dailyGoal).length / 7 * 40).toInt();
    final poopScore = (poop.weeklyPoopCounts.where((c) => c >= 1).length / 7 * 40).toInt();
    final bristolScore = (() {
      final recent = poop.allRecords.take(10);
      if (recent.isEmpty) return 0;
      final healthy = recent.where((r) => r.bristolType >= 3 && r.bristolType <= 5).length;
      return (healthy / recent.length * 20).toInt();
    })();
    final score = (waterScore + poopScore + bristolScore).clamp(0, 100);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _scoreColor(score).withOpacity(0.1),
            _scoreColor(score).withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _scoreColor(score).withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text('장 건강 점수', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 16),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 120, height: 120,
                child: CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 12,
                  backgroundColor: AppColors.background,
                  valueColor: AlwaysStoppedAnimation<Color>(_scoreColor(score)),
                  strokeCap: StrokeCap.round,
                ),
              ),
              Column(
                children: [
                  Text('$score', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: _scoreColor(score))),
                  const Text('점', style: TextStyle(fontSize: 14, color: AppColors.textMedium)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _scoreItem('💧 수분', '$waterScore/40', AppColors.primary),
              _scoreItem('🚽 배변', '$poopScore/40', AppColors.accent),
              _scoreItem('📊 형태', '$bristolScore/20', AppColors.secondary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _scoreItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMedium)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
      ],
    );
  }

  Color _scoreColor(int score) {
    if (score >= 80) return AppColors.success;
    if (score >= 60) return AppColors.primary;
    if (score >= 40) return AppColors.accent;
    return AppColors.warning;
  }

  Widget _weeklyWaterChart(WaterProvider provider) {
    final data = provider.weeklyIntakes;
    final maxVal = math.max(data.reduce(math.max).toDouble(), provider.dailyGoal.toDouble());
    final now = DateTime.now();
    final days = List.generate(7, (i) => now.subtract(Duration(days: 6 - i)));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('💧 주간 수분 섭취', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                maxY: maxVal * 1.2,
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (val, _) => Text(
                        DateFormat('E', 'ko').format(days[val.toInt()]),
                        style: const TextStyle(fontSize: 11, color: AppColors.textMedium),
                      ),
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                barGroups: List.generate(7, (i) => BarChartGroupData(
                  x: i,
                  barRods: [
                    BarChartRodData(
                      toY: data[i].toDouble(),
                      color: data[i] >= provider.dailyGoal ? AppColors.primary : AppColors.primary.withOpacity(0.4),
                      width: 28,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                    ),
                  ],
                )),
                extraLinesData: ExtraLinesData(horizontalLines: [
                  HorizontalLine(
                    y: provider.dailyGoal.toDouble(),
                    color: AppColors.primary.withOpacity(0.3),
                    strokeWidth: 1,
                    dashArray: [4, 4],
                    label: HorizontalLineLabel(
                      show: true,
                      labelResolver: (_) => '목표',
                      style: const TextStyle(fontSize: 10, color: AppColors.primary),
                    ),
                  ),
                ]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _weeklyPoopChart(PoopProvider provider) {
    final data = provider.weeklyPoopCounts;
    final maxVal = math.max(data.reduce(math.max).toDouble(), 3.0);
    final now = DateTime.now();
    final days = List.generate(7, (i) => now.subtract(Duration(days: 6 - i)));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🚽 주간 배변 횟수', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                maxY: maxVal * 1.3,
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (val, _) => Text(
                        DateFormat('E', 'ko').format(days[val.toInt()]),
                        style: const TextStyle(fontSize: 11, color: AppColors.textMedium),
                      ),
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                barGroups: List.generate(7, (i) => BarChartGroupData(
                  x: i,
                  barRods: [
                    BarChartRodData(
                      toY: data[i].toDouble(),
                      color: data[i] > 0 ? AppColors.accent : AppColors.accent.withOpacity(0.3),
                      width: 28,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                    ),
                  ],
                )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _insightsCard(PoopProvider poop, WaterProvider water) {
    final insights = _generateInsights(poop, water);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🤖 AI 인사이트', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 12),
          ...insights.map((insight) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(insight['emoji']!, style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 10),
                Expanded(child: Text(insight['text']!,
                    style: const TextStyle(fontSize: 13, color: AppColors.textDark, height: 1.5))),
              ],
            ),
          )),
        ],
      ),
    );
  }

  List<Map<String, String>> _generateInsights(PoopProvider poop, WaterProvider water) {
    final insights = <Map<String, String>>[];
    final avgWater = water.weeklyIntakes.reduce((a, b) => a + b) / 7;
    final avgPoop = poop.weeklyPoopCounts.reduce((a, b) => a + b) / 7;

    if (avgWater >= water.dailyGoal * 0.9) {
      insights.add({'emoji': '💧', 'text': '이번 주 수분 섭취가 훌륭해요! 평균 ${avgWater.toInt()}ml를 마셨어요.'});
    } else {
      insights.add({'emoji': '⚠️', 'text': '이번 주 수분 섭취가 부족해요. 목표 ${water.dailyGoal}ml의 ${(avgWater / water.dailyGoal * 100).toInt()}%만 달성했어요.'});
    }

    if (avgPoop >= 1) {
      insights.add({'emoji': '✅', 'text': '규칙적인 배변 습관을 유지하고 있어요! 하루 평균 ${avgPoop.toStringAsFixed(1)}회'});
    } else {
      insights.add({'emoji': '🚨', 'text': '배변 횟수가 적어요. 물을 더 마시고 식이섬유를 섭취해보세요.'});
    }

    final recentBristol = poop.allRecords.take(5).map((r) => r.bristolType);
    if (recentBristol.isNotEmpty) {
      final avg = recentBristol.reduce((a, b) => a + b) / recentBristol.length;
      if (avg >= 3 && avg <= 5) {
        insights.add({'emoji': '😊', 'text': '최근 대변 형태가 정상 범위(3~5)예요. 건강한 장 상태입니다!'});
      } else if (avg < 3) {
        insights.add({'emoji': '💊', 'text': '대변이 딱딱한 편이에요. 물 섭취를 늘려보세요.'});
      } else {
        insights.add({'emoji': '🌡️', 'text': '대변이 묽은 편이에요. 음식을 주의하고 충분히 쉬세요.'});
      }
    }

    return insights;
  }
}

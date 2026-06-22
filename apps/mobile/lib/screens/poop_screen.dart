import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/poop_provider.dart';
import '../models/poop_record.dart';
import '../theme/app_theme.dart';
import '../widgets/add_poop_dialog.dart';

class PoopScreen extends StatelessWidget {
  const PoopScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PoopProvider>();
    final records = provider.allRecords;

    return Scaffold(
      appBar: AppBar(title: const Text('🚽 배변 기록')),
      body: records.isEmpty
          ? _emptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: records.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, i) => _recordCard(context, records[i], provider),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => const AddPoopDialog(),
        ),
        backgroundColor: AppColors.accent,
        icon: const Text('🚽', style: TextStyle(fontSize: 20)),
        label: const Text('배변 기록', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('🚽', style: TextStyle(fontSize: 80)),
          const SizedBox(height: 16),
          const Text('아직 기록이 없어요', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 8),
          const Text('배변 후 기록해보세요!', style: TextStyle(fontSize: 14, color: AppColors.textMedium)),
        ],
      ),
    );
  }

  Widget _recordCard(BuildContext context, PoopRecord record, PoopProvider provider) {
    final bristol = bristolTypes.firstWhere((b) => b.type == record.bristolType);
    final colorInfo = poopColors.firstWhere((c) => c['id'] == record.color);
    final dateStr = DateFormat('M/d (E) a h:mm', 'ko').format(record.dateTime);
    final amountLabel = {'small': '적음', 'medium': '보통', 'large': '많음'}[record.amount] ?? '';

    return Dismissible(
      key: Key(record.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.delete_rounded, color: Colors.white, size: 28),
            Text('삭제', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Text('삭제하시겠어요?'),
            content: const Text('이 기록을 삭제합니다.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('취소')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('삭제', style: TextStyle(color: Colors.red))),
            ],
          ),
        );
      },
      onDismissed: (_) => provider.deleteRecord(record.id),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 3))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bristol emoji
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(
                color: bristol.isHealthy ? AppColors.secondary.withOpacity(0.2) : AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(child: Text(bristol.emoji, style: const TextStyle(fontSize: 30))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(bristol.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: bristol.isHealthy ? AppColors.secondary.withOpacity(0.2) : AppColors.warning.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          bristol.isHealthy ? '✅ 정상' : '⚠️ 주의',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: bristol.isHealthy ? AppColors.success : AppColors.warning,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _tag('양: $amountLabel', AppColors.primary),
                      const SizedBox(width: 6),
                      _colorTag(colorInfo),
                      const SizedBox(width: 6),
                      _tag('유형 ${record.bristolType}', AppColors.accent),
                    ],
                  ),
                  if (record.memo.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text('📝 ${record.memo}', style: const TextStyle(fontSize: 12, color: AppColors.textMedium)),
                  ],
                  const SizedBox(height: 8),
                  Text(dateStr, style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }

  Widget _colorTag(Map colorInfo) {
    return Row(
      children: [
        Container(
          width: 12, height: 12,
          decoration: BoxDecoration(
            color: Color(colorInfo['color'] as int),
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(colorInfo['label'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textMedium, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

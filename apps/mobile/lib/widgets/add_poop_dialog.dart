import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/poop_record.dart';
import '../providers/poop_provider.dart';
import '../theme/app_theme.dart';

class AddPoopDialog extends StatefulWidget {
  const AddPoopDialog({super.key});

  @override
  State<AddPoopDialog> createState() => _AddPoopDialogState();
}

class _AddPoopDialogState extends State<AddPoopDialog> {
  int _selectedBristol = 4;
  String _selectedAmount = 'medium';
  String _selectedColor = 'brown';
  final _memoController = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _memoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textLight,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('🚽 배변 기록', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textDark)),
            const SizedBox(height: 24),

            // Bristol Scale
            const Text('대변 형태', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textMedium)),
            const SizedBox(height: 10),
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: bristolTypes.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, i) {
                  final b = bristolTypes[i];
                  final isSelected = _selectedBristol == b.type;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedBristol = b.type),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 80,
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.accent.withOpacity(0.2) : AppColors.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? AppColors.accent : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(b.emoji, style: const TextStyle(fontSize: 28)),
                          const SizedBox(height: 4),
                          Text(
                            b.name,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? AppColors.accentDark : AppColors.textMedium,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Amount
            const Text('양', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textMedium)),
            const SizedBox(height: 10),
            Row(
              children: [
                for (final a in [
                  {'id': 'small', 'label': '💨 적음'},
                  {'id': 'medium', 'label': '💩 보통'},
                  {'id': 'large', 'label': '🪣 많음'},
                ]) ...[
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedAmount = a['id']!),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedAmount == a['id']
                              ? AppColors.accent.withOpacity(0.2)
                              : AppColors.background,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _selectedAmount == a['id']
                                ? AppColors.accent
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Text(
                          a['label']!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _selectedAmount == a['id']
                                ? AppColors.accentDark
                                : AppColors.textMedium,
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (a['id'] != 'large') const SizedBox(width: 8),
                ],
              ],
            ),
            const SizedBox(height: 20),

            // Color
            const Text('색상', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textMedium)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: poopColors.map((c) {
                final isSelected = _selectedColor == c['id'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedColor = c['id'] as String),
                  child: Column(
                    children: [
                      Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: Color(c['color'] as int),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppColors.textDark : Colors.transparent,
                            width: 3,
                          ),
                          boxShadow: isSelected ? [
                            BoxShadow(color: Color(c['color'] as int).withOpacity(0.4), blurRadius: 8),
                          ] : null,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        c['label'] as String,
                        style: TextStyle(
                          fontSize: 10,
                          color: isSelected ? AppColors.textDark : AppColors.textLight,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Memo
            const Text('메모 (선택)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textMedium)),
            const SizedBox(height: 10),
            TextField(
              controller: _memoController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: '예) 커피 마신 후, 배가 아팠음...',
                hintStyle: TextStyle(color: AppColors.textLight),
              ),
            ),
            const SizedBox(height: 28),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  foregroundColor: Colors.white,
                ),
                child: _saving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('저장하기 💩', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    await context.read<PoopProvider>().addRecord(
      bristolType: _selectedBristol,
      amount: _selectedAmount,
      color: _selectedColor,
      memo: _memoController.text,
    );
    if (mounted) Navigator.pop(context);
  }
}

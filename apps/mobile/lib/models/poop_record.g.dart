// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'poop_record.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class PoopRecordAdapter extends TypeAdapter<PoopRecord> {
  @override
  final int typeId = 0;

  @override
  PoopRecord read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return PoopRecord(
      id: fields[0] as String,
      dateTime: fields[1] as DateTime,
      bristolType: fields[2] as int,
      amount: fields[3] as String,
      color: fields[4] as String,
      memo: fields[5] as String,
    );
  }

  @override
  void write(BinaryWriter writer, PoopRecord obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.dateTime)
      ..writeByte(2)
      ..write(obj.bristolType)
      ..writeByte(3)
      ..write(obj.amount)
      ..writeByte(4)
      ..write(obj.color)
      ..writeByte(5)
      ..write(obj.memo);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PoopRecordAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

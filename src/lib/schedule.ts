/**
 * Проверка пересечения интервалов: startA < endB && startB < endA
 * Используется перед сохранением занятия.
 */
export function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Пример серверной проверки конфликта для группы / преподавателя / аудитории.
 * Вызывать в транзакции непосредственно перед create/update Lesson.
 */
export async function hasScheduleConflict(params: {
  groupId: string;
  teacherId: string;
  roomId: string;
  start: Date;
  end: Date;
  excludeLessonId?: string;
}) {
  // В реальном коде — prisma.lesson.findFirst с условиями
  // where: { OR: [{groupId}, {teacherId}, {roomId}], start/end overlap, id not exclude }
  return false; // заглушка
}

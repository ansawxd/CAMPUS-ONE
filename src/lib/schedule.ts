import { prisma } from "./prisma";

/**
 * Проверка пересечения интервалов: startA < endB && startB < endA
 */
export function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

/**
 * Есть ли конфликт у группы, преподавателя или аудитории в этот интервал.
 * Вызывать перед созданием/изменением занятия.
 */
export async function hasScheduleConflict(params: {
  groupId: string;
  teacherId: string;
  roomId: string;
  start: Date;
  end: Date;
  excludeLessonId?: string;
}) {
  const conflict = await prisma.lesson.findFirst({
    where: {
      isCancelled: false,
      id: params.excludeLessonId ? { not: params.excludeLessonId } : undefined,
      OR: [{ groupId: params.groupId }, { teacherId: params.teacherId }, { roomId: params.roomId }],
      start: { lt: params.end },
      end: { gt: params.start },
    },
    select: { id: true },
  });
  return conflict !== null;
}

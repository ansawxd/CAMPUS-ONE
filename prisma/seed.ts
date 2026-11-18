import { PrismaClient, Role, AssessmentType, LessonType, RequestStatus, NewsCategory } from "@prisma/client";
import argon2 from "argon2";

/**
 * Демо-данные CAMPUS ONE.
 * Seed можно запускать сколько угодно раз: он не падает на повторе
 * и каждый раз заново выставляет пароль DemoPass1 всем демо-пользователям.
 */

const prisma = new PrismaClient();
const PASSWORD = "DemoPass1";

// Москва = UTC+3. Дата занятия: dayOffset дней от сегодня, время по Москве.
function moscowTime(dayOffset: number, hour: number, minute: number) {
  const nowMsk = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(nowMsk.getUTCFullYear(), nowMsk.getUTCMonth(), nowMsk.getUTCDate() + dayOffset, hour - 3, minute)
  );
}

// Создать или обновить пользователя по логину (без upsert — работает и на старой базе)
async function saveUser(login: string, fullName: string, role: Role, passwordHash: string) {
  const existing = await prisma.user.findFirst({
    where: { login: { equals: login, mode: "insensitive" } },
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { login, fullName, role, passwordHash },
    });
  }
  return prisma.user.create({ data: { login, fullName, role, passwordHash } });
}

async function findOrCreate<T>(find: () => Promise<T | null>, create: () => Promise<T>): Promise<T> {
  const found = await find();
  return found ?? create();
}

async function main() {
  const hash = await argon2.hash(PASSWORD, { type: argon2.argon2id });

  // --- Структура вуза ---
  const faculty = await findOrCreate(
    () => prisma.faculty.findFirst({ where: { name: "Факультет цифровых технологий" } }),
    () => prisma.faculty.create({ data: { name: "Факультет цифровых технологий" } })
  );
  const group = await findOrCreate(
    () => prisma.studyGroup.findFirst({ where: { name: "ЦТ-101" } }),
    () => prisma.studyGroup.create({ data: { name: "ЦТ-101", course: 1, facultyId: faculty.id } })
  );
  const dept = await findOrCreate(
    () => prisma.department.findFirst({ where: { name: "Кафедра информатики" } }),
    () => prisma.department.create({ data: { name: "Кафедра информатики", facultyId: faculty.id } })
  );

  // --- Пользователи ---
  const userA = await saveUser("studentA", "Алексей Смирнов", Role.STUDENT, hash);
  const userB = await saveUser("studentB", "Мария Кузнецова", Role.STUDENT, hash);
  const deanUser = await saveUser("deanery", "Елена Волкова", Role.DEANERY_STAFF, hash);
  const teacherUser = await saveUser("teacher", "Дмитрий Орлов", Role.TEACHER, hash);
  const teacher2User = await saveUser("teacher2", "Ольга Петрова", Role.TEACHER, hash);
  await saveUser("admin", "Администратор Системы", Role.ADMIN, hash);

  const studentA = await prisma.student.upsert({
    where: { userId: userA.id },
    update: { groupId: group.id }, // прошлые упавшие seed могли создать дубли группы
    create: {
      userId: userA.id, groupId: group.id, course: 1, direction: "Информационные системы и технологии",
      email: "a.smirnov@student.example", phone: "+7 900 000-00-01",
    },
  });
  const studentB = await prisma.student.upsert({
    where: { userId: userB.id },
    update: { groupId: group.id },
    create: {
      userId: userB.id, groupId: group.id, course: 1, direction: "Информационные системы и технологии",
      email: "m.kuznetsova@student.example",
    },
  });
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: { departmentId: dept.id },
    create: { userId: teacherUser.id, departmentId: dept.id, position: "Доцент" },
  });
  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: { departmentId: dept.id },
    create: { userId: teacher2User.id, departmentId: dept.id, position: "Старший преподаватель" },
  });

  // --- Корпус и аудитории ---
  const building = await findOrCreate(
    () => prisma.campusBuilding.findFirst({ where: { name: "Корпус 1" } }),
    () => prisma.campusBuilding.create({ data: { name: "Корпус 1" } })
  );
  const rooms = [];
  for (const number of ["101", "205", "310"]) {
    rooms.push(
      await findOrCreate(
        () => prisma.room.findFirst({ where: { buildingId: building.id, number } }),
        () => prisma.room.create({ data: { buildingId: building.id, number, capacity: 40 } })
      )
    );
  }

  // --- Дисциплины ---
  const subjectData = [
    { name: "Программирование", hours: 144, assessment: AssessmentType.EXAM, teacher },
    { name: "Математический анализ", hours: 108, assessment: AssessmentType.EXAM, teacher: teacher2 },
    { name: "Базы данных", hours: 72, assessment: AssessmentType.DIFFERENTIATED_CREDIT, teacher },
    { name: "Философия", hours: 72, assessment: AssessmentType.CREDIT, teacher: teacher2 },
  ];
  const subjects = [];
  for (const s of subjectData) {
    const subject = await findOrCreate(
      () => prisma.subject.findFirst({ where: { name: s.name } }),
      () => prisma.subject.create({ data: { name: s.name, hours: s.hours, assessment: s.assessment } })
    );
    await prisma.groupSubject.upsert({
      where: { groupId_subjectId: { groupId: group.id, subjectId: subject.id } },
      update: {},
      create: { groupId: group.id, subjectId: subject.id },
    });
    subjects.push({ ...subject, teacherId: s.teacher.id });
  }

  // --- Расписание: пересоздаём на 2 недели назад и 2 недели вперёд от сегодня ---
  await prisma.lesson.deleteMany({ where: { groupId: group.id } });

  const pairs = [
    { h: 9, m: 0 },
    { h: 10, m: 45 },
    { h: 12, m: 40 },
  ];
  const types = [LessonType.LECTURE, LessonType.PRACTICE, LessonType.LABORATORY];
  const now = new Date();

  for (let day = -14; day <= 14; day++) {
    const weekday = moscowTime(day, 12, 0).getUTCDay(); // 0 = воскресенье
    if (weekday === 0) continue;

    for (let p = 0; p < pairs.length; p++) {
      const subject = subjects[(day + 14 + p) % subjects.length];
      const start = moscowTime(day, pairs[p].h, pairs[p].m);
      const end = new Date(start.getTime() + 90 * 60 * 1000);

      const lesson = await prisma.lesson.create({
        data: {
          groupId: group.id,
          subjectId: subject.id,
          teacherId: subject.teacherId,
          roomId: rooms[p].id,
          type: types[(day + 14 + p) % types.length],
          start,
          end,
          isCancelled: day === 2 && p === 2, // одна отменённая пара для демо
        },
      });

      // Посещаемость для прошедших пар
      if (end < now) {
        await prisma.attendance.createMany({
          data: [
            { studentId: studentA.id, lessonId: lesson.id, present: (day + p) % 7 !== 0 },
            { studentId: studentB.id, lessonId: lesson.id, present: (day + p) % 4 !== 0 },
          ],
        });
      }
    }
  }

  // --- Оценки (пересоздаём) ---
  await prisma.grade.deleteMany({ where: { studentId: { in: [studentA.id, studentB.id] } } });
  await prisma.grade.createMany({
    data: [
      { studentId: studentA.id, subjectId: subjects[0].id, value: "5", comment: "Лабораторная №1" },
      { studentId: studentA.id, subjectId: subjects[0].id, value: "4", comment: "Лабораторная №2" },
      { studentId: studentA.id, subjectId: subjects[1].id, value: "4", comment: "Контрольная" },
      { studentId: studentA.id, subjectId: subjects[2].id, value: "5", comment: "ER-диаграмма" },
      { studentId: studentB.id, subjectId: subjects[0].id, value: "5", comment: "Лабораторная №1" },
    ],
  });

  // --- Заявки, новости, уведомления, заметки: только если их ещё нет ---
  if ((await prisma.request.count()) === 0) {
    await prisma.request.create({
      data: {
        studentId: studentA.id,
        type: "Справка об обучении",
        description: "Для предоставления в военкомат",
        status: RequestStatus.READY,
        history: {
          create: [
            { status: RequestStatus.SUBMITTED, comment: "Создана студентом" },
            { status: RequestStatus.IN_PROGRESS, comment: "Принята в работу" },
            { status: RequestStatus.READY, comment: "Можно забрать в каб. 104" },
          ],
        },
      },
    });
    await prisma.request.create({
      data: {
        studentId: studentA.id,
        type: "Справка для стипендии",
        description: "Социальная стипендия, весенний семестр",
        history: { create: { status: RequestStatus.SUBMITTED, comment: "Создана студентом" } },
      },
    });
  }

  if ((await prisma.newsPost.count()) === 0) {
    await prisma.newsPost.createMany({
      data: [
        {
          authorId: deanUser.id, category: NewsCategory.OFFICIAL, isOfficial: true, published: true,
          title: "Расписание зимней сессии опубликовано",
          body: "Расписание экзаменов доступно в разделе «Расписание». Пересдачи — по согласованию с деканатом. (Демо-новость)",
        },
        {
          authorId: deanUser.id, category: NewsCategory.IMPORTANT, isOfficial: true, published: true,
          title: "Приём заявлений на материальную помощь",
          body: "Заявления принимаются до конца месяца через раздел «Справки». (Демо-новость, данные вымышленные)",
        },
        {
          authorId: deanUser.id, category: NewsCategory.EVENT, published: true,
          title: "Хакатон факультета цифровых технологий",
          body: "Команды по 3–5 человек, регистрация в студсовете. (Демо-новость)",
        },
      ],
    });
  }

  if ((await prisma.notification.count({ where: { userId: userA.id } })) === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: userA.id, title: "Справка готова", body: "Справка об обучении готова к выдаче." },
        { userId: userA.id, title: "Изменение в расписании", body: "Одна из пар послезавтра отменена." },
      ],
    });
  }

  if ((await prisma.note.count({ where: { studentId: studentA.id } })) === 0) {
    await prisma.note.create({
      data: { studentId: studentA.id, body: "Сдать лабораторную №3 по программированию до пятницы", pinned: true },
    });
  }

  console.log("Seed готов. Логины: studentA, studentB, teacher, teacher2, deanery, admin. Пароль для всех:", PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

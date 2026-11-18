import { PrismaClient, Role, AssessmentType, LessonType, RequestStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const password = "DemoPass1";
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  console.log("Тестовый пароль (один раз):", password);

  // Факультет и группа
  const faculty = await prisma.faculty.create({
    data: { name: "Факультет цифровых технологий" },
  });

  const group = await prisma.studyGroup.create({
    data: { name: "ЦТ-101", course: 1, facultyId: faculty.id },
  });

  // Студент A
  const userA = await prisma.user.create({
    data: {
      login: "studentA",
      passwordHash: hash,
      role: Role.STUDENT,
      fullName: "Алексей Смирнов",
    },
  });
  await prisma.student.create({
    data: { userId: userA.id, groupId: group.id, course: 1, direction: "Информатика" },
  });

  // Студент B
  const userB = await prisma.user.create({
    data: {
      login: "studentB",
      passwordHash: hash,
      role: Role.STUDENT,
      fullName: "Мария Кузнецова",
    },
  });
  await prisma.student.create({
    data: { userId: userB.id, groupId: group.id, course: 1, direction: "Информатика" },
  });

  // Сотрудник деканата
  const dean = await prisma.user.create({
    data: {
      login: "deanery",
      passwordHash: hash,
      role: Role.DEANERY_STAFF,
      fullName: "Елена Волкова",
    },
  });

  // Преподаватель
  const teacherUser = await prisma.user.create({
    data: {
      login: "teacher",
      passwordHash: hash,
      role: Role.TEACHER,
      fullName: "Дмитрий Орлов",
    },
  });
  const dept = await prisma.department.create({
    data: { name: "Кафедра информатики", facultyId: faculty.id },
  });
  await prisma.teacher.create({
    data: { userId: teacherUser.id, departmentId: dept.id, position: "Доцент" },
  });

  // Администратор
  await prisma.user.create({
    data: {
      login: "admin",
      passwordHash: hash,
      role: Role.ADMIN,
      fullName: "Администратор Системы",
    },
  });

  console.log("Seed: studentA, studentB, teacher, deanery, admin. Пароль для всех:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

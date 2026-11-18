// Русские подписи для значений enum из базы

export const requestStatusLabel: Record<string, string> = {
  SUBMITTED: "Подана",
  IN_PROGRESS: "В работе",
  READY: "Готова",
  REJECTED: "Отклонена",
};

export const lessonTypeLabel: Record<string, string> = {
  LECTURE: "Лекция",
  PRACTICE: "Практика",
  LABORATORY: "Лабораторная",
};

export const assessmentLabel: Record<string, string> = {
  CREDIT: "Зачёт",
  DIFFERENTIATED_CREDIT: "Дифф. зачёт",
  EXAM: "Экзамен",
  COURSE_PROJECT: "Курсовой проект",
};

export const roleLabel: Record<string, string> = {
  STUDENT: "Студент",
  TEACHER: "Преподаватель",
  DEANERY_STAFF: "Сотрудник деканата",
  AUTHOR: "Автор",
  MODERATOR: "Модератор",
  ADMIN: "Администратор",
};

export const newsCategoryLabel: Record<string, string> = {
  OFFICIAL: "Официально",
  IMPORTANT: "Важно",
  SPORT: "Спорт",
  STUDENT_LIFE: "Студжизнь",
  EVENT: "Мероприятие",
};

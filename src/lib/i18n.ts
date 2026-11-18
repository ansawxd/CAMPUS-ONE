const ru = {
  loginTitle: "Вход в CAMPUS ONE",
  login: "Логин",
  password: "Пароль",
  signIn: "Войти",
  signingIn: "Вход…",
  invalidCredentials: "Неверный логин или пароль",
  networkError: "Нет связи с сервером",
  demoHint: "Демо-логины: studentA, studentB, teacher, deanery, admin · пароль DemoPass1",
  logout: "Выйти",
  navHome: "Главная",
  navSchedule: "Расписание",
  navSubjects: "Дисциплины",
  navRequests: "Справки",
  navNews: "Новости",
  navNotes: "Заметки",
  navDirectory: "Каталог",
  navMap: "Карта",
  navProfile: "Профиль",
};

// Тип словаря: те же ключи, любые строки
type Dict = Record<keyof typeof ru, string>;

const en: Dict = {
  loginTitle: "Sign in to CAMPUS ONE",
  login: "Login",
  password: "Password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  invalidCredentials: "Invalid login or password",
  networkError: "Cannot reach the server",
  demoHint: "Demo logins: studentA, studentB, teacher, deanery, admin · password DemoPass1",
  logout: "Log out",
  navHome: "Home",
  navSchedule: "Schedule",
  navSubjects: "Subjects",
  navRequests: "Requests",
  navNews: "News",
  navNotes: "Notes",
  navDirectory: "Directory",
  navMap: "Map",
  navProfile: "Profile",
};

export const translations: Record<"ru" | "en", Dict> = { ru, en };

export type Lang = keyof typeof translations;

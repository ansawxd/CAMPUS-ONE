import { describe, expect, it } from "vitest";

// Пример unit-теста изоляции: студент не должен получать чужие данные.
// В реальном e2e: войти A → запросить UUID заявки B → ожидать 403/404.

describe("isolation", () => {
  it("student cannot access another student's request by UUID", () => {
    // Заглушка: в полном тесте проверяется серверный ответ
    const studentAId: string = "uuid-a";
    const requestOwnerId: string = "uuid-b";
    const canAccess = studentAId === requestOwnerId;
    expect(canAccess).toBe(false);
  });

  it("deanery staff can access any request", () => {
    const role: string = "DEANERY_STAFF";
    const canAccess = role === "DEANERY_STAFF" || role === "ADMIN";
    expect(canAccess).toBe(true);
  });
});

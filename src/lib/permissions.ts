import { Role } from "@prisma/client";
import { getCurrentUser } from "./auth";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

// Пример: проверка владения заявкой
export async function canAccessRequest(userId: string, requestStudentId: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === "DEANERY_STAFF" || user.role === "ADMIN") return true;
  return user.id === userId && user.student?.id === requestStudentId; // упрощённо
}

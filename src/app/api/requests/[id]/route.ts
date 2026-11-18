import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["SUBMITTED", "IN_PROGRESS", "READY", "REJECTED"]),
  comment: z.string().trim().max(500).optional(),
});

// В Next.js 15 params — это Promise. Раньше params.id был undefined и PATCH всегда падал.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = csrfGuard(req);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || (user.role !== "DEANERY_STAFF" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const exists = await prisma.request.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const request = await prisma.request.update({
    where: { id },
    data: {
      status: parsed.data.status,
      history: {
        create: {
          status: parsed.data.status,
          comment: parsed.data.comment || "Изменено деканатом",
        },
      },
    },
    select: { id: true, status: true },
  });

  return NextResponse.json(request);
}

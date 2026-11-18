import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csrfGuard } from "@/lib/csrf";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["SUBMITTED", "IN_PROGRESS", "READY", "REJECTED"]),
  comment: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const csrfError = csrfGuard(req as any);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (!user || (user.role !== "DEANERY_STAFF" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const request = await prisma.request.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      history: {
        create: {
          status: parsed.data.status,
          comment: parsed.data.comment ?? "Изменено деканатом",
        },
      },
    },
  });

  return NextResponse.json(request);
}

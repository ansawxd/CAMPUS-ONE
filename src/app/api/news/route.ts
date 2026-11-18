import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    // Раньше отдавались все лайки с userId — лишние данные о других пользователях
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      isOfficial: true,
      createdAt: true,
      author: { select: { fullName: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(posts);
}

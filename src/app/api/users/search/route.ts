import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Finds GoVenture users to invite. Only people with an account can ever show up here.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ users: [] }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        // Email only matches when it is typed in full, so nobody can browse other people's emails.
        { email: { equals: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, name: true, username: true },
    take: 6,
  });

  return NextResponse.json({ users });
}
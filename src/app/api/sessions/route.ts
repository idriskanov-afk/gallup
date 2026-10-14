import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeName, employeeRole } = body;

    if (!employeeName || !employeeRole) {
      return NextResponse.json(
        { error: "Имя сотрудника и должность обязательны" },
        { status: 400 }
      );
    }

    const session = await prisma.testSession.create({
      data: {
        employeeName: employeeName.trim(),
        employeeRole: employeeRole.trim(),
        status: "in_progress",
        currentQuestionIndex: 0,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      employeeName: session.employeeName,
      employeeRole: session.employeeRole,
      currentQuestionIndex: session.currentQuestionIndex,
      status: session.status,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (name) {
      const activeSession = await prisma.testSession.findFirst({
        where: {
          employeeName: { equals: name.trim() },
          status: "in_progress",
        },
        orderBy: { startedAt: "desc" },
      });
      return NextResponse.json({ activeSession });
    }

    return NextResponse.json({ activeSession: null });
  } catch (error) {
    console.error("Error looking up session:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

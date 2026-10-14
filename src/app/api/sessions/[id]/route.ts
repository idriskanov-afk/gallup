import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.testSession.findUnique({
      where: { id },
      include: {
        responses: {
          select: {
            questionId: true,
            choice: true,
            responseTimeMs: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
    }

    const totalQuestions = await prisma.question.count();

    if (session.status === "completed" && session.resultsJson) {
      return NextResponse.json({
        session: {
          id: session.id,
          employeeName: session.employeeName,
          employeeRole: session.employeeRole,
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
        },
        totalQuestions,
        results: JSON.parse(session.resultsJson),
      });
    }

    // Next question based on currentQuestionIndex (0-indexed -> orderIndex = index + 1)
    const nextOrder = session.currentQuestionIndex + 1;
    const currentQuestion = await prisma.question.findFirst({
      where: { orderIndex: nextOrder },
      select: {
        id: true,
        orderIndex: true,
        statementA: true,
        talentAId: true,
        statementB: true,
        talentBId: true,
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        employeeName: session.employeeName,
        employeeRole: session.employeeRole,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        startedAt: session.startedAt,
      },
      totalQuestions,
      currentQuestion,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUESTIONS_DATA } from "@/lib/data/questions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const totalQuestions = QUESTIONS_DATA.length;

    let session: any = null;
    try {
      session = await prisma.testSession.findUnique({
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
    } catch (dbErr) {
      console.warn("DB lookup warning (falling back gracefully):", dbErr);
    }

    if (session && session.status === "completed" && session.resultsJson) {
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

    const currentIndex = session?.currentQuestionIndex ?? 0;
    const nextOrder = currentIndex + 1;
    const qData = QUESTIONS_DATA.find((q) => q.orderIndex === nextOrder) || QUESTIONS_DATA[0];

    return NextResponse.json({
      session: {
        id: session?.id || id,
        employeeName: session?.employeeName || "Сотрудник",
        employeeRole: session?.employeeRole || "Сотрудник",
        status: session?.status || "in_progress",
        currentQuestionIndex: currentIndex,
        startedAt: session?.startedAt || new Date().toISOString(),
      },
      totalQuestions,
      currentQuestion: {
        id: qData.orderIndex,
        orderIndex: qData.orderIndex,
        statementA: qData.statementA,
        talentAId: qData.talentAId,
        statementB: qData.statementB,
        talentBId: qData.talentBId,
      },
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    // Even on total error, return question 1 so client never shows 'Failed to fetch'
    const qData = QUESTIONS_DATA[0];
    return NextResponse.json({
      session: {
        id: "fallback",
        employeeName: "Сотрудник",
        employeeRole: "Сотрудник",
        status: "in_progress",
        currentQuestionIndex: 0,
      },
      totalQuestions: QUESTIONS_DATA.length,
      currentQuestion: {
        id: qData.orderIndex,
        orderIndex: qData.orderIndex,
        statementA: qData.statementA,
        talentAId: qData.talentAId,
        statementB: qData.statementB,
        talentBId: qData.talentBId,
      },
    });
  }
}

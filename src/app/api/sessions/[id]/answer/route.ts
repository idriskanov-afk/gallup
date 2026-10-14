import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAssessment, ResponseRecord } from "@/lib/scoring";
import { TalentItem } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { questionId, choice, responseTimeMs } = body;

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json({
        completed: true,
        message: "Тест уже завершен",
        results: session.resultsJson ? JSON.parse(session.resultsJson) : null,
      });
    }

    // Record response
    await prisma.response.create({
      data: {
        sessionId,
        questionId: Number(questionId),
        choice: choice === null || choice === undefined ? null : Number(choice),
        responseTimeMs: Math.max(0, Number(responseTimeMs) || 0),
      },
    });

    const nextIndex = session.currentQuestionIndex + 1;
    const totalQuestions = await prisma.question.count();

    if (nextIndex >= totalQuestions) {
      // Calculate results
      const rawTalents = await prisma.talent.findMany({
        orderBy: { id: "asc" },
      });

      const talents: TalentItem[] = rawTalents.map((t) => ({
        id: t.id,
        slug: t.slug,
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        domain: t.domain as any,
        shortDescription: t.shortDescription,
        managerGuide: JSON.parse(t.managerGuide),
      }));

      const responsesWithQuestions = await prisma.response.findMany({
        where: { sessionId },
        include: { question: true },
      });

      const records: ResponseRecord[] = responsesWithQuestions.map((r) => ({
        questionId: r.questionId,
        talentAId: r.question.talentAId,
        talentBId: r.question.talentBId,
        choice: r.choice,
        responseTimeMs: r.responseTimeMs,
      }));

      const assessmentResult = calculateAssessment(talents, records);

      const updatedSession = await prisma.testSession.update({
        where: { id: sessionId },
        data: {
          currentQuestionIndex: nextIndex,
          status: "completed",
          completedAt: new Date(),
          resultsJson: JSON.stringify(assessmentResult),
        },
      });

      return NextResponse.json({
        completed: true,
        currentQuestionIndex: nextIndex,
        results: assessmentResult,
      });
    } else {
      // Advance to next question
      await prisma.testSession.update({
        where: { id: sessionId },
        data: { currentQuestionIndex: nextIndex },
      });

      const nextQuestion = await prisma.question.findFirst({
        where: { orderIndex: nextIndex + 1 },
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
        completed: false,
        currentQuestionIndex: nextIndex,
        nextQuestion,
      });
    }
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

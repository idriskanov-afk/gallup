import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAssessment, ResponseRecord } from "@/lib/scoring";
import { TalentItem } from "@/lib/types";
import { TALENTS_DATA } from "@/lib/data/talents";
import { QUESTIONS_DATA } from "@/lib/data/questions";
import { ADAPTIVE_TOTAL_QUESTIONS } from "@/lib/adaptive";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { questionId, choice, responseTimeMs, allResponses } = body;

    const totalQuestions = body.totalQuestions || ADAPTIVE_TOTAL_QUESTIONS;

    // Optional DB recording with graceful error catch
    let currentDbIndex = 0;
    try {
      const session = await prisma.testSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        currentDbIndex = session.currentQuestionIndex;
        await prisma.response.create({
          data: {
            sessionId,
            questionId: Number(questionId),
            choice: choice === null || choice === undefined ? null : Number(choice),
            responseTimeMs: Math.max(0, Number(responseTimeMs) || 0),
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB response record warning (proceeding):", dbErr);
    }

    const nextIndex = Number(body.currentIndex ?? currentDbIndex) + 1;

    // Check if test completed
    if (nextIndex >= totalQuestions || (allResponses && allResponses.length >= totalQuestions)) {
      const talents: TalentItem[] = TALENTS_DATA.map((t) => ({
        id: t.id,
        slug: t.slug,
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        domain: t.domain as any,
        shortDescription: t.shortDescription,
        managerGuide: t.managerGuide,
      }));

      // Collect records
      let records: ResponseRecord[] = [];
      if (allResponses && Array.isArray(allResponses) && allResponses.length > 0) {
        records = allResponses.map((r: any) => {
          const q = QUESTIONS_DATA.find((item) => item.orderIndex === r.questionIndex || item.orderIndex === r.questionId);
          return {
            questionId: r.questionId,
            talentAId: q?.talentAId ?? 1,
            talentBId: q?.talentBId ?? 2,
            choice: r.choice,
            responseTimeMs: r.responseTimeMs || 0,
          };
        });
      } else {
        try {
          const dbResponses = await prisma.response.findMany({
            where: { sessionId },
            include: { question: true },
          });
          records = dbResponses.map((r) => ({
            questionId: r.questionId,
            talentAId: r.question.talentAId,
            talentBId: r.question.talentBId,
            choice: r.choice,
            responseTimeMs: r.responseTimeMs,
          }));
        } catch {
          // fallback empty
        }
      }

      const assessmentResult = calculateAssessment(talents, records);

      // Attempt to save to DB
      try {
        await prisma.testSession.update({
          where: { id: sessionId },
          data: {
            currentQuestionIndex: totalQuestions,
            status: "completed",
            completedAt: new Date(),
            resultsJson: JSON.stringify(assessmentResult),
          },
        });
      } catch (saveErr) {
        console.warn("Could not save to DB (returning result directly):", saveErr);
      }

      return NextResponse.json({
        completed: true,
        currentQuestionIndex: totalQuestions,
        results: assessmentResult,
      });
    }

    // Advance to next question
    try {
      await prisma.testSession.update({
        where: { id: sessionId },
        data: { currentQuestionIndex: nextIndex },
      });
    } catch {}

    const nextQData = QUESTIONS_DATA.find((q) => q.orderIndex === nextIndex + 1) || QUESTIONS_DATA[0];

    return NextResponse.json({
      completed: false,
      currentQuestionIndex: nextIndex,
      nextQuestion: {
        id: nextQData.orderIndex,
        orderIndex: nextQData.orderIndex,
        statementA: nextQData.statementA,
        talentAId: nextQData.talentAId,
        statementB: nextQData.statementB,
        talentBId: nextQData.talentBId,
      },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

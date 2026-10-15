import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/backup -> Export all sessions
export async function GET() {
  try {
    const sessions = await prisma.testSession.findMany({
      include: {
        responses: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      version: "1.0",
      exportedAt: new Date().toISOString(),
      totalSessions: sessions.length,
      sessions,
    });
  } catch (error: any) {
    console.error("Export backup error:", error);
    return NextResponse.json(
      { error: "Failed to export backup", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup -> Import / restore sessions
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionsToImport = Array.isArray(body) ? body : body.sessions;

    if (!Array.isArray(sessionsToImport)) {
      return NextResponse.json(
        { error: "Invalid backup format. Expected array of sessions." },
        { status: 400 }
      );
    }

    let restoredCount = 0;

    for (const s of sessionsToImport) {
      if (!s.id || !s.employeeName) continue;

      // Upsert session
      await prisma.testSession.upsert({
        where: { id: s.id },
        update: {
          employeeName: s.employeeName,
          employeeRole: s.employeeRole || "Сотрудник",
          status: s.status || "completed",
          currentQuestionIndex: Number(s.currentQuestionIndex) || 50,
          startedAt: s.startedAt ? new Date(s.startedAt) : new Date(),
          completedAt: s.completedAt ? new Date(s.completedAt) : null,
          resultsJson: typeof s.resultsJson === "string" ? s.resultsJson : JSON.stringify(s.resultsJson),
        },
        create: {
          id: s.id,
          employeeName: s.employeeName,
          employeeRole: s.employeeRole || "Сотрудник",
          status: s.status || "completed",
          currentQuestionIndex: Number(s.currentQuestionIndex) || 50,
          startedAt: s.startedAt ? new Date(s.startedAt) : new Date(),
          completedAt: s.completedAt ? new Date(s.completedAt) : null,
          resultsJson: typeof s.resultsJson === "string" ? s.resultsJson : JSON.stringify(s.resultsJson),
        },
      });

      // Restore responses if present
      if (Array.isArray(s.responses)) {
        for (const r of s.responses) {
          if (!r.questionId) continue;
          try {
            await prisma.response.create({
              data: {
                sessionId: s.id,
                questionId: Number(r.questionId),
                choice: r.choice === null || r.choice === undefined ? null : Number(r.choice),
                responseTimeMs: Number(r.responseTimeMs) || 0,
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
              },
            });
          } catch {
            // response might already exist or FK conflict, ignore
          }
        }
      }

      restoredCount++;
    }

    return NextResponse.json({
      success: true,
      restoredCount,
      message: `Успешно восстановлено ${restoredCount} сотрудников/тестов`,
    });
  } catch (error: any) {
    console.error("Import backup error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup", details: error.message },
      { status: 500 }
    );
  }
}

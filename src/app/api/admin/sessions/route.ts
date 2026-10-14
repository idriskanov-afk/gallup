import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssessmentResult } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const domainFilter = searchParams.get("domain");

    const sessions = await prisma.testSession.findMany({
      orderBy: { completedAt: "desc" },
    });

    const parsedSessions = sessions.map((s) => {
      let results: AssessmentResult | null = null;
      if (s.resultsJson) {
        try {
          results = JSON.parse(s.resultsJson);
        } catch {
          results = null;
        }
      }
      return {
        id: s.id,
        employeeName: s.employeeName,
        employeeRole: s.employeeRole,
        status: s.status,
        currentQuestionIndex: s.currentQuestionIndex,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        results,
      };
    });

    // Filtering
    let filtered = parsedSessions;
    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter((s) => s.employeeRole === roleFilter);
    }
    if (domainFilter && domainFilter !== "all") {
      filtered = filtered.filter((s) => s.results?.dominantDomain === domainFilter);
    }

    // Aggregate Team Grid Matrix (Top-5 frequencies)
    const talentFrequency: Record<string, { count: number; nameRu: string; domain: string }> = {};
    const domainDistribution: Record<string, number> = {
      executing: 0,
      influencing: 0,
      relationship: 0,
      strategic: 0,
    };

    let completedCount = 0;
    for (const s of parsedSessions) {
      if (s.status === "completed" && s.results) {
        completedCount++;
        domainDistribution[s.results.dominantDomain] =
          (domainDistribution[s.results.dominantDomain] || 0) + 1;

        for (const t of s.results.top5) {
          if (!talentFrequency[t.slug]) {
            talentFrequency[t.slug] = {
              count: 0,
              nameRu: t.nameRu,
              domain: t.domain,
            };
          }
          talentFrequency[t.slug].count++;
        }
      }
    }

    const availableRoles = Array.from(new Set(sessions.map((s) => s.employeeRole))).filter(Boolean);

    return NextResponse.json({
      sessions: filtered,
      totalCount: sessions.length,
      completedCount,
      availableRoles,
      teamMatrix: {
        talentFrequency,
        domainDistribution,
      },
    });
  } catch (error) {
    console.error("Error retrieving admin data:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

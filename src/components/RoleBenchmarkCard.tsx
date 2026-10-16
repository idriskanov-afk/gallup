"use client";

import { useState } from "react";
import { 
  RoleBenchmark, 
  calculateRoleMatch, 
  normalizeRoleKey, 
  CountryCode,
  CoreRoleKey,
  analyzeBestRoleFit,
  ROLE_BENCHMARKS
} from "@/lib/data/role-benchmarks";
import { AssessmentResult } from "@/lib/types";
import { 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Coins, 
  Brain, 
  Users, 
  Zap, 
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileCheck,
  ChevronRight,
  Compass,
  ArrowRight
} from "lucide-react";

interface RoleBenchmarkCardProps {
  results: AssessmentResult;
  roleName: string;
  country?: "uz" | "kz";
}

export function RoleBenchmarkCard({ results, roleName, country = "kz" }: RoleBenchmarkCardProps) {
  // Analyze matches across all 4 key roles
  const rec = analyzeBestRoleFit(results, roleName, country);
  
  // Local state to toggle which role benchmark details to inspect below
  const [selectedRoleKey, setSelectedRoleKey] = useState<CoreRoleKey>(rec.bestMatch.benchmark.roleKey);
  
  // Current active benchmark being inspected
  const currentMatch = calculateRoleMatch(results, selectedRoleKey, country);
  const { benchmark } = currentMatch;

  return (
    <div className="space-y-6 print:space-y-3 animate-fadeIn">
      {/* ============================================================== */}
      {/* 1. TOP HERO: BEST ROLE RECOMMENDATION & "WHY THIS ROLE" */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 print:p-3 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white shadow-2xl relative overflow-hidden border border-teal-500/20 print:bg-white print:text-slate-900 print:border print:border-teal-700 print:shadow-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none print:hidden" />

        <div className="relative z-10 space-y-4 print:space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 print:px-2 print:py-0.5 rounded-full text-xs print:text-[8.5px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 print:bg-teal-50 print:text-teal-900 print:border-teal-300">
              <Award className="w-4 h-4 print:w-3 print:h-3 text-teal-400 print:text-teal-700" />
              <span>Главная рекомендация по призванию в 35 Health Clubs</span>
            </div>
            <span className="px-2.5 py-1 print:px-2 print:py-0.5 rounded-full text-xs print:text-[8.5px] font-bold bg-white/10 text-slate-200 print:bg-slate-100 print:text-slate-700 print:border print:border-slate-300">
              {country === "uz" ? "🇺🇿 Узбекистан" : "🇰🇿 Казахстан"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 print:flex-row print:items-center print:gap-3">
            <div className="space-y-1.5 print:space-y-0.5 max-w-xl">
              <div className="text-xs print:text-[8.5px] uppercase font-extrabold tracking-wider text-teal-400 print:text-teal-800">
                Вам больше всего подходит роль:
              </div>
              <h2 className="text-2xl sm:text-3xl print:text-base font-black tracking-tight text-white print:text-slate-900 flex items-center gap-2">
                <span>{rec.bestMatch.benchmark.nameRu}</span>
              </h2>
              <p className="text-sm print:text-[9px] text-teal-100 print:text-slate-700 font-semibold leading-snug">
                {rec.whySuitable.headline}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 print:p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] print:min-w-[110px] text-center self-start md:self-center shadow-inner print:bg-teal-50 print:border print:border-teal-600 print:shadow-none">
              <div className="text-4xl sm:text-5xl print:text-2xl font-black tracking-tight text-teal-300 print:text-teal-900 leading-none">
                {rec.bestMatch.matchPercentage}%
              </div>
              <div className="text-[11px] print:text-[7.5px] uppercase tracking-wider text-teal-200/80 print:text-slate-600 font-bold mt-1 print:mt-0.5">
                Индекс совместимости
              </div>
              <div className={`mt-2 print:mt-1 px-3 py-0.5 print:px-1.5 print:py-0 rounded-full text-xs print:text-[8px] font-extrabold border ${rec.bestMatch.gradeColor}`}>
                {rec.bestMatch.gradeTitle}
              </div>
            </div>
          </div>

          {/* Detailed summary */}
          <div className="p-4 print:p-2 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm print:text-[8.5px] text-slate-200 print:text-slate-800 leading-relaxed font-normal print:bg-slate-50 print:border-slate-300">
            {rec.whySuitable.summary}
          </div>

          {/* ============================================================== */}
          {/* 4 PILLARS: WHY THIS ROLE SUITS YOU BEST */}
          {/* ============================================================== */}
          <div className="pt-2 print:pt-0.5 space-y-3 print:space-y-1.5">
            <h3 className="text-xs print:text-[9px] uppercase font-extrabold tracking-wider text-teal-300 print:text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 print:w-3 print:h-3 print:text-teal-700" />
              Почему именно эта должность подходит вам больше всего:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-1.5 text-xs">
              {/* Pillar 1: Strengths */}
              <div className="p-3.5 print:p-1.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 print:space-y-0.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-teal-300 print:text-slate-900 flex items-center gap-1.5 text-xs print:text-[8.5px]">
                  <Brain className="w-4 h-4 print:w-3 print:h-3 text-teal-400 print:text-teal-700" />
                  <span>1. Синергия сильных сторон (Gallup Топ-5)</span>
                </div>
                <ul className="space-y-1 print:space-y-0.5 text-slate-300 print:text-slate-700 text-[11px] print:text-[8px] leading-snug">
                  {rec.whySuitable.strengthsBreakdown.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-teal-400 print:text-teal-700 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2: Motivation */}
              <div className="p-3.5 print:p-1.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 print:space-y-0.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-amber-300 print:text-slate-900 flex items-center gap-1.5 text-xs print:text-[8.5px]">
                  <Coins className="w-4 h-4 print:w-3 print:h-3 text-amber-400 print:text-amber-600" />
                  <span>2. Мотивационный вектор</span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] print:text-[8px] leading-snug">
                  {rec.whySuitable.motivationReason}
                </p>
              </div>

              {/* Pillar 3: Communication Psychotype */}
              <div className="p-3.5 print:p-1.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 print:space-y-0.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-blue-300 print:text-slate-900 flex items-center gap-1.5 text-xs print:text-[8.5px]">
                  <Users className="w-4 h-4 print:w-3 print:h-3 text-blue-400 print:text-blue-600" />
                  <span>3. Коммуникативный психотип (DISC)</span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] print:text-[8px] leading-snug">
                  {rec.whySuitable.psychotypeReason}
                </p>
              </div>

              {/* Pillar 4: Dominant Domain */}
              <div className="p-3.5 print:p-1.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 print:space-y-0.5 print:bg-white print:border-slate-300">
                <div className="font-bold text-purple-300 print:text-slate-900 flex items-center gap-1.5 text-xs print:text-[8.5px]">
                  <Compass className="w-4 h-4 print:w-3 print:h-3 text-purple-400 print:text-purple-600" />
                  <span>4. Доминирующий домен</span>
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] print:text-[8px] leading-snug">
                  {rec.whySuitable.domainReason}
                </p>
              </div>
            </div>

            {/* Growth Advice Card */}
            <div className="p-3.5 print:p-1.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-2 text-xs print:text-[8px] text-teal-100 print:bg-teal-50 print:border-teal-300 print:text-teal-950">
              <Zap className="w-4 h-4 print:w-3 print:h-3 text-teal-400 print:text-teal-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-300 print:text-teal-900">Рекомендация для максимального взлета: </span>
                <span>{rec.whySuitable.growthAdvice}</span>
              </div>
            </div>
          </div>

          {/* Discrepancy Note (if candidate specified another role) */}
          {rec.discrepancyNote && (
            <div className="p-4 print:p-2 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-100 print:text-amber-950 text-xs print:text-[8px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 print:w-3 print:h-3 text-amber-400 print:text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 print:text-amber-900 block mb-0.5">
                  Аналитический вывод для HR и Руководителя:
                </span>
                <p className="leading-relaxed text-amber-200 print:text-amber-900">
                  {rec.discrepancyNote}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MULTI-ROLE COMPATIBILITY LEADERBOARD */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 print:p-2.5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 print:space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 print:pb-1">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base print:text-[10px] text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 print:w-3 print:h-3 text-teal-600" />
              <span>Рейтинг совместимости по ключевым профессиям 35 Health Clubs</span>
            </h3>
            <p className="text-xs text-slate-500 print:hidden">
              Нажмите на любую должность, чтобы изучить подробный паспорт и стандарты ниже
            </p>
          </div>
          <span className="text-[11px] print:text-[8px] font-bold text-slate-400">
            Оценено: 4 направления
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-4 gap-3 print:gap-1.5">
          {rec.allMatches.map((m, index) => {
            const isSelected = selectedRoleKey === m.benchmark.roleKey;
            const isBest = index === 0;
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "4️⃣";

            return (
              <button
                key={m.benchmark.roleKey}
                onClick={() => setSelectedRoleKey(m.benchmark.roleKey)}
                type="button"
                className={`p-4 print:p-1.5 rounded-2xl text-left border transition flex flex-col justify-between gap-3 print:gap-1 ${
                  isSelected
                    ? "border-teal-600 bg-teal-50/50 ring-2 ring-teal-200 shadow-sm print:bg-white print:border-teal-700 print:ring-0"
                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 print:bg-white print:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs print:text-[9px]">{medal}</span>
                      <span className="text-xs print:text-[8.5px] font-black text-slate-900 leading-tight">
                        {m.benchmark.nameRu}
                      </span>
                    </div>
                    {isBest && (
                      <span className="inline-block px-1.5 py-0.2 rounded-full text-[8px] print:text-[7px] font-black bg-teal-600 text-white uppercase tracking-wider">
                        Топ выбор
                      </span>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-lg print:text-xs font-black text-slate-900 leading-tight">
                      {m.matchPercentage}%
                    </div>
                    <span className={`text-[9px] print:text-[7px] font-bold px-1.5 py-0.2 rounded-full border ${m.gradeColor}`}>
                      {m.gradeTitle.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 print:h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.matchPercentage >= 85
                        ? "bg-emerald-500"
                        : m.matchPercentage >= 70
                        ? "bg-teal-500"
                        : m.matchPercentage >= 55
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${m.matchPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] print:text-[7.5px] font-semibold text-slate-600">
                  <span>Целевых: {m.matchedPrimeTalents.length}</span>
                  <span className="text-teal-700 flex items-center gap-0.5 print:hidden">
                    {isSelected ? "Выбрано" : "Паспорт"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DETAILED DOSSIER PASSPORT FOR SELECTED ROLE */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 print:p-2.5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 print:space-y-2">
        <div className="border-b border-slate-100 pb-4 print:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:gap-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1 print:mb-0.5">
              <span className="px-2.5 py-0.5 print:px-1.5 print:py-0 rounded-full text-xs print:text-[8px] font-black bg-teal-100 text-teal-800">
                {benchmark.badge}
              </span>
              <span className="text-xs print:text-[8px] text-slate-500">
                Детальный корпоративный эталон
              </span>
            </div>
            <h3 className="text-xl print:text-xs font-black text-slate-900 leading-tight">
              Паспорт Должности: {benchmark.nameRu}
            </h3>
            <p className="text-xs print:text-[8px] text-slate-600 mt-0.5 print:mt-0 italic">
              {benchmark.keyMotto}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 print:px-2 print:py-0.5 rounded-xl bg-slate-100 text-slate-700 text-xs print:text-[8px] font-bold">
              Совместимость: <span className="text-teal-700 font-extrabold">{currentMatch.matchPercentage}%</span>
            </div>
            <span className={`px-2.5 py-1 print:px-1.5 print:py-0.5 rounded-xl text-xs print:text-[8px] font-extrabold border ${currentMatch.gradeColor}`}>
              {currentMatch.gradeTitle}
            </span>
          </div>
        </div>

        {/* Manager Verdict Banner for this role */}
        <div className="p-3.5 print:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs print:text-[8px] text-slate-700 print-avoid-break">
          <Sparkles className="w-4 h-4 print:w-3 print:h-3 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900">Резюме для руководства: </span>
            {currentMatch.verdict}
          </p>
        </div>

        {/* Prime Talents Breakdown */}
        <div className="space-y-3 print:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs print:text-[8.5px] font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-4 h-4 print:w-3 print:h-3 text-teal-600" />
              Обязательные таланты Gallup для этой роли (Топ-5 кандидата):
            </span>
            <span className="text-[11px] print:text-[7.5px] font-semibold text-slate-500">
              {currentMatch.matchedPrimeTalents.length} из {benchmark.primeTalents.length} совпало
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-3 gap-2 print:gap-1">
            {benchmark.primeTalents.map((pt) => {
              const isMatched = currentMatch.matchedPrimeTalents.some((m) => m.id === pt.id);
              const foundInAll = results.allRanked.findIndex((t) => t.id === pt.id);
              const rank = foundInAll !== -1 ? foundInAll + 1 : 34;

              return (
                <div
                  key={pt.id}
                  className={`p-3 print:p-1 rounded-2xl print:rounded-xl border text-xs print:text-[7.5px] flex items-start justify-between gap-1.5 ${
                    isMatched
                      ? "bg-teal-50/70 border-teal-200 text-slate-800"
                      : "bg-slate-50/70 border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      {isMatched ? (
                        <CheckCircle2 className="w-3.5 h-3.5 print:w-2.5 print:h-2.5 text-teal-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 print:w-2.5 print:h-2.5 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 print:text-[8px]">{pt.nameRu}</span>
                    </div>
                    <p className="text-[11px] print:text-[7px] text-slate-600 leading-tight">
                      {pt.reason}
                    </p>
                  </div>
                  <span className={`text-[10px] print:text-[6.5px] font-extrabold px-2 py-0.5 print:px-1 print:py-0 rounded-full flex-shrink-0 ${
                    rank <= 5 
                      ? "bg-purple-100 text-purple-800" 
                      : rank <= 10 
                      ? "bg-slate-200 text-slate-700" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    #{rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation and Psychotype Alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 print:gap-1.5 print-avoid-break">
          {/* Motivation Alignment */}
          <div className="p-4 print:p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 print:space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs print:text-[8px] font-bold text-slate-800 flex items-center gap-1.5">
                <Coins className="w-4 h-4 print:w-3 print:h-3 text-amber-500" />
                Мотивационная Синергия
              </span>
              <span
                className={`text-[10px] print:text-[7px] font-extrabold px-2 py-0.5 print:px-1 print:py-0 rounded-full ${
                  currentMatch.motivationMatch
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {currentMatch.motivationMatch ? "Точное совпадение" : "Допустимый баланс"}
              </span>
            </div>
            <div className="text-xs print:text-[7.5px] text-slate-600 space-y-0.5">
              <div>
                <span className="text-slate-400">Целевой эталон: </span>
                <span className="font-bold text-slate-800">
                  {benchmark.targetMotivation.primary} + {benchmark.targetMotivation.secondary}
                </span>
              </div>
              <div>
                <span className="text-slate-400">У сотрудника: </span>
                <span className="font-bold text-teal-700">
                  {results.motivation?.dominant?.badge || results.motivation?.dominant?.nameRu || "Результатник"}
                </span>
              </div>
              <p className="text-[11px] print:text-[7px] text-slate-500 leading-tight">
                {benchmark.targetMotivation.rationale}
              </p>
            </div>
          </div>

          {/* Psychotype Alignment */}
          <div className="p-4 print:p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 print:space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs print:text-[8px] font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 print:w-3 print:h-3 text-blue-500" />
                Коммуникативный Психотип
              </span>
              <span
                className={`text-[10px] print:text-[7px] font-extrabold px-2 py-0.5 print:px-1 print:py-0 rounded-full ${
                  currentMatch.psychotypeMatch
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {currentMatch.psychotypeMatch ? "Идеальный стиль" : "Рабочий стиль"}
              </span>
            </div>
            <div className="text-xs print:text-[7.5px] text-slate-600 space-y-0.5">
              <div>
                <span className="text-slate-400">Целевой эталон: </span>
                <span className="font-bold text-slate-800">
                  {benchmark.targetPsychotype.primary} + {benchmark.targetPsychotype.secondary}
                </span>
              </div>
              <div>
                <span className="text-slate-400">У сотрудника: </span>
                <span className="font-bold text-blue-700">
                  {results.psychotype?.dominant?.badge || results.psychotype?.dominant?.nameRu || "Дружелюбный"}
                </span>
              </div>
              <p className="text-[11px] print:text-[7px] text-slate-500 leading-tight">
                {benchmark.targetPsychotype.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Special Framework: Svetlana Ivanova Profile for HR or Behavioral Model */}
        {benchmark.ivanovaProfile ? (
          <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-indigo-50/50 border border-indigo-200 shadow-sm space-y-3 print:space-y-1 print-avoid-break">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm print:text-[8.5px] font-bold text-indigo-950 flex items-center gap-1.5">
                <Brain className="w-4 h-4 print:w-3 print:h-3 text-indigo-600" />
                Поведенческий Профиль по Методике Светланы Ивановой (Массовый подбор)
              </h3>
              <span className="text-[10px] print:text-[7px] font-extrabold px-2 py-0.5 print:px-1 print:py-0 rounded-full bg-indigo-100 text-indigo-800">
                HR-Стандарт
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-3 gap-2 print:gap-1 text-xs print:text-[7.5px]">
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Тип референции:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.reference}</span>
              </div>
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Стремление / Избегание:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.motivationVector}</span>
              </div>
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Процесс / Результат:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.processResult}</span>
              </div>
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Процедуры / Возможности:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.proceduresOpportunities}</span>
              </div>
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Активность / Рефлективность:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.activityReflectivity}</span>
              </div>
              <div className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block text-[8px]">Командная роль:</span>
                <span className="text-slate-600">{benchmark.ivanovaProfile.teamRole}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-sm print:text-[8.5px] font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 print:w-3 print:h-3 text-teal-600" />
              {benchmark.behavioralModel.title}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 print:gap-1 text-xs print:text-[7.5px] text-slate-700">
              {benchmark.behavioralModel.items.map((item, i) => (
                <li key={i} className="p-2.5 print:p-1 rounded-xl bg-white border border-slate-200 flex items-start gap-1.5">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flags & Stop Factors */}
        <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5 print:space-y-1 print-avoid-break">
          <h3 className="text-xs sm:text-sm print:text-[8.5px] font-bold text-rose-950 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 print:w-3 print:h-3 text-rose-600" />
            Критические Стоп-Факторы и Красные Флаги Должности
          </h3>
          <p className="text-[11px] print:text-[7px] text-rose-800/80">
            Признаки профессионального выгорания или несоответствия стандартам 35 Health Clubs:
          </p>
          <ul className="space-y-1.5 print:space-y-0.5 text-xs print:text-[7.5px] text-rose-900">
            {benchmark.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Manager Checklist (Interview, Adaptation, KPI) */}
        <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 print:space-y-1 print-avoid-break">
          <h3 className="text-xs sm:text-sm print:text-[8.5px] font-bold text-teal-950 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 print:w-3 print:h-3 text-teal-700" />
            Инструкция для Руководителя (Чек-лист РОПа / HRD)
          </h3>
          <div className="space-y-2 print:space-y-1 text-xs print:text-[7.5px]">
            <div className="p-2.5 print:p-1 rounded-xl bg-white border border-teal-100">
              <span className="font-bold text-teal-900 block text-xs print:text-[8px]">🎯 Проверка на собеседовании:</span>
              <span className="text-slate-600 print:text-[7.5px] leading-snug">{benchmark.managerAdvice.interviewCheck}</span>
            </div>
            <div className="p-2.5 print:p-1 rounded-xl bg-white border border-teal-100">
              <span className="font-bold text-teal-900 block text-xs print:text-[8px]">🚀 Подсказка по адаптации:</span>
              <span className="text-slate-600 print:text-[7.5px] leading-snug">{benchmark.managerAdvice.adaptationHint}</span>
            </div>
            <div className="p-2.5 print:p-1 rounded-xl bg-white border border-teal-100">
              <span className="font-bold text-teal-900 block text-xs print:text-[8px]">📊 Фокусные KPI должности:</span>
              <span className="text-slate-600 print:text-[7.5px] leading-snug">{benchmark.managerAdvice.kpiFocus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

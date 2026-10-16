"use client";

import { 
  RoleBenchmark, 
  calculateRoleMatch, 
  normalizeRoleKey, 
  CountryCode 
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
  FileCheck
} from "lucide-react";

interface RoleBenchmarkCardProps {
  results: AssessmentResult;
  roleName: string;
  country?: "uz" | "kz";
}

export function RoleBenchmarkCard({ results, roleName, country = "kz" }: RoleBenchmarkCardProps) {
  const roleKey = normalizeRoleKey(roleName);
  const match = calculateRoleMatch(results, roleKey, country);
  const { benchmark } = match;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Overall Match Score Hero */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {benchmark.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200">
                {country === "uz" ? "🇺🇿 Узбекистан" : "🇰🇿 Казахстан"}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {benchmark.nameRu}
            </h2>

            <p className="text-xs sm:text-sm text-teal-100 font-medium">
              {benchmark.headline}
            </p>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs italic text-teal-200 font-medium">
              {benchmark.keyMotto}
            </div>
          </div>

          {/* Big Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[150px] text-center">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-teal-300">
              {match.matchPercentage}%
            </div>
            <div className="text-[11px] uppercase tracking-wider text-teal-200/80 font-bold mt-0.5">
              35 Match Score
            </div>
            <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${match.gradeColor}`}>
              {match.gradeTitle}
            </div>
          </div>
        </div>

        {/* Manager Verdict Banner */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-start gap-2 text-xs text-slate-200">
          <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <span className="text-white font-bold">Вердикт для руководства: </span>
            {match.verdict}
          </p>
        </div>
      </div>

      {/* 2. Gallup Prime Talents Alignment */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-teal-600" />
          Проекция Ключевых Суперсил Gallup для Должности
        </h3>
        <p className="text-xs text-slate-500">
          Сопоставление природных талантов сотрудника с эталонным профилем позиции:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benchmark.primeTalents.map((pt) => {
            const foundInTop5 = results.top5.find((t) => t.id === pt.id);
            const foundRank = results.allRanked.findIndex((t) => t.id === pt.id) + 1;
            const isMatch = foundRank <= 10;

            return (
              <div
                key={pt.id}
                className={`p-3 rounded-xl border flex items-start gap-2.5 transition ${
                  foundInTop5
                    ? "bg-emerald-50/70 border-emerald-300"
                    : isMatch
                    ? "bg-teal-50/50 border-teal-200"
                    : "bg-slate-50 border-slate-200 opacity-75"
                }`}
              >
                <div className="mt-0.5">
                  {foundInTop5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isMatch ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {pt.nameRu}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        foundInTop5
                          ? "bg-emerald-600 text-white"
                          : isMatch
                          ? "bg-teal-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {foundRank <= 34 ? `#${foundRank}` : "—"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {pt.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Motivation & Psychotype Synergy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Motivation Alignment */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              Мотивационный Профиль
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                match.motivationMatch
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {match.motivationMatch ? "Точное совпадение" : "Допустимый баланс"}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
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
            <p className="text-[11px] text-slate-500 pt-1 leading-snug">
              {benchmark.targetMotivation.rationale}
            </p>
          </div>
        </div>

        {/* Psychotype Alignment */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              Коммуникативный Психотип
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                match.psychotypeMatch
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {match.psychotypeMatch ? "Идеальный стиль" : "Рабочий стиль"}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
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
            <p className="text-[11px] text-slate-500 pt-1 leading-snug">
              {benchmark.targetPsychotype.rationale}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Special Framework: Svetlana Ivanova Profile for HR or Behavioral Model */}
      {benchmark.ivanovaProfile ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-600" />
            Поведенческий Профиль по методике Светланы Ивановой (Эталон HR)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Тип референции:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.reference}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Стремление / Избегание:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.motivationVector}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Процесс / Результат:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.processResult}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Процедуры / Возможности:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.proceduresOpportunities}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Активность / Рефлективность:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.activityReflectivity}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-800 block">Командная роль:</span>
              <span className="text-slate-600">{benchmark.ivanovaProfile.teamRole}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            {benchmark.behavioralModel.title}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {benchmark.behavioralModel.items.map((item, i) => (
              <li key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Red Flags & Stop Factors */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Критические Стоп-Факторы и Красные Флаги Должности
        </h3>
        <p className="text-[11px] text-rose-800/80">
          Признаки профессионального выгорания или несоответствия стандартам 35 Health Clubs:
        </p>
        <ul className="space-y-1.5 text-xs text-rose-900">
          {benchmark.redFlags.map((flag, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Manager Checklist (Interview, Adaptation, KPI) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-teal-950 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-teal-700" />
          Инструкция для Руководителя (Чек-лист РОПа / HRD)
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-teal-150">
            <span className="font-bold text-teal-900 block">🎯 Проверка на собеседовании:</span>
            <span className="text-slate-600">{benchmark.managerAdvice.interviewCheck}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-teal-150">
            <span className="font-bold text-teal-900 block">🚀 Подсказка по адаптации:</span>
            <span className="text-slate-600">{benchmark.managerAdvice.adaptationHint}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-teal-150">
            <span className="font-bold text-teal-900 block">📊 Фокусные KPI должности:</span>
            <span className="text-slate-600">{benchmark.managerAdvice.kpiFocus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

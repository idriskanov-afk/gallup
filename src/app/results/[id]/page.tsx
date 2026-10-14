"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Sparkles, 
  Target, 
  Zap, 
  Users, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Printer, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield
} from "lucide-react";
import { AssessmentResult, Domain, ScoredTalent } from "@/lib/types";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTalentId, setExpandedTalentId] = useState<number | null>(null);
  const [showAll34, setShowAll34] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Не удалось загрузить результаты");
        }
        if (data.session?.status === "completed" && data.results) {
          setSession(data.session);
          setResults(data.results);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          // Check localStorage fallback
          if (typeof window !== "undefined") {
            const localStored = localStorage.getItem(`gallup_results_${sessionId}`);
            if (localStored) {
              const parsed = JSON.parse(localStored);
              setResults(parsed);
              setSession(data.session || {
                id: sessionId,
                employeeName: "Сотрудник",
                employeeRole: "Сотрудник",
              });
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } else {
              router.replace(`/test/${sessionId}`);
              return;
            }
          }
        }
      } catch (err: any) {
        // Fallback to local storage
        if (typeof window !== "undefined") {
          const localStored = localStorage.getItem(`gallup_results_${sessionId}`);
          if (localStored) {
            try {
              const parsed = JSON.parse(localStored);
              setResults(parsed);
              setSession({
                id: sessionId,
                employeeName: "Сотрудник",
                employeeRole: "Сотрудник",
              });
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              setLoading(false);
              return;
            } catch {}
          }
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId, router]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Результаты теста CliftonStrengths: ${session?.employeeName}`,
          text: `Мои топ-5 талантов: ${results?.top5.map((t) => t.nameRu).join(", ")}`,
          url,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDomainStyle = (domain: Domain) => {
    switch (domain) {
      case "executing":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          badge: "bg-purple-600 text-white",
          text: "text-purple-700",
          label: "Исполнение",
          icon: Target,
        };
      case "influencing":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge: "bg-orange-500 text-white",
          text: "text-orange-700",
          label: "Влияние",
          icon: Zap,
        };
      case "relationship":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-600 text-white",
          text: "text-blue-700",
          label: "Отношения",
          icon: Users,
        };
      case "strategic":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          badge: "bg-emerald-600 text-white",
          text: "text-emerald-700",
          label: "Мышление",
          icon: Brain,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Формирование вашего профиля талантов...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
          <p className="text-sm font-semibold">{error || "Результаты не найдены"}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
        >
          На главную
        </button>
      </div>
    );
  }

  const durationMin = Math.round(results.totalTimeMs / 60000) || 1;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-2xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Тестирование успешно завершено
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {session.employeeName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {session.employeeRole} • Время прохождения: {durationMin} мин • Точных выборов со скоростным бонусом: {results.speedBonusHits}
        </p>
      </div>

      {/* Dominant Domain Showcase */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
              Доминирующий домен
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
            {getDomainStyle(results.dominantDomain).label}
          </span>
        </div>

        {/* 4 Domains Distribution Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {results.domains.map((dom) => {
            const style = getDomainStyle(dom.domain);
            const Icon = style.icon;
            const isDominant = dom.domain === results.dominantDomain;

            return (
              <div
                key={dom.domain}
                className={`p-3 rounded-xl border transition ${
                  isDominant
                    ? "bg-white/15 border-amber-400/60 shadow-inner"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    {dom.nameRu}
                  </span>
                  <span className="font-extrabold">{dom.percentage}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full"
                    style={{ width: `${dom.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-300 flex justify-between">
                  <span>Баллы: {dom.score}</span>
                  <span>В Топ-5: {dom.talentsInTop5}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP-5 SIGNATURE THEMES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Топ-5 Главных Талантов
          </h2>
          <span className="text-xs text-slate-400 font-medium">Ваша главная суперсила</span>
        </div>

        <div className="space-y-3">
          {results.top5.map((talent) => {
            const style = getDomainStyle(talent.domain);
            const Icon = style.icon;
            const isExpanded = expandedTalentId === talent.id;

            return (
              <div
                key={talent.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border-2 ${style.border} shadow-sm transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                      #{talent.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {talent.nameRu}
                        </h3>
                        <span className="text-xs text-slate-400 font-normal">
                          ({talent.nameEn})
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Балл: <span className="font-semibold text-slate-700">{talent.score}</span> • Точных совпадений: {talent.strongChoicesCount}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTalentId(isExpanded ? null : talent.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
                  {talent.shortDescription}
                </p>

                {/* Expanded Manager Guide Insights */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-150 space-y-2 text-xs bg-slate-50/80 p-3 rounded-xl">
                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      Как этот талант лучше всего применять в работе:
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-slate-600">
                      <div>
                        <span className="font-bold text-slate-700">Идеальные задачи:</span>{" "}
                        {talent.managerGuide.tasks}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Что мотивирует:</span>{" "}
                        {talent.managerGuide.motivation}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Триггеры демотивации:</span>{" "}
                        {talent.managerGuide.demotivationTriggers}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BLIND SPOTS (Ranks 30..34) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Слепая зона (Места 30–34)
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Это не слабости или дефекты. Это модели мышления, которые отнимают у вас больше всего энергии. В этих сферах лучше опираться на надежных напарников или готовые регламенты и чек-листы:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {results.blindSpots.map((b) => (
            <div key={b.id} className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-xs">
              <span className="font-bold text-slate-800">#{b.rank} {b.nameRu}</span>{" "}
              <span className="text-slate-500">({b.nameEn})</span>
              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {b.shortDescription}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL 34 TALENTS ACCORDION */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAll34(!showAll34)}
          className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
        >
          <span>{showAll34 ? "Скрыть полный список" : "Посмотреть полный рейтинг всех 34 талантов"}</span>
          {showAll34 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAll34 && (
          <div className="space-y-1.5 pt-1">
            {results.allRanked.map((t) => {
              const style = getDomainStyle(t.domain);
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs bg-white ${
                    t.rank <= 5
                      ? `${style.border} font-bold`
                      : t.rank >= 30
                      ? "border-slate-200 opacity-70"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center font-black text-slate-500">
                      #{t.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{t.nameRu}</span>
                      <span className="text-slate-400 ml-1.5 text-[11px]">({t.nameEn})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="font-mono text-slate-600 font-bold w-12 text-right">
                      {t.score} б
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <button
          onClick={handleShare}
          className="flex-1 py-3 px-4 bg-purple-600 text-white font-bold rounded-xl text-xs shadow hover:bg-purple-700 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Ссылка скопирована!" : "Поделиться результатами"}
        </button>

        <button
          onClick={() => window.print()}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Распечатать / Сохранить в PDF
        </button>

        <button
          onClick={() => router.push("/")}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          На главную
        </button>
      </div>
    </div>
  );
}

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
  Shield,
  Lightbulb,
  AlertCircle,
  BookOpen,
  FileSpreadsheet,
  Coins,
  Crown,
  Flame,
  FileCheck,
  Heart,
  Palette,
  Crosshair,
  Compass,
  MessageSquare,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { AssessmentResult, Domain, ScoredTalent } from "@/lib/types";
import { TALENT_INSIGHTS } from "@/lib/data/talent-insights";
import { MOTIVATION_TYPES, PSYCHOTYPES, CLIENT_COLORS } from "@/lib/data/sales-frameworks";
import { RoleBenchmarkCard } from "@/components/RoleBenchmarkCard";
import { analyzeBestRoleFit } from "@/lib/data/role-benchmarks";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"talents" | "benchmark" | "motivation" | "psychotype" | "sales">("talents");
  const [expandedTalentId, setExpandedTalentId] = useState<number | null>(null);
  const [showAll34, setShowAll34] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadResults() {
      // 1. Try reading from localStorage first (0ms latency fallback)
      if (typeof window !== "undefined") {
        const localStored = localStorage.getItem(`gallup_results_${sessionId}`);
        if (localStored) {
          try {
            const parsed = JSON.parse(localStored);
            setResults(parsed);
            
            const activeSession = localStorage.getItem("gallup_active_session");
            if (activeSession) {
              const parsedActive = JSON.parse(activeSession);
              setSession(parsedActive);
            } else {
              setSession({
                id: sessionId,
                employeeName: "Сотрудник",
                employeeRole: "Сотрудник",
              });
            }
            setLoading(false);
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {}
        }
      }

      // 2. Fetch from server
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();

        if (data.session?.status === "completed" && data.results) {
          setSession(data.session);
          setResults(data.results);
          setLoading(false);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else if (!results) {
          router.replace(`/test/${sessionId}`);
        }
      } catch (err: any) {
        if (!results) {
          setError(err.message || "Не удалось загрузить данные");
        }
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId, router]);

  const copyToClipboard = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Failed to copy URL:", e);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `35 Health Clubs | Профиль CliftonStrengths: ${session?.employeeName}`,
          text: `Топ-5 талантов: ${results?.top5.map((t) => t.nameRu).join(", ")} | Мотивация: ${results?.motivation?.dominant.nameRu}`,
          url,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await copyToClipboard();
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
          desc: "Превращение идей в осязаемый результат. Неутомимая работа на закрытие задач и точность процессов."
        };
      case "influencing":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge: "bg-orange-500 text-white",
          text: "text-orange-700",
          label: "Влияние",
          icon: Zap,
          desc: "Умение брать инициативу, вдохновлять команду, убеждать клиентов и вести за собой к победе."
        };
      case "relationship":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-600 text-white",
          text: "text-blue-700",
          label: "Отношения",
          icon: Users,
          desc: "Создание крепких связей, цементирование смены, эмпатия и забота о клиентах и напарниках."
        };
      case "strategic":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          badge: "bg-emerald-600 text-white",
          text: "text-emerald-700",
          label: "Мышление",
          icon: Brain,
          desc: "Анализ данных, поиск неочевидных связей, быстрое нахождение наилучшего пути и тяга к знаниям."
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Формирование комплексного бизнес-профайла 35 Health Clubs...</p>
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
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition"
        >
          На главную
        </button>
      </div>
    );
  }

  const durationMin = Math.round(results.totalTimeMs / 60000) || 1;
  const dominantStyle = getDomainStyle(results.dominantDomain);
  const motiv = results.motivation;
  const psycho = results.psychotype;
  const sales = results.salesProfile;
  const bestRoleRec = analyzeBestRoleFit(results, session?.employeeRole, session?.country || "kz");

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-3xl mx-auto pb-16 print:p-0 print:max-w-none print:pb-0">
      
      {/* ============================================================== */}
      {/* PRINT-ONLY OFFICIAL REPORT COVER HEADER */}
      {/* ============================================================== */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="35 Health Clubs" className="h-12 object-contain" />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-teal-700">
                35 HEALTH CLUBS • CliftonStrengths® 2.0 • Комплексный Бизнес-Профайлинг
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Персональное Досье Линейного Сотрудника
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Оценка 34 талантов Gallup + Мотивационная типология + Коммуникативный психотип DISC + Матрица продаж
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5 font-mono">
            <div><span className="font-bold">Сотрудник:</span> {session?.employeeName}</div>
            <div><span className="font-bold">Должность:</span> {session?.employeeRole}</div>
            <div><span className="font-bold">Рекомендация:</span> {bestRoleRec.bestMatch.benchmark.nameRu} ({bestRoleRec.bestMatch.matchPercentage}%)</div>
            <div><span className="font-bold">Тип мотивации:</span> {motiv?.dominant.badge}</div>
            <div><span className="font-bold">Психотип:</span> {psycho?.dominant.badge}</div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WEB HEADER BANNER */}
      {/* ============================================================== */}
      <div className="text-center space-y-2 pt-2 print:hidden">
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="35 Health Clubs" className="h-12 sm:h-14 object-contain" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          Комплексный профиль сотрудника 35 Health Clubs
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {session?.employeeName || "Сотрудник"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {session?.employeeRole || "Сотрудник"} • Затраченное время: {durationMin} мин • Скоростных инстинктивных ответов: {results.speedBonusHits}
        </p>

        {/* Quick Multi-Vector Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {motiv && (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-300 shadow-sm flex items-center gap-1">
              {motiv.dominant.badge} ({motiv.dominant.percentage}%)
            </span>
          )}
          {psycho && (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-300 shadow-sm flex items-center gap-1">
              {psycho.dominant.badge}
            </span>
          )}
          {sales && (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-300 shadow-sm flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-teal-600" />
              Ориентация: {sales.orientationLabel} ({sales.resultOrientationPercent}%)
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* RECOMMENDED ROLE HERO CALLOUT BANNER (CLICKABLE TO OPEN TAB) */}
      {/* ============================================================== */}
      <div 
        onClick={() => setActiveTab("benchmark")}
        className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-md hover:shadow-xl transition border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group print:hidden"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Идеальное призвание
            </span>
            <span className="text-xs text-teal-300 font-extrabold">
              Совместимость: {bestRoleRec.bestMatch.matchPercentage}% ({bestRoleRec.bestMatch.gradeTitle.split(" ")[0]})
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-white group-hover:text-teal-300 transition">
            Вам больше всего подходит роль: <span className="underline decoration-teal-400 underline-offset-4">{bestRoleRec.bestMatch.benchmark.nameRu}</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-1">
            {bestRoleRec.whySuitable.headline}
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2.5 bg-teal-500 group-hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow transition whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
        >
          <Target className="w-4 h-4" />
          <span>Узнать почему</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* DIRECT SHARE / COPY RESULT LINK CARD */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-teal-500/30 shadow-sm space-y-3 print:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Прямая ссылка на результат сотрудника
              </h3>
              <p className="text-[11px] text-slate-500">
                Скопируйте ссылку для руководителя, HR или личного архива
              </p>
            </div>
          </div>
          {copied && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Скопировано!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={typeof window !== "undefined" ? window.location.href : ""}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 px-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap ${
              copied
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Скопировать ссылку
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NAVIGATION TABS (WEB ONLY) */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm font-bold print:hidden">
        <button
          onClick={() => setActiveTab("talents")}
          className={`py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "talents"
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Таланты Gallup (34)
        </button>

        <button
          onClick={() => setActiveTab("benchmark")}
          className={`py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "benchmark"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Target className="w-4 h-4" />
          🎯 Рекомендованная роль & 35 Match™
        </button>

        <button
          onClick={() => setActiveTab("motivation")}
          className={`py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "motivation"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Coins className="w-4 h-4" />
          Тип Мотивации (5)
        </button>

        <button
          onClick={() => setActiveTab("psychotype")}
          className={`py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "psychotype"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Психотип Общения (DISC)
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "sales"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Palette className="w-4 h-4" />
          Продажи & Клиенты
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION: 35 MATCH BENCHMARK (Visible on Tab or Print) */}
      {/* ============================================================== */}
      <div className={`space-y-6 ${activeTab === "benchmark" ? "block" : "hidden print:block"}`}>
        <RoleBenchmarkCard
          results={results}
          roleName={session?.employeeRole || "Сотрудник"}
          country={session?.country || "kz"}
        />
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: GALLUP CLIFTONSTRENGTHS 34 (Visible on Tab or Print) */}
      {/* ============================================================== */}
      <div className={`space-y-6 ${activeTab === "talents" ? "block" : "hidden print:block"}`}>
        
        {/* HOW TO READ THIS REPORT */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700 print-avoid-break">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <BookOpen className="w-4 h-4 text-purple-600" />
            Как читать и применять ваш отчет CliftonStrengths
          </div>
          <p className="leading-relaxed">
            Методология Gallup ранжирует все 34 таланта по степени вашей естественной силы. Это карта ваших врожденных сильных сторон:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-100/50 border border-purple-200">
              <span className="font-bold text-purple-900 block mb-0.5">🔥 Места 1–5: Топ-5</span>
              <span className="text-[11px] text-purple-800 leading-tight block">
                Ваши доминирующие таланты. Это ядро вашей суперсилы, дающее 80% успеха и драйва.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-200/50 border border-slate-300">
              <span className="font-bold text-slate-800 block mb-0.5">⚙️ Места 6–29: Опора</span>
              <span className="text-[11px] text-slate-600 leading-tight block">
                Поддерживающие таланты. Ваш надежный рабочий инструментарий, включаемый по ситуации.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100/50 border border-amber-200">
              <span className="font-bold text-amber-900 block mb-0.5">🛡️ Места 30–34: Слепая зона</span>
              <span className="text-[11px] text-amber-800 leading-tight block">
                Энергозатратные сферы. Не ломайте себя — здесь эффективнее опереться на чек-листы или напарника.
              </span>
            </div>
          </div>
        </div>

        {/* DOMINANT DOMAIN SHOWCASE */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4 print:bg-white print:text-slate-900 print:border print:border-slate-300 print:shadow-none print-avoid-break">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 print:text-amber-600" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300 print:text-slate-700">
                Доминирующий домен эффективности:
              </span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
              {dominantStyle.label}
            </span>
          </div>

          <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            {dominantStyle.desc}
          </p>

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
                      ? "bg-white/15 border-amber-400/60 shadow-inner print:bg-slate-50 print:border-slate-400"
                      : "bg-white/5 border-white/10 print:bg-white print:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold flex items-center gap-1 text-white print:text-slate-900">
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      {dom.nameRu}
                    </span>
                    <span className="font-extrabold text-white print:text-slate-900">{dom.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1 print:bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full print:bg-purple-600"
                      style={{ width: `${dom.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-300 print:text-slate-600 flex justify-between">
                    <span>Баллы: {dom.score}</span>
                    <span>В Топ-5: {dom.talentsInTop5}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP-5 SIGNATURE THEMES */}
        <div className="space-y-4 print-avoid-break">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Топ-5 Главных Талантов (Signature Themes)
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Ядро вашей профессиональной силы
            </span>
          </div>

          <div className="space-y-4">
            {results.top5.map((talent) => {
              const style = getDomainStyle(talent.domain);
              const insight = TALENT_INSIGHTS[talent.slug];
              const isExpanded = expandedTalentId === talent.id;

              return (
                <div
                  key={talent.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border-2 ${style.border} shadow-sm print:shadow-none print-avoid-break transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                        #{talent.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base">
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
                          Балл: <span className="font-bold text-slate-700">{talent.score}</span> • Категоричных выборов: {talent.strongChoicesCount}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedTalentId(isExpanded ? null : talent.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition print:hidden"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
                    {talent.shortDescription}
                  </p>

                  <div className={`mt-4 pt-3 border-t border-slate-150 space-y-3 text-xs ${isExpanded ? "block" : "hidden print:block"}`}>
                    {insight && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                            В чем ваша суперсила:
                          </span>
                          <p className="text-emerald-800 text-[11px] leading-relaxed">
                            {insight.superpower}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                          <span className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                            Совет на каждую смену:
                          </span>
                          <p className="text-blue-800 text-[11px] leading-relaxed">
                            {insight.actionTip}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 sm:col-span-2">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Ловушка таланта (Слепая зона сильной стороны):
                          </span>
                          <p className="text-amber-800 text-[11px] leading-relaxed">
                            {insight.watchOut}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        Инструкция для руководителя по этому таланту:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-slate-700 text-[11px]">
                        <div><span className="font-bold text-slate-900">📌 Задачи в смене:</span> {talent.managerGuide.tasks}</div>
                        <div><span className="font-bold text-emerald-800">🎯 Мотивация:</span> {talent.managerGuide.motivation}</div>
                        <div><span className="font-bold text-indigo-800">🔍 Контроль:</span> {talent.managerGuide.control}</div>
                        <div><span className="font-bold text-rose-800">⚠️ Триггеры демотивации:</span> {talent.managerGuide.demotivationTriggers}</div>
                      </div>
                    </div>
                  </div>

                  {!isExpanded && (
                    <button
                      onClick={() => setExpandedTalentId(talent.id)}
                      className="mt-2 text-[11px] text-purple-600 font-bold hover:underline flex items-center gap-1 print:hidden"
                    >
                      Показать суперсилу, ловушки и советы для смены <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BLIND SPOTS (30-34) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2.5 print-avoid-break">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Слепая зона (Места 30–34) — Зоны наибольших энергозатрат
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            В методологии CliftonStrengths низкие ранги — это не дефекты. Это задачи, которые отнимают больше всего энергии. Не ломайте себя — используйте компенсаторные стратегии:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {results.blindSpots.map((b) => (
              <div key={b.id} className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-slate-800">#{b.rank} {b.nameRu}</span>
                  <span className="text-[10px] text-amber-700 font-bold uppercase">{b.domain}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {b.shortDescription}
                </p>
                <div className="mt-1 pt-1 border-t border-amber-100 text-[10px] text-amber-900 font-medium">
                  💡 Компенсация: шаблоны, чек-листы или помощь напарника.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FULL 34 TALENTS TABLE */}
        <div className="space-y-3 print-page-break">
          <button
            onClick={() => setShowAll34(!showAll34)}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition print:hidden"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
              {showAll34 ? "Скрыть полный реестр 34 талантов" : "Посмотреть полный реестр всех 34 талантов (Полный файл данных)"}
            </span>
            {showAll34 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`space-y-3 ${showAll34 ? "block" : "hidden print:block"}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                Полный Реестр и Ранжирование Всех 34 Талантов
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden bg-white">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Ранг</th>
                    <th className="py-2.5 px-3">Талант</th>
                    <th className="py-2.5 px-3">Домен</th>
                    <th className="py-2.5 px-3 text-right">Баллы</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">Точно я</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">Ср. время</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {results.allRanked.map((t) => {
                    const style = getDomainStyle(t.domain);
                    const isTop5 = t.rank <= 5;
                    const isBlindSpot = t.rank >= 30;

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50 transition ${
                          isTop5
                            ? "bg-purple-50/50 font-bold"
                            : isBlindSpot
                            ? "bg-amber-50/30 opacity-80"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-3 text-center font-black text-slate-700">#{t.rank}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900">{t.nameRu}</span>
                          <span className="text-slate-400 ml-1.5 text-[10px]">({t.nameEn})</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{t.score}</td>
                        <td className="py-2 px-3 text-right text-slate-500 hidden sm:table-cell">{t.strongChoicesCount}</td>
                        <td className="py-2 px-3 text-right text-slate-500 font-mono text-[11px] hidden sm:table-cell">
                          {t.avgResponseTimeMs < 90000 ? `${(t.avgResponseTimeMs / 1000).toFixed(1)} с` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: MOTIVATION PROFILE (5 TYPES) */}
      {/* ============================================================== */}
      {motiv && (
        <div className={`space-y-5 print-page-break ${activeTab === "motivation" ? "block" : "hidden print:block"}`}>
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Мотивационный Профиль Сотрудника (5 типов)
            </h2>
            <p className="text-xs text-slate-500">
              Показывает истинные глубинные драйверы продуктивности, систему KPI и триггеры выгорания
            </p>
          </div>

          {/* Dominant Motivation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg space-y-3 print:bg-white print:text-slate-900 print:border print:border-amber-400 print:shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider opacity-90">
                Ведущий тип мотивации:
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs print:bg-amber-100 print:text-amber-900">
                {motiv.dominant.percentage}% совпадения
              </span>
            </div>

            <h3 className="text-2xl font-black text-white print:text-amber-900">
              {motiv.dominant.badge}
            </h3>

            {/* Behavior & Appearance Details */}
            {MOTIVATION_TYPES[motiv.dominant.typeId] && (
              <div className="space-y-2 text-xs pt-1 border-t border-white/20 print:border-slate-200">
                <p className="opacity-95 leading-relaxed">
                  <span className="font-bold">Поведение и стиль работы:</span> {MOTIVATION_TYPES[motiv.dominant.typeId].behavior}
                </p>
                <p className="opacity-95 leading-relaxed">
                  <span className="font-bold">О чем говорит в кулуарах:</span> {MOTIVATION_TYPES[motiv.dominant.typeId].speechTopics}
                </p>
              </div>
            )}
          </div>

          {/* All 5 Types Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Баланс всех 5 мотивационных векторов:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {motiv.all.map((m) => (
                <div key={m.typeId} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
                  <div className="flex justify-between items-center mb-1 font-bold text-slate-800">
                    <span>{m.badge}</span>
                    <span className="font-mono text-amber-600">{m.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${m.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Management Guide for this Motivation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Как правильно работать и мотивировать:
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-emerald-800">
                {motiv.howToWork.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Что категорически нельзя делать (Триггеры увольнения):
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-rose-800">
                {motiv.whatNotToDo.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 sm:col-span-2 space-y-1">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-600" />
                Рекомендованная система KPI и оплаты:
              </span>
              <p className="text-purple-800 text-xs leading-relaxed">
                {motiv.kpiRecommendations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: COMMUNICATION PSYCHOTYPE (DISC / 4 COLORS) */}
      {/* ============================================================== */}
      {psycho && (
        <div className={`space-y-5 print-page-break ${activeTab === "psychotype" ? "block" : "hidden print:block"}`}>
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Коммуникативный Психотип (DISC / 4 Цвета)
            </h2>
            <p className="text-xs text-slate-500">
              Манера речи, жесты, ключевые ценности и особенности поведения в команде и с клиентами
            </p>
          </div>

          {/* Dominant Psychotype Showcase */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-lg space-y-3 print:bg-white print:text-slate-900 print:border print:border-blue-400 print:shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider opacity-90">
                Ведущий психотип:
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs print:bg-blue-100 print:text-blue-900">
                {psycho.dominant.percentage}% выраженности
              </span>
            </div>

            <h3 className="text-2xl font-black text-white print:text-blue-900">
              {psycho.dominant.badge}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-white/20 print:border-slate-200">
              <div><span className="font-bold">Главная ценность:</span> {psycho.mainValue}</div>
              <div><span className="font-bold">Ключевой вопрос мышления:</span> {psycho.keyQuestion}</div>
              <div className="sm:col-span-2"><span className="font-bold">Манера речи:</span> {psycho.speechStyle}</div>
            </div>
          </div>

          {/* 4 Psychotypes Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {psycho.all.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="font-black text-lg text-slate-800">{p.percentage}%</div>
                <div className="font-bold text-slate-700 text-[11px] mt-0.5">{p.badge}</div>
              </div>
            ))}
          </div>

          {/* How to Communicate */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Памятка руководителю: Как эффективно общаться с этим психотипом
            </div>
            <p className="text-slate-700 leading-relaxed">
              {psycho.howToCommunicate}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: SALES MATRIX & CLIENT COMPATIBILITY */}
      {/* ============================================================== */}
      {sales && (
        <div className={`space-y-5 print-page-break ${activeTab === "sales" ? "block" : "hidden print:block"}`}>
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              Профиль в Продажах & Совместимость с Клиентами
            </h2>
            <p className="text-xs text-slate-500">
              Цветовая гамма клиентов, преодоление барьера Крок-мозга, АРО-контакт и естественный стиль дожима
            </p>
          </div>

          {/* Result vs Process Scale */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-teal-600" />
                Ориентация: <span className="text-teal-700 font-black">{sales.orientationLabel}</span>
              </span>
              <span className="font-mono text-teal-600 font-extrabold">{sales.resultOrientationPercent}% фокус на результат</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-teal-600 h-full" style={{ width: `${sales.resultOrientationPercent}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${100 - sales.resultOrientationPercent}%` }} />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>Цель, рекорды, скорость (Результатник)</span>
              <span>Регламент, стабильность, процесс (Процессник)</span>
            </div>
          </div>

          {/* Client Compatibility Cards (Best Match vs Challenge) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Best Match */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
              <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-full">
                Идеальный клиент (Максимум конверсии)
              </span>
              <h4 className="font-black text-sm text-emerald-950">
                {sales.bestClientMatch.nameRu} ({sales.bestClientMatch.badge})
              </h4>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                {sales.bestClientMatch.whyMatch}
              </p>
              <div className="pt-1.5 border-t border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">Как закрывать:</span>
                <ul className="list-disc list-inside text-emerald-800 text-[10px] space-y-0.5">
                  {sales.bestClientMatch.howToSell.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Challenging Match */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
              <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider bg-amber-200/60 px-2 py-0.5 rounded-full">
                Сложный клиент (Требуется адаптация)
              </span>
              <h4 className="font-black text-sm text-amber-950">
                {sales.challengingClientMatch.nameRu} ({sales.challengingClientMatch.badge})
              </h4>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {sales.challengingClientMatch.whyChallenge}
              </p>
              <div className="pt-1.5 border-t border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">Рекомендованная тактика:</span>
                <ul className="list-disc list-inside text-amber-800 text-[10px] space-y-0.5">
                  {sales.challengingClientMatch.recommendedTactics.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Neuro-sales & ARO Audit */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              Аудит навыков продаж (Нейробиология + АРО + Дожим)
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">
                  🧠 Прохождение барьера «Крок-мозга» клиента (по Орену Клаффу):
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {sales.crocBrainTactic}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">
                  🤝 Треугольник доверия АРО (Аффинити, Реальность, Общение):
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {sales.aroSkillDescription}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">
                  🎯 Органичный метод дожима и закрытия сделки:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {sales.closingMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WEB ACTION BUTTONS */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-4 print:hidden">
        <button
          onClick={copyToClipboard}
          className="flex-1 py-3.5 px-4 bg-teal-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-teal-700 active:scale-95 transition flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Ссылка скопирована в буфер!" : "Скопировать ссылку на результат"}
        </button>

        <button
          onClick={handleShare}
          className="py-3.5 px-4 bg-slate-800 text-white font-bold rounded-xl text-xs shadow hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-teal-400" />
          Поделиться
        </button>

        <button
          onClick={() => window.print()}
          className="py-3.5 px-5 bg-slate-900 text-white font-bold rounded-xl text-xs shadow hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4 text-teal-300" />
          Распечатать отчет (PDF)
        </button>

        <button
          onClick={() => router.push("/")}
          className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          На главную
        </button>
      </div>

      {/* Print Footer Watermark */}
      <div className="hidden print:block text-center text-[10px] text-slate-400 pt-6 border-t border-slate-200">
        35 Health Clubs • CliftonStrengths® Extended 2.0 • Персональный коммерческий профиль сформирован системой автоматизированного тестирования
      </div>
    </div>
  );
}

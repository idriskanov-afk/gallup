"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, Zap, AlertCircle, ArrowRight } from "lucide-react";

interface QuestionData {
  id: number;
  orderIndex: number;
  statementA: string;
  talentAId: number;
  statementB: string;
  talentBId: number;
}

interface SessionData {
  id: string;
  employeeName: string;
  employeeRole: string;
  status: string;
  currentQuestionIndex: number;
}

const TOTAL_QUESTIONS = 68;
const QUESTION_TIMEOUT_SECONDS = 20;

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMEOUT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Telegram Haptic
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      tg?.HapticFeedback?.impactOccurred(type);
    }
  };

  // Fetch initial session & question
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Не удалось загрузить тест");
        }

        if (data.session.status === "completed") {
          router.replace(`/results/${sessionId}`);
          return;
        }

        setSession(data.session);
        setCurrentQuestion(data.currentQuestion);
        startTimeRef.current = performance.now();
        setTimeLeft(QUESTION_TIMEOUT_SECONDS);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId, router]);

  // Timer countdown loop
  useEffect(() => {
    if (!currentQuestion || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, submitting]);

  // Timeout handler: automatic submission with choice = null
  const handleTimeout = async () => {
    if (submitting || !currentQuestion) return;
    triggerHaptic("heavy");
    await submitAnswer(null, QUESTION_TIMEOUT_SECONDS * 1000);
  };

  // User click on one of the 5 options
  const handleChoice = async (choiceValue: number) => {
    if (submitting || !currentQuestion) return;
    triggerHaptic("medium");
    const elapsedMs = Math.round(performance.now() - startTimeRef.current);
    await submitAnswer(choiceValue, elapsedMs);
  };

  const submitAnswer = async (choice: number | null, responseTimeMs: number) => {
    if (!currentQuestion) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          choice,
          responseTimeMs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка сохранения ответа");
      }

      if (data.completed) {
        // Test completed!
        localStorage.removeItem("gallup_active_session");
        router.replace(`/results/${sessionId}`);
      } else {
        // Advance to next question
        setCurrentQuestion(data.nextQuestion);
        setSession((prev) =>
          prev
            ? { ...prev, currentQuestionIndex: data.currentQuestionIndex }
            : null
        );
        setTimeLeft(QUESTION_TIMEOUT_SECONDS);
        startTimeRef.current = performance.now();
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Загрузка вопросов тестирования...</p>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h2 className="font-bold text-base">Ошибка загрузки</h2>
          <p className="text-xs mt-1">{error || "Вопрос не найден"}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  const questionNum = currentQuestion.orderIndex;
  const progressPercent = Math.round((questionNum / TOTAL_QUESTIONS) * 100);
  const isSpeedBonusEligible = timeLeft > 12; // 20 - 8 = 12 sec left
  const timerPercent = (timeLeft / QUESTION_TIMEOUT_SECONDS) * 100;

  // Dynamic timer color
  let timerBarColor = "bg-emerald-500";
  let timerTextColor = "text-emerald-700";
  if (timeLeft <= 5) {
    timerBarColor = "bg-rose-500 animate-pulse";
    timerTextColor = "text-rose-600 font-extrabold animate-pulse";
  } else if (timeLeft <= 10) {
    timerBarColor = "bg-amber-500";
    timerTextColor = "text-amber-600";
  }

  return (
    <div className="flex flex-col min-h-screen justify-between p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 max-w-xl mx-auto">
      {/* Top Header: Progress & Timer */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold">
              Вопрос {questionNum} / {TOTAL_QUESTIONS}
            </span>
            <span className="text-slate-400 font-normal hidden sm:inline">
              ({session?.employeeName})
            </span>
          </div>

          {/* 20s Digital Counter */}
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 ${timerTextColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono text-sm">{timeLeft} сек</span>
          </div>
        </div>

        {/* Global Test Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 20s Countdown Timer Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
          <div
            className={`h-full transition-all duration-1000 linear ${timerBarColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Speed Bonus Badge */}
        <div className="flex items-center justify-between text-[11px] px-1">
          <div
            className={`flex items-center gap-1 transition-all ${
              isSpeedBonusEligible
                ? "text-amber-600 font-bold"
                : "text-slate-400"
            }`}
          >
            <Zap className={`w-3 h-3 ${isSpeedBonusEligible ? "text-amber-500 fill-amber-500" : ""}`} />
            <span>Инстинкт: +15% бонус (ответ до 8 сек)</span>
          </div>
          <span className="text-slate-400">{progressPercent}% пройдено</span>
        </div>
      </div>

      {/* Main Question Cards (Statements A & B) */}
      <div className="space-y-3 sm:space-y-4 my-auto">
        {/* Card A */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-purple-200/80 shadow-sm hover:border-purple-400 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-xs font-bold tracking-wide uppercase">
              Утверждение А
            </span>
          </div>
          <p className="text-slate-900 font-medium text-sm sm:text-base leading-snug">
            «{currentQuestion.statementA}»
          </p>
        </div>

        {/* VS Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full absolute" />
          <span className="relative bg-slate-100 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-slate-400 border border-slate-200">
            ИЛИ
          </span>
        </div>

        {/* Card B */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-indigo-200/80 shadow-sm hover:border-indigo-400 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-bold tracking-wide uppercase">
              Утверждение Б
            </span>
          </div>
          <p className="text-slate-900 font-medium text-sm sm:text-base leading-snug">
            «{currentQuestion.statementB}»
          </p>
        </div>
      </div>

      {/* 5 Ergonomic Thumb Buttons */}
      <div className="space-y-2 pt-2 pb-4">
        <div className="text-[11px] text-center font-medium text-slate-400 mb-1">
          Выберите степень совпадения:
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* -2: Definitely A */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(-2)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-sm font-black mb-0.5">Точно А</span>
            <span className="text-[10px] opacity-80">+2.0 б</span>
          </button>

          {/* -1: Likely A */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(-1)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-purple-100 text-purple-800 font-semibold text-xs border border-purple-200 hover:bg-purple-200 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-xs font-bold mb-0.5">Скорее А</span>
            <span className="text-[10px] opacity-70">+1.0 б</span>
          </button>

          {/* 0: Neutral / Both */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(0)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs border border-slate-300 hover:bg-slate-200 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-[11px] font-semibold mb-0.5 text-center leading-tight">Оба / Равно</span>
            <span className="text-[10px] text-slate-400">0.3 / 0.3</span>
          </button>

          {/* +1: Likely B */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(1)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-indigo-100 text-indigo-800 font-semibold text-xs border border-indigo-200 hover:bg-indigo-200 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-xs font-bold mb-0.5">Скорее Б</span>
            <span className="text-[10px] opacity-70">+1.0 б</span>
          </button>

          {/* +2: Definitely B */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(2)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-sm font-black mb-0.5">Точно Б</span>
            <span className="text-[10px] opacity-80">+2.0 б</span>
          </button>
        </div>

        {submitting && (
          <div className="text-center text-[11px] text-slate-400 pt-1 animate-pulse">
            Фиксация ответа...
          </div>
        )}
      </div>
    </div>
  );
}

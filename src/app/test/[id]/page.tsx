"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, Zap, AlertCircle } from "lucide-react";
import { QUESTIONS_DATA } from "@/lib/data/questions";
import { TALENTS_DATA } from "@/lib/data/talents";
import { calculateAssessment, ResponseRecord } from "@/lib/scoring";
import { TalentItem } from "@/lib/types";

const TOTAL_QUESTIONS = 68;
const QUESTION_TIMEOUT_SECONDS = 20;

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0); // 0 to 67
  const [submitting, setSubmitting] = useState(false);
  const [employeeName, setEmployeeName] = useState("Сотрудник");
  const [responses, setResponses] = useState<
    Array<{ questionId: number; choice: number | null; responseTimeMs: number }>
  >([]);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMEOUT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Haptic feedback for Telegram WebApp
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      tg?.HapticFeedback?.impactOccurred(type);
    }
  };

  // On mount: restore session or initialize
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(QUESTION_TIMEOUT_SECONDS);

    // Try reading active session info from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gallup_active_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.employeeName) setEmployeeName(parsed.employeeName);
        } catch {}
      }

      // Check if partially answered
      const storedResponses = localStorage.getItem(`gallup_responses_${sessionId}`);
      if (storedResponses) {
        try {
          const parsedResp = JSON.parse(storedResponses);
          if (Array.isArray(parsedResp) && parsedResp.length > 0) {
            setResponses(parsedResp);
            if (parsedResp.length < TOTAL_QUESTIONS) {
              setCurrentIndex(parsedResp.length);
            }
          }
        } catch {}
      }
    }
  }, [sessionId]);

  // Timer tick
  useEffect(() => {
    if (submitting) return;

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
  }, [currentIndex, submitting]);

  // Timeout: choice = null (0 points)
  const handleTimeout = async () => {
    if (submitting) return;
    triggerHaptic("heavy");
    await recordChoiceAndAdvance(null, QUESTION_TIMEOUT_SECONDS * 1000);
  };

  // User choice button click
  const handleChoice = async (choiceValue: number) => {
    if (submitting) return;
    triggerHaptic("medium");
    const elapsedMs = Math.round(Date.now() - startTimeRef.current);
    await recordChoiceAndAdvance(choiceValue, elapsedMs);
  };

  const recordChoiceAndAdvance = async (choice: number | null, responseTimeMs: number) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = QUESTIONS_DATA[currentIndex] || QUESTIONS_DATA[0];
    const newRecord = {
      questionId: currentQ.orderIndex,
      choice,
      responseTimeMs,
    };

    const updatedResponses = [...responses, newRecord];
    setResponses(updatedResponses);

    // Save to localStorage so no progress is ever lost
    if (typeof window !== "undefined") {
      localStorage.setItem(`gallup_responses_${sessionId}`, JSON.stringify(updatedResponses));
    }

    const nextIdx = currentIndex + 1;

    // Send async background sync to server (non-blocking)
    fetch(`/api/sessions/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQ.orderIndex,
        choice,
        responseTimeMs,
        currentIndex,
        allResponses: nextIdx >= TOTAL_QUESTIONS ? updatedResponses : undefined,
      }),
    }).catch((e) => console.warn("Background sync warning:", e));

    if (nextIdx >= TOTAL_QUESTIONS) {
      // Assessment finished!
      // Compute client-side immediately so user gets 0ms delay!
      const talents: TalentItem[] = TALENTS_DATA.map((t) => ({
        id: t.id,
        slug: t.slug,
        nameRu: t.nameRu,
        nameEn: t.nameEn,
        domain: t.domain as any,
        shortDescription: t.shortDescription,
        managerGuide: t.managerGuide,
      }));

      const records: ResponseRecord[] = updatedResponses.map((r, idx) => {
        const q = QUESTIONS_DATA[idx] || QUESTIONS_DATA[0];
        return {
          questionId: r.questionId,
          talentAId: q.talentAId,
          talentBId: q.talentBId,
          choice: r.choice,
          responseTimeMs: r.responseTimeMs,
        };
      });

      const assessmentResult = calculateAssessment(talents, records);

      if (typeof window !== "undefined") {
        localStorage.setItem(`gallup_results_${sessionId}`, JSON.stringify(assessmentResult));
        localStorage.removeItem("gallup_active_session");
      }

      router.replace(`/results/${sessionId}`);
    } else {
      // Advance to next question instantly
      setCurrentIndex(nextIdx);
      setTimeLeft(QUESTION_TIMEOUT_SECONDS);
      startTimeRef.current = Date.now();
      setSubmitting(false);
    }
  };

  const currentQuestion = QUESTIONS_DATA[currentIndex] || QUESTIONS_DATA[0];
  const questionNum = currentIndex + 1;
  const progressPercent = Math.round((questionNum / TOTAL_QUESTIONS) * 100);
  const isSpeedBonusEligible = timeLeft > 12; // first 8 seconds
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
      {/* Top Header: Brand, Progress & Timer */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="35 Health Clubs" className="h-7 object-contain" />
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-800">
              35 Health Clubs
            </span>
          </div>
          <span className="text-slate-400 font-semibold text-xs">
            {employeeName}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold">
              Вопрос {questionNum} / {TOTAL_QUESTIONS}
            </span>
          </div>

          {/* 20s Digital Counter */}
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 ${timerTextColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono text-sm">{timeLeft} сек</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300 ease-out"
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
              isSpeedBonusEligible ? "text-amber-600 font-bold" : "text-slate-400"
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
        <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-teal-200/80 shadow-sm hover:border-teal-400 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-600 text-white text-xs font-bold tracking-wide uppercase">
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
        <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-300/80 shadow-sm hover:border-slate-500 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-white text-xs font-bold tracking-wide uppercase">
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
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-teal-600 text-white font-bold text-xs shadow hover:bg-teal-700 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-sm font-black mb-0.5">Точно А</span>
            <span className="text-[10px] opacity-80">+2.0 б</span>
          </button>

          {/* -1: Likely A */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(-1)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 active:scale-95 transition disabled:opacity-50"
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
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300 hover:bg-slate-200 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-xs font-bold mb-0.5">Скорее Б</span>
            <span className="text-[10px] opacity-70">+1.0 б</span>
          </button>

          {/* +2: Definitely B */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice(2)}
            className="flex flex-col items-center justify-center py-3.5 px-1 rounded-xl bg-slate-800 text-white font-bold text-xs shadow hover:bg-slate-900 active:scale-95 transition disabled:opacity-50"
          >
            <span className="text-sm font-black mb-0.5">Точно Б</span>
            <span className="text-[10px] opacity-80">+2.0 б</span>
          </button>
        </div>

        {submitting && (
          <div className="text-center text-[11px] text-slate-400 pt-1 animate-pulse">
            Переход к следующему вопросу...
          </div>
        )}
      </div>
    </div>
  );
}

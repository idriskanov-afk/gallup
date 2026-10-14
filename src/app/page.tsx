"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  Clock, 
  Brain, 
  Target, 
  Users, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  LayoutDashboard,
  PlayCircle
} from "lucide-react";

const ROLE_OPTIONS = [
  "Менеджер отдела продаж",
  "Администратор рецепции",
  "Фитнес-тренер / Инструктор",
  "Сервис-менеджер / Клиентский отдел",
  "Управляющий клубом",
  "Специалист колл-центра",
  "Другая должность",
];

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<{
    id: string;
    employeeName: string;
    employeeRole: string;
    currentQuestionIndex: number;
  } | null>(null);

  // Initialize Telegram WebApp if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready?.();
        tg.expand?.();
      }

      // Check localStorage for in-progress session
      const stored = localStorage.getItem("gallup_active_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            fetch(`/api/sessions/${parsed.id}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.session && data.session.status === "in_progress") {
                  setSavedSession({
                    id: data.session.id,
                    employeeName: data.session.employeeName,
                    employeeRole: data.session.employeeRole,
                    currentQuestionIndex: data.session.currentQuestionIndex,
                  });
                } else if (data.session?.status === "completed") {
                  localStorage.removeItem("gallup_active_session");
                }
              })
              .catch(() => {});
          }
        } catch {}
      }
    }
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = role === "Другая должность" ? customRole.trim() : role;

    if (!name.trim()) {
      setError("Пожалуйста, введите ваше имя или ФИО");
      return;
    }
    if (role === "Другая должность" && !customRole.trim()) {
      setError("Пожалуйста, укажите вашу должность");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: name.trim(),
          employeeRole: finalRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка при создании сессии");
      }

      localStorage.setItem(
        "gallup_active_session",
        JSON.stringify({
          id: data.sessionId,
          employeeName: data.employeeName,
          employeeRole: data.employeeRole,
        })
      );

      router.push(`/test/${data.sessionId}`);
    } catch (err: any) {
      setError(err.message || "Не удалось начать тестирование");
      setLoading(false);
    }
  };

  const handleResume = () => {
    if (savedSession) {
      router.push(`/test/${savedSession.id}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-xl mx-auto">
      {/* 35 Health Clubs Brand Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="flex justify-center mb-1">
          <img 
            src="/logo.png" 
            alt="35 Health Clubs Logo" 
            className="h-20 sm:h-24 object-contain filter drop-shadow-sm transition hover:scale-105"
          />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          35 HEALTH CLUBS • CliftonStrengths® 2.0
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Оценка талантов команды клуба
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Узнайте ваши сильнейшие стороны из 34 талантов, стиль мотивации и клиентской совместимости для рекордных результатов
        </p>
      </div>

      {/* 4 Domains Badges in 35 Health Clubs palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-medium">
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
          <div className="font-bold flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5 text-purple-600" /> Исполнение
          </div>
          <div className="text-[10px] text-purple-600/80">9 талантов</div>
        </div>
        <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
          <div className="font-bold flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-orange-600" /> Влияние
          </div>
          <div className="text-[10px] text-orange-600/80">8 талантов</div>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
          <div className="font-bold flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Отношения
          </div>
          <div className="text-[10px] text-blue-600/80">9 талантов</div>
        </div>
        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
          <div className="font-bold flex items-center justify-center gap-1">
            <Brain className="w-3.5 h-3.5 text-teal-600" /> Мышление
          </div>
          <div className="text-[10px] text-teal-600/80">8 талантов</div>
        </div>
      </div>

      {/* Resume Active Session Card */}
      {savedSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-slate-800 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-teal-200 animate-pulse" />
              <span className="font-bold text-sm">У вас есть незавершенный тест</span>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
              Вопрос {savedSession.currentQuestionIndex + 1} из 68
            </span>
          </div>
          <p className="text-xs text-teal-100">
            Сотрудник: <span className="font-semibold text-white">{savedSession.employeeName}</span> ({savedSession.employeeRole})
          </p>
          <button
            onClick={handleResume}
            className="w-full py-2.5 px-4 bg-white text-teal-800 font-bold rounded-xl text-sm shadow hover:bg-teal-50 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            Продолжить тестирование
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Start Form */}
      <form onSubmit={handleStart} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Начать новое тестирование
        </h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            ФИО или Имя сотрудника
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Должность в 35 Health Clubs
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {role === "Другая должность" && (
            <input
              type="text"
              required
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Укажите вашу должность..."
              className="mt-2 w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          )}
        </div>

        {/* Quick Rules */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Регламент тестирования команды:
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            <li><span className="font-semibold text-slate-700">68 парных вопросов</span> — сравнивайте два утверждения.</li>
            <li><span className="font-semibold text-slate-700">20 секунд</span> на каждый вопрос с автопереходом.</li>
            <li><span className="font-semibold text-teal-600">Бонус +15%</span> при быстром инстинктивном ответе (до 8 сек).</li>
            <li>Выбирайте первое, что откликается в реальной работе с клиентами.</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 via-teal-700 to-slate-800 text-white font-bold rounded-xl text-base shadow-md hover:from-teal-700 hover:to-slate-900 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Подготовка вопросов...
            </span>
          ) : (
            <>
              Начать тестирование
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Admin Link */}
      <div className="text-center pt-2 pb-6">
        <button
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 font-medium transition"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Вход для HR и Руководства клуба (Дашборд и Матрица команды)
        </button>
      </div>
    </div>
  );
}

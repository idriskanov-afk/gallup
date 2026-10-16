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
  PlayCircle,
  Globe2,
  RotateCcw
} from "lucide-react";

const CORE_ROLES = [
  "Клоузер (Менеджер закрытия сделок)",
  "Хантер (Привлечение & Первичный контакт)",
  "Тренер 35’ Health Clubs",
  "HR-Рекрутер (Массовый подбор)",
  "Промоутер",
  "Другая должность",
];

export default function HomePage() {
  const router = useRouter();
  const [country, setCountry] = useState<"uz" | "kz" | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState(CORE_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<{
    id: string;
    employeeName: string;
    employeeRole: string;
    country?: string;
    currentQuestionIndex: number;
  } | null>(null);

  // Initialize Telegram WebApp and check existing session / country
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready?.();
        tg.expand?.();
      }

      // Restore country preference if chosen before
      const savedCountry = localStorage.getItem("35_selected_country") as "uz" | "kz" | null;
      if (savedCountry === "uz" || savedCountry === "kz") {
        setCountry(savedCountry);
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
                    country: data.session.country,
                    currentQuestionIndex: data.session.currentQuestionIndex,
                  });
                  if (data.session.country) {
                    setCountry(data.session.country as "uz" | "kz");
                  }
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

  const handleSelectCountry = (chosen: "uz" | "kz") => {
    setCountry(chosen);
    if (typeof window !== "undefined") {
      localStorage.setItem("35_selected_country", chosen);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = role === "Другая должность" ? customRole.trim() : role;

    if (!country) {
      setError("Пожалуйста, выберите страну");
      return;
    }
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
          country,
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
          country: data.country || country,
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

  // ==========================================
  // FIRST SPLASH SCREEN: CHOOSE COUNTRY
  // ==========================================
  if (!country) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 max-w-lg mx-auto">
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-fadeIn">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="35 Health Clubs" 
              className="h-20 sm:h-24 object-contain filter drop-shadow-sm transition hover:scale-105"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide uppercase">
              <Globe2 className="w-3.5 h-3.5 text-teal-600" />
              Локация тестирования
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Выберите страну
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Тестирование адаптировано под стандарты работы и профили должностей фитнес-клубов 35 Health Clubs
            </p>
          </div>

          {/* Country Selection 2 Big Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => handleSelectCountry("uz")}
              className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl">🇺🇿</span>
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-teal-700 transition">
                  Узбекистан
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  35 Health Clubs Uzbekistan
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCountry("kz")}
              className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl">🇰🇿</span>
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-teal-700 transition">
                  Казахстан
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  35 Health Clubs Kazakhstan
                </p>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => router.push("/admin")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 font-medium transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Вход для HR и Руководства клуба
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // REGISTRATION & TEST ONBOARDING FORM
  // ==========================================
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

        {/* Selected Country Indicator with Switch Button */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide">
            <span>{country === "uz" ? "🇺🇿 Узбекистан" : "🇰🇿 Казахстан"}</span>
            <span className="text-teal-500">•</span>
            <span>CliftonStrengths® 2.0</span>
          </div>
          <button
            type="button"
            onClick={() => setCountry(null)}
            title="Сменить страну"
            className="p-1 rounded-full text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Оценка талантов команды клуба
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Узнайте ваши сильнейшие стороны из 34 талантов, стиль мотивации и соответствие эталону должности
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
              Вопрос {savedSession.currentQuestionIndex + 1} из 50
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Регистрация сотрудника
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {country === "uz" ? "🇺🇿 Узбекистан" : "🇰🇿 Казахстан"}
          </span>
        </div>

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
            {CORE_ROLES.map((opt) => (
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
            <li><span className="font-semibold text-slate-700">50 адаптивных ситуаций</span> — вопросы ветвятся под ваш реальный стиль.</li>
            <li><span className="font-semibold text-slate-700">Многогранность</span> — сервис, форс-мажоры, регламенты, команда и стратегия.</li>
            <li><span className="font-semibold text-slate-700">20 секунд</span> на каждый вопрос с автопереходом.</li>
            <li><span className="font-semibold text-teal-600">Бонус +15%</span> при быстром инстинктивном ответе (до 8 сек).</li>
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
          Вход для HR и Руководства клуба
        </button>
      </div>
    </div>
  );
}

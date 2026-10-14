"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Target, 
  Zap, 
  Brain, 
  Search, 
  Filter, 
  ChevronRight, 
  Grid, 
  FileText, 
  CheckCircle, 
  Clock, 
  X,
  Shield, 
  Award,
  AlertTriangle,
  ArrowUpDown,
  Home
} from "lucide-react";
import { AssessmentResult, Domain, ScoredTalent } from "@/lib/types";

interface SessionSummary {
  id: string;
  employeeName: string;
  employeeRole: string;
  status: string;
  currentQuestionIndex: number;
  startedAt: string;
  completedAt: string | null;
  results: AssessmentResult | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [teamMatrix, setTeamMatrix] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"employees" | "matrix">("employees");

  // Selected employee for detailed dossier modal
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, [roleFilter, domainFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (domainFilter !== "all") params.append("domain", domainFilter);

      const res = await fetch(`/api/admin/sessions?${params.toString()}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setAvailableRoles(data.availableRoles || []);
      setTeamMatrix(data.teamMatrix || null);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchName = s.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName;
  });

  const getDomainBadge = (domain?: Domain) => {
    switch (domain) {
      case "executing":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">Исполнение</span>;
      case "influencing":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">Влияние</span>;
      case "relationship":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Отношения</span>;
      case "strategic":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Мышление</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">В процессе</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Дашборд Руководителя
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
              HR & Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Аналитика сильных сторон команды, матрицы покрытия талантов и персональные инструкции по управлению
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
          >
            <Home className="w-3.5 h-3.5" />
            На главную
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === "employees"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Сотрудники ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === "matrix"
              ? "border-purple-600 text-purple-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Grid className="w-4 h-4" />
          Командная Матрица (Team Grid)
        </button>
      </div>

      {/* TAB 1: EMPLOYEES LIST & DOSSIER */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Все должности</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Все домены</option>
                <option value="executing">Исполнение</option>
                <option value="influencing">Влияние</option>
                <option value="relationship">Отношения</option>
                <option value="strategic">Мышление</option>
              </select>
            </div>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
              Загрузка списка сотрудников...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Сотрудников по заданным критериям не найдено
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => s.results && setSelectedSession(s)}
                  className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition cursor-pointer hover:border-purple-300 hover:shadow-md ${
                    selectedSession?.id === s.id ? "border-purple-500 ring-2 ring-purple-100" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {s.employeeName}
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.employeeRole}
                      </span>
                      {getDomainBadge(s.results?.dominantDomain)}
                    </div>

                    {s.results ? (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600 pt-1">
                        <span className="font-semibold text-slate-500 text-[11px]">Топ-5:</span>
                        {s.results.top5.map((t) => (
                          <span
                            key={t.id}
                            className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700"
                          >
                            {t.nameRu}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 font-medium">
                        Тест в процессе (вопрос {s.currentQuestionIndex + 1} из 68)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {s.results && (
                      <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                        Открыть досье <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAM MATRIX */}
      {activeTab === "matrix" && teamMatrix && (
        <div className="space-y-5">
          {/* Domain Distribution Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Баланс 4 Доменов в Команде
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <div className="font-extrabold text-purple-800 text-lg">
                  {teamMatrix.domainDistribution.executing || 0}
                </div>
                <div className="text-[11px] font-bold text-purple-600">Исполнители</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <div className="font-extrabold text-orange-800 text-lg">
                  {teamMatrix.domainDistribution.influencing || 0}
                </div>
                <div className="text-[11px] font-bold text-orange-600">Лидеры Влияния</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="font-extrabold text-blue-800 text-lg">
                  {teamMatrix.domainDistribution.relationship || 0}
                </div>
                <div className="text-[11px] font-bold text-blue-600">Мастера Отношений</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="font-extrabold text-emerald-800 text-lg">
                  {teamMatrix.domainDistribution.strategic || 0}
                </div>
                <div className="text-[11px] font-bold text-emerald-600">Стратеги / Мыслители</div>
              </div>
            </div>
          </div>

          {/* Talents Frequency Heatmap */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-600" />
              Частота талантов в Топ-5 команды (Покрытие матрицы)
            </h3>
            <p className="text-xs text-slate-500">
              Показывает, сколько раз каждый талант вошел в Top-5 у ваших сотрудников:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
              {Object.entries(teamMatrix.talentFrequency || {})
                .sort((a: any, b: any) => b[1].count - a[1].count)
                .map(([slug, item]: any) => (
                  <div
                    key={slug}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{item.nameRu}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{item.domain}</div>
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                      {item.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE DOSSIER MODAL */}
      {selectedSession && selectedSession.results && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-150 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Карточка сотрудника для руководителя
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedSession.employeeName}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedSession.employeeRole} • Доминирующий домен: {getDomainBadge(selectedSession.results.dominantDomain)}
                </p>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOP-5 & BLIND SPOTS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Топ-5 Сильных Талантов:
                </span>
                <div className="space-y-1">
                  {selectedSession.results.top5.map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-slate-800">
                      <span>#{t.rank} {t.nameRu} ({t.nameEn})</span>
                      <span className="font-mono font-bold text-purple-700">{t.score} б</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Слепая зона (30–34 место):
                </span>
                <div className="space-y-1">
                  {selectedSession.results.blindSpots.map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-slate-700">
                      <span>#{b.rank} {b.nameRu}</span>
                      <span className="text-[10px] text-slate-400">Нужна опора/чек-лист</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MANAGER ACTION INSTRUCTION (Собранная выжимка) */}
            <div className="space-y-3 pt-1">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Инструкция для Руководителя: Как ставить задачи и мотивировать
              </h3>

              <div className="space-y-3">
                {selectedSession.results.top5.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span>Талант #{t.rank}: {t.nameRu} ({t.nameEn})</span>
                      <span className="text-[10px] uppercase font-bold text-purple-600">{t.domain}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">📌 Куда ставить в смене:</span>{" "}
                        {t.managerGuide.tasks}
                      </div>
                      <div>
                        <span className="font-bold text-emerald-800">🎯 Как мотивировать:</span>{" "}
                        {t.managerGuide.motivation}
                      </div>
                      <div>
                        <span className="font-bold text-indigo-800">🔍 Как контролировать:</span>{" "}
                        {t.managerGuide.control}
                      </div>
                      <div>
                        <span className="font-bold text-rose-800">⚠️ Триггеры демотивации:</span>{" "}
                        {t.managerGuide.demotivationTriggers}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Закрыть карточку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

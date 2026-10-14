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
  Home,
  Coins,
  MessageSquare,
  Crosshair,
  Palette,
  ShieldAlert,
  Lightbulb
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
  const [motivationFilter, setMotivationFilter] = useState("all");
  const [psychotypeFilter, setPsychotypeFilter] = useState("all");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [teamMatrix, setTeamMatrix] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"employees" | "matrix">("employees");

  // Selected employee for detailed dossier modal
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, [roleFilter, domainFilter, motivationFilter, psychotypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (domainFilter !== "all") params.append("domain", domainFilter);
      if (motivationFilter !== "all") params.append("motivation", motivationFilter);
      if (psychotypeFilter !== "all") params.append("psychotype", psychotypeFilter);

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
    return s.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Дашборд Руководителя
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
              HR & Commercial Audit 2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Комплексный коммерческий аудит сотрудников: Gallup 34, Мотивационная типология, Психотипы DISC и Матрица продаж
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
          Командная Матрица (Team Grid 2.0)
        </button>
      </div>

      {/* TAB 1: EMPLOYEES LIST */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            <div className="relative md:col-span-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="all">Все должности</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="all">Все домены Gallup</option>
                <option value="executing">Исполнение</option>
                <option value="influencing">Влияние</option>
                <option value="relationship">Отношения</option>
                <option value="strategic">Мышление</option>
              </select>
            </div>

            <div>
              <select
                value={motivationFilter}
                onChange={(e) => setMotivationFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="all">Вся мотивация (5)</option>
                <option value="money">Денежник 💰</option>
                <option value="status">Статусник 👑</option>
                <option value="result">Результатник 🏆</option>
                <option value="budget">Бюджетник 📑</option>
                <option value="romantic">Романтик 🎨</option>
              </select>
            </div>

            <div>
              <select
                value={psychotypeFilter}
                onChange={(e) => setPsychotypeFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="all">Все психотипы (4)</option>
                <option value="directive">Директив 🔴</option>
                <option value="expressive">Экспрессив 🟡</option>
                <option value="amiable">Дружелюбный 🟢</option>
                <option value="analytical">Аналитик 🔵</option>
              </select>
            </div>
          </div>

          {/* List of Employees */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
              Загрузка досье сотрудников...
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
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {s.employeeName}
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.employeeRole}
                      </span>
                      {getDomainBadge(s.results?.dominantDomain)}

                      {s.results?.motivation && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {s.results.motivation.dominant.badge}
                        </span>
                      )}

                      {s.results?.psychotype && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {s.results.psychotype.dominant.badge}
                        </span>
                      )}
                    </div>

                    {s.results ? (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
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
                        Открыть паспорт <ChevronRight className="w-4 h-4" />
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
          {/* Motivation Distribution */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Распределение Мотивационных Типов в Команде (5 типов)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-extrabold text-amber-900 text-lg">{teamMatrix.motivationDistribution?.money || 0}</div>
                <div className="text-[10px] font-bold text-amber-700">Денежники 💰</div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                <div className="font-extrabold text-purple-900 text-lg">{teamMatrix.motivationDistribution?.status || 0}</div>
                <div className="text-[10px] font-bold text-purple-700">Статусники 👑</div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="font-extrabold text-rose-900 text-lg">{teamMatrix.motivationDistribution?.result || 0}</div>
                <div className="text-[10px] font-bold text-rose-700">Результатники 🏆</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="font-extrabold text-slate-900 text-lg">{teamMatrix.motivationDistribution?.budget || 0}</div>
                <div className="text-[10px] font-bold text-slate-700">Бюджетники 📑</div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="font-extrabold text-emerald-900 text-lg">{teamMatrix.motivationDistribution?.romantic || 0}</div>
                <div className="text-[10px] font-bold text-emerald-700">Романтики 🎨</div>
              </div>
            </div>
          </div>

          {/* Psychotype Distribution */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Коммуникативный Баланс Команды (4 Психотипа DISC)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="font-extrabold text-red-900 text-lg">{teamMatrix.psychotypeDistribution?.directive || 0}</div>
                <div className="text-[11px] font-bold text-red-700">Директивы 🔴</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-extrabold text-amber-900 text-lg">{teamMatrix.psychotypeDistribution?.expressive || 0}</div>
                <div className="text-[11px] font-bold text-amber-700">Экспрессивы 🟡</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="font-extrabold text-emerald-900 text-lg">{teamMatrix.psychotypeDistribution?.amiable || 0}</div>
                <div className="text-[11px] font-bold text-emerald-700">Дружелюбные 🟢</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="font-extrabold text-blue-900 text-lg">{teamMatrix.psychotypeDistribution?.analytical || 0}</div>
                <div className="text-[11px] font-bold text-blue-700">Аналитики 🔵</div>
              </div>
            </div>
          </div>

          {/* Gallup Domains Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Баланс 4 Доменов Gallup в Отделе
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <div className="font-extrabold text-purple-800 text-lg">{teamMatrix.domainDistribution?.executing || 0}</div>
                <div className="text-[11px] font-bold text-purple-600">Исполнители</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <div className="font-extrabold text-orange-800 text-lg">{teamMatrix.domainDistribution?.influencing || 0}</div>
                <div className="text-[11px] font-bold text-orange-600">Лидеры Влияния</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="font-extrabold text-blue-800 text-lg">{teamMatrix.domainDistribution?.relationship || 0}</div>
                <div className="text-[11px] font-bold text-blue-600">Мастера Отношений</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="font-extrabold text-emerald-800 text-lg">{teamMatrix.domainDistribution?.strategic || 0}</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
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

      {/* DETAILED EMPLOYEE DOSSIER MODAL */}
      {selectedSession && selectedSession.results && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-150 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Паспорт сотрудника 2.0 (Коммерческий профайлинг)
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedSession.employeeName}
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 mt-1">
                  <span>{selectedSession.employeeRole}</span> • 
                  {getDomainBadge(selectedSession.results.dominantDomain)}
                  {selectedSession.results.motivation && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {selectedSession.results.motivation.dominant.badge}
                    </span>
                  )}
                  {selectedSession.results.psychotype && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedSession.results.psychotype.dominant.badge}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MOTIVATION & KPI DIRECTIVE */}
            {selectedSession.results.motivation && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <Coins className="w-4 h-4 text-amber-600" />
                  Мотивация и Регламент Оплаты: {selectedSession.results.motivation.dominant.badge}
                </span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  <span className="font-bold">🎯 Рекомендованный KPI:</span> {selectedSession.results.motivation.kpiRecommendations}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-white/80 border border-amber-200">
                    <span className="font-bold text-emerald-800 block text-[10px] mb-0.5">Как работать:</span>
                    <ul className="list-disc list-inside text-slate-700 text-[10px] space-y-0.5">
                      {selectedSession.results.motivation.howToWork.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 border border-amber-200">
                    <span className="font-bold text-rose-800 block text-[10px] mb-0.5">Что нельзя делать:</span>
                    <ul className="list-disc list-inside text-slate-700 text-[10px] space-y-0.5">
                      {selectedSession.results.motivation.whatNotToDo.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SALES & CLIENT PROFILE */}
            {selectedSession.results.salesProfile && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  Расстановка в смене: Клиентская совместимость
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200">
                    <span className="font-bold text-emerald-950 block">Идеальный клиент:</span>
                    <span className="font-semibold text-emerald-700">{selectedSession.results.salesProfile.bestClientMatch.nameRu}</span>
                    <p className="text-slate-600 text-[10px] mt-1">{selectedSession.results.salesProfile.bestClientMatch.whyMatch}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                    <span className="font-bold text-amber-950 block">Сложный клиент:</span>
                    <span className="font-semibold text-amber-700">{selectedSession.results.salesProfile.challengingClientMatch.nameRu}</span>
                    <p className="text-slate-600 text-[10px] mt-1">{selectedSession.results.salesProfile.challengingClientMatch.whyChallenge}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TOP-5 & BLIND SPOTS */}
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

              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Слепая зона (30–34 место):
                </span>
                <div className="space-y-1">
                  {selectedSession.results.blindSpots.map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-slate-700">
                      <span>#{b.rank} {b.nameRu}</span>
                      <span className="text-[10px] text-slate-400">Нужен чек-лист/напарник</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MANAGER ACTION INSTRUCTIONS */}
            <div className="space-y-2.5 pt-1 text-xs">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-purple-600" />
                Инструкция по задачам и контролю (Top-5 талантов):
              </h3>
              <div className="space-y-2">
                {selectedSession.results.top5.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>#{t.rank} {t.nameRu} ({t.nameEn})</span>
                      <span className="uppercase text-[9px] text-purple-600 font-extrabold">{t.domain}</span>
                    </div>
                    <div><span className="font-semibold text-slate-700">📌 Задачи в смене:</span> {t.managerGuide.tasks}</div>
                    <div><span className="font-semibold text-emerald-700">🎯 Мотивация:</span> {t.managerGuide.motivation}</div>
                    <div><span className="font-semibold text-rose-700">⚠️ Демотивация:</span> {t.managerGuide.demotivationTriggers}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Закрыть паспорт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

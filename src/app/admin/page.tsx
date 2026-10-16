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
  Lightbulb,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Download,
  Upload,
  Lock,
  LogOut,
  Globe2
} from "lucide-react";
import { AssessmentResult, Domain, ScoredTalent } from "@/lib/types";
import { PinAuthModal } from "@/components/PinAuthModal";
import { RoleBenchmarkCard } from "@/components/RoleBenchmarkCard";
import { calculateRoleMatch, normalizeRoleKey, CountryCode } from "@/lib/data/role-benchmarks";

interface SessionSummary {
  id: string;
  employeeName: string;
  employeeRole: string;
  country?: "uz" | "kz";
  status: string;
  currentQuestionIndex: number;
  startedAt: string;
  completedAt: string | null;
  results: AssessmentResult | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [countryFilter, setCountryFilter] = useState<"all" | "uz" | "kz">("all");

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
  const [modalTab, setModalTab] = useState<"summary" | "benchmark" | "talents34" | "motivation" | "psychotype" | "sales">("summary");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("35_admin_authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
        const savedCountry = sessionStorage.getItem("35_admin_country") as "uz" | "kz" | null;
        if (savedCountry === "uz" || savedCountry === "kz") {
          setCountryFilter(savedCountry);
        }
      }
      setCheckingAuth(false);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("35_admin_authenticated");
      sessionStorage.removeItem("35_admin_country");
    }
    setIsAuthenticated(false);
  };

  const copyEmployeeLink = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/results/${id}` : "";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
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
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.warn("Failed to copy link:", err);
    }
  };

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleExportBackup = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/admin/backup");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `35_health_gallup_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice(`Резервная копия (${data.totalSessions || 0} сотрудников) успешно сохранена на ваш компьютер!`);
      setTimeout(() => setBackupNotice(null), 5000);
    } catch (err: any) {
      alert("Ошибка при выгрузке бэкапа: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Ошибка восстановления");

      setBackupNotice(result.message || "Данные сотрудников успешно восстановлены!");
      setTimeout(() => setBackupNotice(null), 5000);
      fetchData();
    } catch (err: any) {
      alert("Ошибка восстановления из файла: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [countryFilter, roleFilter, domainFilter, motivationFilter, psychotypeFilter, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (countryFilter !== "all") params.append("country", countryFilter);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PinAuthModal
        defaultCountry={countryFilter === "uz" ? "uz" : "kz"}
        onSuccess={(selectedCountry) => {
          setIsAuthenticated(true);
          setCountryFilter(selectedCountry);
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="35 Health Clubs" className="h-12 object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Дашборд Руководителя
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white shadow-sm">
                35 Health Clubs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Комплексный аудит сотрудников: 35 Match™ эталон должности, Gallup 34, Мотивация и Психотипы
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Country Filter Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setCountryFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                countryFilter === "all" ? "bg-white text-teal-800 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              Все страны
            </button>
            <button
              onClick={() => setCountryFilter("uz")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                countryFilter === "uz" ? "bg-white text-teal-800 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <span>🇺🇿</span> Уз
            </button>
            <button
              onClick={() => setCountryFilter("kz")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                countryFilter === "kz" ? "bg-white text-teal-800 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <span>🇰🇿</span> Кз
            </button>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={exporting}
            title="Скачать JSON-файл со всеми результатами сотрудников на компьютер"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Выгрузка..." : "Бэкап"}
          </button>

          <label
            title="Восстановить сотрудников и тесты из ранее сохраненного файла"
            className={`px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              importing ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {importing ? "Импорт..." : "Восстановить"}
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
              disabled={importing}
            />
          </label>

          <button
            onClick={handleLogout}
            title="Заблокировать дашборд PIN-кодом"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 flex items-center gap-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
          >
            <Home className="w-3.5 h-3.5" />
            На сайт
          </button>
        </div>
      </div>

      {/* Backup Notification */}
      {backupNotice && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{backupNotice}</span>
          </div>
          <button onClick={() => setBackupNotice(null)} className="text-teal-600 hover:text-teal-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === "employees"
              ? "border-teal-600 text-teal-700"
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
              ? "border-teal-600 text-teal-700"
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
                className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              {filteredSessions.map((s) => {
                const roleKey = normalizeRoleKey(s.employeeRole);
                const empCountry = (s.country === "uz" ? "uz" : "kz") as CountryCode;
                const match = s.results ? calculateRoleMatch(s.results, roleKey, empCountry) : null;

                return (
                  <div
                    key={s.id}
                    onClick={() => s.results && setSelectedSession(s)}
                    className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition cursor-pointer hover:border-teal-300 hover:shadow-md ${
                      selectedSession?.id === s.id ? "border-teal-500 ring-2 ring-teal-100" : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {s.country === "uz" ? "🇺🇿 Уз" : "🇰🇿 Кз"}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {s.employeeName}
                        </h3>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {s.employeeRole}
                        </span>
                        {match && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${match.gradeColor}`}>
                            🎯 {match.matchPercentage}% {match.gradeTitle}
                          </span>
                        )}
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
                        Тест в процессе (вопрос {s.currentQuestionIndex + 1} из 50)
                      </div>
                    )}
                  </div>

                  {/* Actions for this employee */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {s.results && (
                      <>
                        <a
                          href={`/results/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                          title="Открыть полный итоговый отчет в новой вкладке"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Полный отчет</span>
                        </a>

                        <button
                          type="button"
                          onClick={(e) => copyEmployeeLink(s.id, e)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          title="Скопировать ссылку на результат"
                        >
                          {copiedId === s.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSession(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition"
                        >
                          <span>Паспорт</span>
                          <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
          <div className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    35 Health Clubs • Досье Сотрудника 2.0
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedSession.employeeName}
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">{selectedSession.employeeRole}</span> • 
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

            {/* Quick Action Bar for Manager */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <a
                href={`/results/${selectedSession.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Открыть полный отчет сотрудника</span>
              </a>

              <button
                type="button"
                onClick={() => window.open(`/results/${selectedSession.id}`, "_blank")}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-teal-300" />
                <span>Печать A4 PDF</span>
              </button>

              <button
                type="button"
                onClick={() => copyEmployeeLink(selectedSession.id)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border ${
                  copiedId === selectedSession.id
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {copiedId === selectedSession.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Скопировать ссылку</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setModalTab("summary")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  modalTab === "summary"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Сводка & Топ-5
              </button>

              <button
                onClick={() => setModalTab("benchmark")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === "benchmark"
                    ? "bg-slate-900 text-teal-300 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-teal-500" />
                <span>35 Match™ (Эталон Должности)</span>
              </button>

              <button
                onClick={() => setModalTab("talents34")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  modalTab === "talents34"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Все 34 таланта
              </button>

              <button
                onClick={() => setModalTab("motivation")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  modalTab === "motivation"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Мотивация (5)
              </button>

              <button
                onClick={() => setModalTab("psychotype")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  modalTab === "psychotype"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Психотип DISC
              </button>

              <button
                onClick={() => setModalTab("sales")}
                className={`py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  modalTab === "sales"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Продажи & Клиенты
              </button>
            </div>

            {/* TAB CONTENT: BENCHMARK ROLE MATCH */}
            {modalTab === "benchmark" && selectedSession.results && (
              <RoleBenchmarkCard
                results={selectedSession.results}
                roleName={selectedSession.employeeRole}
                country={(selectedSession.country === "uz" ? "uz" : "kz") as "uz" | "kz"}
              />
            )}

            {/* TAB CONTENT: 1. SUMMARY */}
            {modalTab === "summary" && (
              <div className="space-y-4">
                {/* TOP-5 & BLIND SPOTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <span className="font-bold text-teal-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-600" />
                      Топ-5 Сильных Талантов:
                    </span>
                    <div className="space-y-1">
                      {selectedSession.results.top5.map((t) => (
                        <div key={t.id} className="flex justify-between items-center text-slate-800">
                          <span className="font-medium">#{t.rank} {t.nameRu} ({t.nameEn})</span>
                          <span className="font-mono font-bold text-teal-700">{t.score} б</span>
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
                    <Shield className="w-4 h-4 text-teal-600" />
                    Инструкция по задачам и контролю (Top-5 талантов):
                  </h3>
                  <div className="space-y-2">
                    {selectedSession.results.top5.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                        <div className="font-bold text-slate-900 flex justify-between">
                          <span>#{t.rank} {t.nameRu} ({t.nameEn})</span>
                          <span className="uppercase text-[9px] text-teal-600 font-extrabold">{t.domain}</span>
                        </div>
                        <div><span className="font-semibold text-slate-700">📌 Задачи в смене:</span> {t.managerGuide.tasks}</div>
                        <div><span className="font-semibold text-emerald-700">🎯 Мотивация:</span> {t.managerGuide.motivation}</div>
                        <div><span className="font-semibold text-rose-700">⚠️ Демотивация:</span> {t.managerGuide.demotivationTriggers}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. ALL 34 TALENTS */}
            {modalTab === "talents34" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 font-medium">
                  Все 34 таланта сотрудника ранжированы от наиболее выраженных (1–5) к поддерживающим (6–29) и дефицитным (30–34).
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSession.results.allRanked?.map((t) => {
                    const isTop5 = t.rank <= 5;
                    const isBlind = t.rank >= 30;
                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                          isTop5
                            ? "bg-teal-50 border-teal-300 font-bold"
                            : isBlind
                            ? "bg-rose-50/60 border-rose-200 text-slate-700"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center ${
                            isTop5 ? "bg-teal-600 text-white" : isBlind ? "bg-rose-200 text-rose-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {t.rank}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{t.nameRu}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({t.nameEn})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-400 capitalize">{t.domain}</span>
                          <span className="font-bold text-slate-800">{t.score} б</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. MOTIVATION */}
            {modalTab === "motivation" && selectedSession.results.motivation && (
              <div className="space-y-4 text-xs">
                {/* Motivation Scores Breakdown */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                      <Coins className="w-4 h-4 text-amber-600" />
                      Доминирующая Мотивация: {selectedSession.results.motivation.dominant.badge}
                    </span>
                    <span className="font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg text-xs">
                      {selectedSession.results.motivation.dominant.percentage}% силы
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                    {selectedSession.results.motivation.all?.map((m) => (
                      <div key={m.typeId} className="p-2 rounded-xl bg-white border border-amber-200">
                        <div className="font-bold text-slate-800">{m.badge}</div>
                        <div className="font-extrabold text-amber-700 text-sm mt-0.5">{m.score} б</div>
                        <div className="text-[10px] text-slate-400">{m.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI Directives */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs">
                    🎯 Рекомендованный KPI и Схема Оплаты:
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {selectedSession.results.motivation.kpiRecommendations}
                  </p>
                </div>

                {/* Working with employee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <span className="font-bold text-emerald-900 block text-xs">✅ Как ставить задачи:</span>
                    <ul className="list-disc list-inside text-emerald-950 text-[11px] space-y-1">
                      {selectedSession.results.motivation.howToWork.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                    <span className="font-bold text-rose-900 block text-xs">⛔ Что категорически демотивирует:</span>
                    <ul className="list-disc list-inside text-rose-950 text-[11px] space-y-1">
                      {selectedSession.results.motivation.whatNotToDo.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. PSYCHOTYPE */}
            {modalTab === "psychotype" && selectedSession.results.psychotype && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Коммуникативный стиль DISC: {selectedSession.results.psychotype.dominant.badge}
                    </span>
                    <span className="font-bold text-blue-800 bg-blue-200/80 px-2.5 py-0.5 rounded-lg text-xs">
                      {selectedSession.results.psychotype.dominant.percentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div><span className="font-bold text-slate-800">Главная ценность:</span> {selectedSession.results.psychotype.mainValue}</div>
                    <div><span className="font-bold text-slate-800">Ключевой вопрос:</span> {selectedSession.results.psychotype.keyQuestion}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">🗣️ Манера и стиль речи:</span>
                    <p className="text-slate-600 leading-snug">{selectedSession.results.psychotype.speechStyle}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">💡 Как общаться и ставить задачи:</span>
                    <p className="text-slate-600 leading-snug">{selectedSession.results.psychotype.howToCommunicate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. SALES */}
            {modalTab === "sales" && selectedSession.results.salesProfile && (
              <div className="space-y-4 text-xs">
                {/* Client Match */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                    <span className="font-bold text-emerald-950 block text-xs">🌟 Идеальный клиент в фитнес-клубе:</span>
                    <div className="font-bold text-emerald-800 text-sm">{selectedSession.results.salesProfile.bestClientMatch.nameRu}</div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{selectedSession.results.salesProfile.bestClientMatch.whyMatch}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1.5">
                    <span className="font-bold text-amber-950 block text-xs">⚠️ Сложный клиент (требует внимания):</span>
                    <div className="font-bold text-amber-800 text-sm">{selectedSession.results.salesProfile.challengingClientMatch.nameRu}</div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{selectedSession.results.salesProfile.challengingClientMatch.whyChallenge}</p>
                  </div>
                </div>

                {/* Sales orientation */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Ориентация: <span className="text-teal-700">{selectedSession.results.salesProfile.orientationLabel}</span></span>
                    <span className="font-mono text-teal-600">{selectedSession.results.salesProfile.resultOrientationPercent}% результат</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-teal-600 h-full" style={{ width: `${selectedSession.results.salesProfile.resultOrientationPercent}%` }} />
                    <div className="bg-emerald-500 h-full" style={{ width: `${100 - selectedSession.results.salesProfile.resultOrientationPercent}%` }} />
                  </div>
                </div>

                {/* Croc & ARO & Closing */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900 block">🧠 Барьер «Крок-мозга» клиента:</span>
                    <p className="text-slate-600">{selectedSession.results.salesProfile.crocBrainTactic}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">🤝 Треугольник доверия АРО:</span>
                    <p className="text-slate-600">{selectedSession.results.salesProfile.aroSkillDescription}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">🎯 Рекомендуемый метод дожима:</span>
                    <p className="text-slate-600">{selectedSession.results.salesProfile.closingMethod}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <a
                href={`/results/${selectedSession.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Открыть полный отчет в отдельной вкладке</span>
              </a>

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

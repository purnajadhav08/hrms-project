import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { useAuthStore } from "@/store/authStore";
import type { DashboardStats } from "@/types/employee";

const VISA_COLORS: Record<string, string> = {
  GC: "bg-green-500", USC: "bg-blue-500", H1B: "bg-purple-500",
  L1: "bg-indigo-500", OPT: "bg-amber-500", CPT: "bg-orange-500",
  TN: "bg-cyan-500", other: "bg-gray-400", "": "bg-gray-300",
};

export default function DashboardPage() {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Employees", value: stats.total,  icon: Users,     bg: "#1e3a5f" },
    { label: "Active",          value: stats.active, icon: UserCheck, bg: "#16a34a" },
    { label: "Exited",          value: stats.exited, icon: UserX,     bg: "#dc2626" },
    { label: "Bench",          value: stats.bench,  icon: TrendingUp, bg: "#d97706" },
  ] : [];

  return (
    <div className="p-6">

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-xs text-gray-500 mt-0.5 capitalize">
          {user?.role} · CBC Labs. Inc HRMS
        </p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl shrink-0" style={{ background: bg }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* Change 5: Bench alert — employees going to bench within 10 days */}
          {stats.bench_soon && stats.bench_soon.length > 0 && (
            <div className="col-span-1 lg:col-span-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-amber-800">
                  ⚠️ {stats.bench_soon.length} Employee{stats.bench_soon.length > 1 ? "s" : ""} Going to Bench Soon
                </h3>
                <span className="text-xs text-amber-600">(exit date within 10 days)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.bench_soon.map((emp: any) => (
                  <div key={emp.id} className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs">
                    <p className="font-semibold text-gray-800">{emp.full_name}</p>
                    <p className="text-amber-700">Exit: {emp.exit_date} · {emp.visa_type || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visa breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Visa Breakdown</h3>
              <div className="space-y-2.5">
                {stats.visa_breakdown.length === 0 && (
                  <p className="text-xs text-gray-400">No data yet</p>
                )}
                {stats.visa_breakdown.map(v => (
                  <div key={v.visa_type} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${VISA_COLORS[v.visa_type] || "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700 font-medium flex-1">{v.visa_type || "Unknown"}</span>
                    <span className="text-sm font-bold text-gray-900">{v.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment type */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Employment Type</h3>
              <div className="space-y-2.5">
                {stats.emp_type_breakdown.length === 0 && (
                  <p className="text-xs text-gray-400">No data yet</p>
                )}
                {stats.emp_type_breakdown.map(e => (
                  <div key={e.employment_type} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-sm text-gray-700 font-medium flex-1 uppercase">{e.employment_type || "Unknown"}</span>
                    <span className="text-sm font-bold text-gray-900">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top employers */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Top Employers</h3>
              <div className="space-y-2.5">
                {stats.top_employers.length === 0 && (
                  <p className="text-xs text-gray-400">No data yet</p>
                )}
                {stats.top_employers.map((e, i) => (
                  <div key={e.employer} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-medium flex-1 truncate">{e.employer}</span>
                    <span className="text-sm font-bold text-gray-900">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent employees */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">Recently Added</h3>
              </div>
              <button onClick={() => navigate("/employees")}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: "#1e3a5f" }}>
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {stats.recent_employees.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No employees yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Emp No","Name","Employer","Designation","Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recent_employees.map(emp => (
                    <tr key={emp.id}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-600">{emp.emp_no}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{emp.full_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{emp.employer || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{emp.designation || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize
                          ${emp.status === "active" ? "bg-green-100 text-green-700" :
                            emp.status === "exited" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm">Could not load dashboard data.</p>
        </div>
      )}
    </div>
  );
}

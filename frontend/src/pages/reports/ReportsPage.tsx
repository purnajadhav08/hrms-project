import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText, Download, AlertTriangle,
  Users, Briefcase, Globe, Building2, Filter
} from "lucide-react";
import { reportService } from "@/services/reportService";

type ReportTab = "master" | "visa" | "employment-type" | "bench" | "client";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  bench:  "bg-amber-100 text-amber-700",
  exited: "bg-red-100   text-red-700",
};

const VISA_COLORS: Record<string, string> = {
  H1B: "bg-purple-100 text-purple-700",
  GC:  "bg-green-100  text-green-700",
  USC: "bg-blue-100   text-blue-700",
  OPT: "bg-amber-100  text-amber-700",
  CPT: "bg-orange-100 text-orange-700",
  L1:  "bg-indigo-100 text-indigo-700",
  TN:  "bg-cyan-100   text-cyan-700",
  other: "bg-gray-100 text-gray-600",
};

// ── Shared employee table ─────────────────────────────────────────────────────
function EmpTable({ employees }: { employees: any[] }) {
  if (!employees?.length) return (
    <p className="text-center text-gray-400 text-sm py-8">No employees found.</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {["Emp No","Name","Status","Employer","Designation","Type","Visa","Location","Email"].map(h => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((e: any) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-700">{e.emp_no}</td>
              <td className="px-3 py-2.5 font-semibold text-gray-900 whitespace-nowrap">{e.adf_employee_name}</td>
              <td className="px-3 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[e.status] || "bg-gray-100 text-gray-600"}`}>
                  {e.status}
                </span>
              </td>
              <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">{e.employer || "—"}</td>
              <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">{e.designation || "—"}</td>
              <td className="px-3 py-2.5">
                {e.employment_type
                  ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium uppercase">{e.employment_type}</span>
                  : <span className="text-gray-400 text-xs">—</span>}
              </td>
              <td className="px-3 py-2.5">
                {e.visa_type
                  ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${VISA_COLORS[e.visa_type] || "bg-gray-100 text-gray-600"}`}>{e.visa_type}</span>
                  : <span className="text-gray-400 text-xs">—</span>}
              </td>
              <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">{e.location || "—"}</td>
              <td className="px-3 py-2.5 text-gray-400 text-xs">{e.official_email || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Export buttons ────────────────────────────────────────────────────────────
function ExportButtons({ reportKey, filters }: { reportKey: string; filters: any }) {
  const [loading, setLoading] = useState<"excel" | "csv" | null>(null);

  const handle = async (type: "excel" | "csv") => {
    setLoading(type);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      if (type === "excel") await reportService.downloadExcel(reportKey, clean);
      else                  await reportService.downloadCSV(reportKey, clean);
    } catch { /* handled */ }
    finally { setLoading(null); }
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => handle("excel")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
        style={{ background: "#16a34a" }}>
        <Download className="w-3.5 h-3.5" />
        {loading === "excel" ? "Downloading…" : "Excel"}
      </button>
      <button onClick={() => handle("csv")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
        <Download className="w-3.5 h-3.5" />
        {loading === "csv" ? "Downloading…" : "CSV"}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Read tab from URL hash — e.g. /reports#visa → tab = "visa"
  const hashTab   = location.hash.replace("#", "") as ReportTab;
  const validTabs: ReportTab[] = ["master", "visa", "employment-type", "bench", "client"];
  const tab       = validTabs.includes(hashTab) ? hashTab : "master";

  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const tabs = [
    { key: "master",          label: "Employee Master", icon: Users        },
    { key: "visa",            label: "Visa Status",     icon: Globe        },
    { key: "employment-type", label: "Employment Type", icon: Briefcase    },
    { key: "bench",           label: "Bench",           icon: AlertTriangle},
    { key: "client",          label: "By Client",       icon: Building2    },
  ] as const;

  const exportKey: Record<ReportTab, string> = {
    "master":          "employee-master",
    "visa":            "visa-status",
    "employment-type": "employment-type",
    "bench":           "bench",
    "client":          "client",
  };

  const fetchData = async (t: ReportTab, f: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
      let res: any;
      if      (t === "master")          res = await reportService.employeeMaster(clean);
      else if (t === "visa")            res = await reportService.visaStatus(clean);
      else if (t === "employment-type") res = await reportService.employmentType(clean);
      else if (t === "bench")           res = await reportService.bench(clean);
      else if (t === "client")          res = await reportService.client(clean);
      setData(res?.data ?? null);
    } catch (e: any) {
      setError("Failed to load report. Make sure the backend is running.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    fetchData(tab, filters);
  }, [tab]); // re-fetches whenever URL hash changes

  const handleTabChange = (t: ReportTab) => {
    // Push to history so browser back button returns to previous tab
    navigate(`/reports#${t}`);
    setFilters({});
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Generate and export HR reports</p>
        </div>
        {data && <ExportButtons reportKey={exportKey[tab]} filters={filters} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => handleTabChange(key as ReportTab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Filters — master only */}
      {tab === "master" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            {[
              { label: "Status", key: "status", options: [["active","Active"],["bench","Bench"],["exited","Exited"]] },
              { label: "Employment Type", key: "employment_type", options: [["w2","W2"],["c2c","C2C"],["1099","1099"],["fulltime","Full Time"]] },
              { label: "Visa Type", key: "visa_type", options: [["GC","GC"],["USC","USC"],["H1B","H1B"],["L1","L1"],["OPT","OPT"],["CPT","CPT"],["TN","TN"],["other","Other"]] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
                <select value={filters[key] || ""} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">All</option>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Joined From</label>
              <input type="date" value={filters.joined_from || ""}
                onChange={e => setFilters(f => ({ ...f, joined_from: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Joined To</label>
              <input type="date" value={filters.joined_to || ""}
                onChange={e => setFilters(f => ({ ...f, joined_to: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <button onClick={() => fetchData(tab, filters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#1e3a5f" }}>
              <Filter className="w-3.5 h-3.5" /> Apply
            </button>
            <button onClick={() => { setFilters({}); fetchData(tab, {}); }}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Report content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Loading */}
        {loading && (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading report…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-16 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* ── Report 1: Employee Master ── */}
        {!loading && !error && data && tab === "master" && (
          <div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800">Employee Master Report</h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {data.count} employees
              </span>
            </div>
            <EmpTable employees={data.results || []} />
          </div>
        )}

        {/* ── Report 2: Visa Status ── */}
        {!loading && !error && data && tab === "visa" && (
          <div>
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Visa Status Report</h2>
            </div>

            {/* H1B Critical Alert */}
            {data.h1b_bench_count > 0 && (
              <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-bold text-red-700">
                    🚨 {data.h1b_bench_count} H1B Employee{data.h1b_bench_count > 1 ? "s" : ""} on Bench — Critical!
                  </p>
                </div>
                <p className="text-xs text-red-600 mb-3">
                  H1B visa does not allow bench beyond 10 days. Immediate action required.
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.h1b_bench_alert?.map((e: any) => (
                    <div key={e.id} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs">
                      <p className="font-semibold text-gray-800">{e.adf_employee_name}</p>
                      <p className="text-red-600">{e.emp_no} · {e.location || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa breakdown cards */}
            {data.breakdown?.length > 0 ? (
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.breakdown.map((b: any) => (
                  <div key={b.visa_type} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${VISA_COLORS[b.visa_type] || "bg-gray-100 text-gray-600"}`}>
                        {b.visa_type}
                      </span>
                      <span className="text-xl font-bold text-gray-900">{b.total}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600 font-medium">✓ {b.active} active</span>
                      <span className="text-amber-600 font-medium">⏸ {b.bench} bench</span>
                      <span className="text-red-500 font-medium">✗ {b.exited} exited</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm">No visa data available.</div>
            )}
          </div>
        )}

        {/* ── Report 3: Employment Type ── */}
        {!loading && !error && data && tab === "employment-type" && (
          <div>
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Employment Type Report</h2>
            </div>

            {data.breakdown?.length > 0 ? (
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100">
                {data.breakdown.map((b: any) => (
                  <div key={b.employment_type} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-lg font-bold text-gray-900 mb-1">{b.employment_type_label}</p>
                    <p className="text-3xl font-black text-blue-600 mb-2">{b.total}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600 font-medium">✓ {b.active} active</span>
                      <span className="text-amber-600 font-medium">⏸ {b.bench} bench</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No employment type data available.</div>
            )}

            <EmpTable employees={data.results || []} />
          </div>
        )}

        {/* ── Report 4: Bench ── */}
        {!loading && !error && data && tab === "bench" && (
          <div>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <h2 className="font-semibold text-gray-800">Bench Report</h2>
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {data.total_bench} on bench
              </span>
              {data.h1b_critical_count > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  🚨 {data.h1b_critical_count} H1B Critical
                </span>
              )}
            </div>

            {!data.results?.length ? (
              <div className="p-16 text-center text-gray-400 text-sm">
                No employees currently on bench. 🎉
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["Emp No","Name","Visa","Type","Bench Since","Days on Bench","Location","Email"].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.results.map((e: any) => (
                      <tr key={e.id} className={`hover:bg-gray-50 ${e.is_h1b_critical ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-700">{e.emp_no}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{e.adf_employee_name}</p>
                          {e.is_h1b_critical && (
                            <span className="text-xs text-red-600 font-semibold">⚠ H1B Critical</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${VISA_COLORS[e.visa_type] || "bg-gray-100 text-gray-600"}`}>
                            {e.visa_type || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 uppercase">{e.employment_type || "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{e.bench_since || "—"}</td>
                        <td className="px-3 py-2.5">
                          {e.days_on_bench != null ? (
                            <span className={`text-xs font-bold ${e.days_on_bench > 10 ? "text-red-600" : "text-amber-600"}`}>
                              {e.days_on_bench} days
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{e.location || "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-400">{e.official_email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Report 5: By Client ── */}
        {!loading && !error && data && tab === "client" && (
          <div>
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Client / Employer Report</h2>
              <p className="text-xs text-gray-400 mt-0.5">Active employees grouped by client</p>
            </div>

            {!data.grouped?.length ? (
              <div className="p-16 text-center text-gray-400 text-sm">
                No active employees assigned to any client yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.grouped.map((g: any) => (
                  <div key={g.employer} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <h3 className="font-bold text-gray-800">{g.employer}</h3>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {g.count} employee{g.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <EmpTable employees={g.employees} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import type { Employee } from "@/types/employee";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  exited: "bg-red-100   text-red-700",
  bench:  "bg-amber-100 text-amber-700",
};

type StatusTab = "all" | "active" | "bench" | "exited";

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Partial<Employee>[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [searched,  setSearched]  = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const load = async (empNo?: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (empNo) params.search = empNo;
      const { data } = await employeeService.list(params);
      setEmployees(data.results ?? data);
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    setSearched(term);
    setLoading(true);
    try {
      const params: any = term ? { search: term } : {};
      const { data } = await employeeService.list(params);
      const results  = data.results ?? data;
      setEmployees(results);
      setActiveTab("all");
      // Direct to profile if exact single match
      if (results.length === 1 && term) {
        navigate(`/employees/${results[0].id}`);
      }
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  const handleClear = () => {
    setSearch(""); setSearched("");
    load();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    await employeeService.delete(id);
    setEmployees(e => e.filter(x => x.id !== id));
  };

  // Change 3: filter by status tab
  const filtered = activeTab === "all"
    ? employees
    : employees.filter(e => e.status === activeTab);

  const counts = {
    all:    employees.length,
    active: employees.filter(e => e.status === "active").length,
    bench:  employees.filter(e => e.status === "bench").length,
    exited: employees.filter(e => e.status === "exited").length,
  };

  const tabs: { key: StatusTab; label: string; color: string }[] = [
    { key: "all",    label: "All",    color: "" },
    { key: "active", label: "Active", color: "text-green-600" },
    { key: "bench",  label: "Bench",  color: "text-amber-600" },
    { key: "exited", label: "Exited", color: "text-red-600"   },
  ];

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-xs text-gray-500 mt-0.5">Search by Employee ID to find a specific record</p>
        </div>
        <button onClick={() => navigate("/employees/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "#1e3a5f" }}>
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Employee ID (e.g. EMP-001)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button type="submit"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}>
          Search
        </button>
        {searched && (
          <button type="button" onClick={handleClear}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">
            Clear
          </button>
        )}
      </form>

      {/* Change 3: Status filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {tabs.map(({ key, label, color }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : `text-gray-500 hover:text-gray-700`}`}>
            <span className={activeTab === key && color ? color : ""}>
              {label}
            </span>
            <span className="ml-1.5 text-xs text-gray-400">({counts[key]})</span>
          </button>
        ))}
      </div>

      {searched && (
        <p className="text-xs text-gray-500 mb-4">
          Results for <span className="font-semibold text-gray-700">"{searched}"</span>
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {searched
                ? `No employee found with ID "${searched}"`
                : activeTab !== "all"
                  ? `No ${activeTab} employees.`
                  : "No employees yet. Add your first employee."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Emp No","Name","Status","End Client","Designation","Type","Visa","Location","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{emp.emp_no}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 whitespace-nowrap">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.official_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize
                      ${STATUS_COLORS[emp.status || ""] || "bg-gray-100 text-gray-600"}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{emp.end_client || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{emp.designation || "—"}</td>
                  <td className="px-4 py-3">
                    {emp.employment_type
                      ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium uppercase">{emp.employment_type}</span>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {emp.visa_type
                      ? <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{emp.visa_type}</span>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{emp.location || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => navigate(`/employees/${emp.id}`)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => navigate(`/employees/${emp.id}/edit`)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(emp.id!, emp.full_name || "")}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

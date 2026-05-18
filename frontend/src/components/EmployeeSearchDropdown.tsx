import { useState, useEffect, useRef } from "react";
import { Search, X, User } from "lucide-react";
import api from "@/services/apiClient";

interface EmployeeOption {
  id: number;
  full_name: string;
  emp_no: string;
  gender: string;
  designation: string;
  official_email: string;
  personal_email: string;
  contact_number: string;
  dob: string | null;
  visa_type: string;
  address: string;
  employment_type: string;
  vendor: string;
  end_client: string;
  implementation_partners: string[];
  status: string;
}

interface Props {
  value: EmployeeOption | null;
  onChange: (emp: EmployeeOption | null) => void;
  label?: string;
}

export default function EmployeeSearchDropdown({ value, onChange, label = "Link Employee (HR)" }: Props) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<EmployeeOption[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.get("/employees/", { params: { search: query, limit: 10 } });
        setResults(r.data.results ?? r.data);
      } finally { setLoading(false); }
    }, 300);
  }, [query]);

  const select = (emp: EmployeeOption) => {
    onChange(emp);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const clear = () => { onChange(null); setQuery(""); };

  return (
    <div ref={wrapRef} className="col-span-1 md:col-span-2 lg:col-span-3">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>

      {value ? (
        /* Selected employee card */
        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "#1e3a5f" }}>
            {value.full_name.charAt(0)}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
            <div>
              <p className="text-xs text-blue-400 font-medium">Name</p>
              <p className="text-sm font-semibold text-gray-900">{value.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Emp No</p>
              <p className="text-sm font-semibold text-gray-700 font-mono">{value.emp_no}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Designation</p>
              <p className="text-sm font-semibold text-gray-700">{value.designation || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Visa</p>
              <p className="text-sm font-semibold text-gray-700">{value.visa_type || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Email</p>
              <p className="text-sm text-gray-700">{value.official_email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Phone</p>
              <p className="text-sm text-gray-700">{value.contact_number || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">End Client</p>
              <p className="text-sm text-gray-700">{value.end_client || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium">Status</p>
              <p className="text-sm font-semibold capitalize text-gray-700">{value.status}</p>
            </div>
          </div>
          <button type="button" onClick={clear}
            className="p-1 text-blue-400 hover:text-red-500 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search by name or employee number…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          {open && (query.trim() || results.length > 0) && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> No employees found
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {results.map(emp => (
                    <li key={emp.id}>
                      <button type="button" onClick={() => select(emp)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: "#1e3a5f" }}>
                          {emp.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{emp.full_name}</p>
                          <p className="text-xs text-gray-400">{emp.emp_no} · {emp.designation || "—"} · {emp.visa_type || "—"}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0
                          ${emp.status === "active" ? "bg-green-100 text-green-700"
                          : emp.status === "bench"  ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"}`}>
                          {emp.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

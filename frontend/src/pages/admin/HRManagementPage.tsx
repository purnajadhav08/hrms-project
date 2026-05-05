import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Search, ShieldCheck, Clock, Users } from "lucide-react";
import { hrService } from "@/services/authService";

interface HR {
  id: number; full_name: string; email: string; emp_no: string | null;
  designation: string; account_status: string; is_approved: boolean;
  date_joined: string; contact_number: string; location: string; visa_type: string;
}

export default function HRManagementPage() {
  const [hrs,     setHrs]     = useState<HR[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"pending" | "approved">("pending");
  const [search,  setSearch]  = useState("");

  const load = async () => {
    try { const { data } = await hrService.list(); setHrs(data); }
    catch { /* handled */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: number) => {
    await hrService.approve(id);
    setHrs(h => h.map(x => x.id === id ? { ...x, is_approved: true } : x));
  };
  const handleRevoke = async (id: number) => {
    await hrService.revoke(id);
    setHrs(h => h.map(x => x.id === id ? { ...x, is_approved: false } : x));
  };
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await hrService.delete(id);
    setHrs(h => h.filter(x => x.id !== id));
  };

  const pending  = hrs.filter(h => !h.is_approved);
  const approved = hrs.filter(h =>  h.is_approved);
  const filtered = (tab === "pending" ? pending : approved)
    .filter(h => !search ||
      h.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">HR Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage HR accounts and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total HRs",  value: hrs.length,     icon: Users,       bg: "#1e3a5f" },
          { label: "Pending",    value: pending.length, icon: Clock,       bg: "#d97706" },
          { label: "Approved",   value: approved.length,icon: ShieldCheck, bg: "#16a34a" },
        ].map(({ label, value, icon: Icon, bg }) => (
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

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["pending","approved"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors
                ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t} ({t === "pending" ? pending.length : approved.length})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">
            No {tab} HR accounts{search ? " matching your search" : ""}.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Name / Email","Designation","Location","Visa","Joined","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(hr => (
                <tr key={hr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{hr.full_name || "—"}</p>
                    <p className="text-xs text-gray-400">{hr.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{hr.designation || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{hr.location || "—"}</td>
                  <td className="px-4 py-3">
                    {hr.visa_type
                      ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{hr.visa_type}</span>
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(hr.date_joined).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {!hr.is_approved ? (
                        <button onClick={() => handleApprove(hr.id)}
                          className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                      ) : (
                        <button onClick={() => handleRevoke(hr.id)}
                          className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-100">
                          <XCircle className="w-3 h-3" /> Revoke
                        </button>
                      )}
                      <button onClick={() => handleDelete(hr.id, hr.full_name || hr.email)}
                        className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100">
                        <Trash2 className="w-3 h-3" /> Delete
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

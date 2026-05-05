import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FileCheck } from "lucide-react";
import { poService } from "@/services/offerService";

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  expired:   "bg-red-100   text-red-700",
  pending:   "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100  text-gray-600",
};

export default function POPage() {
  const navigate = useNavigate();
  const [pos,     setPos]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");

  useEffect(() => {
    poService.list()
      .then(r => setPos(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete PO for ${name}?`)) return;
    await poService.delete(id);
    setPos(p => p.filter(x => x.id !== id));
  };

  const filtered = filter ? pos.filter(p => p.po_status === filter) : pos;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Purchase Orders / MSA</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track PO, invoices and contract information</p>
        </div>
        <button onClick={() => navigate("/po/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}>
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {[["","All"],["active","Active"],["expired","Expired"],["pending","Pending"],["cancelled","Cancelled"]].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${filter === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No purchase orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Candidate","Billable Client","End Client","PO Status","Invoice Status","Bill Rate","Pay Type","Visa","PO End Date","Work Mode","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{po.candidate_name}</p>
                      <p className="text-xs text-gray-400">{po.job_title || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{po.billable_client_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{po.end_client_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[po.po_status] || "bg-gray-100 text-gray-600"}`}>
                        {po.po_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[po.invoice_status] || "bg-gray-100 text-gray-600"}`}>
                        {po.invoice_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-semibold">
                      {po.bill_rate ? `$${po.bill_rate}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {po.candidate_pay_type ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium uppercase">{po.candidate_pay_type}</span> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {po.candidate_visa ? <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{po.candidate_visa}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{po.po_end_date || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{po.work_location_type || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/po/${po.id}/edit`)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(po.id, po.candidate_name)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

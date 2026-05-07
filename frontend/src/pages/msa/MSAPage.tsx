import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FileSignature, CheckCircle, XCircle, Download } from "lucide-react";
import { msaService } from "@/services/msaService";

const VALIDITY_LABELS: Record<string, string> = {
  long_term:  "Long Term",
  short_term: "Short Term",
  annual:     "Annual",
  custom:     "Custom",
};

export default function MSAPage() {
  const navigate = useNavigate();
  const [msas,    setMsas]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"active" | "inactive">("active");

  useEffect(() => {
    msaService.list()
      .then(r => setMsas(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete MSA for ${name}?`)) return;
    await msaService.delete(id);
    setMsas(m => m.filter(x => x.id !== id));
  };

  const active   = msas.filter(m => m.status === "active");
  const inactive = msas.filter(m => m.status === "inactive");
  const shown    = tab === "active" ? active : inactive;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">MSA Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5">Master Service Agreements — vendor contracts &amp; POCs</p>
        </div>
        <button onClick={() => navigate("/msa/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}>
          <Plus className="w-4 h-4" /> New MSA
        </button>
      </div>

      {/* Active / Inactive tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {([["active","Active"], ["inactive","Inactive"]] as [string, string][]).map(([val, label]) => (
          <button key={val} onClick={() => setTab(val as "active" | "inactive")}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
              ${tab === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {val === "active"
              ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              : <XCircle    className="w-3.5 h-3.5 text-gray-400" />}
            {label}
            <span className="ml-1 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {val === "active" ? active.length : inactive.length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="p-16 text-center">
            <FileSignature className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No {tab} MSAs yet.
              {tab === "inactive" && " Inactive MSAs are contracts that have ended but are kept for history."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Vendor","Client","Supplier","FEIN","Mutually Executed","Date of Execution","Validity","End Date","Signatory","Document","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map(msa => (
                  <tr key={msa.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{msa.vendor_name}</p>
                      <p className="text-xs text-gray-400">{msa.vendor_address?.split(",")[0] || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{msa.client_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{msa.supplier_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{msa.fein_number || "—"}</td>
                    <td className="px-4 py-3">
                      {msa.mutually_executed
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Yes</span>
                        : <span className="text-gray-400 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{msa.date_of_execution || "—"}</td>
                    <td className="px-4 py-3">
                      {msa.msa_validity
                        ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{VALIDITY_LABELS[msa.msa_validity] || msa.msa_validity}</span>
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{msa.msa_end_date || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{msa.poc_signatory || "—"}</td>
                    <td className="px-4 py-3">
                      {msa.document_url
                        ? <a href={msa.document_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                            <Download className="w-3.5 h-3.5" /> View
                          </a>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/msa/${msa.id}/edit`)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(msa.id, msa.vendor_name)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
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

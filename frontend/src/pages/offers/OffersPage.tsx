import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { offerService } from "@/services/offerService";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  accepted:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100   text-red-700",
  no_show:   "bg-gray-100  text-gray-600",
  withdrawn: "bg-purple-100 text-purple-700",
};

export default function OffersPage() {
  const navigate = useNavigate();
  const [offers,  setOffers]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");

  useEffect(() => {
    offerService.list()
      .then(r => setOffers(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete offer for ${name}?`)) return;
    await offerService.delete(id);
    setOffers(o => o.filter(x => x.id !== id));
  };

  const filtered = filter
    ? offers.filter(o => o.offer_status === filter)
    : offers;

  const counts = {
    all:       offers.length,
    pending:   offers.filter(o => o.offer_status === "pending").length,
    accepted:  offers.filter(o => o.offer_status === "accepted").length,
    rejected:  offers.filter(o => o.offer_status === "rejected").length,
    no_show:   offers.filter(o => o.offer_status === "no_show").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Offer Letters</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track candidate offers and status</p>
        </div>
        <button onClick={() => navigate("/offers/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}>
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5 flex-wrap">
        {[["","All"],["pending","Pending"],["accepted","Accepted"],["rejected","Rejected"],["no_show","No Show"]].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
              ${filter === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label} ({val === "" ? counts.all : (counts as any)[val] ?? 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No offers yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Candidate ID","Name","Status","Offer Type","Visa","Job Title","Technology","DOJ","Recruiter","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{o.candidate_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 whitespace-nowrap">{o.candidate_full_name}</p>
                    <p className="text-xs text-gray-400">{o.personal_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[o.offer_status] || "bg-gray-100 text-gray-600"}`}>
                      {o.offer_status?.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.offer_type ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium uppercase">{o.offer_type}</span> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {o.visa_type ? <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{o.visa_type}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{o.job_title || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.technology || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{o.date_of_joining || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{o.recruiter_name || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => navigate(`/offers/${o.id}/edit`)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(o.id, o.candidate_full_name)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
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

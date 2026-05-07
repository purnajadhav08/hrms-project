import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, CheckCircle } from "lucide-react";
import { msaService } from "@/services/msaService";

const init = {
  vendor_name: "", client_name: "", supplier_name: "", fein_number: "", vendor_address: "",
  mutually_executed: false, date_of_execution: "", msa_validity: "",
  msa_start_date: "", msa_end_date: "", poc_signatory: "",
  status: "active", notes: "",
  accounts_poc_name: "", accounts_poc_email: "", accounts_poc_phone: "",
  vendor_poc1_name: "", vendor_poc1_email: "", vendor_poc1_phone: "",
  vendor_poc2_name: "", vendor_poc2_email: "", vendor_poc2_phone: "",
  vendor_poc3_name: "", vendor_poc3_email: "", vendor_poc3_phone: "",
};
type F = typeof init;

function Field({ label, name, type = "text", placeholder = "", required = false, form, onChange }: {
  label: string; name: keyof F; type?: string; placeholder?: string; required?: boolean;
  form: F; onChange: (k: keyof F, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} placeholder={placeholder} required={required}
        value={form[name] as string}
        onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400" />
    </div>
  );
}

function SelectField({ label, name, options, required = false, form, onChange }: {
  label: string; name: keyof F; options: { value: string; label: string }[]; required?: boolean;
  form: F; onChange: (k: keyof F, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select required={required} value={form[name] as string}
        onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, name, placeholder = "", form, onChange }: {
  label: string; name: keyof F; placeholder?: string; form: F; onChange: (k: keyof F, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea rows={2} placeholder={placeholder} value={form[name] as string}
        onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none" />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2 pb-1 border-b border-gray-200 mb-1">
      <h3 className="text-sm font-bold text-gray-700">{title}</h3>
    </div>
  );
}

function POCGroup({ prefix, label, form, onChange }: {
  prefix: "vendor_poc1" | "vendor_poc2" | "vendor_poc3" | "accounts_poc";
  label: string; form: F; onChange: (k: keyof F, v: string) => void;
}) {
  return (
    <>
      <Field label={`${label} — Name`}  name={`${prefix}_name`  as keyof F} placeholder="John Doe"         form={form} onChange={onChange} />
      <Field label={`${label} — Email`} name={`${prefix}_email` as keyof F} type="email" placeholder="john@vendor.com" form={form} onChange={onChange} />
      <Field label={`${label} — Phone`} name={`${prefix}_phone` as keyof F} placeholder="848-295-2066"     form={form} onChange={onChange} />
    </>
  );
}

export default function MSAFormPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const isEdit    = !!id;
  const fileRef   = useRef<HTMLInputElement>(null);

  const [form,        setForm]        = useState<F>(init);
  const [file,        setFile]        = useState<File | null>(null);
  const [existingDoc, setExistingDoc] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(isEdit);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!isEdit) return;
    msaService.get(Number(id))
      .then(r => {
        const d = r.data;
        setForm(Object.fromEntries(Object.keys(init).map(k => [k, d[k] ?? (typeof (init as any)[k] === "boolean" ? false : "")])) as F);
        setExistingDoc(d.document_url || null);
      })
      .catch(() => navigate("/msa"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (k: keyof F, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) return;
        fd.append(k, typeof v === "boolean" ? String(v) : v);
      });
      if (file) fd.append("document", file);

      if (isEdit) { await msaService.update(Number(id), fd); }
      else        { await msaService.create(fd); }
      navigate("/msa");
    } catch (err: any) {
      const d = err?.response?.data;
      setError(typeof d === "object" ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | ") : "Save failed.");
    } finally { setLoading(false); }
  };

  const fp = { form, onChange: handleChange };
  if (fetching) return <div className="p-6 text-center text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/msa")} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit MSA" : "New MSA"}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fields marked * are required</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <SectionTitle title="Core Details" />
            <Field label="Vendor Name *"  name="vendor_name"  placeholder="Raps Consulting Inc"        required {...fp} />
            <Field label="Client Name"    name="client_name"  placeholder="Hexaware Technologies"      {...fp} />
            <Field label="Supplier Name"  name="supplier_name" placeholder="Raps Consulting Inc"       {...fp} />
            <Field label="FEIN Number"    name="fein_number"  placeholder="12-3456789"                 {...fp} />
            <div className="col-span-1 md:col-span-2">
              <TextArea label="Vendor Address" name="vendor_address" placeholder="505 Thomas Street, Edison NJ 08837" {...fp} />
            </div>

            <SectionTitle title="Agreement" />
            {/* Mutually Executed toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Mutually Executed</label>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, mutually_executed: !p.mutually_executed }))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${form.mutually_executed
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-300 text-gray-500"}`}>
                <CheckCircle className={`w-4 h-4 ${form.mutually_executed ? "text-green-500" : "text-gray-300"}`} />
                {form.mutually_executed ? "Yes" : "No"}
              </button>
            </div>
            <Field label="Date of Execution" name="date_of_execution" type="date" {...fp} />
            <SelectField label="MSA Validity" name="msa_validity" options={[
              { value: "long_term",  label: "Long Term"  },
              { value: "short_term", label: "Short Term" },
              { value: "annual",     label: "Annual"     },
              { value: "custom",     label: "Custom Dates" },
            ]} {...fp} />
            <Field label="MSA Start Date" name="msa_start_date" type="date" {...fp} />
            <Field label="MSA End Date"   name="msa_end_date"   type="date" {...fp} />
            <Field label="POC — Signatory Name" name="poc_signatory" placeholder="Chethan Babu" {...fp} />
            <SelectField label="Status *" name="status" required options={[
              { value: "active",   label: "Active"   },
              { value: "inactive", label: "Inactive" },
            ]} {...fp} />

            <SectionTitle title="Accounts POC" />
            <POCGroup prefix="accounts_poc" label="Accounts POC" form={form} onChange={handleChange} />

            <SectionTitle title="Vendor POC 1" />
            <POCGroup prefix="vendor_poc1" label="Vendor POC 1" form={form} onChange={handleChange} />

            <SectionTitle title="Vendor POC 2" />
            <POCGroup prefix="vendor_poc2" label="Vendor POC 2" form={form} onChange={handleChange} />

            <SectionTitle title="Vendor POC 3" />
            <POCGroup prefix="vendor_poc3" label="Vendor POC 3" form={form} onChange={handleChange} />

            <SectionTitle title="Document & Notes" />
            {/* Document upload */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">MSA Document</label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  {file ? "Change File" : existingDoc ? "Replace File" : "Upload File"}
                </button>
                {file && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-blue-700 font-medium">{file.name}</span>
                    <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                      <X className="w-4 h-4 text-blue-400 hover:text-blue-600" />
                    </button>
                  </div>
                )}
                {!file && existingDoc && (
                  <a href={existingDoc} target="_blank" rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium">
                    View current document
                  </a>
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextArea label="Notes" name="notes" placeholder="Any additional notes about this MSA…" {...fp} />
            </div>

          </div>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#1e3a5f" }}>
              <Save className="w-4 h-4" />{loading ? "Saving…" : isEdit ? "Save Changes" : "Create MSA"}
            </button>
            <button type="button" onClick={() => navigate("/msa")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

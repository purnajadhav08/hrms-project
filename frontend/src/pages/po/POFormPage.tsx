import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, CheckCircle } from "lucide-react";
import { poService } from "@/services/offerService";
import EmployeeSearchDropdown from "@/components/EmployeeSearchDropdown";

const init = {
  po_remarks:"", comments:"", sorting:"", company:"", entry_date:"", country:"USA",
  record_created_by:"", msa_po_signed_by:"", remarks:"",
  recruitment_manager:"", candidate_name:"", candidate_email:"", candidate_phone:"",
  candidate_dob:"", candidate_ssn:"", candidate_address:"",
  candidate_pay_type:"", candidate_relationship_mgr:"", candidate_visa:"",
  implementation_partner:"", job_title:"",
  invoice_start_month:"", invoice_start_dt:"", active_invoice_begin:"", active_invoice_end:"",
  invoice_status:"active", invoice_end_dt:"", invoice_schedule:"", invoice_email:"",
  po_status:"active", po_end_date:"", po_comments:"", contract_info_path:"",
  billing_type:"", bill_rate:"", candidate_payrate:"", net_pay:"",
  referral_rate:"", net_payment_terms:"",
  billable_client_name:"", billable_client_person:"", billable_client_email:"",
  billable_client_phone:"", billable_client_address:"",
  supplier_name:"", second_customer:"", system_integrator:"",
  end_client_name:"", end_client_person:"", end_client_email:"", end_client_phone:"",
  customer_type:"", first_customer:"",
  work_location_type:"", work_location_state:"", work_location_address:"",
};
type F = typeof init;

function Field({ label, name, type="text", placeholder="", required=false, form, onChange }: {
  label:string; name:keyof F; type?:string; placeholder?:string; required?:boolean;
  form:F; onChange:(k:keyof F,v:string)=>void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} placeholder={placeholder} required={required} value={form[name]}
        onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400" />
    </div>
  );
}

function SelectField({ label, name, options, required=false, form, onChange }: {
  label:string; name:keyof F; options:{value:string;label:string}[]; required?:boolean;
  form:F; onChange:(k:keyof F,v:string)=>void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select required={required} value={form[name]} onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, name, placeholder="", form, onChange }: {
  label:string; name:keyof F; placeholder?:string; form:F; onChange:(k:keyof F,v:string)=>void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea rows={2} placeholder={placeholder} value={form[name]}
        onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none" />
    </div>
  );
}

function SectionTitle({ title }: { title:string }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2 pb-1 border-b border-gray-200 mb-1">
      <h3 className="text-sm font-bold text-gray-700">{title}</h3>
    </div>
  );
}

export default function POFormPage() {
  const { id }   = useParams<{ id:string }>();
  const navigate = useNavigate();
  const isEdit   = !!id;
  const fileRef  = useRef<HTMLInputElement>(null);

  const [form,           setForm]          = useState<F>(init);
  const [file,           setFile]          = useState<File | null>(null);
  const [existingDoc,    setExistingDoc]   = useState<string | null>(null);
  const [payWhenPaid,    setPayWhenPaid]   = useState(false);
  const [mutuallyExec,   setMutuallyExec]  = useState(false);
  const [selectedEmp,    setSelectedEmp]   = useState<any | null>(null);
  const [loading,        setLoading]       = useState(false);
  const [fetching,       setFetching]      = useState(isEdit);
  const [error,          setError]         = useState("");

  useEffect(() => {
    if (!isEdit) return;
    poService.get(Number(id))
      .then(r => {
        setForm(Object.fromEntries(Object.keys(init).map(k => [k, r.data[k] ?? ""])) as F);
        setPayWhenPaid(!!r.data.pay_when_paid);
        setMutuallyExec(!!r.data.mutually_executed);
        setExistingDoc(r.data.document_url || null);
      })
      .catch(() => navigate("/po"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (k: keyof F, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleEmployeeSelect = (emp: any | null) => {
    setSelectedEmp(emp);
    if (!emp) return;
    setForm(p => ({
      ...p,
      candidate_name:    emp.full_name        || p.candidate_name,
      candidate_email:   emp.official_email   || p.candidate_email,
      candidate_phone:   emp.contact_number   || p.candidate_phone,
      candidate_dob:     emp.dob              || p.candidate_dob,
      candidate_visa:    emp.visa_type        || p.candidate_visa,
      candidate_address: emp.address          || p.candidate_address,
      job_title:         emp.designation      || p.job_title,
      implementation_partner: (emp.implementation_partners ?? []).join(", ") || p.implementation_partner,
      end_client_name:   emp.end_client       || p.end_client_name,
      billable_client_name: emp.vendor        || p.billable_client_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null) fd.append(k, v as string); });
      fd.append("pay_when_paid",     String(payWhenPaid));
      fd.append("mutually_executed", String(mutuallyExec));
      if (selectedEmp) fd.append("employee", String(selectedEmp.id));
      if (file) fd.append("document", file);

      if (isEdit) { await poService.updateForm(Number(id), fd); navigate("/po"); }
      else        { await poService.createForm(fd);             navigate("/po"); }
    } catch (err: any) {
      const d = err?.response?.data;
      setError(typeof d === "object" ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(" "):v}`).join(" | ") : "Save failed.");
    } finally { setLoading(false); }
  };

  const fp = { form, onChange: handleChange };
  if (fetching) return <div className="p-6 text-center text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/po")} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Purchase Order" : "New Purchase Order"}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fields marked * are required</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <EmployeeSearchDropdown value={selectedEmp} onChange={handleEmployeeSelect} />

            <SectionTitle title="Admin & Tracking" />
            <Field label="Company (CBC)" name="company" placeholder="CloudBC / Apptad Inc" {...fp} />
            <Field label="Entry Date" name="entry_date" type="date" {...fp} />
            <Field label="Country" name="country" placeholder="USA" {...fp} />
            <Field label="Recruitment Manager" name="recruitment_manager" placeholder="Sanghraj" {...fp} />
            <Field label="Record Created By" name="record_created_by" placeholder="Vinay" {...fp} />
            <Field label="MSA/PO Signed By" name="msa_po_signed_by" placeholder="Chethan Babu" {...fp} />
            <Field label="Sorting" name="sorting" placeholder="CloudBCActive..." {...fp} />
            <SelectField label="PO Remarks" name="po_remarks" options={[
              {value:"Up to date",label:"Up to date"},
              {value:"PO yet to collect",label:"PO yet to collect"},
              {value:"MSA pending",label:"MSA pending"},
            ]} {...fp} />
            <div className="col-span-1 md:col-span-2"><TextArea label="Comments" name="comments" placeholder="PO is Active…" {...fp} /></div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3"><TextArea label="Remarks" name="remarks" placeholder="Additional remarks…" {...fp} /></div>

            <SectionTitle title="Candidate Information" />
            <Field label="Candidate Name *" name="candidate_name"  placeholder="John Smith"        required {...fp} />
            <Field label="Candidate Email"  name="candidate_email" type="email" placeholder="john@gmail.com" {...fp} />
            <Field label="Candidate Phone"  name="candidate_phone" placeholder="+1 555 000 0000"   {...fp} />
            <Field label="Date of Birth"    name="candidate_dob"   type="date"                     {...fp} />
            <Field label="SSN"              name="candidate_ssn"   placeholder="XXX-XX-XXXX"       {...fp} />
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextArea label="Candidate Residential Address" name="candidate_address" placeholder="123 Main St, Edison NJ 08817" {...fp} />
            </div>
            <SelectField label="Candidate Pay Type" name="candidate_pay_type" options={[
              {value:"w2",label:"W2"},{value:"c2c",label:"C2C"},{value:"na",label:"NA"},
            ]} {...fp} />
            <Field label="Candidate Visa"        name="candidate_visa"            placeholder="H1B / GC / USC…"     {...fp} />
            <Field label="Implementation Partner" name="implementation_partner"   placeholder="Hexaware Technologies" {...fp} />
            <Field label="Job Title"             name="job_title"                 placeholder="SQL Developer"        {...fp} />
            <Field label="Relationship Manager"  name="candidate_relationship_mgr" placeholder="Sanghraj"           {...fp} />

            <SectionTitle title="Invoice Details" />
            <Field label="Invoice Start Month" name="invoice_start_month" placeholder="Sep-23" {...fp} />
            <Field label="Invoice Start DT"    name="invoice_start_dt"    type="date" {...fp} />
            <Field label="Active Invoice Begin" name="active_invoice_begin" type="date" {...fp} />
            <Field label="Active Invoice End"   name="active_invoice_end"   type="date" {...fp} />
            <SelectField label="Invoice Status" name="invoice_status" options={[
              {value:"active",label:"Active"},{value:"expired",label:"Expired"},{value:"pending",label:"Pending"},
            ]} {...fp} />
            <Field label="Invoice End DT"   name="invoice_end_dt"   type="date" {...fp} />
            <Field label="Invoice Schedule" name="invoice_schedule" placeholder="Monthly" {...fp} />
            <Field label="Invoice Email"    name="invoice_email"    type="email" placeholder="accounts@client.com" {...fp} />

            <SectionTitle title="PO Details" />
            <SelectField label="PO Status" name="po_status" options={[
              {value:"active",label:"Active"},{value:"expired",label:"Expired"},
              {value:"pending",label:"Pending"},{value:"cancelled",label:"Cancelled"},
            ]} {...fp} />
            <Field label="PO End Date" name="po_end_date" type="date" {...fp} />
            <div className="col-span-1 md:col-span-2"><TextArea label="PO Comments" name="po_comments" placeholder="Long Term / 12/31/2026…" {...fp} /></div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3"><TextArea label="Contract Information Path" name="contract_info_path" placeholder="CloudBC Labs --> Raps Consulting --> Hexaware…" {...fp} /></div>

            <SectionTitle title="Billing" />
            <SelectField label="Billing Type" name="billing_type" options={[
              {value:"hourly",label:"Hourly"},{value:"fixed",label:"Fixed"},{value:"monthly",label:"Monthly"},
            ]} {...fp} />
            <Field label="Bill Rate ($)"         name="bill_rate"         type="number" placeholder="65.00" {...fp} />
            <Field label="Candidate Payrate ($)" name="candidate_payrate" type="number" placeholder="50.00" {...fp} />
            <Field label="Net Pay ($)"           name="net_pay"           type="number" placeholder="48.00" {...fp} />
            <Field label="Referral Rate ($)"     name="referral_rate"     type="number" placeholder="5.00"  {...fp} />
            <Field label="Net Payment Terms (days)" name="net_payment_terms" type="number" placeholder="45" {...fp} />
            {/* Pay When Paid toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Pay When Paid</label>
              <button type="button" onClick={() => setPayWhenPaid(p => !p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${payWhenPaid ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-300 text-gray-500"}`}>
                <CheckCircle className={`w-4 h-4 ${payWhenPaid ? "text-green-500" : "text-gray-300"}`} />
                {payWhenPaid ? "Yes" : "No"}
              </button>
            </div>

            <SectionTitle title="Client Chain" />
            <Field label="Billable Client Name"    name="billable_client_name"   placeholder="Raps Consulting Inc" {...fp} />
            <Field label="Billable Client Person"  name="billable_client_person" placeholder="Raga K" {...fp} />
            <Field label="Billable Client Email"   name="billable_client_email"  type="email" placeholder="raga@rapscorp.com" {...fp} />
            <Field label="Billable Client Phone"   name="billable_client_phone"  placeholder="848-295-2066" {...fp} />
            <div className="col-span-1 md:col-span-2"><TextArea label="Billable Client Address" name="billable_client_address" placeholder="505 Thomas Street, Edison NJ 08837" {...fp} /></div>
            <Field label="Supplier Name"          name="supplier_name"          placeholder="Raps Consulting Inc" {...fp} />
            <Field label="2nd Customer"           name="second_customer"        placeholder="Staffing company name" {...fp} />
            <Field label="System Integrator"      name="system_integrator"      placeholder="UST Global" {...fp} />
            <Field label="End Client Name"        name="end_client_name"        placeholder="Jenninson Associates" {...fp} />
            <SelectField label="Customer Type" name="customer_type" options={[
              {value:"investment_firm",label:"Investment Firm"},{value:"medical_insurance",label:"Medical Insurance"},
              {value:"pharma",label:"Pharma"},{value:"technology",label:"Technology"},
              {value:"finance",label:"Finance"},{value:"retail",label:"Retail"},{value:"other",label:"Other"},
            ]} {...fp} />
            <Field label="First Customer"         name="first_customer"         placeholder="Raps Consulting Inc" {...fp} />
            <Field label="End Client Person"      name="end_client_person"      placeholder="Phillips" {...fp} />
            <Field label="End Client Email"       name="end_client_email"       type="email" placeholder="jphillips@client.com" {...fp} />
            <Field label="End Client Phone"       name="end_client_phone"       placeholder="314-447-2800" {...fp} />

            <SectionTitle title="Contract" />
            {/* Mutually Executed */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Mutually Executed</label>
              <button type="button" onClick={() => setMutuallyExec(p => !p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${mutuallyExec ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-300 text-gray-500"}`}>
                <CheckCircle className={`w-4 h-4 ${mutuallyExec ? "text-green-500" : "text-gray-300"}`} />
                {mutuallyExec ? "Yes" : "No"}
              </button>
            </div>
            {/* Document upload */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Upload Document</label>
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
                  <a href={existingDoc} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                    View current document
                  </a>
                )}
              </div>
            </div>

            <SectionTitle title="Work Location" />
            <SelectField label="Work Location Type" name="work_location_type" options={[
              {value:"remote",label:"Remote"},{value:"onsite",label:"Onsite"},{value:"hybrid",label:"Hybrid"},
            ]} {...fp} />
            <Field label="Work Location State"   name="work_location_state"   placeholder="Massachusetts" {...fp} />
            <div className="col-span-1 md:col-span-2"><TextArea label="Work Location Address" name="work_location_address" placeholder="800 N. Lindbergh Blvd, Blue Ash MO 63167" {...fp} /></div>

          </div>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#1e3a5f" }}>
              <Save className="w-4 h-4" />{loading ? "Saving…" : isEdit ? "Save Changes" : "Create PO"}
            </button>
            <button type="button" onClick={() => navigate("/po")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

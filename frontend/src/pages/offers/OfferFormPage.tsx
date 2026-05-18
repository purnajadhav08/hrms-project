import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { offerService } from "@/services/offerService";
import EmployeeSearchDropdown from "@/components/EmployeeSearchDropdown";

const init = {
  candidate_id:"", candidate_full_name:"", gender:"", contact_number:"", personal_email:"",
  current_location:"", preferred_work_location:"",
  offer_released_date:"", offer_type:"", employment_type:"", visa_type:"", offer_status:"pending",
  no_show_reason:"", hr_remarks:"",
  job_title:"", technology:"", work_mode:"", rate_type:"", salary_pay_rate:"", date_of_joining:"",
  recruiter_name:"", account_manager:"",
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
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400 transition-colors" />
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
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors">
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2 pb-1 border-b border-gray-200 mb-1">
      <h3 className="text-sm font-bold text-gray-700">{title}</h3>
    </div>
  );
}

export default function OfferFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = !!id;
  const [form,        setForm]        = useState<F>(init);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(isEdit);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!isEdit) return;
    offerService.get(Number(id))
      .then(r => {
        const d = r.data;
        setForm(Object.fromEntries(
          Object.keys(init).map(k => [k, d[k] ?? ""])
        ) as F);
      })
      .catch(() => navigate("/offers"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (k: keyof F, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleEmployeeSelect = (emp: any | null) => {
    setSelectedEmp(emp);
    if (!emp) return;
    const empTypeMap:   Record<string, string> = { W2: "w2", C2C: "c2c", "1099": "c2c", FullTime: "fulltime" };
    const genderMap:    Record<string, string> = { M: "Male", F: "Female", O: "Other" };
    setForm(p => ({
      ...p,
      candidate_id:        emp.emp_no                          || p.candidate_id,
      candidate_full_name: emp.full_name                       || p.candidate_full_name,
      contact_number:      emp.contact_number                  || p.contact_number,
      personal_email:      emp.personal_email                  || p.personal_email,
      gender:              genderMap[emp.gender] || emp.gender || p.gender,
      current_location:    emp.address                         || p.current_location,
      visa_type:           emp.visa_type                       || p.visa_type,
      job_title:           emp.designation                     || p.job_title,
      offer_type:          empTypeMap[emp.employment_type]     || p.offer_type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const payload = { ...form } as any;
    ["offer_released_date","date_of_joining"].forEach(f => { if (!payload[f]) payload[f] = null; });
    if (!payload.salary_pay_rate) payload.salary_pay_rate = null;
    if (selectedEmp) payload.employee = selectedEmp.id;
    try {
      if (isEdit) { await offerService.update(Number(id), payload); navigate("/offers"); }
      else        { await offerService.create(payload);             navigate("/offers"); }
    } catch (err: any) {
      const d = err?.response?.data;
      setError(typeof d === "object" ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(" "):v}`).join(" | ") : "Save failed.");
    } finally { setLoading(false); }
  };

  const fp = { form, onChange: handleChange };
  if (fetching) return <div className="p-6 text-center text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/offers")} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Offer" : "New Offer Letter"}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fields marked * are required</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <EmployeeSearchDropdown value={selectedEmp} onChange={handleEmployeeSelect} />

            <SectionTitle title="Candidate Information" />
            <Field label="Candidate ID *"    name="candidate_id"        placeholder="CBC-2026-001" required {...fp} />
            <Field label="Full Name *"       name="candidate_full_name" placeholder="John Smith"   required {...fp} />
            <SelectField label="Gender"      name="gender" options={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]} {...fp} />
            <Field label="Contact Number"    name="contact_number"      placeholder="+1 555 000 0000" {...fp} />
            <Field label="Personal Email *"  name="personal_email"      type="email" placeholder="john@gmail.com" required {...fp} />
            <Field label="Current Location"  name="current_location"    placeholder="Texas" {...fp} />
            <Field label="Preferred Location"name="preferred_work_location" placeholder="Remote / Texas" {...fp} />

            <SectionTitle title="Offer Details" />
            <SelectField label="Offer Status *" name="offer_status" required options={[
              {value:"pending",label:"Pending"},{value:"accepted",label:"Accepted"},
              {value:"rejected",label:"Rejected"},{value:"no_show",label:"No Show"},
              {value:"withdrawn",label:"Withdrawn"},
            ]} {...fp} />
            <SelectField label="Offer Type" name="offer_type" options={[
              {value:"w2",label:"W2"},{value:"c2c",label:"C2C"},{value:"intern",label:"Intern"},{value:"na",label:"NA"},
            ]} {...fp} />
            <SelectField label="Employment Type" name="employment_type" options={[
              {value:"fulltime",label:"Full-Time"},{value:"contract",label:"Contract"},
              {value:"parttime",label:"Part-Time"},{value:"intern",label:"Internship"},
            ]} {...fp} />
            <SelectField label="Visa Type" name="visa_type" options={[
              {value:"H1B",label:"H1B"},{value:"GC",label:"Green Card"},{value:"USC",label:"US Citizen"},
              {value:"OPT",label:"OPT"},{value:"CPT",label:"CPT"},{value:"L1",label:"L1"},
              {value:"TN",label:"TN"},{value:"F1",label:"F1"},{value:"other",label:"Other"},
            ]} {...fp} />
            <Field label="Offer Released Date" name="offer_released_date" type="date" {...fp} />
            <Field label="Date of Joining (DOJ)" name="date_of_joining" type="date" {...fp} />

            <SectionTitle title="Job Details" />
            <Field label="Job Title"    name="job_title"    placeholder="Technical Consultant" {...fp} />
            <Field label="Technology"   name="technology"   placeholder="SnapLogic, React…" {...fp} />
            <SelectField label="Work Mode" name="work_mode" options={[
              {value:"remote",label:"Remote"},{value:"onsite",label:"Onsite"},{value:"hybrid",label:"Hybrid"},
            ]} {...fp} />
            <SelectField label="Rate Type" name="rate_type" options={[
              {value:"annual",label:"Annual"},{value:"hourly",label:"Hourly"},
            ]} {...fp} />
            <Field label="Salary / Pay Rate" name="salary_pay_rate" type="number" placeholder="92600" {...fp} />
            <Field label="Recruiter Name"    name="recruiter_name"  placeholder="Raj" {...fp} />
            <Field label="Account Manager"   name="account_manager" placeholder="John" {...fp} />

            <SectionTitle title="Remarks" />
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextArea label="HR Remarks" name="hr_remarks" placeholder="Joined Successfully…" {...fp} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextArea label="No Show Reason" name="no_show_reason" placeholder="If candidate did not join…" {...fp} />
            </div>

          </div>

          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#1e3a5f" }}>
              <Save className="w-4 h-4" />{loading ? "Saving…" : isEdit ? "Save Changes" : "Create Offer"}
            </button>
            <button type="button" onClick={() => navigate("/offers")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

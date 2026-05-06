import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { employeeService } from "@/services/employeeService";

const LOCATION_OPTIONS = [
  // US States
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","Washington D.C.","West Virginia","Wisconsin","Wyoming",
  "Puerto Rico","Guam",
  // Countries
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Brazil",
  "Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia",
  "Czech Republic","Denmark","Ecuador","Egypt","Estonia","Ethiopia","Finland",
  "France","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong",
  "Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya",
  "Lithuania","Malaysia","Mexico","Morocco","Myanmar","Nepal","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia",
  "Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea",
  "Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Thailand",
  "Tunisia","Turkey","UAE","Ukraine","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zimbabwe","Other",
].map(l => ({ value: l, label: l }));

const DESIGNATION_OPTIONS = [
  // IT / Engineering
  "Software Engineer","Senior Software Engineer","Lead Software Engineer",
  "Principal Software Engineer","Staff Software Engineer",
  "Frontend Developer","Backend Developer","Full Stack Developer",
  "Mobile Developer","iOS Developer","Android Developer",
  "DevOps Engineer","Cloud Engineer","Site Reliability Engineer (SRE)",
  "Infrastructure Engineer","Network Engineer","Security Engineer",
  "Database Administrator (DBA)","System Administrator","IT Support Specialist",
  "IT Manager","Data Engineer","Data Scientist","Machine Learning Engineer",
  "AI/ML Engineer","BI Developer","QA Engineer","Senior QA Engineer","QA Lead",
  "Automation Engineer (SDET)","Solutions Architect","Enterprise Architect",
  "Cloud Architect","Technical Lead","Engineering Manager","VP of Engineering",
  "Chief Technology Officer (CTO)","UI/UX Designer","Product Designer",
  // Project / Program Management
  "Project Manager","Senior Project Manager","Program Manager","Portfolio Manager",
  "Delivery Manager","Scrum Master","Agile Coach","Product Owner",
  // Business Analysis / Consulting
  "Business Analyst","Senior Business Analyst","Functional Consultant",
  "ERP Consultant","SAP Consultant","Salesforce Consultant",
  // Product Management
  "Product Manager","Senior Product Manager",
  // HR
  "HR Executive","HR Specialist","HR Generalist","HR Manager","Senior HR Manager",
  "Talent Acquisition Specialist","Recruiter","Senior Recruiter",
  "Technical Recruiter","HR Business Partner",
  "Compensation & Benefits Specialist","Learning & Development Specialist",
  "HR Director","VP of Human Resources","Chief People Officer (CPO)",
  "Payroll Specialist","Payroll Manager","HRIS Analyst",
  // Finance
  "Financial Analyst","Senior Financial Analyst","Accountant","Senior Accountant",
  "Finance Manager","Controller","Chief Financial Officer (CFO)",
  // Sales & BD
  "Sales Executive","Business Development Manager","Account Manager",
  "Key Account Manager","Account Executive","Sales Manager","VP of Sales",
  // Marketing
  "Marketing Specialist","Digital Marketing Manager","Content Manager",
  "Marketing Director","VP of Marketing",
  // Operations & Leadership
  "Operations Manager","Director of Operations","VP of Operations",
  "Chief Operating Officer (COO)","Chief Executive Officer (CEO)",
  "General Manager","Director","Senior Director","Vice President (VP)",
  "Senior Vice President (SVP)",
  // Admin & Legal
  "Administrative Assistant","Executive Assistant","Office Manager",
  "Legal Counsel","Compliance Officer","Contracts Manager",
  // General
  "Trainee / Intern","Associate Consultant","Consultant","Senior Consultant",
  "Principal Consultant","Managing Consultant","Other",
].map(d => ({ value: d, label: d }));

const initialForm = {
  first_name: "", middle_name: "", last_name: "",
  emp_no: "",
  gender: "", dob: "", retirement_dob: "",
  contact_number: "", official_email: "", personal_email: "",
  address: "", worksite_address: "",
  status: "active", employment_type: "",
  date_of_joining: "", exit_date: "",
  employer: "CBC Labs",
  client: "", customer: "",
  designation: "", primary_skills: "", secondary_skills: "",
  location: "",
  visa_type: "", id_status: "", e_verify_status: "",
};

type FormData = typeof initialForm;
const DATE_FIELDS: (keyof FormData)[] = ["dob", "retirement_dob", "date_of_joining", "exit_date"];

function Field({ label, name, type = "text", placeholder = "", required = false, disabled = false, form, onChange }: {
  label: string; name: keyof FormData; type?: string;
  placeholder?: string; required?: boolean; disabled?: boolean;
  form: FormData; onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} placeholder={placeholder} required={required} disabled={disabled}
        value={form[name]}
        onChange={e => onChange(name, e.target.value)}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                   placeholder:text-gray-400 transition-colors
                   ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

function SelectField({ label, name, options, required = false, form, onChange }: {
  label: string; name: keyof FormData;
  options: { value: string; label: string }[];
  required?: boolean;
  form: FormData; onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        required={required}
        value={form[name]} onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextAreaField({ label, name, placeholder = "", required = false, form, onChange }: {
  label: string; name: keyof FormData; placeholder?: string; required?: boolean;
  form: FormData; onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea rows={3} placeholder={placeholder} required={required}
        value={form[name]} onChange={e => onChange(name, e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
                   placeholder:text-gray-400 transition-colors resize-none" />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-2 md:col-span-3 pt-2 pb-1 border-b border-gray-200 mb-1">
      <h3 className="text-sm font-bold text-gray-700">{title}</h3>
    </div>
  );
}

export default function EmployeeFormPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,          setForm]          = useState<FormData>(initialForm);
  const [currentlyHere, setCurrentlyHere] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [fetching,      setFetching]      = useState(isEdit);
  const [error,         setError]         = useState("");

  useEffect(() => {
    if (!isEdit) return;
    employeeService.get(Number(id))
      .then(r => {
        const d = r.data;
        setCurrentlyHere(!d.exit_date);
        setForm({
          first_name:       d.first_name       || "",
          middle_name:      d.middle_name      || "",
          last_name:        d.last_name        || "",
          emp_no:           d.emp_no           || "",
          gender:           d.gender           || "",
          dob:              d.dob              || "",
          retirement_dob:   d.retirement_dob   || "",
          contact_number:   d.contact_number   || "",
          official_email:   d.official_email   || "",
          personal_email:   d.personal_email   || "",
          address:          d.address          || "",
          worksite_address: d.worksite_address || "",
          status:           d.status           || "active",
          employment_type:  d.employment_type  || "",
          date_of_joining:  d.date_of_joining  || "",
          exit_date:        d.exit_date        || "",
          employer:         d.employer         || "CBC Labs",
          client:           d.client           || "",
          customer:         d.customer         || "",
          designation:      d.designation      || "",
          primary_skills:   d.primary_skills   || "",
          secondary_skills: d.secondary_skills || "",
          location:         d.location         || "",
          visa_type:        d.visa_type        || "",
          id_status:        d.id_status        || "",
          e_verify_status:  d.e_verify_status  || "",
        });
      })
      .catch(() => navigate("/employees"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (key: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleCurrentlyHereToggle = (checked: boolean) => {
    setCurrentlyHere(checked);
    if (checked) handleChange("exit_date", "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const payload = { ...form } as any;
    DATE_FIELDS.forEach(f => { if (!payload[f]) payload[f] = null; });
    if (currentlyHere) payload.exit_date = null;

    try {
      if (isEdit) {
        await employeeService.update(Number(id), payload);
        navigate(`/employees/${id}`);
      } else {
        const { data } = await employeeService.create(payload);
        navigate(`/employees/${data.id}`);
      }
    } catch (err: any) {
      const d = err?.response?.data;
      setError(typeof d === "object"
        ? Object.entries(d).map(([k, v]) =>
            `${k}: ${Array.isArray(v) ? v.join(" ") : v}`
          ).join(" | ")
        : "Save failed. Please check the form.");
    } finally { setLoading(false); }
  };

  const fp = { form, onChange: handleChange };

  if (fetching) return (
    <div className="p-6 flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl">

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(isEdit ? `/employees/${id}` : "/employees")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fields marked <span className="text-red-500 font-bold">*</span> are required
            {isEdit && " · Employment changes are auto-saved to history"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ── Personal Information ─────────────────────────── */}
            <SectionTitle title="Personal Information" />
            <Field label="First Name"  name="first_name"  placeholder="John"   required {...fp} />
            <Field label="Middle Name" name="middle_name" placeholder="A."              {...fp} />
            <Field label="Last Name"   name="last_name"   placeholder="Smith"  required {...fp} />
            <Field label="Emp No"      name="emp_no"      placeholder="EMP-001" required {...fp} />
            <SelectField label="Gender" name="gender" required options={[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "O", label: "Other" },
            ]} {...fp} />
            <Field label="Date of Birth"  name="dob"            type="date" required {...fp} />
            <Field label="Rehire DOJ"     name="retirement_dob" type="date"          {...fp} />
            <Field label="Contact Number" name="contact_number" placeholder="+1 555 000 0000" required {...fp} />
            <Field label="Official Mail ID"  name="official_email" type="email" placeholder="emp@cbcinc.ai"  required {...fp} />
            <Field label="Personal Email ID" name="personal_email" type="email" placeholder="emp@gmail.com"  required {...fp} />
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextAreaField label="Address" name="address" placeholder="Street, City, State, ZIP" required {...fp} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextAreaField label="Worksite Address / Location 1" name="worksite_address" placeholder="Client site address" required {...fp} />
            </div>

            {/* ── Employment Details ───────────────────────────── */}
            <SectionTitle title="Employment Details" />
            <SelectField label="Status" name="status" required options={[
              { value: "active", label: "Active" },
              { value: "exited", label: "Exited" },
              { value: "bench",  label: "Bench"  },
            ]} {...fp} />
            <SelectField label="Employment Type" name="employment_type" required options={[
              { value: "w2",       label: "W2"        },
              { value: "c2c",      label: "C2C"       },
              { value: "1099",     label: "1099"      },
              { value: "fulltime", label: "Full Time" },
            ]} {...fp} />

            {/* Employer locked to CBC Labs */}
            <Field label="Employer" name="employer" disabled {...fp} />

            {/* Client & Customer */}
            <Field label="Client"   name="client"   placeholder="e.g. Infosys"   {...fp} />
            <Field label="Customer" name="customer" placeholder="e.g. Accenture" {...fp} />

            <SelectField label="Designation" name="designation" options={DESIGNATION_OPTIONS} {...fp} />
            <Field       label="Date of Joining" name="date_of_joining" type="date" {...fp} />
            <SelectField label="Location" name="location" required options={LOCATION_OPTIONS} {...fp} />

            {/* Exit date with "currently working here" toggle */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Exit Date
              </label>
              <Field
                label=""
                name="exit_date"
                type="date"
                disabled={currentlyHere}
                form={form}
                onChange={handleChange}
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={currentlyHere}
                  onChange={e => handleCurrentlyHereToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-gray-600">Currently working here</span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextAreaField label="Primary Skills"   name="primary_skills"   placeholder="React, Python, Django…" {...fp} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextAreaField label="Secondary Skills" name="secondary_skills" placeholder="SQL, Docker, AWS…"      {...fp} />
            </div>

            {/* ── Visa & Compliance ────────────────────────────── */}
            <SectionTitle title="Visa & Compliance" />
            <SelectField label="Visa Type" name="visa_type" required options={[
              { value: "GC",    label: "Green Card"  },
              { value: "USC",   label: "US Citizen"  },
              { value: "H1B",   label: "H1B"         },
              { value: "L1",    label: "L1"          },
              { value: "OPT",   label: "OPT"         },
              { value: "CPT",   label: "CPT"         },
              { value: "TN",    label: "TN"          },
              { value: "other", label: "Other"       },
            ]} {...fp} />
            <SelectField label="ID Status" name="id_status" required options={[
              { value: "compliant", label: "Compliant" },
              { value: "pending",   label: "Pending"   },
              { value: "expired",   label: "Expired"   },
              { value: "na",        label: "N/A"       },
            ]} {...fp} />
            <SelectField label="E-Verify Status" name="e_verify_status" required options={[
              { value: "compliant", label: "Compliant" },
              { value: "applied",   label: "Applied"   },
              { value: "pending",   label: "Pending"   },
              { value: "na",        label: "N/A"       },
            ]} {...fp} />

          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ background: "#1e3a5f" }}>
              <Save className="w-4 h-4" />
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Employee"}
            </button>
            <button type="button"
              onClick={() => navigate(isEdit ? `/employees/${id}` : "/employees")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

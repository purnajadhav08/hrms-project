import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { employeeService } from "@/services/employeeService";

const initialForm = {
  adf_employee_name: "", emp_no: "",
  gender: "", dob: "", retirement_dob: "",
  contact_number: "", official_email: "", personal_email: "",
  address: "", worksite_address: "",
  status: "active", employment_type: "",
  date_of_joining: "", exit_date: "",
  employer: "", designation: "",
  primary_skills: "", secondary_skills: "",
  location: "",
  visa_type: "", id_status: "", e_verify_status: "",
};

type FormData = typeof initialForm;
const DATE_FIELDS: (keyof FormData)[] = ["dob", "retirement_dob", "date_of_joining", "exit_date"];

// ── Field components defined OUTSIDE to prevent focus loss ───────────────────

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
                   ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployeeFormPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,         setForm]         = useState<FormData>(initialForm);
  const [currentlyHere,setCurrentlyHere]= useState(false); // Change 2: currently working toggle
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(isEdit);
  const [error,        setError]        = useState("");

  useEffect(() => {
    if (!isEdit) return;
    employeeService.get(Number(id))
      .then(r => {
        const d = r.data;
        const noExitDate = !d.exit_date;
        setCurrentlyHere(noExitDate);
        setForm({
          adf_employee_name: d.adf_employee_name || "",
          emp_no:            d.emp_no            || "",
          gender:            d.gender            || "",
          dob:               d.dob               || "",
          retirement_dob:    d.retirement_dob    || "",
          contact_number:    d.contact_number    || "",
          official_email:    d.official_email    || "",
          personal_email:    d.personal_email    || "",
          address:           d.address           || "",
          worksite_address:  d.worksite_address  || "",
          status:            d.status            || "active",
          employment_type:   d.employment_type   || "",
          date_of_joining:   d.date_of_joining   || "",
          exit_date:         d.exit_date         || "",
          employer:          d.employer          || "",
          designation:       d.designation       || "",
          primary_skills:    d.primary_skills    || "",
          secondary_skills:  d.secondary_skills  || "",
          location:          d.location          || "",
          visa_type:         d.visa_type         || "",
          id_status:         d.id_status         || "",
          e_verify_status:   d.e_verify_status   || "",
        });
      })
      .catch(() => navigate("/employees"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (key: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // When "Currently working here" is toggled ON — clear exit date
  const handleCurrentlyHereToggle = (checked: boolean) => {
    setCurrentlyHere(checked);
    if (checked) handleChange("exit_date", "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const payload = { ...form } as any;
    DATE_FIELDS.forEach(f => { if (!payload[f]) payload[f] = null; });
    // If currently working here — force exit_date to null
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
            <Field label="ADP Employee Name" name="adf_employee_name" placeholder="Full name" required {...fp} />
            <Field label="Emp No"             name="emp_no"            placeholder="EMP-001"   required {...fp} />
            <SelectField label="Gender" name="gender" required options={[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "O", label: "Other" },
            ]} {...fp} />
            <Field label="Date of Birth"   name="dob"            type="date" required {...fp} />
            <Field label="Rehire DOJ"      name="retirement_dob" type="date" {...fp} />
            <Field label="Contact Number"  name="contact_number" placeholder="+1 555 000 0000" required {...fp} />
            <Field label="Official Mail ID"   name="official_email" type="email" placeholder="emp@cbcinc.ai"  required {...fp} />
            <Field label="Personal Email ID"  name="personal_email" type="email" placeholder="emp@gmail.com"  required {...fp} />
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TextAreaField label="Address"           name="address"          placeholder="Street, City, State, ZIP" required {...fp} />
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
            <Field label="Employer"        name="employer"        placeholder="Client company name" {...fp} />
            <Field label="Designation"     name="designation"     placeholder="Job title"           {...fp} />
            <Field label="Date of Joining" name="date_of_joining" type="date" {...fp} />
            <Field label="Location"        name="location"        placeholder="City, State"         required {...fp} />

            {/* ── Exit date with "currently working here" toggle ── */}
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

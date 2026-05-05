import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, User, Briefcase, ShieldCheck,
  Mail, Phone, MapPin, Calendar, Clock, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { employeeService } from "@/services/employeeService";
import api from "@/services/apiClient";
import type { Employee, EmploymentHistory } from "@/types/employee";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  exited: "bg-red-100   text-red-700   border-red-200",
  bench:  "bg-amber-100 text-amber-700 border-amber-200",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-gray-800 mt-0.5">{value || "—"}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
        style={{ background: "#f8fafc" }}>
        <Icon className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function HistoryCard({ record, index }: { record: EmploymentHistory; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "#1e3a5f" }}>{index + 1}</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {record.employer || "—"} — {record.designation || "—"}
            </p>
            <p className="text-xs text-gray-400">
              {record.date_of_joining || "?"} → {record.exit_date || "present"} · recorded {new Date(record.recorded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoRow label="Employer"        value={record.employer} />
          <InfoRow label="Designation"     value={record.designation} />
          <InfoRow label="Employment Type" value={record.employment_type} />
          <InfoRow label="Location"        value={record.location} />
          <InfoRow label="Status"          value={record.status} />
          <InfoRow label="Visa Type"       value={record.visa_type} />
          <InfoRow label="Date of Joining" value={record.date_of_joining} />
          <InfoRow label="Exit Date"       value={record.exit_date} />
          <InfoRow label="ID Status"       value={record.id_status} />
          <InfoRow label="E-Verify"        value={record.e_verify_status} />
          <InfoRow label="Recorded By"     value={record.recorded_by_name} />
          <div className="col-span-2 md:col-span-3">
            <InfoRow label="Primary Skills"   value={record.primary_skills} />
          </div>
          <div className="col-span-2 md:col-span-3">
            <InfoRow label="Secondary Skills" value={record.secondary_skills} />
          </div>
          {record.worksite_address && (
            <div className="col-span-2 md:col-span-3">
              <InfoRow label="Worksite Address" value={record.worksite_address} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emp,          setEmp]          = useState<Employee | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [exportLoading,setExportLoading]= useState<"excel"|"csv"|null>(null);

  useEffect(() => {
    if (!id) return;
    employeeService.get(Number(id))
      .then(r => setEmp(r.data))
      .catch(() => navigate("/employees"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async (type: "excel" | "csv") => {
    setExportLoading(type);
    try {
      const token = localStorage.getItem("access_token");
      const url   = `${api.defaults.baseURL}/employees/${id}/history-report/?export=${type}`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob  = await res.blob();
      const a     = document.createElement("a");
      a.href      = URL.createObjectURL(blob);
      a.download  = `employment_history_${emp?.emp_no}.${type === "excel" ? "xlsx" : "csv"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* handled */ }
    finally { setExportLoading(null); }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading employee profile…</p>
    </div>
  );

  if (!emp) return null;

  return (
    <div className="p-6 max-w-5xl">

      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/employees")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
        <div className="flex items-center gap-2">
          {/* Export history buttons */}
          <button onClick={() => handleExport("excel")} disabled={!!exportLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ background: "#16a34a" }}>
            <Download className="w-3.5 h-3.5" />
            {exportLoading === "excel" ? "Downloading…" : "Export Excel"}
          </button>
          <button onClick={() => handleExport("csv")} disabled={!!exportLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            {exportLoading === "csv" ? "Downloading…" : "Export CSV"}
          </button>
          <button onClick={() => navigate(`/employees/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#1e3a5f" }}>
            <Pencil className="w-4 h-4" /> Edit Employee
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
          style={{ background: "#1e3a5f" }}>
          {emp.adf_employee_name?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{emp.adf_employee_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {emp.designation || "—"} · {emp.employer || "—"}
              </p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border capitalize
              ${STATUS_COLORS[emp.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {emp.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><User   className="w-3.5 h-3.5" /> {emp.emp_no}</span>
            <span className="flex items-center gap-1"><Mail   className="w-3.5 h-3.5" /> {emp.official_email || "—"}</span>
            <span className="flex items-center gap-1"><Phone  className="w-3.5 h-3.5" /> {emp.contact_number || "—"}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {emp.location || "—"}</span>
          </div>
        </div>
      </div>

      {/* Identity */}
      <Section title="Personal Information" icon={User}>
        <InfoRow label="Full Name"       value={emp.adf_employee_name} />
        <InfoRow label="Employee No."    value={emp.emp_no} />
        <InfoRow label="Gender"          value={emp.gender} />
        <InfoRow label="Date of Birth"   value={emp.dob} />
        <InfoRow label="Rehire DOJ"      value={emp.retirement_dob} />
        <InfoRow label="Contact Number"  value={emp.contact_number} />
        <InfoRow label="Official Email"  value={emp.official_email} />
        <InfoRow label="Personal Email"  value={emp.personal_email} />
        <div className="col-span-2 md:col-span-3">
          <InfoRow label="Address"       value={emp.address} />
        </div>
      </Section>

      {/* Employment */}
      <Section title="Current Employment" icon={Briefcase}>
        <InfoRow label="Status"          value={emp.status} />
        <InfoRow label="Employment Type" value={emp.employment_type} />
        <InfoRow label="Employer"        value={emp.employer} />
        <InfoRow label="Designation"     value={emp.designation} />
        <InfoRow label="Date of Joining" value={emp.date_of_joining} />
        <InfoRow label="Exit Date"       value={emp.exit_date} />
        <InfoRow label="Location"        value={emp.location} />
        <div className="col-span-2 md:col-span-3">
          <InfoRow label="Primary Skills"   value={emp.primary_skills} />
        </div>
        <div className="col-span-2 md:col-span-3">
          <InfoRow label="Secondary Skills" value={emp.secondary_skills} />
        </div>
        <div className="col-span-2 md:col-span-3">
          <InfoRow label="Worksite Address" value={emp.worksite_address} />
        </div>
      </Section>

      {/* Visa */}
      <Section title="Visa & Compliance" icon={ShieldCheck}>
        <InfoRow label="Visa Type"       value={emp.visa_type} />
        <InfoRow label="ID Status"       value={emp.id_status} />
        <InfoRow label="E-Verify Status" value={emp.e_verify_status} />
      </Section>

      {/* Audit */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Record Audit</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoRow label="Created By"  value={emp.created_by_name} />
          <InfoRow label="Created At"  value={new Date(emp.created_at).toLocaleString()} />
          <InfoRow label="Updated By"  value={emp.updated_by_name} />
          <InfoRow label="Updated At"  value={new Date(emp.updated_at).toLocaleString()} />
        </div>
      </div>

      {/* Employment History */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-bold text-gray-800">Employment History</h2>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {emp.employment_history?.length || 0} records
          </span>
        </div>

        {!emp.employment_history?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">No history yet. History is saved automatically when employment details are updated.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emp.employment_history.map((record, i) => (
              <HistoryCard key={record.id} record={record} index={i} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

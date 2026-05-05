import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, UserPlus, CheckCircle, User, Mail, Lock } from "lucide-react";
import { authService } from "@/services/authService";
import AuthLayout from "@/components/layout/AuthLayout";

interface FormState {
  full_name: string;
  email:     string;
  password:  string;
  password2: string;
}

const initial: FormState = { full_name: "", email: "", password: "", password2: "" };

// ── Reusable input — defined OUTSIDE to prevent focus loss ───────────────────
function FormInput({ label, icon: Icon, type = "text", placeholder, value, onChange, right }: {
  label: string; icon: React.ElementType; type?: string;
  placeholder: string; value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-gray-400 transition-colors bg-white"
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { role } = useParams<{ role: "admin" | "hr" }>();
  const navigate = useNavigate();
  const isAdmin  = role === "admin";

  const [form,      setForm]      = useState<FormState>(initial);
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        password2: form.password2,
      };
      if (isAdmin) {
        await authService.adminSignup(payload);
        navigate("/login");
      } else {
        await authService.hrSignup(payload);
        setSubmitted(true);
      }
    } catch (err: any) {
      const d = err?.response?.data;
      if (typeof d === "object") {
        const msgs = Object.entries(d).map(([k, v]) =>
          `${k !== "non_field_errors" ? k + ": " : ""}${Array.isArray(v) ? v.join(" ") : v}`
        );
        setError(msgs.join(" "));
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── HR success screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1" style={{ background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                Your HR account request has been sent to all Admins for review.
                You'll receive an email at <strong>{form.email}</strong> once your account is approved.
              </p>
              <button onClick={() => navigate("/login")}
                className="mt-6 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: "#1e3a5f" }}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4">
            {isAdmin
              ? <ShieldCheck className="w-8 h-8" style={{ color: "#1e3a5f" }} />
              : <UserPlus   className="w-8 h-8" style={{ color: "#1e3a5f" }} />
            }
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isAdmin ? "Admin Sign Up" : "HR Sign Up"}
          </h1>
          <p className="text-blue-300 mt-1 text-sm">
            {isAdmin
              ? "Create your administrator account"
              : "Submit your HR account request"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: "linear-gradient(90deg, #1e3a5f, #3b82f6)" }} />
          <div className="p-8">

            {!isAdmin && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  HR accounts require Admin approval before you can log in.
                  All Admins will be notified by email.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <FormInput
                label="Full Name"
                icon={User}
                placeholder="John Smith"
                value={form.full_name}
                onChange={set("full_name")}
              />

              <FormInput
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="you@cbcinc.ai"
                value={form.email}
                onChange={set("email")}
              />

              <FormInput
                label="Password"
                icon={Lock}
                type={showPwd ? "text" : "password"}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set("password")}
                right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <FormInput
                label="Confirm Password"
                icon={Lock}
                type={showPwd2 ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.password2}
                onChange={set("password2")}
                right={
                  <button type="button" onClick={() => setShowPwd2(!showPwd2)}
                    className="text-gray-400 hover:text-gray-600">
                    {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 mt-2"
                style={{ background: loading ? "#93a5b8" : "#1e3a5f" }}>
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {loading
                  ? "Creating account…"
                  : isAdmin ? "Create Admin Account" : "Submit Application"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "#1e3a5f" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}

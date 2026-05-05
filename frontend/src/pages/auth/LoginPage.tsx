import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "@/components/layout/AuthLayout";
import type { User, Tokens } from "@/types/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("access_token",  data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      setAuth(data.user as User, data.tokens as Tokens);
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/hr/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4">
            <span className="font-black text-xl" style={{ color: "#1e3a5f" }}>CBC</span>
          </div>
          <h1 className="text-3xl font-bold text-white">HRMS Portal</h1>
          <p className="text-blue-300 mt-1 text-sm">CBC Labs. Inc — Internal HR System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: "linear-gradient(90deg, #1e3a5f, #3b82f6)" }} />
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-6">Use your @cbcinc.ai email address</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required autoFocus
                    placeholder="you@cbcinc.ai"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               placeholder:text-gray-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"} required
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               placeholder:text-gray-400 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                           text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: loading ? "#93a5b8" : "#1e3a5f" }}>
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500 mb-3">Don't have an account?</p>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/signup/hr"
                  className="text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg
                             text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Join as HR
                </Link>
                <Link to="/signup/admin"
                  className="text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg
                             text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Admin Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}

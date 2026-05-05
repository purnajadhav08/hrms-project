import { useNavigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Footer from "@/components/layout/Footer";

// Only shown if HR is not yet approved — otherwise AppLayout handles routing
export default function HRPendingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Awaiting Approval</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Your account is under review. Admins have been notified and will approve your request shortly.
            You'll be able to log in once approved.
          </p>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-300
                       text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

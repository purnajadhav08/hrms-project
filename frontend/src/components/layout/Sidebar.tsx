import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserCog, LogOut, BarChart2, FileText, FileCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const isAdmin          = user?.role === "admin";

  const navItems = [
    { to: isAdmin ? "/admin/dashboard" : "/hr/dashboard", icon: LayoutDashboard, label: "Dashboard"      },
    { to: "/employees",                                    icon: Users,           label: "Employees"      },
    { to: "/offers",                                       icon: FileText,        label: "Offer Letters"  },
    { to: "/po",                                           icon: FileCheck,       label: "PO / MSA"       },
    { to: "/reports",                                      icon: BarChart2,       label: "Reports"        },
    ...(isAdmin ? [{ to: "/admin/hrs", icon: UserCog, label: "HR Management" }] : []),
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ background: "#0f2137", minHeight: "100vh" }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">CBC</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CBC Labs. Inc</p>
            <p className="text-blue-400 text-xs">HRMS Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"}`
            }>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isAdmin ? "bg-blue-500" : "bg-green-500"}`}>
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name}</p>
            <p className={`text-xs ${isAdmin ? "text-blue-400" : "text-green-400"}`}>
              {isAdmin ? "Administrator" : "HR"}
            </p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";

export default function ProtectedRoute({
  children, role,
}: { children: React.ReactNode; role: Role }) {
  const { isLoggedIn, user } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

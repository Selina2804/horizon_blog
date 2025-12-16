import { Outlet, Navigate, Link } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { Home, FileText, Users } from "lucide-react";

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-6 space-y-6">
        <h2 className="text-xl font-bold mb-6">Horizon Admin</h2>

        <nav className="space-y-3">
          <Link
            to="/admin"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>

          <Link
            to="/admin/posts"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <FileText className="w-4 h-4" /> Quản lý bài viết
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <Users className="w-4 h-4" /> Quản lý tài khoản
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

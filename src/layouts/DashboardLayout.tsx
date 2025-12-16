import { Outlet } from "@tanstack/react-router";

export default function DashboardLayout() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <Outlet />
    </main>
  );
}

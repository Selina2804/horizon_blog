import { RootRoute, Route, Outlet } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

// Pages
import Home from "../pages/Home";
import BlogDetail from "../pages/BlogDetail/BlogDetail";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import About from "../pages/About/About";
import Favorites from "../pages/Favorites/Favorites";
import Search from "../pages/Search/Search"; // ✅ THÊM IMPORT

// User Pages
import UserProfile from "../pages/UserProfile/UserProfile";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../Admin/AdminLayout";

// Dashboard (user) pages
import DashboardMine from "../pages/Dashboard/DashboardMine";
import DashboardCreate from "../pages/Dashboard/DashboardCreate";
import DashboardEdit from "../pages/Dashboard/DashboardEdit";
import DashboardSettings from "../pages/Dashboard/DashboardSettings";

// Admin pages
import DashboardAdmin from "../Admin/Dashboard/DashboardAdmin";
import AdminPosts from "../Admin/Dashboard/AdminPosts";
import AdminUsers from "../Admin/Dashboard/AdminUsers";

// ✅ Root route
const rootRoute = new RootRoute({
  component: () => (
    <>
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  ),
});

// ✅ Public routes
const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const postRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/post/$id",
  component: BlogDetail,
});

const favoritesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: Favorites,
});

const userProfileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/user/$id",
  component: UserProfile,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const registerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Register,
});

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

// ✅ THÊM SEARCH ROUTE
const searchRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: Search,
});

// ✅ Dashboard layout (USER)
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardLayout,
});

const dashboardMineRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: "/mine",
  component: DashboardMine,
});

const dashboardCreateRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: "/create",
  component: DashboardCreate,
});

const dashboardEditRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: "/edit/$id",
  component: DashboardEdit,
});

const dashboardSettingsRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: DashboardSettings,
});

// ✅ Admin layout
const adminLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = new Route({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: DashboardAdmin,
});

const adminPostsRoute = new Route({
  getParentRoute: () => adminLayoutRoute,
  path: "/posts",
  component: AdminPosts,
});

const adminUsersRoute = new Route({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: AdminUsers,
});

// ✅ Export route tree
export const routeTree = rootRoute.addChildren([
  homeRoute,
  postRoute,
  favoritesRoute,
  searchRoute, // ✅ THÊM VÀO ĐÂY
  userProfileRoute,
  loginRoute,
  registerRoute,
  aboutRoute,

  dashboardRoute.addChildren([
    dashboardMineRoute,
    dashboardCreateRoute,
    dashboardEditRoute,
    dashboardSettingsRoute,
  ]),

  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminPostsRoute,
    adminUsersRoute,
  ]),
]);
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Menu, Pencil, User, Shield, Star } from "lucide-react";
import { cn } from "../lib/utils";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./ui/avatar";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <nav className={cn("fixed top-0 inset-x-0 z-50 border-b bg-white/80 backdrop-blur")}>
      <div className="container h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Horizon Blog
        </Link>

        {/* Search bar (desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Tìm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">Tìm</Button>
        </form>

        {/* ✅ Desktop menu */}
        <div className="hidden md:flex items-center gap-4">

          <Link to="/about" className="text-sm font-medium hover:underline">
            Giới thiệu
          </Link>

          <Link to="/dashboard/create" className="flex items-center gap-1 text-sm font-medium hover:underline">
            <Pencil className="h-4 w-4" /> Tạo bài viết
          </Link>

          <Link to="/dashboard/mine" className="flex items-center gap-1 text-sm font-medium hover:underline">
            <User className="h-4 w-4" /> Bài của tôi
          </Link>

          {user && (
            <Link to="/favorites" className="flex items-center gap-1 text-sm font-medium hover:underline">
              <Star className="h-4 w-4" /> Bài đã lưu
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium hover:underline">
              <Shield className="h-4 w-4" /> Quản trị
            </Link>
          )}
        </div>

        {/* ✅ Desktop avatar */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hidden md:flex">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <div className="px-2 py-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to={`/user/${user.id}`}>Trang cá nhân</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings">Cài đặt</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex">
            <Button variant="outline" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </div>
        )}

        {/* ✅ Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* ✅ Mobile menu */}
      {open && (
        <div className="md:hidden container pb-4 space-y-3">

          {/* Search mobile */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Tìm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit">Tìm</Button>
          </form>

          {/* Menu items */}
          <Link to="/about" className="block text-sm font-medium" onClick={() => setOpen(false)}>
            Giới thiệu
          </Link>

          <Link to="/dashboard/create" className="block text-sm font-medium" onClick={() => setOpen(false)}>
            Tạo bài viết
          </Link>

          <Link to="/dashboard/mine" className="block text-sm font-medium" onClick={() => setOpen(false)}>
            Bài của tôi
          </Link>

          {user && (
            <Link to="/favorites" className="block text-sm font-medium" onClick={() => setOpen(false)}>
              Bài đã lưu ⭐
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="block text-sm font-medium" onClick={() => setOpen(false)}>
              Quản trị
            </Link>
          )}

          {/* ✅ Avatar section at bottom */}
          <div className="pt-4 border-t">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link to={`/user/${user.id}`}>Trang cá nhân</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">Cài đặt</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="w-full">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

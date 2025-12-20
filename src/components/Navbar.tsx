import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Menu, Pencil, User, Shield, Star, Search as SearchIcon } from "lucide-react";
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

const BASE_URL = import.meta.env.PROD
  ? "https://693a3c10c8d59937aa0a30c1.mockapi.io"
  : "/api";

type Post = {
  id: string;
  title: string;
  body: string;
  images?: string[];
  authorId: string;
  likes: string[];
  isPublic?: boolean;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch posts for suggestions (only when user types)
  const { data: posts = [] } = useQuery({
    queryKey: ["navbar-search-posts"],
    queryFn: async () => {
      const res = await axios.get<Post[]>(`${BASE_URL}/posts`);
      return res.data.filter((post) => post.isPublic !== false);
    },
    enabled: search.length > 0, // Only fetch when searching
  });

  // Filter posts based on search
  const suggestions = posts
    .filter((post) => {
      const query = search.toLowerCase().trim();
      return post.title.toLowerCase().includes(query);
    })
    .slice(0, 5); // Limit to 5 suggestions

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate({
        to: "/search",
        search: { q: search.trim() }
      });
      setSearch("");
      setShowSuggestions(false);
      setOpen(false);
    }
  };

  const handleSuggestionClick = (postId: string) => {
    navigate({ to: `/post/${postId}` });
    setSearch("");
    setShowSuggestions(false);
    setOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearch(value);
    setShowSuggestions(value.trim().length > 0);
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

        {/* Search bar (desktop) with suggestions */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearch} className="flex w-full">
            <Input
              type="text"
              placeholder="Tìm bài viết..."
              value={search}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => search.trim() && setShowSuggestions(true)}
              className="rounded-r-none"
            />
            <Button type="submit" className="rounded-l-none">Tìm</Button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {suggestions.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handleSuggestionClick(post.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors flex items-start gap-3"
                >
                  {post.images?.[0] && (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {(() => {
                        try {
                          const decoded = decodeURIComponent(post.body);
                          return decoded.replace(/<[^>]*>/g, "").slice(0, 60) + "...";
                        } catch {
                          return post.body.replace(/<[^>]*>/g, "").slice(0, 60) + "...";
                        }
                      })()}
                    </p>
                  </div>
                  <SearchIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
              
              {/* "Xem tất cả" button */}
              <button
                onClick={handleSearch}
                className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Xem tất cả kết quả cho "{search}"
              </button>
            </div>
          )}
        </div>

        {/* Desktop menu */}
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

        {/* Desktop avatar */}
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

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
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

          {/* Avatar section at bottom */}
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
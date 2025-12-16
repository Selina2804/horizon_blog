import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load email/password đã lưu
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loggedUser = await login(email.trim(), password);

    if (loggedUser) {
      alert("Đăng nhập thành công!");

      // ✅ Lưu hoặc xóa thông tin đăng nhập
      if (rememberMe) {
        localStorage.setItem("savedEmail", email.trim());
        localStorage.setItem("savedPassword", password);
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      // ✅ Điều hướng theo role
      if (loggedUser.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    } else {
      alert("Sai email hoặc mật khẩu!");
    }

    setLoading(false);
  };

  return (
    <div className="container py-10 max-w-md">
      <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>

      <form
        onSubmit={handleLogin}
        className="space-y-4 bg-white p-6 rounded-xl border"
      >
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Mật khẩu */}
        <div className="relative">
          <Input
            placeholder="Mật khẩu"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Nhớ tài khoản */}
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-sm cursor-pointer">
            Nhớ tài khoản
          </label>
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Tạo tài khoản
        </Link>
      </p>
    </div>
  );
}

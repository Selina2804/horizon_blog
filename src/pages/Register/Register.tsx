import { useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { X, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    let avatarUrl = "https://i.pravatar.cc/40?img=12";

    try {
      if (avatarFile) {
        avatarUrl = await uploadToImgBB(avatarFile);
      }

      const success = await register({
        name,
        email,
        password,
        role: "user",
        avatarUrl,
      });

      if (success) {
        alert("Đăng ký thành công!");
        navigate({ to: "/" });
      } else {
        alert("Email này đã được sử dụng, vui lòng chọn email khác!");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Có lỗi khi đăng ký!");
    }

    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container py-10 max-w-md">
      <h2 className="text-2xl font-bold mb-6">Đăng ký</h2>

      <form
        onSubmit={handleRegister}
        className="space-y-4 bg-white p-6 rounded-xl border"
      >
        <div className="relative flex justify-center mb-4">
          <div
            className="w-24 h-24 rounded-full border overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                Chọn ảnh
              </div>
            )}
          </div>

          {preview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute top-3 left-[57%] bg-white border rounded-full p-1 shadow"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Input
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="relative">
          <Input
            placeholder="Xác nhận mật khẩu"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

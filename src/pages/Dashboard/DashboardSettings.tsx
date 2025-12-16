import { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";
import axios from "axios";

const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

export default function DashboardSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <p>Bạn cần đăng nhập để chỉnh sửa thông tin.</p>;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(user.avatarUrl);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // ✅ Upload avatar lên ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingInfo(true);

    try {
      let avatarUrl = preview;

      if (avatarFile) {
        avatarUrl = await uploadToImgBB(avatarFile);
      }

      await updateUser({ name, email, avatarUrl });
      alert("Thông tin đã được cập nhật!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Có lỗi khi cập nhật thông tin!");
    }

    setLoadingInfo(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);

    if (oldPassword !== user.password) {
      alert("Mật khẩu cũ không đúng!");
      setLoadingPassword(false);
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      setLoadingPassword(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu không khớp!");
      setLoadingPassword(false);
      return;
    }

    try {
      await updateUser({ password: newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Đổi mật khẩu thành công!");
    } finally {
      setLoadingPassword(false);
    }
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
    <div className="container py-8 max-w-lg space-y-8">
      <h2 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h2>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
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
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={loadingInfo}>
            {loadingInfo ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            placeholder="Mật khẩu cũ"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            placeholder="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            placeholder="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loadingPassword}>
            {loadingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

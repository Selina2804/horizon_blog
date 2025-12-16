import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { X, Eye, EyeOff } from "lucide-react";
import type { User } from '../../types/index';

const BASE_URL = "/api";
const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";



export default function AdminUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    password: "",
    role: "user",
  });

  if (!user) return <p>Bạn cần đăng nhập để xem trang quản trị.</p>;
  if (user.role !== "admin") return <p>Bạn không có quyền truy cập trang này.</p>;

  // ✅ Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users`);
      return res.data;
    },
  });

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

  // ✅ Xóa tài khoản
  const deleteUser = useMutation({
    mutationFn: async (id: string) => axios.delete(`${BASE_URL}/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  // ✅ Đổi role user
  const toggleRole = useMutation({
    mutationFn: async (u: User) =>
      axios.put(`${BASE_URL}/users/${u.id}`, {
        ...u,
        role: u.role === "admin" ? "user" : "admin",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  // ✅ Sửa user
  const updateUser = useMutation({
    mutationFn: async () => {
      let avatarUrl = form.avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadToImgBB(avatarFile);
      }

      await axios.put(`${BASE_URL}/users/${selectedUser?.id}`, {
        ...form,
        avatarUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpenEdit(false);
    },
  });

  // ✅ Thêm user
  const addUser = useMutation({
    mutationFn: async () => {
      let avatarUrl = form.avatarUrl || "https://i.pravatar.cc/40?img=12";

      if (avatarFile) {
        avatarUrl = await uploadToImgBB(avatarFile);
      }

      await axios.post(`${BASE_URL}/users`, {
        ...form,
        avatarUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpenAdd(false);
    },
  });

  // ✅ Mở modal sửa
  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setForm({
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      password: u.password,
      role: u.role,
    });
    setPreview(u.avatarUrl);
    setAvatarFile(null);
    setOpenEdit(true);
  };

  // ✅ Mở modal thêm
  const openAddModal = () => {
    setForm({
      name: "",
      email: "",
      avatarUrl: "",
      password: "",
      role: "user",
    });
    setPreview("");
    setAvatarFile(null);
    setOpenAdd(true);
  };

  // ✅ Chọn avatar
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Xóa avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Quản lý tài khoản</h2>

        <Button onClick={openAddModal}>➕ Thêm tài khoản</Button>
      </div>

      {/* ✅ Danh sách user */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
       {users.map((u: User) => ( 
          <Card key={u.id} className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={u.avatarUrl}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
            </div>

            <p className="text-sm">
              Quyền:{" "}
              <span
                className={`font-semibold ${
                  u.role === "admin" ? "text-red-600" : "text-blue-600"
                }`}
              >
                {u.role}
              </span>
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => toggleRole.mutate(u)}
                className="flex-1"
              >
                {u.role === "admin" ? "Hạ quyền" : "Nâng quyền"}
              </Button>

              <Button
                variant="outline"
                onClick={() => openEditModal(u)}
                className="flex-1"
              >
                Sửa
              </Button>

              <Button
                variant="destructive"
                onClick={() => deleteUser.mutate(u.id)}
                className="flex-1"
              >
                Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ✅ Modal Sửa */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Sửa tài khoản</h3>

            {/* Avatar */}
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

            {/* Form */}
            <Input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative">
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <select
              className="border p-2 rounded w-full"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenEdit(false)}>
                Hủy
              </Button>
              <Button onClick={() => updateUser.mutate()}>Lưu</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ✅ Modal Thêm */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Thêm tài khoản mới</h3>

            {/* Avatar */}
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

            {/* Form */}
            <Input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative">
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <select
              className="border p-2 rounded w-full"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Hủy
              </Button>
              <Button onClick={() => addUser.mutate()}>Thêm</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

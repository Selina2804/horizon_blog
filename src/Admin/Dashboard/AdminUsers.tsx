import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";

const BASE_URL = "/api";
const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "user" | "admin";
  password: string;
};

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
    role: "user" as "user" | "admin",
  });

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!user) return <p className="p-6 text-center text-red-500">Bạn cần đăng nhập để xem trang quản trị.</p>;
  if (user.role !== "admin") return <p className="p-6 text-center text-red-500">Bạn không có quyền truy cập trang này.</p>;

  // ✅ Fetch users với loading state
  const { data: users = [], isLoading } = useQuery({
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
      let avatarUrl = form.avatarUrl || "https://i.pravatar.cc/100?img=12";

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
    setPreview(u.avatarUrl || "");
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous object URL
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Xóa avatar
  const handleRemoveAvatar = () => {
    // Revoke object URL
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setAvatarFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Default avatar fallback
  const defaultAvatar = "https://i.pravatar.cc/100?img=12";

  // Hiển thị loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto" />
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Quản lý tài khoản</h2>
        <Button onClick={openAddModal}>➕ Thêm tài khoản</Button>
      </div>

      {/* ✅ Danh sách user */}
      {users.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">Chưa có người dùng nào</p>
          <Button onClick={openAddModal} className="mt-4">
            Thêm người dùng đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u: User) => (
            <Card key={u.id} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatarUrl || defaultAvatar}
                  className="w-12 h-12 rounded-full object-cover border"
                  alt={`Avatar của ${u.name}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                </div>
              </div>

              <p className="text-sm">
                Quyền:{" "}
                <span
                  className={`font-semibold ${
                    u.role === "admin" ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (u.id === user?.id) {
                      alert("Bạn không thể thay đổi quyền của chính mình!");
                      return;
                    }
                    if (window.confirm(`Bạn có chắc chắn muốn ${u.role === "admin" ? "hạ quyền" : "nâng quyền"} cho "${u.name}"?`)) {
                      toggleRole.mutate(u);
                    }
                  }}
                  className="flex-1"
                  disabled={toggleRole.isPending || u.id === user?.id}
                >
                  {toggleRole.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : u.role === "admin" ? "Hạ quyền" : "Nâng quyền"}
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
                  onClick={() => {
                    if (u.id === user?.id) {
                      alert("Bạn không thể xóa tài khoản của chính mình!");
                      return;
                    }
                    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.name}"?\nHành động này không thể hoàn tác!`)) {
                      deleteUser.mutate(u.id);
                    }
                  }}
                  className="flex-1"
                  disabled={deleteUser.isPending || u.id === user?.id}
                >
                  {deleteUser.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : "Xóa"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ Modal Sửa */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Sửa tài khoản</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenEdit(false)}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Avatar */}
            <div className="relative flex justify-center mb-4">
              <div
                className="w-24 h-24 rounded-full border overflow-hidden cursor-pointer border-gray-300 hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Nhấn để chọn ảnh"
              >
                {preview ? (
                  <img 
                    src={preview} 
                    className="w-full h-full object-cover" 
                    alt="Avatar đã chọn"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 bg-gray-100">
                    Chọn ảnh
                  </div>
                )}
              </div>

              {preview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-3 left-[57%] bg-white border rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                  title="Xóa ảnh"
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
              required
            />

            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quyền</label>
              <select
                className="border p-2 rounded w-full bg-white"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpenEdit(false)}>
                Hủy
              </Button>
              <Button 
                onClick={() => updateUser.mutate()} 
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : "Lưu thay đổi"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ✅ Modal Thêm */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Thêm tài khoản mới</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenAdd(false)}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Avatar */}
            <div className="relative flex justify-center mb-4">
              <div
                className="w-24 h-24 rounded-full border overflow-hidden cursor-pointer border-gray-300 hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Nhấn để chọn ảnh"
              >
                {preview ? (
                  <img 
                    src={preview} 
                    className="w-full h-full object-cover" 
                    alt="Avatar đã chọn"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 bg-gray-100">
                    Chọn ảnh
                  </div>
                )}
              </div>

              {preview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-3 left-[57%] bg-white border rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                  title="Xóa ảnh"
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
              required
            />

            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                placeholder="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quyền</label>
              <select
                className="border p-2 rounded w-full bg-white"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Hủy
              </Button>
              <Button 
                onClick={() => addUser.mutate()} 
                disabled={addUser.isPending}
              >
                {addUser.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang thêm...
                  </>
                ) : "Thêm tài khoản"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
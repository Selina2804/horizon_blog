import { useState, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import type { User as AppUser, Post as AppPost } from '../../types/index'; // ✅ Import đúng types

const BASE_URL = "/api";
export default function UserProfile() {
  const { id } = useParams({ from: "/user/$id" });
  const { user: currentUser, setUser: setAuthUser } = useAuth();

  const [openModal, setOpenModal] = useState(false);

  const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

  // ✅ Fetch user - Dùng AppUser type
  const {
    data: user,
    isLoading: loadingUser,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axios.get<AppUser>(`${BASE_URL}/users/${id}`);
      return res.data;
    },
  });

  // ✅ Fetch posts - Dùng AppPost type
  const {
    data: posts = [],
    isLoading: loadingPosts,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["user-posts", id],
    queryFn: async () => {
      try {
        const res = await axios.get<AppPost[]>(`${BASE_URL}/posts?authorId=${id}`);
        return res.data.filter((p) => p.isPublic);
      } catch (err: any) {
        if (err.response?.status === 404) return [];
        throw err;
      }
    },
  });

  // ✅ Tổng lượt yêu thích
  const totalLikes = posts.reduce(
    (sum, post) => sum + (post.likes?.length || 0),
    0
  );

  // ✅ State chỉnh giao diện
  const [bio, setBio] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [themeValue, setThemeValue] = useState("minimal");

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setCoverUrl(user.coverUrl || "");
      setThemeValue(user.theme || "minimal");
    }
  }, [user]);

  const isOwner = currentUser?.id === user?.id;

  const themeColors: Record<string, string> = {
    pastel: "from-pink-100 to-blue-100",
    dark: "from-gray-800 to-gray-900 text-white",
    neon: "from-purple-500 to-pink-500 text-white",
    minimal: "from-white to-gray-50",
  };

  const themeClass = themeColors[user?.theme || "minimal"];

  // ✅ Upload ảnh cover
  const handleCoverUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    const url = data.data.url;

    setCoverUrl(url);
  };

  // ✅ FIX QUAN TRỌNG: Lưu giao diện
  const handleSave = async () => {
    if (!user) return;

    // ✅ Tạo updatedUser đầy đủ các trường bắt buộc của AppUser
    const updatedUser: AppUser = {
      // Các trường bắt buộc từ AppUser interface
      id: user.id,
      name: user.name,
      email: user.email || "", // ✅ THÊM email
      password: user.password || "", // ✅ THÊM password
      avatarUrl: user.avatarUrl,
      role: user.role || "user", // ✅ THÊM role
      
      // Các trường tùy chỉnh
      bio,
      coverUrl,
      theme: themeValue,
      
      // Các trường optional khác
      favorites: user.favorites || [],
      createdAt: user.createdAt,
    };

    await axios.put(`${BASE_URL}/users/${user.id}`, updatedUser);

    if (isOwner && setAuthUser) {
      setAuthUser(updatedUser); // ✅ Type đã match
    }

    setOpenModal(false);
    alert("Đã lưu giao diện cá nhân!");
  };

  // ✅ Loading / Error
  if (loadingUser || loadingPosts)
    return <p className="container py-16 text-center">Đang tải thông tin...</p>;

  if (isUserError || !user)
    return (
      <p className="container py-16 text-center text-gray-500">
        Không tìm thấy người dùng
      </p>
    );

  if (isPostsError)
    return (
      <p className="container py-16 text-center text-red-500">
        Lỗi khi tải bài viết
      </p>
    );

  return (
    <div className="container py-10 max-w-4xl space-y-10">

      {/* ✅ Cover */}
      <div className={`rounded-xl overflow-hidden shadow bg-gradient-to-r ${themeClass}`}>
        <div className="relative h-48 w-full">
          <img
            src={user.coverUrl || "https://unsplash.it/1200/400?random=profile"}
            className="w-full h-full object-cover opacity-90"
            alt="Cover"
          />

          {/* Avatar */}
          <img
            src={user.avatarUrl}
            className="absolute -bottom-10 left-6 w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            alt={user.name}
          />
        </div>

        {/* ✅ Tên bên trái – Tổng like bên phải */}
        <div className="pt-14 pb-6 px-6 flex items-start justify-between">

          {/* ✅ Bên trái: Tên + Bio */}
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}

            {isOwner && (
              <button
                onClick={() => setOpenModal(true)}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Chỉnh giao diện
              </button>
            )}
          </div>

          {/* ✅ Bên phải: Tổng lượt yêu thích */}
          <div className="text-right">
            <p className="text-red-600 font-semibold text-lg flex items-center gap-2 justify-end">
              ❤️ {totalLikes}
            </p>
            <p className="text-gray-600 text-sm">Tổng lượt yêu thích</p>
          </div>
        </div>
      </div>

      {/* ✅ Danh sách bài viết */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Bài viết đã đăng</h3>

        {posts.length === 0 ? (
          <p className="text-gray-500">Người dùng này chưa đăng bài nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              let decodedBody = post.body;
              try {
                decodedBody = decodeURIComponent(post.body);
              } catch {}

              const postImages = post.images || []; // ✅ Fix undefined
              const thumbnail = postImages[0] || `https://unsplash.it/600/300?random=${post.id}`;

              return (
                <Card
                  key={post.id}
                  className="overflow-hidden border shadow-sm hover:shadow-md transition"
                >
                  <Link to={`/post/${post.id}`}>
                    <img 
                      src={thumbnail} 
                      className="w-full h-40 object-cover" 
                      alt={post.title}
                    />
                  </Link>

                  <div className="p-4 space-y-2">
                    <h4 className="text-lg font-semibold">
                      <Link to={`/post/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h4>

                    <div
                      className="text-sm text-gray-700 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: decodedBody }}
                    />

                    {/* Likes */}
                    <div className="flex items-center gap-1 text-sm text-gray-700 pt-1">
                      <span className="text-red-500 text-lg">❤️</span>
                      <span>{post.likes?.length || 0}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Modal chỉnh giao diện */}
      {isOwner && openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl space-y-6">
            <h2 className="text-xl font-bold">Chỉnh giao diện cá nhân</h2>

            {/* Bio */}
            <div className="space-y-2">
              <label className="font-medium">Tiểu sử</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu bản thân..."
              />
            </div>

            {/* Cover */}
            <div className="space-y-2">
              <label className="font-medium">Ảnh cover</label>

              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="Dán link ảnh cover..."
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
                className="block w-full border p-2 rounded"
              />

              {coverUrl && (
                <img
                  src={coverUrl}
                  className="w-full h-32 object-cover rounded-lg border"
                  alt="Cover preview"
                />
              )}
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="font-medium">Chọn theme</label>
              <select
                className="border p-2 rounded w-full"
                value={themeValue}
                onChange={(e) => setThemeValue(e.target.value)}
              >
                <option value="minimal">Tối giản</option>
                <option value="pastel">Pastel</option>
                <option value="dark">Tối</option>
                <option value="neon">Neon</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "https://693a3c10c8d59937aa0a30c1.mockapi.io";

// ✅ Định nghĩa kiểu dữ liệu
type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "user" | "admin";
  password: string;
};

type Post = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  isPublic: boolean;
  images?: string[];
  likes?: string[];
  comments?: any[];
};

export default function DashboardAdmin() {
  const { user } = useAuth();

  if (!user) return <p className="p-6 text-center text-red-500">Bạn cần đăng nhập để xem trang quản trị.</p>;
  if (user.role !== "admin") return <p className="p-6 text-center text-red-500">Bạn không có quyền truy cập trang này.</p>;

  // ✅ Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users`);
      return res.data;
    },
  });

  // ✅ Fetch posts
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["all-posts"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/posts`);
      return res.data;
    },
  });

  const totalPosts = posts.length;
  const publicPosts = posts.filter((p) => p.isPublic).length;
  const privatePosts = posts.filter((p) => !p.isPublic).length;

  // ✅ Hàm lấy tên tác giả từ authorId
  const getAuthor = (authorId: string) => {
    return users.find((u: User) => u.id === authorId);
  };

  // ✅ Sắp xếp bài theo lượt thích
  const sortedByLikes = [...posts].sort(
    (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
  );

  const mostLikedPost = sortedByLikes[0] || null;
  const top3 = sortedByLikes.slice(0, 3);

  // Default avatar fallback
  const defaultAvatar = "https://i.pravatar.cc/100?img=12";

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold">Dashboard Admin</h2>

      {/* ✅ Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800">Tổng số tài khoản</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{users.length}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <h3 className="text-xl font-semibold text-green-800">Tổng số bài viết</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{totalPosts}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800">Bài viết công khai</h3>
          <p className="text-3xl font-bold mt-2 text-purple-600">{publicPosts}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <h3 className="text-xl font-semibold text-yellow-800">Bài viết riêng tư</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{privatePosts}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ✅ Bài viết được yêu thích nhất */}
        <Card className="p-6 border border-red-300 shadow-md bg-gradient-to-r from-red-50 to-red-100">
          <h3 className="text-xl font-semibold mb-4 text-red-700 flex items-center gap-2">
            <span className="text-2xl">⭐</span> Bài viết được yêu thích nhất
          </h3>

          {mostLikedPost ? (
            <div className="flex gap-4 items-start">
              {/* Thumbnail */}
              <img
                src={
                  mostLikedPost.images?.[0] ||
                  `https://unsplash.it/200/150?random=${mostLikedPost.id}`
                }
                className="w-32 h-24 object-cover rounded-lg border shadow-sm"
                alt={mostLikedPost.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://unsplash.it/200/150?random=${mostLikedPost.id}`;
                }}
              />

              <div className="flex-1 space-y-2">
                <p className="font-semibold text-lg line-clamp-2">{mostLikedPost.title}</p>

                {/* Tác giả */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img
                    src={getAuthor(mostLikedPost.authorId)?.avatarUrl || defaultAvatar}
                    className="w-6 h-6 rounded-full border"
                    alt={getAuthor(mostLikedPost.authorId)?.name || "Unknown"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <span>{getAuthor(mostLikedPost.authorId)?.name || "Unknown"}</span>
                </div>

                {/* Lượt thích */}
                <p className="text-red-600 font-semibold flex items-center gap-1">
                  <span className="text-lg">❤️</span> {mostLikedPost.likes?.length || 0} lượt thích
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có bài viết nào.</p>
          )}
        </Card>

        {/* ✅ User mới đăng ký */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">👤 Người dùng mới</h3>

          {users.slice(0, 5).map((u: User) => (
            <div key={u.id} className="border-b border-blue-200 py-3 last:border-0">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatarUrl || defaultAvatar}
                  className="w-8 h-8 rounded-full border"
                  alt={u.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ✅ Top 3 bài được yêu thích nhất */}
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <h3 className="text-xl font-semibold mb-4 text-orange-800 flex items-center gap-2">
            <span className="text-2xl">🔥</span> Top 3 bài được yêu thích nhất
          </h3>

          {top3.length > 0 ? (
            top3.map((post: Post, index: number) => {
              const author = getAuthor(post.authorId);

              return (
                <div key={post.id} className="border-b border-orange-200 py-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-red-500 w-8">#{index + 1}</span>
                      
                      {post.images?.[0] && (
                        <img
                          src={post.images[0]}
                          className="w-16 h-12 object-cover rounded-lg border shadow-sm"
                          alt={post.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://unsplash.it/100/75?random=${post.id}`;
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{post.title}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={author?.avatarUrl || defaultAvatar}
                          className="w-5 h-5 rounded-full border"
                          alt={author?.name || "Unknown"}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultAvatar;
                          }}
                        />
                        <p className="text-sm text-gray-600 truncate">{author?.name || "Unknown"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-red-600 font-semibold">
                      <span className="text-lg">❤️</span> {post.likes?.length || 0}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 italic">Chưa có bài viết nào.</p>
          )}
        </Card>

        {/* ✅ Bài viết mới nhất */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center gap-2">
            <span className="text-2xl">🆕</span> Bài viết mới nhất
          </h3>

          {posts.slice(0, 5).length > 0 ? (
            posts.slice(0, 5).map((post: Post) => (
              <div key={post.id} className="border-b border-green-200 py-4 last:border-0">
                <div className="flex items-start gap-3">
                  {post.images?.[0] && (
                    <img
                      src={post.images[0]}
                      className="w-16 h-12 object-cover rounded-lg border shadow-sm"
                      alt={post.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://unsplash.it/100/75?random=${post.id}`;
                      }}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{post.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Tác giả: {getAuthor(post.authorId)?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Chưa có bài viết nào.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
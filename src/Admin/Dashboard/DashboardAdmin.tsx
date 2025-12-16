import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import type { Post } from '../../types/index';
const BASE_URL = "/api";

export default function DashboardAdmin() {
  const { user } = useAuth();

  if (!user) return <p>Bạn cần đăng nhập để xem trang quản trị.</p>;
  if (user.role !== "admin") return <p>Bạn không có quyền truy cập trang này.</p>;

  // ✅ Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users`);
      return res.data;
    },
  });

  // ✅ Fetch posts
  const { data: posts = [] } = useQuery({
    queryKey: ["all-posts"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/posts`);
      return res.data;
    },
  });

  const totalPosts = posts.length;
  const publicPosts = posts.filter((p: Post) => p.isPublic).length;
const privatePosts = posts.filter((p: Post) => !p.isPublic).length;

  // ✅ Hàm lấy tên tác giả từ authorId
  const getAuthor = (authorId: string) => {
    return users.find((u: any) => u.id === authorId);
  };

  // ✅ Sắp xếp bài theo lượt thích
  const sortedByLikes = [...posts].sort(
    (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
  );

  const mostLikedPost = sortedByLikes[0] || null;
  const top3 = sortedByLikes.slice(0, 3);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Dashboard Admin</h2>

      {/* ✅ Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Tổng số tài khoản</h3>
          <p className="text-3xl font-bold mt-2">{users.length}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Tổng số bài viết</h3>
          <p className="text-3xl font-bold mt-2">{totalPosts}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Bài viết công khai</h3>
          <p className="text-3xl font-bold mt-2">{publicPosts}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Bài viết riêng tư</h3>
          <p className="text-3xl font-bold mt-2">{privatePosts}</p>
        </Card>
      </div>

      {/* ✅ Bài viết được yêu thích nhất */}
      <Card className="p-6 border border-red-300 shadow-md bg-red-50">
        <h3 className="text-xl font-semibold mb-4 text-red-700">
          ⭐ Bài viết được yêu thích nhất
        </h3>

        {mostLikedPost ? (
          <div className="flex gap-4 items-start">
            {/* Thumbnail */}
            <img
              src={
                mostLikedPost.images?.[0] ||
                `https://unsplash.it/200/150?random=${mostLikedPost.id}`
              }
              className="w-32 h-24 object-cover rounded-lg border"
            />

            <div className="flex-1 space-y-1">
              <p className="font-semibold text-lg">{mostLikedPost.title}</p>

              {/* Tác giả */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <img
                  src={getAuthor(mostLikedPost.authorId)?.avatarUrl}
                  className="w-6 h-6 rounded-full border"
                />
                <span>{getAuthor(mostLikedPost.authorId)?.name}</span>
              </div>

              {/* Lượt thích */}
              <p className="text-red-600 font-semibold flex items-center gap-1">
                ❤️ {mostLikedPost.likes?.length || 0} lượt thích
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        )}
      </Card>

      {/* ✅ Top 3 bài được yêu thích nhất */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">🔥 Top 3 bài được yêu thích nhất</h3>

        {top3.map((post: any, index: number) => {
          const author = getAuthor(post.authorId);

          return (
            <div key={post.id} className="border-b py-3 flex items-center gap-3">
              <span className="text-2xl font-bold text-red-500">{index + 1}</span>

              <div className="flex-1">
                <p className="font-medium">{post.title}</p>

                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <img
                    src={author?.avatarUrl}
                    className="w-5 h-5 rounded-full border"
                  />
                  {author?.name}
                </p>
              </div>

              <p className="text-red-600 font-semibold flex items-center gap-1">
                ❤️ {post.likes?.length || 0}
              </p>
            </div>
          );
        })}
      </Card>

      {/* ✅ Bài viết mới nhất */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Bài viết mới nhất</h3>

        {posts.slice(0, 5).map((post: any) => (
          <div key={post.id} className="border-b py-3">
            <p className="font-medium">{post.title}</p>

            <p className="text-sm text-gray-500">
              Tác giả: {getAuthor(post.authorId)?.name}
            </p>
          </div>
        ))}
      </Card>

      {/* ✅ User mới đăng ký */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Người dùng mới</h3>

        {users.slice(0, 5).map((u: any) => (
          <div key={u.id} className="border-b py-3">
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

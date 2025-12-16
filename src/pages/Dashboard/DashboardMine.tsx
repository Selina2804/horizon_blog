import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

const BASE_URL = "/api";

type Post = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  isPublic: boolean;
  images?: string[];
  likes?: string[];
};

const fetchPosts = async (userId: string): Promise<Post[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/posts?authorId=${userId}`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) return [];
    throw err;
  }
};

export default function DashboardMine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => fetchPosts(user!.id),
    enabled: !!user,
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => axios.delete(`${BASE_URL}/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-posts"] }),
  });

  if (!user) return <p>Bạn cần đăng nhập để xem bài viết của mình.</p>;
  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">Lỗi khi tải dữ liệu.</p>;

  return (
    <div className="container py-10 max-w-5xl space-y-6">
      <h2 className="text-3xl font-bold mb-6">📝 Bài viết của tôi</h2>

      {data.length === 0 && (
        <p className="text-gray-500">Bạn chưa có bài viết nào.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((post) => {
          const thumbnail =
            post.images?.[0] ||
            `https://unsplash.it/600/300?random=${post.id}`;

          let decodedBody = post.body;
          try {
            decodedBody = decodeURIComponent(post.body);
          } catch {}

          const isLiked = post.likes?.includes(user.id);

          return (
            <Card
              key={post.id}
              className="overflow-hidden border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
            >
              {/* ✅ Thumbnail */}
              <div className="relative">
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-full h-44 object-cover"
                />

                {/* ✅ Badge trạng thái (GIỮ NGUYÊN) */}
                <span
                  className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-md shadow-md ${
                    post.isPublic
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {post.isPublic ? "Công khai" : "Riêng tư"}
                </span>
              </div>

              {/* ✅ Nội dung */}
              <div className="p-4 space-y-3">

                {/* ✅ Title giống Favorites */}
                <h4 className="text-xl font-semibold leading-tight">
                  <Link
                    to={`/post/${post.id}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </h4>

                {/* ✅ Mô tả giống Favorites */}
                <div
                  className="text-sm text-gray-700 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: decodedBody }}
                />

                {/* ✅ Like ONLY — đã xóa badge công khai ở dưới */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Heart
                      className={`h-5 w-5 ${
                        isLiked ? "text-red-500 fill-red-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">
                      {post.likes?.length || 0} thích
                    </span>
                  </div>
                </div>

                {/* ✅ Ảnh phụ (GIỮ NGUYÊN) */}
                {post.images && post.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {post.images.slice(1).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt="Post image"
                        className="w-full h-16 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}

                {/* ✅ Nút hành động (GIỮ NGUYÊN) */}
                <div className="pt-3 grid grid-cols-3 gap-2">
                  <Button variant="outline" asChild>
                    <Link to={`/post/${post.id}`}>Xem</Link>
                  </Button>

                  <Button variant="outline" asChild>
                    <Link to={`/dashboard/edit/${post.id}`}>Sửa</Link>
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => deletePost.mutate(post.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

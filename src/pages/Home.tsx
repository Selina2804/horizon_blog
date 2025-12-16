import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "@tanstack/react-router";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { Heart, Star } from "lucide-react";

const BASE_URL = "/api";

type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

type Post = { 
  id: string; 
  title: string; 
  body: string;
  authorId?: string;
  isPublic?: boolean;
  images?: string[];
  createdAt?: string;
  likes?: string[];
};

const fetchPosts = async (): Promise<Post[]> => {
  const res = await axios.get(`${BASE_URL}/posts`);
  return res.data.slice(0, 12);
};

const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get(`${BASE_URL}/users`);
  return res.data;
};

export default function Home() {
  const { user } = useAuth();

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (postsQuery.isLoading || usersQuery.isLoading)
    return <p className="container py-16 text-center">Đang tải bài viết...</p>;

  if (postsQuery.error || usersQuery.error)
    return (
      <p className="container py-16 text-center text-red-500">
        Lỗi khi tải dữ liệu
      </p>
    );

  const posts = postsQuery.data || [];
  const users = usersQuery.data || [];

  return (
    <div className="container py-10">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Horizon Blog</h1>
        <p className="text-gray-600 mt-3 text-lg">
          Chia sẻ câu chuyện và kiến thức theo phong cách tối giản, hiện đại.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => {
          const author = users.find((u) => u.id === post.authorId);

          const thumbnail =
            post.images?.[0] ||
            `https://unsplash.it/600/300?random=${post.id}`;

          let decodedBody = post.body;
          try {
            decodedBody = decodeURIComponent(post.body);
          } catch {}

          const isLiked = user ? post.likes?.includes(user.id) : false;
          const isSaved = user ? user.favorites?.includes(post.id) : false;

          return (
            <Card
              key={post.id}
              className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border bg-white"
            >
              <Link to={`/post/${post.id}`}>
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-full h-40 object-cover"
                />
              </Link>

              <div className="p-4 space-y-3">
                {/* ✅ Tiêu đề */}
                <h3 className="text-lg font-semibold leading-tight">
                  <Link to={`/post/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>

                {/* ✅ Mô tả ngắn */}
                <div
                  className="text-gray-700 text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: decodedBody }}
                />

                {/* ✅ Avatar trái – Like + Save phải */}
                <div className="flex items-center justify-between pt-2">

                  {/* ✅ Avatar + tên tác giả */}
                  {author && (
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${author.id}`}>
                        <img
                          src={author.avatarUrl}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      </Link>

                      <div className="text-sm">
                        <Link
                          to={`/user/${author.id}`}
                          className="font-medium hover:underline"
                        >
                          {author.name}
                        </Link>
                        <p className="text-gray-500 text-xs">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                            : "Vừa đăng"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ✅ Like + Save */}
                  <div className="flex items-center gap-4">

                    {/* ❤️ Like */}
                    <div className="flex items-center gap-1 text-sm">
                      <Heart
                        className={`h-5 w-5 ${
                          isLiked
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span>{post.likes?.length || 0}</span>
                    </div>

                    {/* ⭐ Save */}
                    <div className="flex items-center gap-1 text-sm">
                      <Star
                        className={`h-5 w-5 ${
                          isSaved
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span>{isSaved ? "Đã lưu" : "Chưa lưu"}</span>
                    </div>

                  </div>
                </div>

                {/* ✅ Đọc tiếp */}
                <div className="pt-2">
                  <Link
                    to={`/post/${post.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Đọc tiếp →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

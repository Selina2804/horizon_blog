import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";

const BASE_URL = import.meta.env.MODE === 'development' 
  ? "/api" 
  : "https://693a3c10c8d59937aa0a30c1.mockapi.io/api";

type Post = {
  id: string;
  title: string;
  body: string;
  images?: string[];
  likes?: string[];
};

export default function Favorites() {
  const { user } = useAuth();

  if (!user)
    return (
      <p className="container py-16 text-center text-gray-600">
        Bạn cần đăng nhập để xem bài đã lưu.
      </p>
    );

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["all-posts"],
    queryFn: async () => {
      const res = await axios.get<Post[]>(`${BASE_URL}/posts`);
      return res.data;
    },
  });

  if (isLoading)
    return <p className="container py-16 text-center">Đang tải...</p>;

  const favoritePosts = posts.filter((p) =>
    user.favorites?.includes(p.id)
  );

  return (
    <div className="container py-10 max-w-5xl space-y-6">
      <h2 className="text-3xl font-bold mb-6">⭐ Bài viết đã lưu</h2>

      {favoritePosts.length === 0 ? (
        <p className="text-gray-500">Bạn chưa lưu bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {favoritePosts.map((post) => {
            const thumbnail =
              post.images?.[0] ||
              `https://unsplash.it/600/300?random=${post.id}`;

            let decodedBody = post.body;
            try {
              decodedBody = decodeURIComponent(post.body);
            } catch {}

            const isLiked = post.likes?.includes(user.id);
            const isSaved = user.favorites?.includes(post.id);

            return (
              <Card
                key={post.id}
                className="overflow-hidden border rounded-xl shadow-sm hover:shadow-lg transition bg-white"
              >
                {/* Thumbnail */}
                <Link to={`/post/${post.id}`}>
                  <img
                    src={thumbnail}
                    className="w-full h-48 object-cover"
                  />
                </Link>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h4 className="text-xl font-semibold leading-tight">
                    <Link
                      to={`/post/${post.id}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h4>

                  <div
                    className="text-sm text-gray-700 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: decodedBody }}
                  />

                  {/* ✅ Like + Save status */}
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

                    <div className="flex items-center gap-1 text-gray-700">
                      <Star
                        className={`h-5 w-5 ${
                          isSaved ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm">
                        {isSaved ? "Đã lưu" : "Chưa lưu"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Heart, Star } from "lucide-react";

const BASE_URL = "https://693a3c10e8d59937aa0a30c1.mockapi.io/api";

type Post = {
  id: string;
  title: string;
  body: string;
  images?: string[];
  authorId: string;
  likes: string[];
};

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  favorites?: string[];
};

const fetchPost = async (id: string): Promise<Post> => {
  const res = await axios.get<Post>(`${BASE_URL}/posts/${id}`);
  return res.data;
};

const fetchUser = async (id: string): Promise<User> => {
  const res = await axios.get<User>(`${BASE_URL}/users/${id}`);
  return res.data;
};

export default function BlogDetail() {
  const { id } = useParams({ from: "/post/$id" });
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  const { data: author } = useQuery({
    queryKey: ["author", post?.authorId],
    queryFn: () => fetchUser(post!.authorId),
    enabled: !!post?.authorId,
  });

  // ✅ Toggle Like
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!post || !user) return;

      const hasLiked = post.likes.includes(user.id);

      const updatedLikes = hasLiked
        ? post.likes.filter((uid) => uid !== user.id)
        : [...post.likes, user.id];

      await axios.put(`${BASE_URL}/posts/${post.id}`, {
        ...post,
        likes: updatedLikes,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", id] }),
  });

  // ✅ Toggle Favorite ⭐
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user || !post) return;

      const isSaved = user.favorites?.includes(post.id);

      const updatedUser = {
        ...user,
        favorites: isSaved
          ? user.favorites?.filter((pid) => pid !== post.id)
          : [...(user.favorites || []), post.id],
      };

      await axios.put(`${BASE_URL}/users/${user.id}`, updatedUser);
      setUser(updatedUser);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", user?.id] }),
  });

  if (isLoading)
    return <p className="container py-16 text-center">Đang tải bài viết...</p>;

  if (error)
    return (
      <p className="container py-16 text-center text-red-500">
        Lỗi khi tải bài viết
      </p>
    );

  if (!post)
    return (
      <p className="container py-16 text-center text-gray-500">
        Không tìm thấy bài viết
      </p>
    );

  const banner =
    post.images?.[0] || `https://unsplash.it/1200/400?random=${id}`;

  let decodedBody = post.body;
  try {
    decodedBody = decodeURIComponent(post.body);
  } catch {}

  const hasLiked = user ? post.likes.includes(user.id) : false;
  const hasSaved = user ? user.favorites?.includes(post.id) : false;

  return (
    <div className="container py-10 flex justify-center">
      <article className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8 border">

        {/* ✅ Header: Author + Like + Save */}
        <div className="flex items-center justify-between mb-6">

          {/* ✅ Author */}
          {author && (
            <div className="flex items-center gap-3">
              <img
                src={author.avatarUrl || "https://i.pravatar.cc/100"}
                alt={author.name}
                className="w-12 h-12 rounded-full border shadow-sm"
              />
              <div>
                <p className="font-semibold text-gray-900">{author.name}</p>
                <Link
                  to={`/user/${author.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Xem trang cá nhân
                </Link>
              </div>
            </div>
          )}

          {/* ✅ Like + Save (Lucide icons) */}
          <div className="flex items-center gap-6">

            {/* ❤️ Like */}
            <div className="flex items-center gap-2">
              <button
                disabled={!user}
                onClick={() => toggleLike.mutate()}
                className="transition"
              >
                <Heart
                  className={`h-5 w-5 ${
                    hasLiked
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <div className="flex flex-col leading-tight">
                <span className="text-xs text-gray-600">
                  {hasLiked ? "Bạn đã thích" : "Yêu thích"}
                </span>
                <span className="text-gray-800 font-medium text-sm">
                  {post.likes.length} lượt thích
                </span>
              </div>
            </div>

            {/* ⭐ Save */}
            <div className="flex items-center gap-2">
              <button
                disabled={!user}
                onClick={() => toggleFavorite.mutate()}
                className="transition"
              >
                <Star
                  className={`h-5 w-5 ${
                    hasSaved
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <span className="text-xs text-gray-600">
                {hasSaved ? "Đã lưu" : "Lưu bài"}
              </span>
            </div>

          </div>
        </div>

        {/* ✅ Banner */}
        <img
          src={banner}
          alt="Banner"
          className="rounded-xl mb-8 w-full h-64 object-cover shadow"
        />

        {/* ✅ Title */}
        <h1 className="text-4xl font-bold mb-6 leading-tight text-gray-900">
          {post.title}
        </h1>

        {/* ✅ Content */}
        <div
          className="text-gray-800 leading-relaxed text-lg prose max-w-none"
          dangerouslySetInnerHTML={{ __html: decodedBody }}
        />

        {/* ✅ Gallery */}
        {post.images && post.images.length > 1 && (
          <div className="mt-10 grid grid-cols-2 gap-4">
            {post.images.slice(1).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Image ${index}`}
                className="rounded-lg w-full h-40 object-cover border shadow-sm"
              />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

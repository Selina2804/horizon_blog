import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const BASE_URL = import.meta.env.PROD
  ? "https://693a3c10c8d59937aa0a30c1.mockapi.io"
  : "/api";

type Post = {
  id: string;
  title: string;
  body: string;
  images?: string[];
  authorId: string;
  likes: string[];
  isPublic?: boolean;
};

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export default function Search() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const initialQuery = searchParams.q || "";

  // ONLY FETCH POSTS WHEN THERE'S A SEARCH QUERY
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["search-posts", initialQuery],
    queryFn: async () => {
      const res = await axios.get<Post[]>(`${BASE_URL}/posts`);
      return res.data.filter((post) => post.isPublic !== false);
    },
    enabled: !!initialQuery,
  });

  // Fetch users only when we have posts
  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axios.get<User[]>(`${BASE_URL}/users`);
      return res.data;
    },
    enabled: posts.length > 0,
  });

  // Helper function to safely decode body
  const safeDecodeBody = (body: string): string => {
    try {
      return decodeURIComponent(body);
    } catch (error) {
      console.warn("Failed to decode body:", error);
      return body;
    }
  };

  // Filter posts with improved logic
  const filteredPosts = posts.filter((post) => {
    if (!initialQuery) return false;
    
    const query = initialQuery.toLowerCase().trim();
    const titleMatch = post.title.toLowerCase().includes(query);
    
    const decodedBody = safeDecodeBody(post.body);
    const bodyMatch = decodedBody.toLowerCase().includes(query);
    
    return titleMatch || bodyMatch;
  });

  const clearSearch = () => {
    navigate({ to: "/" });
  };

  // Get author info with fallback
  const getAuthorName = (authorId: string) => {
    return users.find((u) => u.id === authorId)?.name || "Ẩn danh";
  };

  const getAuthorAvatar = (authorId: string) => {
    return users.find((u) => u.id === authorId)?.avatarUrl || 
           `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  // Extract clean preview text
  const getPreviewText = (body: string, maxLength = 150) => {
    const decoded = safeDecodeBody(body);
    const text = decoded.replace(/<[^>]*>/g, "").trim();
    return text.length > maxLength 
      ? text.slice(0, maxLength) + "..." 
      : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tìm kiếm...</p>
          </div>
        ) : initialQuery ? (
          <>
            {/* ✅ GIỮ LẠI PHẦN NÀY */}
            <div className="mb-6">
              <p className="text-gray-600 text-lg">
                Tìm thấy <span className="font-semibold text-gray-900">{filteredPosts.length}</span> kết quả cho{" "}
                <span className="font-semibold text-blue-600">"{initialQuery}"</span>
              </p>
            </div>

            {filteredPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Quay về trang chủ
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const banner = post.images?.[0] || 
                    `https://picsum.photos/seed/${post.id}/800/400`;
                  
                  return (
                    <Link 
                      key={post.id} 
                      to={`/post/${post.id}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Image */}
                          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                            <img
                              src={banner}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            {/* Author info */}
                            <div className="flex items-center gap-2 mb-3">
                              <img
                                src={getAuthorAvatar(post.authorId)}
                                alt={getAuthorName(post.authorId)}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm text-gray-600">
                                {getAuthorName(post.authorId)}
                              </span>
                            </div>

                            {/* Excerpt */}
                            <p className="text-gray-600 line-clamp-3 mb-3">
                              {getPreviewText(post.body)}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                ❤️ {post.likes.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bắt đầu tìm kiếm
            </h3>
            <p className="text-gray-600 mb-4">
              Sử dụng thanh tìm kiếm trên Navbar để khám phá bài viết
            </p>
            <Button onClick={() => navigate({ to: "/" })} variant="outline">
              Về trang chủ
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
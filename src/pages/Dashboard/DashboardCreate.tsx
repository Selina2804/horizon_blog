import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { X, Image as ImageIcon, FileText, Eye, EyeOff, Sparkles } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const BASE_URL = import.meta.env.PROD 
  ? "https://693a3c10c8d59937aa0a30c1.mockapi.io"
  : "/api";

const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";
const TINYMCE_API_KEY = "5780sbucqutfi5xr5swj8hgnpxeusj9w0x22s2dizuy3cf6j";

type Post = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  isPublic: boolean;
  images?: string[];
};

export default function DashboardCreate() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );
    return res.data.data.url;
  };

  const uploadAllImages = async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map((file) => uploadToImgBB(file)));
  };

  const createPost = useMutation({
    mutationFn: async (newPost: Omit<Post, "id">) =>
      axios.post(`${BASE_URL}/posts`, newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      setTitle("");
      setBody("");
      setVisibility("public");
      setImages([]);
      setPreviews([]);
      setLoading(false);
    },
    onError: () => {
      alert("Có lỗi khi đăng bài. Vui lòng thử lại.");
      setLoading(false);
    },
  });

  if (!user) return <p>Bạn cần đăng nhập để tạo bài viết.</p>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const arr = Array.from(files);
      setImages((prev) => [...prev, ...arr]);
      setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const uploadedUrls = await uploadAllImages(images);
      const safeBody = encodeURIComponent(body);

      await createPost.mutateAsync({
        title,
        body: safeBody,
        authorId: user.id,
        isPublic: visibility === "public",
        images: uploadedUrls,
      });
    } catch (err) {
      console.error("Submit error:", err);
      alert("Có lỗi khi upload ảnh. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Tạo bài viết mới</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Chia sẻ câu chuyện của bạn
          </h1>
          <p className="text-gray-600">
            Viết và chia sẻ những ý tưởng tuyệt vời với cộng đồng
          </p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Title Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Tiêu đề bài viết
                </label>
              </div>
              <Input
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg h-12 border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {visibility === "public" ? (
                  <Eye className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Chế độ hiển thị
                </label>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    visibility === "public"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Eye className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Công khai</div>
                    <div className="text-xs opacity-75">Mọi người có thể xem</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    visibility === "private"
                      ? "border-gray-500 bg-gray-50 text-gray-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <EyeOff className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Riêng tư</div>
                    <div className="text-xs opacity-75">Chỉ bạn có thể xem</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Editor Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Nội dung bài viết
                </label>
              </div>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <Editor
                  apiKey={TINYMCE_API_KEY}
                  value={body}
                  onEditorChange={(newValue) => setBody(newValue)}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: [
                      "advlist", "autolink", "lists", "link", "image", "charmap",
                      "preview", "anchor", "searchreplace", "visualblocks",
                      "code", "fullscreen", "insertdatetime", "media", "table", "wordcount"
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic underline | link image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
                    placeholder: "Bắt đầu viết câu chuyện của bạn...",
                  }}
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Ảnh minh họa
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-gray-50">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hỗ trợ: JPG, PNG, GIF (Tối đa 10MB mỗi ảnh)
                </p>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Đang đăng bài...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Xuất bản bài viết
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Mẹo viết bài thu hút
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Chọn tiêu đề ngắn gọn, súc tích và hấp dẫn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Sử dụng ảnh chất lượng cao để minh họa nội dung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Chia nhỏ nội dung thành các đoạn văn dễ đọc</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
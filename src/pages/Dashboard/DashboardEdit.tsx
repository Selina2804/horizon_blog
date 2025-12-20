import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { X, Image as ImageIcon, FileText, Eye, EyeOff, Save, Sparkles } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const BASE_URL = import.meta.env.PROD 
  ? "https://693a3c10c8d59937aa0a30c1.mockapi.io"
  : "/api";

const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";
const TINYMCE_API_KEY = "5780sbucqutfi5xr5swj8hgnpxeusj9w0x22s2dizuy3cf6j";

function decodeFull(str: string) {
  try {
    const urlDecoded = decodeURIComponent(str);
    const txt = document.createElement("textarea");
    txt.innerHTML = urlDecoded;
    return txt.value;
  } catch {
    return str;
  }
}

export default function DashboardEdit() {
  const { id } = useParams({ from: "/dashboard/edit/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-edit", id],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/posts/${id}`);
      return res.data;
    },
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(decodeFull(post.body));
      setImages(post.images || []);
      setIsPublic(post.isPublic !== undefined ? post.isPublic : true);
    }
  }, [post]);

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

  const updatePost = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const uploadedUrls = await uploadAllImages(newFiles);
      const finalImages = [...images, ...uploadedUrls];
      const safeBody = encodeURIComponent(body);

      await axios.put(`${BASE_URL}/posts/${id}`, {
        ...post,
        title,
        body: safeBody,
        images: finalImages,
        isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      navigate({ to: "/dashboard/mine" });
      setLoading(false);
    },
    onError: () => {
      alert("Có lỗi khi lưu bài viết.");
      setLoading(false);
    },
  });

  const handleRemoveOldImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const arr = Array.from(files);
      setNewFiles((prev) => [...prev, ...arr]);
      setNewPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Chỉnh sửa bài viết</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hoàn thiện nội dung của bạn
          </h1>
          <p className="text-gray-600">
            Cập nhật và cải thiện bài viết để thu hút độc giả hơn
          </p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="p-8 space-y-8">
            
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
                className="text-lg h-12 border-2 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isPublic ? (
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
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    isPublic
                      ? "border-green-500 bg-green-50 text-green-700"
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
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                    !isPublic
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
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-500 transition-colors">
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
                    placeholder: "Chỉnh sửa nội dung bài viết...",
                  }}
                />
              </div>
            </div>

            {/* Current Images */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Ảnh hiện tại
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOldImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Thêm ảnh mới
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-amber-400 transition-colors bg-gray-50">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hỗ trợ: JPG, PNG, GIF (Tối đa 10MB mỗi ảnh)
                </p>
              </div>

              {newPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newPreviews.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        className="w-full h-40 object-cover rounded-xl border-2 border-amber-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
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
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all"
                onClick={() => updatePost.mutate()}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Lưu thay đổi
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gợi ý chỉnh sửa
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Kiểm tra lại chính tả và ngữ pháp trước khi lưu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Thêm ảnh chất lượng cao để bài viết hấp dẫn hơn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Cập nhật tiêu đề nếu nội dung có thay đổi lớn</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
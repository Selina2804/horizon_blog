import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const BASE_URL = "https://693a3c10e8d59937aa0a30c1.mockapi.io/api";

// ✅ ImgBB API key
const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

// ✅ TinyMCE API key
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
  const [body, setBody] = useState(""); // HTML từ TinyMCE
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  // ✅ Upload 1 ảnh lên ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url;
  };

  // ✅ Upload nhiều ảnh song song
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
      // ✅ Upload ảnh lên ImgBB
      const uploadedUrls = await uploadAllImages(images);

      // ✅ Encode HTML để MockAPI không lỗi
      const safeBody = encodeURIComponent(body);

      // ✅ Lưu bài viết vào MockAPI
      await createPost.mutateAsync({
        title,
        body: safeBody, // ✅ Lưu dạng encode
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
    <div className="container py-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Tạo bài viết mới</h2>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ✅ TinyMCE Editor */}
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
              placeholder: "Viết nội dung bài viết ở đây...",
            }}
          />

          <div>
            <label className="block mb-2 font-medium">Ảnh minh họa</label>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} />

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {previews.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">Chế độ hiển thị</label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "public" | "private")
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

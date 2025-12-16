import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Card from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const BASE_URL = "/api";

// ✅ ImgBB API key
const IMGBB_API_KEY = "8068c291d96c4970f773d1ef7b562fb1";

// ✅ TinyMCE API key
const TINYMCE_API_KEY = "5780sbucqutfi5xr5swj8hgnpxeusj9w0x22s2dizuy3cf6j";

// ✅ Decode 2 lớp: URL + HTML entity
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
  const [body, setBody] = useState(""); // ✅ HTML từ TinyMCE
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load bài viết + decode FULL
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(decodeFull(post.body)); // ✅ FIX CHÍNH
      setImages(post.images || []);
    }
  }, [post]);

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

  const updatePost = useMutation({
    mutationFn: async () => {
      setLoading(true);

      const uploadedUrls = await uploadAllImages(newFiles);
      const finalImages = [...images, ...uploadedUrls];

      // ✅ Encode lại trước khi lưu
      const safeBody = encodeURIComponent(body);

      await axios.put(`${BASE_URL}/posts/${id}`, {
        ...post,
        title,
        body: safeBody,
        images: finalImages,
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

  if (isLoading) return <p className="container py-10">Đang tải...</p>;

  return (
    <div className="container py-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Sửa bài viết</h2>

      <Card className="p-6 space-y-6">
        <Input
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* ✅ TinyMCE Editor giống DashboardCreate */}
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

        {/* Ảnh cũ */}
        {images.length > 0 && (
          <div>
            <p className="font-medium mb-2">Ảnh hiện tại</p>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOldImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ảnh mới */}
        <div>
          <p className="font-medium mb-2">Thêm ảnh mới</p>
          <Input type="file" accept="image/*" multiple onChange={handleNewFileChange} />

          {newPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {newPreviews.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          onClick={() => updatePost.mutate()}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Card>
    </div>
  );
}

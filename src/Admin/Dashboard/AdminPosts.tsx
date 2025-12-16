import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { X, Plus, Search } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

const BASE_URL = "/api";

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

const fetchPosts = async (): Promise<Post[]> => {
  const res = await axios.get<Post[]>(`${BASE_URL}/posts`);
  return res.data;
};

export default function AdminPosts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  if (!user) return <p className="p-6 text-center text-red-500">Bạn cần đăng nhập.</p>;
  if (user.role !== "admin")
    return <p className="p-6 text-center text-red-500">Bạn không có quyền truy cập.</p>;

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: fetchPosts,
  });

  // ✅ Tìm kiếm
  const [search, setSearch] = useState("");

  // ✅ Lọc bài viết theo từ khóa
  const filteredPosts = posts.filter((post) => {
    const keyword = search.toLowerCase();
    const title = post.title.toLowerCase();
    const body = decodeURIComponent(post.body || "").toLowerCase();
    const id = post.id.toLowerCase();

    return (
      title.includes(keyword) ||
      body.includes(keyword) ||
      id.includes(keyword)
    );
  });

  // ✅ Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Upload ảnh
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url;
  };

  const uploadAllImages = async (files: File[]) =>
    Promise.all(files.map((file) => uploadToImgBB(file)));

  // ✅ Tạo bài viết
  const createPost = useMutation({
    mutationFn: async (newPost: Omit<Post, "id">) =>
      axios.post(`${BASE_URL}/posts`, newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      resetForm();
      setOpen(false);
    },
  });

  // ✅ Cập nhật bài viết
  const updatePost = useMutation({
    mutationFn: async (updatedPost: Post) =>
      axios.put(`${BASE_URL}/posts/${updatedPost.id}`, updatedPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      resetForm();
      setOpen(false);
    },
  });

  // ✅ Xóa bài viết
  const deletePost = useMutation({
    mutationFn: async (id: string) => axios.delete(`${BASE_URL}/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  const resetForm = () => {
    setTitle("");
    setBody("");
    setVisibility("public");
    setExistingImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    setEditId(null);
    setEditingPost(null);
    setLoading(false);
  };

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const arr = Array.from(files);
    setNewFiles((prev) => [...prev, ...arr]);
    setNewPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const uploadedUrls = newFiles.length ? await uploadAllImages(newFiles) : [];
      const finalImages = [...existingImages, ...uploadedUrls];
      const safeBody = encodeURIComponent(body);

      if (editId && editingPost) {
        await updatePost.mutateAsync({
          id: editId,
          title,
          body: safeBody,
          authorId: editingPost.authorId, // ✅ GIỮ NGUYÊN AUTHOR
          isPublic: visibility === "public",
          images: finalImages,
        });
      } else {
        await createPost.mutateAsync({
          title,
          body: safeBody,
          authorId: user.id,
          isPublic: visibility === "public",
          images: finalImages,
        });
      }
    } catch {
      alert("Có lỗi khi lưu bài viết.");
      setLoading(false);
    }
  };

  const openEdit = (post: Post) => {
    resetForm();
    setEditId(post.id);
    setEditingPost(post);

    setTitle(post.title);

    try {
      setBody(decodeURIComponent(post.body));
    } catch {
      setBody(post.body);
    }

    setVisibility(post.isPublic ? "public" : "private");
    setExistingImages(post.images || []);
    setOpen(true);
  };

  if (isLoading) return <p className="p-6 text-center">Đang tải...</p>;
  if (error) return <p className="p-6 text-center text-red-500">Lỗi khi tải dữ liệu.</p>;

  return (
    <div className="container py-8 space-y-8">

      {/* ✅ Header + Search */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Quản lý tất cả bài viết</h2>

        {/* ✅ Ô tìm kiếm */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Tìm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={() => { resetForm(); setOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm bài viết
        </Button>
      </div>

      {/* ✅ Danh sách bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          let decodedBody = post.body;
          try { decodedBody = decodeURIComponent(post.body); } catch {}

          return (
            <Card key={post.id} className="p-4 space-y-3">
              {post.images?.length > 0 && (
                <img
                  src={post.images[0]}
                  className="w-full h-40 object-cover rounded-lg border"
                />
              )}

              <h3 className="text-lg font-semibold">{post.title}</h3>

              <div
                className="text-gray-700 line-clamp-3 text-sm"
                dangerouslySetInnerHTML={{ __html: decodedBody }}
              />

              <div className="flex gap-2 mt-3">
                <Button variant="secondary" onClick={() => openEdit(post)}>Sửa</Button>
                <Button variant="destructive" onClick={() => deletePost.mutate(post.id)}>Xóa</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ✅ Popup thêm / sửa */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />

            <Editor
              apiKey={TINYMCE_API_KEY}
              value={body}
              onEditorChange={(v) => setBody(v)}
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

            {/* ✅ Ảnh cũ */}
            {existingImages.length > 0 && (
              <div>
                <label className="block mb-2 font-medium">Ảnh hiện tại</label>
                <div className="grid grid-cols-2 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Ảnh mới */}
            <div>
              <label className="block mb-2 font-medium">Thêm ảnh mới</label>
              <Input type="file" accept="image/*" multiple onChange={handleNewFileChange} />

              {newPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
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

            {/* ✅ Chế độ hiển thị */}
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

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Tạo bài viết"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

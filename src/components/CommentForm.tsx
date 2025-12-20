// src/components/CommentForm.tsx
import { useState } from "react";
import { Send } from "lucide-react";
import type { User } from "../context/AuthContext";

type Props = {
  user: User;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
};

export default function CommentForm({ user, onSubmit, isSubmitting }: Props) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit(content.trim());
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* Avatar */}
      <img
        src={user.avatarUrl || "https://i.pravatar.cc/100"}
        alt={user.name}
        className="w-10 h-10 rounded-full border shadow-sm flex-shrink-0"
      />

      {/* Input */}
      <div className="flex-1 flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </form>
  );
}
// src/components/CommentItem.tsx
import { Trash2 } from "lucide-react";
import type { CommentWithUser } from "../types/comment";
import { formatDistanceToNow } from "../lib/utils";

type Props = {
  comment: CommentWithUser;
  currentUserId?: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export default function CommentItem({
  comment,
  currentUserId,
  onDelete,
  isDeleting,
}: Props) {
  const canDelete = currentUserId === comment.userId;

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      {/* Avatar */}
      <img
        src={comment.user.avatarUrl || "https://i.pravatar.cc/100"}
        alt={comment.user.name}
        className="w-10 h-10 rounded-full border shadow-sm flex-shrink-0"
      />

      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {comment.user.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(comment.createdAt)}
            </span>
          </div>

          {/* Delete button */}
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
              title="Xóa bình luận"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
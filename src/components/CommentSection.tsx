// src/components/CommentSection.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Comment, CommentWithUser } from "../types/comment";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const BASE_URL = "https://693a3c10c8d59937aa0a30c1.mockapi.io";

type Props = {
  postId: string;
};

type Post = {
  id: string;
  title: string;
  body: string;
  images?: string[];
  authorId: string;
  likes: string[];
  comments?: Comment[];
};

export default function CommentSection({ postId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch post with comments
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async (): Promise<Post> => {
      const res = await axios.get<Post>(`${BASE_URL}/posts/${postId}`);
      return res.data;
    },
  });

  // Fetch all users for comment authors
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/users`);
      return res.data;
    },
  });

  // Transform comments with user info
  const commentsWithUsers: CommentWithUser[] = (post?.comments || []).map((comment) => {
    const commentUser = users.find((u: any) => u.id === comment.userId);
    return {
      ...comment,
      user: commentUser
        ? {
            id: commentUser.id,
            name: commentUser.name,
            avatarUrl: commentUser.avatarUrl,
          }
        : {
            id: "unknown",
            name: "Unknown User",
            avatarUrl: undefined,
          },
    };
  });

  // Create comment
  const createComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !post) throw new Error("User or post not found");

      const newComment: Comment = {
        id: Date.now().toString(),
        postId,
        userId: user.id,
        content,
        createdAt: new Date().toISOString(),
      };

      const updatedComments = [...(post.comments || []), newComment];

      await axios.put(`${BASE_URL}/posts/${postId}`, {
        ...post,
        comments: updatedComments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!post) throw new Error("Post not found");

      const updatedComments = (post.comments || []).filter((c) => c.id !== commentId);

      await axios.put(`${BASE_URL}/posts/${postId}`, {
        ...post,
        comments: updatedComments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return (
    <div className="mt-12 border-t pt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">
          Bình luận ({commentsWithUsers.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <div className="mb-8">
          <CommentForm
            user={user}
            onSubmit={(content) => createComment.mutateAsync(content)}
            isSubmitting={createComment.isPending}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Vui lòng <span className="text-blue-600 font-semibold">đăng nhập</span> để bình luận
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Đang tải bình luận...</p>
        ) : commentsWithUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          commentsWithUsers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onDelete={(id) => deleteComment.mutate(id)}
                isDeleting={deleteComment.isPending}
              />
            ))
        )}
      </div>
    </div>
  );
}
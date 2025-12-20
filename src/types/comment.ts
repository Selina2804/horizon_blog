// src/types/comment.ts

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type CommentWithUser = Comment & {
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};
// src/types/index.ts
import type { ReactNode } from 'react';

export type { ReactNode };

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  bio?: string;
  coverUrl?: string;
  theme?: string;
  createdAt?: string;
  favorites?: string[];
}

export interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
  isPublic: boolean;
  images?: string[];
  likes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (newUser: Omit<User, 'id'>) => Promise<boolean>;
  updateUser: (updated: Partial<User>) => Promise<void>;
  setUser: (u: User | null) => void;
}
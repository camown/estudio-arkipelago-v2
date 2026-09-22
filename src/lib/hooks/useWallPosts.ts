'use client';
import { useState, useCallback } from 'react';
import type { WallPost, User } from '@/types';
import { SEED_WALL_POSTS } from '@/lib/constants';

const STORAGE_KEY = 'arkipelago_wall_posts';

function getInitialPosts(): WallPost[] {
  if (typeof window === 'undefined') return SEED_WALL_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WALL_POSTS));
    return SEED_WALL_POSTS;
  } catch {
    return SEED_WALL_POSTS;
  }
}

export function useWallPosts() {
  const [posts, setPosts] = useState<WallPost[]>(getInitialPosts);

  const loadPosts = useCallback(() => {
    setPosts(getInitialPosts());
  }, []);

  const addPost = useCallback((content: string, author: User) => {
    const newPost: WallPost = {
      id: crypto.randomUUID?.() || `post-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => {
      const updated = [newPost, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return { posts, addPost, deletePost, refreshPosts: loadPosts };
}


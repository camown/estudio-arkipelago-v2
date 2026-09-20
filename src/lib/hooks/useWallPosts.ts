'use client';
import { useState, useEffect, useCallback } from 'react';
import type { WallPost, User } from '@/types';
import { SEED_WALL_POSTS } from '@/lib/constants';

const STORAGE_KEY = 'arkipelago_wall_posts';

export function useWallPosts() {
  const [posts, setPosts] = useState<WallPost[]>([]);

  const loadPosts = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setPosts(JSON.parse(raw));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WALL_POSTS));
      setPosts(SEED_WALL_POSTS);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const addPost = useCallback((content: string, author: User) => {
    const newPost: WallPost = {
      id: crypto.randomUUID?.() || `post-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPosts(updated);
  }, [posts]);

  const deletePost = useCallback((id: string) => {
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPosts(updated);
  }, [posts]);

  return { posts, addPost, deletePost, refreshPosts: loadPosts };
}

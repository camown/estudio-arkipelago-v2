'use client';
import { useState, useEffect, useCallback } from 'react';
import type { WallPost, User } from '@/types';
import { SEED_WALL_POSTS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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

  // Fetch and sync with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Initial fetch from Supabase
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('wall_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: WallPost[] = data.map((item) => ({
          id: item.id,
          authorId: item.author_id,
          authorName: item.author_name,
          authorRole: item.author_role,
          content: item.content,
          createdAt: item.created_at,
        }));
        setPosts(mapped);
      }
    };

    fetchPosts();

    // 2. Real-time subscription
    const channel = supabase
      .channel('wall_posts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wall_posts' },
        (payload) => {
          const newItem = payload.new;
          const mappedPost: WallPost = {
            id: newItem.id,
            authorId: newItem.author_id,
            authorName: newItem.author_name,
            authorRole: newItem.author_role,
            content: newItem.content,
            createdAt: newItem.created_at,
          };
          setPosts((prev) => [mappedPost, ...prev.filter((p) => p.id !== mappedPost.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'wall_posts' },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const loadPosts = useCallback(() => {
    setPosts(getInitialPosts());
  }, []);

  const addPost = useCallback(async (content: string, author: User) => {
    const newPost: WallPost = {
      id: crypto.randomUUID?.() || `post-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately for instant feedback
    setPosts((prev) => {
      const updated = [newPost, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    // Write to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wall_posts').insert({
        id: newPost.id,
        author_id: newPost.authorId,
        author_name: newPost.authorName,
        author_role: newPost.authorRole,
        content: newPost.content,
        created_at: newPost.createdAt,
      });
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    setPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      await supabase.from('wall_posts').delete().eq('id', id);
    }
  }, []);

  return { posts, addPost, deletePost, refreshPosts: loadPosts };
}

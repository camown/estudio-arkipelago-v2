'use client';
import { useState, useEffect, useCallback } from 'react';
import type { WallPost, WallComment, User } from '@/types';
import { SEED_WALL_POSTS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const STORAGE_KEY = 'arkipelago_wall_posts';

function getInitialPosts(): WallPost[] {
  if (typeof window === 'undefined') return SEED_WALL_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WALL_POSTS));
    return SEED_WALL_POSTS;
  } catch {
    return SEED_WALL_POSTS;
  }
}

function persistPosts(posts: WallPost[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // Ignore storage quotas
    }
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
          updatedAt: item.updated_at || undefined,
          attachments: item.attachments || undefined,
          likes: typeof item.likes === 'number' ? item.likes : 0,
          likedBy: Array.isArray(item.liked_by) ? item.liked_by : [],
          comments: Array.isArray(item.comments) ? item.comments : [],
        }));
        setPosts(mapped);
        persistPosts(mapped);
      }
    };

    fetchPosts();

    // 2. Real-time subscription
    const channelId = `wall_posts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
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
            updatedAt: newItem.updated_at || undefined,
            attachments: newItem.attachments || undefined,
            likes: typeof newItem.likes === 'number' ? newItem.likes : 0,
            likedBy: Array.isArray(newItem.liked_by) ? newItem.liked_by : [],
            comments: Array.isArray(newItem.comments) ? newItem.comments : [],
          };
          setPosts((prev) => {
            const updated = [mappedPost, ...prev.filter((p) => p.id !== mappedPost.id)];
            persistPosts(updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wall_posts' },
        (payload) => {
          const updatedItem = payload.new;
          const mappedPost: WallPost = {
            id: updatedItem.id,
            authorId: updatedItem.author_id,
            authorName: updatedItem.author_name,
            authorRole: updatedItem.author_role,
            content: updatedItem.content,
            createdAt: updatedItem.created_at,
            updatedAt: updatedItem.updated_at || undefined,
            attachments: updatedItem.attachments || undefined,
            likes: typeof updatedItem.likes === 'number' ? updatedItem.likes : 0,
            likedBy: Array.isArray(updatedItem.liked_by) ? updatedItem.liked_by : [],
            comments: Array.isArray(updatedItem.comments) ? updatedItem.comments : [],
          };
          setPosts((prev) => {
            const updated = prev.map((p) => (p.id === mappedPost.id ? mappedPost : p));
            persistPosts(updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'wall_posts' },
        (payload) => {
          setPosts((prev) => {
            const updated = prev.filter((p) => p.id !== payload.old.id);
            persistPosts(updated);
            return updated;
          });
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

  const addPost = useCallback(async (content: string, author: User, attachments?: string[]) => {
    const newPost: WallPost = {
      id: crypto.randomUUID?.() || `post-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: new Date().toISOString(),
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      likes: 0,
      likedBy: [],
      comments: [],
    };

    setPosts((prev) => {
      const updated = [newPost, ...prev];
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const fullPayload = {
          id: newPost.id,
          author_id: newPost.authorId,
          author_name: newPost.authorName,
          author_role: newPost.authorRole,
          content: newPost.content,
          created_at: newPost.createdAt,
          attachments: newPost.attachments || [],
          likes: 0,
          liked_by: [],
          comments: [],
        };
        const { error: fullError } = await supabase.from('wall_posts').insert(fullPayload);
        if (fullError) {
          // If schema cache does not have comments/likes/liked_by, insert core columns
          await supabase.from('wall_posts').insert({
            id: newPost.id,
            author_id: newPost.authorId,
            author_name: newPost.authorName,
            author_role: newPost.authorRole,
            content: newPost.content,
            created_at: newPost.createdAt,
            attachments: newPost.attachments || [],
          });
        }
      } catch (err) {
        console.error('Error saving post to Supabase:', err);
      }
    }
  }, []);

  const editPost = useCallback(async (id: string, newContent: string) => {
    const now = new Date().toISOString();
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return { ...p, content: newContent, updatedAt: now };
        }
        return p;
      });
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('wall_posts').update({
          content: newContent,
          updated_at: now,
        }).eq('id', id);
        if (error) {
          await supabase.from('wall_posts').update({ content: newContent }).eq('id', id);
        }
      } catch (err) {
        console.error('Error editing post in Supabase:', err);
      }
    }
  }, []);

  const deletePost = useCallback(async (id: string, currentUser?: { id?: string; name?: string; role?: string } | null) => {
    // If user is provided, enforce that only the post author or partner/admin can delete
    if (currentUser) {
      const targetPost = posts.find((p) => p.id === id);
      if (targetPost) {
        const isAuthor = Boolean(
          (currentUser.id && targetPost.authorId && currentUser.id === targetPost.authorId) ||
          (currentUser.name && targetPost.authorName && currentUser.name.trim().toLowerCase() === targetPost.authorName.trim().toLowerCase())
        );
        const isPartnerOrAdmin = currentUser.role === 'partner' || currentUser.role === 'admin';
        if (!isAuthor && !isPartnerOrAdmin) {
          console.warn('Unauthorized: Only the post author or a partner can delete this post.');
          return false;
        }
      }
    }

    setPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('wall_posts').delete().eq('id', id);
      } catch {
        // graceful fallback
      }
    }
    return true;
  }, [posts]);

  const toggleLike = useCallback(async (postId: string, userId: string) => {
    let updatedPost: WallPost | null = null;

    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const likedBy = p.likedBy || [];
          const isLiked = likedBy.includes(userId);
          const newLikedBy = isLiked
            ? likedBy.filter((uid) => uid !== userId)
            : [...likedBy, userId];
          const newLikes = newLikedBy.length;
          const modPost: WallPost = {
            ...p,
            likes: newLikes,
            likedBy: newLikedBy,
          };
          updatedPost = modPost;
          return modPost;
        }
        return p;
      });
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase && updatedPost) {
      try {
        await supabase.from('wall_posts').update({
          likes: (updatedPost as WallPost).likes,
          liked_by: (updatedPost as WallPost).likedBy,
        }).eq('id', postId);
      } catch {
        // graceful fallback
      }
    }
  }, []);

  const addComment = useCallback(async (postId: string, content: string, author: User) => {
    if (!content.trim()) return;

    const newComment: WallComment = {
      id: crypto.randomUUID?.() || `comment-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    let updatedPost: WallPost | null = null;

    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          const modPost: WallPost = {
            ...p,
            comments: [...currentComments, newComment],
          };
          updatedPost = modPost;
          return modPost;
        }
        return p;
      });
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase && updatedPost) {
      try {
        await supabase.from('wall_posts').update({
          comments: (updatedPost as WallPost).comments,
        }).eq('id', postId);
      } catch {
        // graceful fallback
      }
    }
  }, []);

  const deleteComment = useCallback(async (postId: string, commentId: string, currentUser?: { id?: string; name?: string; role?: string } | null) => {
    let updatedPost: WallPost | null = null;

    if (currentUser) {
      const targetPost = posts.find((p) => p.id === postId);
      const targetComment = targetPost?.comments?.find((c) => c.id === commentId);
      if (targetComment) {
        const isAuthor = Boolean(
          (currentUser.id && targetComment.authorId && currentUser.id === targetComment.authorId) ||
          (currentUser.name && targetComment.authorName && currentUser.name.trim().toLowerCase() === targetComment.authorName.trim().toLowerCase())
        );
        const isPartnerOrAdmin = currentUser.role === 'partner' || currentUser.role === 'admin';
        if (!isAuthor && !isPartnerOrAdmin) {
          console.warn('Unauthorized: Only the comment author or a partner can delete this comment.');
          return false;
        }
      }
    }

    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          const modPost: WallPost = {
            ...p,
            comments: currentComments.filter((c) => c.id !== commentId),
          };
          updatedPost = modPost;
          return modPost;
        }
        return p;
      });
      persistPosts(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase && updatedPost) {
      try {
        await supabase.from('wall_posts').update({
          comments: (updatedPost as WallPost).comments,
        }).eq('id', postId);
      } catch {
        // graceful fallback
      }
    }
  }, []);

  return {
    posts,
    addPost,
    editPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    refreshPosts: loadPosts,
  };
}

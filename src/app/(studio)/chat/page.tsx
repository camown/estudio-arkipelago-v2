'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import { MessageSquare, ImagePlus, BarChart3, Smile, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'wall' | 'chat'>('wall');
  const [postContent, setPostContent] = useState('');
  const { user } = useAuth();
  const { posts, addPost } = useWallPosts();

  const handlePost = () => {
    if (!postContent.trim() || !user) return;
    addPost(postContent, user);
    setPostContent('');
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: true,
      }).format(date).toUpperCase();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-main text-text-main font-mono transition-colors pb-12">
      {/* Top Tabs */}
      <div className="flex border-b border-border-main">
        <button
          className={cn(
            'px-6 py-4 uppercase font-bold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors',
            activeTab === 'wall'
              ? 'border-accent-cyan text-text-main font-extrabold'
              : 'border-transparent text-muted-main hover:text-text-main'
          )}
          onClick={() => setActiveTab('wall')}
        >
          ESTUDIO WALL
        </button>
        <button
          className={cn(
            'px-6 py-4 uppercase font-bold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors',
            activeTab === 'chat'
              ? 'border-accent-cyan text-text-main font-extrabold'
              : 'border-transparent text-muted-main hover:text-text-main'
          )}
          onClick={() => setActiveTab('chat')}
        >
          CHAT & THREADS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6">
        {activeTab === 'wall' && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Post Composer */}
            <div className="bg-surface-main border border-border-main rounded-xl p-5 flex flex-col gap-4 shadow-sm">
              <textarea
                className="w-full bg-transparent border-none outline-none resize-none min-h-[120px] font-mono text-text-main placeholder:text-muted-main text-sm"
                placeholder="Share something with estudio..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div className="flex justify-between items-center pt-4 border-t border-border-main">
                <div className="flex items-center gap-4 text-muted-main">
                  <button className="hover:text-text-main transition-colors">
                    <ImagePlus size={18} />
                  </button>
                  <button className="hover:text-text-main transition-colors">
                    <BarChart3 size={18} />
                  </button>
                  <button className="hover:text-text-main transition-colors">
                    <Smile size={18} />
                  </button>
                  <button className="uppercase font-bold text-xs hover:text-text-main transition-colors tracking-wider">
                    STICKER
                  </button>
                </div>
                <button
                  className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-lg uppercase font-bold text-xs tracking-wider hover:opacity-90 transition-opacity"
                  onClick={handlePost}
                >
                  POST WALL
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="flex flex-col space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border-strong flex items-center justify-center font-bold uppercase text-sm text-text-main">
                      {post.authorName ? post.authorName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="font-bold uppercase text-xs tracking-wider flex items-center gap-2 text-text-main">
                        {post.authorName}
                        <span className="text-muted-main text-[11px] font-normal">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                        {post.authorRole?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-main opacity-90">
                    {post.content}
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="text-center text-muted-main py-12 uppercase text-xs tracking-wider">
                  No posts on the wall yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-[calc(100vh-14rem)] min-h-[400px] border border-border-main bg-surface-main rounded-xl overflow-hidden shadow-sm">
            <div className="w-64 border-r border-border-main flex flex-col">
              <div className="p-4 border-b border-border-main uppercase font-bold text-xs text-muted-main tracking-wider">
                CHANNELS
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {[
                  { id: 'general', name: 'general', selected: true },
                  { id: 'projects', name: 'projects', selected: false },
                  { id: 'announcements', name: 'announcements', selected: false },
                  { id: 'random', name: 'random', selected: false },
                ].map((channel) => (
                  <button
                    key={channel.id}
                    className={cn(
                      'w-full text-left py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-l-2 uppercase tracking-wider transition-colors',
                      channel.selected
                        ? 'border-accent-cyan bg-surface-hover text-text-main font-bold'
                        : 'border-transparent text-muted-main hover:bg-surface-hover/50 hover:text-text-main'
                    )}
                  >
                    <Hash size={15} />
                    {channel.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
              <MessageSquare size={44} className="text-muted-main/40 mb-4" />
              <div className="text-muted-main uppercase text-xs tracking-wider mb-8">
                Select a channel to start messaging
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-muted-main/60 text-[10px] uppercase tracking-widest">
                POWERED BY REAL-TIME WEBSOCKETS — PHASE 2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

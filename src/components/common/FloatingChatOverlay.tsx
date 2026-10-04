'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Pin,
  Send,
  Users,
  Search,
  ArrowUpRight,
  ChevronLeft,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  GripHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export interface FloatingChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface FloatingChatThread {
  id: string;
  name: string;
  category: 'PROJECT_TOPIC' | 'DIRECT_MESSAGE' | 'CUSTOM_THREAD';
  participants: string[];
  colorTag?: string;
  lastMessage?: FloatingChatMessage;
  unreadCount?: number;
}

const DEFAULT_FLOATING_THREADS: FloatingChatThread[] = [
  {
    id: 'thread-001',
    name: '[MT-2024] Schematic Revision & Massing',
    category: 'PROJECT_TOPIC',
    participants: ['Arch. Carlos Mendoza', 'Arch. Patricia Ramos', 'Elena Gomez'],
    colorTag: 'indigo',
    lastMessage: {
      id: 'msg-3',
      sender: 'Elena Gomez',
      text: 'Ayala dev team reviewed this in our weekly brief. Please ensure all stamped revisions are uploaded to the project vault before Friday.',
      timestamp: '10:35 AM',
    },
    unreadCount: 2,
  },
  {
    id: 'thread-002',
    name: '[CV-2024] Material Board & Marble Specs',
    category: 'PROJECT_TOPIC',
    participants: ['Arch. Leandro Locsin', 'Engr. Roberto Cruz', 'Foreman Danilo'],
    colorTag: 'emerald',
    lastMessage: {
      id: 'msg-5',
      sender: 'Arch. Leandro Locsin',
      text: 'Received Engr. Roberto. Let us schedule a material board review with the Verde family this afternoon.',
      timestamp: '09:50 AM',
    },
    unreadCount: 0,
  },
  {
    id: 'thread-003',
    name: '[BCP-2024] Structural Permit & Beams',
    category: 'PROJECT_TOPIC',
    participants: ['Arch. Sofia Reyes', 'Engr. Roberto Cruz'],
    colorTag: 'amber',
    lastMessage: {
      id: 'msg-6',
      sender: 'Engr. Roberto Cruz',
      text: 'Foundation soil test report and city structural permits are ready for submission to Taguig City Hall.',
      timestamp: '08:30 AM',
    },
    unreadCount: 1,
  },
  {
    id: 'dm-001',
    name: 'Arch. Carlos Mendoza',
    category: 'DIRECT_MESSAGE',
    participants: ['Arch. Carlos Mendoza', 'You'],
    colorTag: 'cyan',
    lastMessage: {
      id: 'msg-7',
      sender: 'Arch. Carlos Mendoza',
      text: 'Please review the facade engineering submittal when you get a chance.',
      timestamp: '11:00 AM',
    },
    unreadCount: 1,
  },
  {
    id: 'dm-002',
    name: 'Engr. Roberto Cruz',
    category: 'DIRECT_MESSAGE',
    participants: ['Engr. Roberto Cruz', 'You'],
    colorTag: 'rose',
    lastMessage: {
      id: 'msg-8',
      sender: 'Engr. Roberto Cruz',
      text: 'Direct structural channel active for quick consultations on foundation pours.',
      timestamp: '11:30 AM',
    },
    unreadCount: 0,
  },
];

const STORAGE_FLOATING_CHAT_PINNED = 'arkipelago_floating_chat_pinned';

export function FloatingChatOverlay() {
  const router = useRouter();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [threads, setThreads] = useState<FloatingChatThread[]>(DEFAULT_FLOATING_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('thread-001');
  const [messagesMap, setMessagesMap] = useState<Record<string, FloatingChatMessage[]>>({});
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PINNED' | 'DMS'>('ALL');
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['thread-001'];
    try {
      const saved = localStorage.getItem(STORAGE_FLOATING_CHAT_PINNED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['thread-001'];
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync threads & messages from cache
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cachedThreads = localStorage.getItem('arkipelago_synced_threads_v2');
      const cachedMessages = localStorage.getItem('arkipelago_synced_messages_v2');
      const unreadMap = localStorage.getItem('arkipelago_chat_unread_counts');

      if (cachedMessages) {
        setMessagesMap(JSON.parse(cachedMessages));
      }

      if (cachedThreads) {
        const parsedThreads = JSON.parse(cachedThreads);
        const parsedMessages = cachedMessages ? JSON.parse(cachedMessages) : {};
        const parsedUnread = unreadMap ? JSON.parse(unreadMap) : {};

        if (Array.isArray(parsedThreads) && parsedThreads.length > 0) {
          const merged: FloatingChatThread[] = parsedThreads.map((t: any) => {
            const threadMsgs = parsedMessages[t.id] || [];
            const last = threadMsgs[threadMsgs.length - 1];
            return {
              id: t.id,
              name: t.name,
              category: t.category,
              participants: Array.isArray(t.participants) ? t.participants : [],
              colorTag: t.colorTag || 'indigo',
              lastMessage: last
                ? {
                    id: last.id,
                    sender: last.sender,
                    text: last.text || 'Attachment',
                    timestamp: last.timestamp || 'Just now',
                  }
                : undefined,
              unreadCount: parsedUnread[t.id] || 0,
            };
          });
          setThreads(merged);
        }
      }
    } catch (e) {
      console.warn('Floating chat sync notice:', e);
    }
  }, []);

  // Listen to open-floating-chat custom events
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.threadId) {
        setSelectedThreadId(e.detail.threadId);
      }
    };
    window.addEventListener('open_floating_chat', handleOpen);
    return () => window.removeEventListener('open_floating_chat', handleOpen);
  }, []);

  const totalUnread = useMemo(
    () => threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0),
    [threads]
  );

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
      try {
        localStorage.setItem(STORAGE_FLOATING_CHAT_PINNED, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedThreadId) return;

    const senderName = user?.name || 'Arch. Leandro Locsin';
    const newMsg: FloatingChatMessage = {
      id: `msg-${Date.now()}`,
      sender: senderName,
      text: replyInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesMap((prev) => {
      const updated = {
        ...prev,
        [selectedThreadId]: [...(prev[selectedThreadId] || []), newMsg],
      };
      try {
        localStorage.setItem('arkipelago_synced_messages_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setThreads((prev) =>
      prev.map((t) => (t.id === selectedThreadId ? { ...t, lastMessage: newMsg } : t))
    );

    setReplyInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const displayedThreads = useMemo(() => {
    return threads
      .filter((t) => {
        if (activeTab === 'PINNED' && !pinnedIds.includes(t.id)) return false;
        if (activeTab === 'DMS' && t.category !== 'DIRECT_MESSAGE') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            t.name.toLowerCase().includes(q) ||
            (t.lastMessage?.text && t.lastMessage.text.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const aPinned = pinnedIds.includes(a.id);
        const bPinned = pinnedIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
  }, [threads, pinnedIds, activeTab, searchQuery]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId),
    [threads, selectedThreadId]
  );

  const activeMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    return messagesMap[selectedThreadId] || (activeThread?.lastMessage ? [activeThread.lastMessage] : []);
  }, [selectedThreadId, messagesMap, activeThread]);

  return (
    <>
      {/* Floating Messenger Bubble / Launcher Icon */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-20 md:bottom-6 right-6 z-[120] w-13 h-13 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border-main group"
          title="Open Floating Studio Messenger"
          aria-label="Open Floating Messenger"
        >
          <MessageSquare className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-cyan text-black font-extrabold text-[10px] font-mono flex items-center justify-center border-2 border-surface-main animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Floating Messenger Window Overlay */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-[120] bg-surface-main border border-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-200',
            // Mobile: Full overlay on mobile devices; Desktop: floating bottom-right drawer
            'bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[410px]',
            isMinimized
              ? 'h-14'
              : 'h-[540px] max-h-[85vh] md:max-h-[640px]'
          )}
        >
          {/* Window Top Titlebar */}
          <div className="bg-surface-hover/80 border-b border-border-main/60 px-3.5 py-2.5 flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2 min-w-0">
              {selectedThreadId && !isMinimized && (
                <button
                  type="button"
                  onClick={() => setSelectedThreadId(null)}
                  className="p-1 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer"
                  title="Back to all threads"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-6 h-6 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-text-main truncate leading-tight">
                  {selectedThreadId && activeThread ? activeThread.name : 'Studio Comms'}
                </h3>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {selectedThreadId && (
                <button
                  type="button"
                  onClick={() => router.push(`/chat?thread=${selectedThreadId}`)}
                  className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer"
                  title="Open in full screen Studio Chat"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsIsOpenFalse()}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-main hover:text-rose-500 transition-colors cursor-pointer"
                title="Close floating window"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Window Body (When Not Minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-surface-main">
              {/* VIEW 1: Active Thread Chat View */}
              {selectedThreadId && activeThread ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Messages Feed */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                    {activeMessages.length > 0 ? (
                      activeMessages.map((msg, i) => {
                        const isMe =
                          msg.sender.toLowerCase().includes('you') ||
                          (user?.name && msg.sender.toLowerCase().includes(user.name.toLowerCase()));

                        return (
                          <div
                            key={msg.id || i}
                            className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                          >
                            {!isMe && (
                              <span className="text-[11px] font-bold text-text-main mb-1 px-1">
                                {msg.sender}
                              </span>
                            )}
                            <div
                              className={cn(
                                'max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-sans leading-relaxed shadow-2xs',
                                isMe
                                  ? 'bg-black text-white dark:bg-white dark:text-black rounded-br-xs'
                                  : 'bg-surface-hover text-text-main border border-border-main/60 rounded-bl-xs'
                              )}
                            >
                              <p>{msg.text}</p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 px-1">
                              {msg.timestamp}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                        Start of discussion for {activeThread.name}
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Reply Box */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-2.5 border-t border-border-main/60 bg-surface-hover/30 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-surface-main border border-border-main rounded-xl px-3 py-2 text-xs sm:text-sm text-text-main font-sans placeholder:text-zinc-500 focus:outline-none focus:border-accent-cyan"
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim()}
                      className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* VIEW 2: Thread List & Channels Drawer */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search & Filter bar */}
                  <div className="p-3 border-b border-border-main/50 space-y-2 shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats or members..."
                        className="w-full bg-surface-hover/60 border border-border-main rounded-xl pl-8 pr-3 py-1.5 text-xs font-sans text-text-main placeholder:text-zinc-500 focus:outline-none focus:border-border-strong"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('ALL')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer',
                          activeTab === 'ALL'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                            : 'bg-surface-hover text-zinc-600 dark:text-zinc-400'
                        )}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('PINNED')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1',
                          activeTab === 'PINNED'
                            ? 'bg-accent-cyan text-black shadow-2xs'
                            : 'bg-surface-hover text-zinc-600 dark:text-zinc-400'
                        )}
                      >
                        <Pin className="w-3 h-3 fill-current" />
                        <span>Pinned</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('DMS')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer',
                          activeTab === 'DMS'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                            : 'bg-surface-hover text-zinc-600 dark:text-zinc-400'
                        )}
                      >
                        DMs
                      </button>
                    </div>
                  </div>

                  {/* Thread Items List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-border-main/40">
                    {displayedThreads.length > 0 ? (
                      displayedThreads.map((thread) => {
                        const isPinned = pinnedIds.includes(thread.id);

                        return (
                          <div
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className="p-3 hover:bg-surface-hover/60 transition-colors cursor-pointer group flex items-start justify-between gap-2.5"
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'w-2 h-2 rounded-full shrink-0',
                                    thread.category === 'DIRECT_MESSAGE' ? 'bg-cyan-500' : 'bg-indigo-500'
                                  )}
                                />
                                <h4 className="text-xs sm:text-sm font-bold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                                  {thread.name}
                                </h4>
                              </div>

                              {thread.lastMessage && (
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-1 font-sans">
                                  <span className="font-semibold text-text-main mr-1">
                                    {thread.lastMessage.sender.split(' ')[0]}:
                                  </span>
                                  {thread.lastMessage.text}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {thread.lastMessage?.timestamp}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {thread.unreadCount && thread.unreadCount > 0 ? (
                                  <span className="w-4.5 h-4.5 rounded-full bg-accent-cyan text-black font-extrabold text-[10px] font-mono flex items-center justify-center">
                                    {thread.unreadCount}
                                  </span>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={(e) => togglePin(thread.id, e)}
                                  className={cn(
                                    'p-1 rounded-md transition-colors',
                                    isPinned
                                      ? 'text-accent-cyan'
                                      : 'text-zinc-400 hover:text-text-main opacity-0 group-hover:opacity-100'
                                  )}
                                  title={isPinned ? 'Unpin' : 'Pin to top'}
                                >
                                  <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-zinc-500 text-xs">
                        No chats matching your filter.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  function setIsIsOpenFalse() {
    setIsOpen(false);
  }
}

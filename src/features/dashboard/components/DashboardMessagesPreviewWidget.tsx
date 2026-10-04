'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Pin,
  PinOff,
  Send,
  Users,
  ExternalLink,
  Search,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export interface DashboardThreadPreview {
  id: string;
  name: string;
  category: 'PROJECT_TOPIC' | 'DIRECT_MESSAGE' | 'CUSTOM_THREAD';
  projectCode?: string;
  projectName?: string;
  topicName?: string;
  participants: string[];
  colorTag?: string;
  lastMessage?: {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    isSystem?: boolean;
    attachmentTitle?: string;
  };
  unreadCount?: number;
}

const DEFAULT_PREVIEW_THREADS: DashboardThreadPreview[] = [
  {
    id: 'thread-001',
    name: '[MT-2024] Schematic Revision & Massing',
    category: 'PROJECT_TOPIC',
    projectCode: 'MT-2024',
    projectName: 'Makati Commercial Tower',
    topicName: 'Schematic Revision & 3D Massing Review',
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
    projectCode: 'CV-2024',
    projectName: 'Casa Verde Residence',
    topicName: 'Italian Marble & Timber Veneer Selection',
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
    projectCode: 'BCP-2024',
    projectName: 'BGC Cultural Pavilion',
    topicName: 'Long-span Timber Truss & Permit Coordination',
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

const STORAGE_PINNED_CHATS_KEY = 'arkipelago_dashboard_pinned_chats';

export function DashboardMessagesPreviewWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const [threads, setThreads] = useState<DashboardThreadPreview[]>(DEFAULT_PREVIEW_THREADS);
  const [pinnedThreadIds, setPinnedThreadIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['thread-001'];
    try {
      const saved = localStorage.getItem(STORAGE_PINNED_CHATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['thread-001'];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PINNED' | 'PROJECTS' | 'DMS'>('ALL');
  const [quickReplyThreadId, setQuickReplyThreadId] = useState<string | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync threads from Studio Chat cache if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cachedThreads = localStorage.getItem('arkipelago_synced_threads_v2');
      const cachedMessages = localStorage.getItem('arkipelago_synced_messages_v2');
      const unreadMap = localStorage.getItem('arkipelago_chat_unread_counts');

      if (cachedThreads) {
        const parsedThreads = JSON.parse(cachedThreads);
        const parsedMessages = cachedMessages ? JSON.parse(cachedMessages) : {};
        const parsedUnread = unreadMap ? JSON.parse(unreadMap) : {};

        if (Array.isArray(parsedThreads) && parsedThreads.length > 0) {
          const merged: DashboardThreadPreview[] = parsedThreads.map((t: any) => {
            const threadMsgs = parsedMessages[t.id] || [];
            const last = threadMsgs[threadMsgs.length - 1];
            return {
              id: t.id,
              name: t.name,
              category: t.category,
              projectCode: t.projectCode,
              projectName: t.projectName,
              topicName: t.topicName,
              participants: Array.isArray(t.participants) ? t.participants : [],
              colorTag: t.colorTag || 'indigo',
              lastMessage: last
                ? {
                    id: last.id,
                    sender: last.sender,
                    text: last.text || 'Shared attachment',
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
      console.warn('Dashboard messages sync notice:', e);
    }
  }, []);

  const togglePinChat = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPinnedThreadIds((prev) => {
      const next = prev.includes(threadId)
        ? prev.filter((id) => id !== threadId)
        : [threadId, ...prev];
      try {
        localStorage.setItem(STORAGE_PINNED_CHATS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    const isPinned = pinnedThreadIds.includes(threadId);
    showToast(isPinned ? 'Chat unpinned from dashboard' : '📌 Chat pinned to top');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendQuickReply = (threadId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;

    const senderName = user?.name || 'Arch. Leandro Locsin';
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderName,
      text: quickReplyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update local threads state
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, lastMessage: newMsg } : t))
    );

    // Save to storage cache for studio chat
    try {
      const cached = localStorage.getItem('arkipelago_synced_messages_v2');
      const messagesMap = cached ? JSON.parse(cached) : {};
      messagesMap[threadId] = [...(messagesMap[threadId] || []), newMsg];
      localStorage.setItem('arkipelago_synced_messages_v2', JSON.stringify(messagesMap));
    } catch {}

    setQuickReplyText('');
    setQuickReplyThreadId(null);
    showToast('✓ Quick reply sent to thread');
  };

  // Filter and sort: pinned threads ALWAYS appear at the top
  const displayedThreads = useMemo(() => {
    return threads
      .filter((t) => {
        if (activeFilter === 'PINNED' && !pinnedThreadIds.includes(t.id)) return false;
        if (activeFilter === 'PROJECTS' && t.category !== 'PROJECT_TOPIC') return false;
        if (activeFilter === 'DMS' && t.category !== 'DIRECT_MESSAGE') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchSender = t.lastMessage?.sender.toLowerCase().includes(q) || false;
          const matchText = t.lastMessage?.text.toLowerCase().includes(q) || false;
          const matchTopic = t.topicName?.toLowerCase().includes(q) || false;
          return matchName || matchSender || matchText || matchTopic;
        }
        return true;
      })
      .sort((a, b) => {
        const aPinned = pinnedThreadIds.includes(a.id);
        const bPinned = pinnedThreadIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
  }, [threads, pinnedThreadIds, activeFilter, searchQuery]);

  const totalUnread = useMemo(
    () => threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0),
    [threads]
  );

  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full space-y-4 relative overflow-hidden transition-colors">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-30 bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shadow-xl animate-in fade-in slide-in-from-top-1 duration-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-sans text-text-main leading-tight tracking-tight">
                Studio Comms &amp; Threads
              </h2>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                  {totalUnread} new
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/chat"
              className="text-xs sm:text-sm font-semibold text-accent-cyan hover:underline flex items-center gap-1 shrink-0 font-mono"
            >
              <span>Open Studio Chat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>


        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0',
                activeFilter === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main hover:text-text-main'
              )}
            >
              All ({threads.length})
            </button>
            <button
              onClick={() => setActiveFilter('PINNED')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1',
                activeFilter === 'PINNED'
                  ? 'bg-accent-cyan text-black shadow-2xs'
                  : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main hover:text-text-main'
              )}
            >
              <Pin className="w-3 h-3 fill-current" />
              <span>Pinned ({pinnedThreadIds.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('PROJECTS')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0',
                activeFilter === 'PROJECTS'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main hover:text-text-main'
              )}
            >
              Project Topics
            </button>
            <button
              onClick={() => setActiveFilter('DMS')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0',
                activeFilter === 'DMS'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                  : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main hover:text-text-main'
              )}
            >
              Direct
            </button>
          </div>

          <div className="relative w-full sm:w-44 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-main" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-surface-hover/50 border border-border-main rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono text-text-main placeholder:text-muted-main focus:outline-none focus:border-border-strong transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-1">
        {displayedThreads.length > 0 ? (
          displayedThreads.map((thread) => {
            const isPinned = pinnedThreadIds.includes(thread.id);
            const isReplying = quickReplyThreadId === thread.id;

            return (
              <div
                key={thread.id}
                onClick={() => router.push(`/chat?thread=${thread.id}`)}
                className={cn(
                  'p-3 rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-2 relative',
                  isPinned
                    ? 'border-accent-cyan/40 bg-surface-hover/50 hover:border-accent-cyan shadow-2xs'
                    : 'border-border-main/70 bg-surface-main hover:border-text-main/60 hover:bg-surface-hover/30'
                )}
              >
                {/* Top Row: Thread Name, Project Badge, Pin Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        thread.category === 'DIRECT_MESSAGE'
                          ? 'bg-cyan-500'
                          : thread.colorTag === 'emerald'
                          ? 'bg-emerald-500'
                          : thread.colorTag === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      )}
                    />
                    <h4 className="text-sm sm:text-base font-bold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                      {thread.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {thread.unreadCount && thread.unreadCount > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-accent-cyan text-black font-extrabold text-[11px] font-mono flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => togglePinChat(thread.id, e)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors cursor-pointer',
                        isPinned
                          ? 'text-accent-cyan hover:bg-accent-cyan/10'
                          : 'text-zinc-400 hover:text-text-main hover:bg-surface-hover'
                      )}
                      title={isPinned ? 'Unpin chat' : 'Pin chat to top'}
                    >
                      {isPinned ? (
                        <Pin className="w-4 h-4 fill-current" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Last Message Snippet - High Contrast & Crisp Font */}
                {thread.lastMessage ? (
                  <div className="flex flex-col gap-1 py-0.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-bold text-text-main text-xs sm:text-sm truncate max-w-[160px] sm:max-w-[240px]">
                        {thread.lastMessage.sender}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                        {thread.lastMessage.timestamp}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans font-normal">
                      {thread.lastMessage.text}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic font-sans">No messages yet in this channel.</p>
                )}

                {/* Bottom Row: Quick Reply Drawer Toggle & Members */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-border-main/50 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{thread.participants.length} members</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuickReplyThreadId(isReplying ? null : thread.id)}
                      className="text-accent-cyan hover:underline font-bold cursor-pointer"
                    >
                      {isReplying ? 'Cancel' : 'Quick Reply'}
                    </button>
                    <Link
                      href={`/chat?thread=${thread.id}`}
                      className="text-zinc-600 hover:text-text-main dark:text-zinc-400 font-semibold flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>


                {/* Inline Quick Reply Form */}
                {isReplying && (
                  <form
                    onSubmit={(e) => handleSendQuickReply(thread.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="pt-2 flex items-center gap-2 animate-in fade-in duration-150"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      placeholder={`Reply to ${thread.name}...`}
                      className="flex-1 bg-surface-main border border-border-main rounded-lg px-2.5 py-1.5 text-xs font-mono text-text-main focus:outline-none focus:border-accent-cyan"
                    />
                    <button
                      type="submit"
                      disabled={!quickReplyText.trim()}
                      className="p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-muted-main space-y-1">
            <MessageSquare className="w-6 h-6 mx-auto opacity-40 mb-1" />
            <p className="text-xs font-semibold">No discussions matching &quot;{searchQuery}&quot;</p>
            <p className="text-[11px] opacity-75">Try clearing filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

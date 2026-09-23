'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import {
  ImagePlus,
  BarChart3,
  Smile,
  Search,
  Plus,
  ChevronDown,
  Paperclip,
  Send,
  MoreVertical,
  Hash,
  Tag,
  Users,
  X,
  PlusCircle,
  FolderKanban,
  MessageSquare,
  ArrowLeft,
  PenTool,
  Images,
  Download,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRESET_ACCOUNTS, MOCK_PROJECTS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  attachment?: string;
  attachmentTitle?: string;
}

interface ThreadChannel {
  id: string;
  name: string;
  category: 'PROJECT_TOPIC' | 'DIRECT_MESSAGE' | 'CUSTOM_THREAD';
  projectCode?: string;
  projectName?: string;
  topicName?: string;
  participants: string[];
}

const INITIAL_THREADS: ThreadChannel[] = [
  {
    id: 'thread-001',
    name: '[MT-2024] SCHEMATIC REVISION & MASSING',
    category: 'PROJECT_TOPIC',
    projectCode: 'MT-2024',
    projectName: 'Makati Commercial Tower',
    topicName: 'Schematic Revision & 3D Massing Review',
    participants: ['Arch. Testing3', 'Arch. Testing2'],
  },
  {
    id: 'thread-002',
    name: '[CV-2024] MATERIAL BOARD & MARBLE SPECS',
    category: 'PROJECT_TOPIC',
    projectCode: 'CV-2024',
    projectName: 'Casa Verde Residence',
    topicName: 'Italian Marble & Timber Veneer Selection',
    participants: ['Arch. Testing3', 'Engr. Testing4'],
  },
  {
    id: 'thread-003',
    name: '[BCP-2024] STRUCTURAL PERMIT & BEAMS',
    category: 'PROJECT_TOPIC',
    projectCode: 'BCP-2024',
    projectName: 'BGC Cultural Pavilion',
    topicName: 'Foundation Soil Test & City Permits',
    participants: ['Arch. Testing3', 'Arch. Testing1'],
  },
  {
    id: 'dm-001',
    name: 'Arch. Testing2',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Testing Channel',
    participants: ['Arch. Testing3', 'Arch. Testing2'],
  },
  {
    id: 'dm-002',
    name: 'Engr. Testing4',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Structural Consultation',
    participants: ['Arch. Testing3', 'Engr. Testing4'],
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wall' | 'chat'>('chat');
  const [postContent, setPostContent] = useState('');
  const [wallAttachments, setWallAttachments] = useState<string[]>([]);
  const { user } = useAuth();
  const { posts, addPost } = useWallPosts();

  // Threads & Topics State
  const [threads, setThreads] = useState<ThreadChannel[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>('list');
  const [isGalleryDrawerOpen, setIsGalleryDrawerOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const chatFileRef = useRef<HTMLInputElement>(null);
  const wallFileRef = useRef<HTMLInputElement>(null);

  // Deep linking URL query parameter detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const targetThread = params.get('thread');
    const targetDm = params.get('dm');
    const isAttached = params.get('attached');

    if (targetThread) {
      const match = INITIAL_THREADS.find(
        (t) => t.id === targetThread || t.projectCode === targetThread || t.name.includes(targetThread)
      );
      if (match) {
        setSelectedThreadId(match.id);
        setActiveTab('chat');
        setMobileActiveView('chat');
      }
    } else if (targetDm) {
      const match = INITIAL_THREADS.find(
        (t) => t.category === 'DIRECT_MESSAGE' && t.name.toLowerCase().includes(targetDm.toLowerCase())
      );
      if (match) {
        setSelectedThreadId(match.id);
        setActiveTab('chat');
        setMobileActiveView('chat');
      }
    }

    if (isAttached === 'sketch') {
      try {
        const pending = localStorage.getItem('arkipelago_pending_chat_attachment');
        if (pending) {
          setAttachedImage(pending);
          localStorage.removeItem('arkipelago_pending_chat_attachment');
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Chat Messages State per Thread with Sample Blueprints
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'thread-001': [
      {
        id: 'msg-1',
        sender: 'Arch. Testing2',
        text: 'Hi Arch. Testing3! Here is the latest floor 14-16 massing diagram. Please review cantilever support.',
        timestamp: '10:15 AM',
        attachment: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
        attachmentTitle: 'MAKATI TOWER MASSING DIAGRAM - REV 01',
      },
      {
        id: 'msg-2',
        sender: 'Arch. Testing3',
        text: 'Reviewing now. The cantilever looks structurally viable. I will redline the facade mullions.',
        timestamp: '10:20 AM',
      },
      {
        id: 'msg-3',
        sender: 'Arch. Testing1',
        text: 'Great progress team. Please ensure all stamped revisions are uploaded to the project vault before Friday review.',
        timestamp: '10:35 AM',
      },
    ],
    'thread-002': [
      {
        id: 'msg-4',
        sender: 'Engr. Testing4',
        text: 'For Casa Verde Residence, we received 3 marble sample slabs for the foyer. Photo attached.',
        timestamp: '09:45 AM',
        attachment: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
        attachmentTitle: 'CARRARA MARBLE SAMPLE SLAB',
      },
      {
        id: 'msg-5',
        sender: 'Arch. Testing3',
        text: 'Received Engr. Testing4. Let us schedule a material board review with Arch. Testing1.',
        timestamp: '09:50 AM',
      },
    ],
    'thread-003': [
      {
        id: 'msg-6',
        sender: 'Engr. Testing4',
        text: 'Foundation soil test report and city structural permits are ready for submission.',
        timestamp: '08:30 AM',
      },
    ],
    'dm-001': [
      {
        id: 'msg-7',
        sender: 'Arch. Testing2',
        text: 'Please review the HR overtime approval when you get a chance.',
        timestamp: '11:00 AM',
      },
    ],
    'dm-002': [
      {
        id: 'msg-8',
        sender: 'Engr. Testing4',
        text: 'Direct structural channel active for quick consultations.',
        timestamp: '11:30 AM',
      },
    ],
  });

  // Load threads and messages from Supabase + Realtime sync
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch threads from Supabase
    const fetchThreadsAndMessages = async () => {
      const { data: dbThreads, error: threadsErr } = await supabase
        .from('chat_threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!threadsErr && dbThreads && dbThreads.length > 0) {
        const mappedThreads: ThreadChannel[] = dbThreads.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          projectCode: t.project_code,
          projectName: t.project_name,
          topicName: t.topic_name,
          participants: Array.isArray(t.participants) ? t.participants : [],
        }));
        setThreads(mappedThreads);
      }

      // Fetch all messages
      const { data: dbMessages, error: msgsErr } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!msgsErr && dbMessages && dbMessages.length > 0) {
        const grouped: Record<string, ChatMessage[]> = {};
        dbMessages.forEach((m) => {
          if (!grouped[m.thread_id]) grouped[m.thread_id] = [];
          grouped[m.thread_id].push({
            id: m.id,
            sender: m.sender,
            text: m.text,
            attachment: m.attachment || undefined,
            attachmentTitle: m.attachment_title || undefined,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        });
        setMessages((prev) => ({ ...prev, ...grouped }));
      }
    };

    fetchThreadsAndMessages();

    // 2. Realtime channel subscription for instant messages & threads across devices
    const channel = supabase
      .channel('chat_realtime_broadcast')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const m = payload.new;
          const formattedMsg: ChatMessage = {
            id: m.id,
            sender: m.sender,
            text: m.text,
            attachment: m.attachment || undefined,
            attachmentTitle: m.attachment_title || undefined,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => {
            const threadMsgs = prev[m.thread_id] || [];
            if (threadMsgs.some((existing) => existing.id === m.id)) return prev;
            return {
              ...prev,
              [m.thread_id]: [...threadMsgs, formattedMsg],
            };
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_threads' },
        (payload) => {
          const t = payload.new;
          const mappedThread: ThreadChannel = {
            id: t.id,
            name: t.name,
            category: t.category,
            projectCode: t.project_code,
            projectName: t.project_name,
            topicName: t.topic_name,
            participants: Array.isArray(t.participants) ? t.participants : [],
          };
          setThreads((prev) => {
            if (prev.some((existing) => existing.id === mappedThread.id)) return prev;
            return [mappedThread, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectThreadsOpen, setIsProjectThreadsOpen] = useState(true);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] = useState(true);

  // Modal State for New Topic Thread
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicProject, setNewTopicProject] = useState(MOCK_PROJECTS[0]?.code || 'GENERAL');
  const [newTopicParticipant, setNewTopicParticipant] = useState(PRESET_ACCOUNTS[1]?.name || 'Arch. Testing2');
  const [initialNote, setInitialNote] = useState('');

  const currentThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const activeMessages = messages[currentThread.id] || [];

  const handlePost = () => {
    if (!postContent.trim() || !user) return;
    addPost(postContent, user);
    setPostContent('');
    setWallAttachments([]);
  };

  const handleWallFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setWallAttachments((prev) => [...prev, evt.target?.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !attachedImage) return;
    const messageId = 'msg-' + Date.now();
    const senderName = user?.name ? user.name : 'Arch. Testing3';
    const messageText = chatInput.trim();
    const attachmentUrl = attachedImage || undefined;
    const attachmentHeader = attachedImage ? 'STUDIO SKETCH MARKUP' : undefined;

    const newMsg: ChatMessage = {
      id: messageId,
      sender: senderName,
      text: messageText,
      attachment: attachmentUrl,
      attachmentTitle: attachmentHeader,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [currentThread.id]: [...(prev[currentThread.id] || []), newMsg],
    }));
    setChatInput('');
    setAttachedImage(null);

    // Save message to Supabase
    if (isSupabaseConfigured && supabase) {
      await supabase.from('chat_messages').insert({
        id: messageId,
        thread_id: currentThread.id,
        sender: senderName,
        text: messageText,
        attachment: attachmentUrl || null,
        attachment_title: attachmentHeader || null,
      });
    }
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleRedlineInSketch = (imgUrl: string, title?: string) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', imgUrl);
      localStorage.setItem('arkipelago_pending_sketch_title', title || 'CHAT MARKUP');
    } catch {
      // ignore
    }
    router.push('/sketch');
  };

  const handleCreateTopicThread = async () => {
    if (!newTopicName.trim()) {
      alert('THREAD / TOPIC NAME IS REQUIRED.');
      return;
    }

    const matchedProject = MOCK_PROJECTS.find((p) => p.code === newTopicProject);
    const newId = 'thread-' + Date.now();
    const creatorName = user?.name || 'Arch. Testing3';
    const participantsList = [creatorName, newTopicParticipant];

    const createdThread: ThreadChannel = {
      id: newId,
      name: `[${newTopicProject}] ${newTopicName.toUpperCase()}`,
      category: 'PROJECT_TOPIC',
      projectCode: newTopicProject,
      projectName: matchedProject?.name || 'Studio Project',
      topicName: newTopicName,
      participants: participantsList,
    };

    setThreads((prev) => [createdThread, ...prev]);

    // Insert into Supabase
    if (isSupabaseConfigured && supabase) {
      await supabase.from('chat_threads').insert({
        id: createdThread.id,
        name: createdThread.name,
        category: createdThread.category,
        project_code: createdThread.projectCode,
        project_name: createdThread.projectName,
        topic_name: createdThread.topicName,
        participants: createdThread.participants,
      });
    }

    if (initialNote.trim()) {
      const initMsgId = 'msg-init-' + Date.now();
      const initText = `[TOPIC INITIALIZED] ${initialNote.trim()}`;
      setMessages((prev) => ({
        ...prev,
        [newId]: [
          {
            id: initMsgId,
            sender: creatorName,
            text: initText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));

      if (isSupabaseConfigured && supabase) {
        await supabase.from('chat_messages').insert({
          id: initMsgId,
          thread_id: newId,
          sender: creatorName,
          text: initText,
        });
      }
    }

    setSelectedThreadId(newId);
    setIsTopicModalOpen(false);
    setNewTopicName('');
    setInitialNote('');
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

  // Collect all blueprints and media shared in this thread
  const threadMediaList = activeMessages.filter((m) => !!m.attachment);

  return (
    <div className="flex flex-col h-full bg-bg-main text-text-main font-mono transition-colors pb-8 relative">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={wallFileRef}
        onChange={handleWallFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* NEW THREAD / TOPIC MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border border-border-main rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-main">
                  START NEW TOPIC THREAD
                </h2>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-main mb-1.5">
                  LINK TO PROJECT
                </label>
                <select
                  value={newTopicProject}
                  onChange={(e) => setNewTopicProject(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-4 py-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main uppercase"
                >
                  {MOCK_PROJECTS.map((p) => (
                    <option key={p.id} value={p.code}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                  <option value="GENERAL">[GENERAL] STUDIO GENERAL TOPICS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-main mb-1.5">
                  TOPIC NAME / DISCUSSION TITLE *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3D Massing Review, Material Board Selection..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-4 py-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-main mb-1.5">
                  INVITE PARTICIPANT / MEMBER
                </label>
                <select
                  value={newTopicParticipant}
                  onChange={(e) => setNewTopicParticipant(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-4 py-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main uppercase"
                >
                  {PRESET_ACCOUNTS.map((acc) => (
                    <option key={acc.email} value={acc.name}>
                      {acc.name} ({acc.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-main mb-1.5">
                  INITIAL NOTE / CONTEXT MESSAGE (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide background context or initial testing note for this discussion topic..."
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl p-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-border-main text-xs font-bold uppercase tracking-wider hover:bg-surface-hover transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateTopicThread}
                className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
              >
                CREATE THREAD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Main Tabs Header */}
      <div className="flex border-b border-border-main mb-4">
        <button
          className={cn(
            'px-6 py-3.5 uppercase font-extrabold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors',
            activeTab === 'wall'
              ? 'border-text-main text-text-main font-extrabold'
              : 'border-transparent text-muted-main hover:text-text-main'
          )}
          onClick={() => setActiveTab('wall')}
        >
          ESTUDIO WALL
        </button>
        <button
          className={cn(
            'px-6 py-3.5 uppercase font-extrabold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors flex items-center gap-2',
            activeTab === 'chat'
              ? 'border-text-main text-text-main font-extrabold'
              : 'border-transparent text-muted-main hover:text-text-main'
          )}
          onClick={() => setActiveTab('chat')}
        >
          <span>CHAT & THREADS</span>
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-300 dark:border-slate-700">
            {threads.length} TOPICS
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* ESTUDIO WALL VIEW */}
        {activeTab === 'wall' && (
          <div className="max-w-2xl mx-auto space-y-8 pt-4">
            {/* Post Composer */}
            <div className="bg-surface-main border border-border-main rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <textarea
                className="w-full bg-transparent border-none outline-none resize-none min-h-[100px] font-mono text-text-main placeholder:text-muted-main text-sm"
                placeholder="Share site progress, blueprint updates, or studio announcements..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />

              {/* Multi-Attachment Previews */}
              {wallAttachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-main">
                  {wallAttachments.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border-main bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setWallAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-border-main">
                <div className="flex items-center gap-4 text-muted-main">
                  <button
                    onClick={() => wallFileRef.current?.click()}
                    className="hover:text-text-main transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Attach Site Photos / Blueprints"
                  >
                    <ImagePlus size={18} className="text-accent-cyan" />
                    <span className="hidden sm:inline">ATTACH PHOTO</span>
                  </button>
                  <button className="hover:text-text-main transition-colors">
                    <BarChart3 size={18} />
                  </button>
                  <button className="hover:text-text-main transition-colors">
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-xl uppercase font-bold text-xs tracking-wider hover:opacity-90 transition-opacity shadow-sm"
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
                  className="bg-surface-main border border-border-main rounded-2xl p-6 shadow-sm space-y-4"
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
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {post.authorRole?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-main opacity-90">
                    {post.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT & TOPIC THREADS VIEW */}
        {activeTab === 'chat' && (
          <div className="flex flex-col md:flex-row h-[calc(100vh-13rem)] min-h-[500px] border border-border-main bg-surface-main rounded-2xl overflow-hidden shadow-sm relative">
            {/* LEFT SIDEBAR: THREADS & TOPICS */}
            <div
              className={cn(
                'w-full md:w-80 border-r border-border-main bg-surface-main flex flex-col shrink-0',
                mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'
              )}
            >
              {/* Search & Action Controls Header */}
              <div className="p-3 border-b border-border-main flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
                  <input
                    type="text"
                    placeholder="Search threads or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl py-2 pl-8 pr-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                  />
                </div>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center gap-1 hover:opacity-90 transition-opacity text-xs font-bold uppercase tracking-wider shrink-0 shadow-xs"
                  title="Create New Topic Thread"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>THREAD</span>
                </button>
              </div>

              {/* Subheader: START TOPIC THREAD quick action */}
              <div className="p-3 border-b border-border-main bg-surface-hover/40 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  STUDIO WORKSPACE THREADS
                </span>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ NEW TOPIC</span>
                </button>
              </div>

              {/* Threads & Channels List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border-main/30">
                {/* 1. PROJECT TOPIC THREADS SECTION */}
                <div>
                  <button
                    onClick={() => setIsProjectThreadsOpen(!isProjectThreadsOpen)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 uppercase tracking-wider border-b border-border-main/30"
                  >
                    <span className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      PROJECT TOPIC THREADS ({threads.filter((t) => t.category === 'PROJECT_TOPIC').length})
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform text-slate-600 dark:text-slate-400',
                        isProjectThreadsOpen ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>

                  {isProjectThreadsOpen && (
                    <div className="divide-y divide-border-main/30">
                      {threads
                        .filter(
                          (t) =>
                            t.category === 'PROJECT_TOPIC' &&
                            (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (t.topicName && t.topicName.toLowerCase().includes(searchQuery.toLowerCase())))
                        )
                        .map((thread) => {
                          const isSelected = selectedThreadId === thread.id;
                          const msgList = messages[thread.id] || [];
                          const lastMsg = msgList[msgList.length - 1];

                          return (
                            <div
                              key={thread.id}
                              onClick={() => {
                                setSelectedThreadId(thread.id);
                                setMobileActiveView('chat');
                              }}
                              className={cn(
                                'p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-4',
                                isSelected
                                  ? 'bg-surface-hover border-l-black dark:border-l-white shadow-2xs font-semibold'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                <Hash className="w-4 h-4" />
                              </div>
                              <div className="overflow-hidden flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-black rounded">
                                    {thread.projectCode || 'PROJECT'}
                                  </span>
                                  <span className="text-[9px] font-bold text-muted-main">
                                    {thread.participants.length} USERS
                                  </span>
                                </div>
                                <div className="text-xs font-extrabold uppercase truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[10px] text-muted-main truncate font-sans">
                                  {lastMsg ? `${lastMsg.sender}: ${lastMsg.text}` : thread.topicName || 'Topic room ready'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* 2. DIRECT 1-ON-1 MESSAGES SECTION */}
                <div>
                  <button
                    onClick={() => setIsDirectMessagesOpen(!isDirectMessagesOpen)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 uppercase tracking-wider border-b border-border-main/30"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      DIRECT MESSAGES ({threads.filter((t) => t.category === 'DIRECT_MESSAGE').length})
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform text-slate-600 dark:text-slate-400',
                        isDirectMessagesOpen ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>

                  {isDirectMessagesOpen && (
                    <div className="divide-y divide-border-main/30">
                      {threads
                        .filter(
                          (t) =>
                            t.category === 'DIRECT_MESSAGE' &&
                            (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (t.topicName && t.topicName.toLowerCase().includes(searchQuery.toLowerCase())))
                        )
                        .map((thread) => {
                          const isSelected = selectedThreadId === thread.id;
                          const msgList = messages[thread.id] || [];
                          const lastMsg = msgList[msgList.length - 1];

                          return (
                            <div
                              key={thread.id}
                              onClick={() => {
                                setSelectedThreadId(thread.id);
                                setMobileActiveView('chat');
                              }}
                              className={cn(
                                'p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-4',
                                isSelected
                                  ? 'bg-surface-hover border-l-black dark:border-l-white shadow-2xs font-semibold'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                {thread.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-muted-main uppercase">1-ON-1 CHAT</span>
                                </div>
                                <div className="text-xs font-extrabold uppercase truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[10px] text-muted-main truncate font-sans">
                                  {lastMsg ? lastMsg.text : 'Direct chat active'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT MAIN PANEL: ACTIVE THREAD CHAT CONVERSATION */}
            <div
              className={cn(
                'flex-1 flex flex-col bg-surface-main overflow-hidden',
                mobileActiveView === 'list' ? 'hidden md:flex' : 'flex'
              )}
            >
              {/* Header Bar for Active Thread */}
              <div className="p-4 border-b border-border-main flex items-center justify-between bg-surface-hover/30 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => setMobileActiveView('list')}
                    className="md:hidden p-1.5 rounded-lg border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main shrink-0"
                    title="Back to Threads List"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-sm">
                    {currentThread.category === 'DIRECT_MESSAGE' ? (
                      currentThread.name.charAt(0)
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      {currentThread.projectCode && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-black rounded uppercase">
                          PROJECT: {currentThread.projectCode}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-muted-main uppercase">
                        {currentThread.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-main truncate mt-0.5">
                      {currentThread.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle Thread Drawing Gallery Drawer */}
                  <button
                    onClick={() => setIsGalleryDrawerOpen(!isGalleryDrawerOpen)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors',
                      isGalleryDrawerOpen
                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                        : 'border-border-main hover:bg-surface-hover text-text-main'
                    )}
                    title="Open Blueprint & Drawing Gallery for this Thread"
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">BLUEPRINTS ({threadMediaList.length})</span>
                  </button>

                  <button
                    onClick={() => setIsTopicModalOpen(true)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-border-main hover:bg-surface-hover rounded-xl text-xs font-bold uppercase tracking-wider text-text-main transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>NEW TOPIC</span>
                  </button>
                </div>
              </div>

              {/* Chat Body & Media Gallery Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Message Stream */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-main">
                    {activeMessages.map((msg) => {
                      const isMe =
                        msg.sender === (user?.name || 'Arch. Testing3') ||
                        msg.sender === 'Arch. Testing3';

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex flex-col max-w-xl space-y-1',
                            isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                          )}
                        >
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-main px-1">
                            <span>{msg.sender}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div
                            className={cn(
                              'p-4 rounded-2xl text-xs font-sans leading-relaxed shadow-2xs border space-y-2.5',
                              isMe
                                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-medium'
                                : 'bg-surface-hover text-text-main border-border-main'
                            )}
                          >
                            {msg.attachment && (
                              <div className="rounded-xl overflow-hidden border border-border-main bg-white/10 p-2 space-y-2">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-between">
                                  <span>{msg.attachmentTitle || 'ATTACHED BLUEPRINT'}</span>
                                  <button
                                    onClick={() => handleRedlineInSketch(msg.attachment!, msg.attachmentTitle)}
                                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold uppercase flex items-center gap-1 transition-colors"
                                  >
                                    <PenTool className="w-3 h-3" />
                                    <span>REDLINE IN SKETCH</span>
                                  </button>
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={msg.attachment}
                                  alt="Attachment"
                                  className="max-h-60 w-full rounded-lg object-contain bg-white"
                                />
                              </div>
                            )}
                            {msg.text && <div>{msg.text}</div>}
                          </div>
                        </div>
                      );
                    })}

                    {activeMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                        <MessageSquare className="w-10 h-10 text-muted-main/40" />
                        <p className="text-xs text-muted-main uppercase font-mono tracking-wider">
                          THIS TOPIC THREAD IS READY FOR DISCUSSION. SEND A TESTING CHAT MESSAGE BELOW.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pending Attachment Preview Bar */}
                  {attachedImage && (
                    <div className="px-4 py-2 border-t border-border-main bg-surface-hover/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded border border-border-main overflow-hidden bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={attachedImage} alt="Attachment" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-accent-cyan">
                          SKETCH / BLUEPRINT ATTACHED
                        </span>
                      </div>
                      <button
                        onClick={() => setAttachedImage(null)}
                        className="p-1 rounded-lg text-muted-main hover:text-text-main"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Chat Input Field Bar */}
                  <div className="p-4 border-t border-border-main bg-surface-main flex items-center gap-3 shrink-0">
                    <input
                      type="file"
                      ref={chatFileRef}
                      onChange={handleChatFileUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <button
                      onClick={() => chatFileRef.current?.click()}
                      className="p-2 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors shrink-0"
                      title="Attach Blueprint or Photo"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={`Send testing chat message to ${currentThread.name}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 bg-surface-hover border border-border-main rounded-xl px-4 py-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() && !attachedImage}
                      className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* THREAD DRAWING & MEDIA GALLERY SLIDE-OUT DRAWER */}
                {isGalleryDrawerOpen && (
                  <div className="w-72 border-l border-border-main bg-surface-main flex flex-col shrink-0 animate-in slide-in-from-right-4">
                    <div className="p-3 border-b border-border-main flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Images className="w-4 h-4 text-accent-cyan" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                          THREAD MEDIA
                        </span>
                      </div>
                      <button
                        onClick={() => setIsGalleryDrawerOpen(false)}
                        className="p-1 rounded text-muted-main hover:text-text-main"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 border-b border-border-main bg-surface-hover/30 text-[10px] text-muted-main uppercase font-bold">
                      BLUEPRINTS & MARKUPS IN THIS ROOM ({threadMediaList.length})
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {threadMediaList.length === 0 ? (
                        <div className="text-center py-10 text-xs text-muted-main italic uppercase">
                          NO MEDIA ATTACHMENTS SHARED YET
                        </div>
                      ) : (
                        threadMediaList.map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-xl border border-border-main bg-surface-hover/60 space-y-2"
                          >
                            <div className="aspect-video bg-white rounded-lg overflow-hidden border border-border-main">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.attachment!} alt="Drawing" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-[10px] font-extrabold uppercase text-text-main truncate">
                              {m.attachmentTitle || 'DRAWING ATTACHMENT'}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-muted-main">
                              <span>BY: {m.sender}</span>
                              <span>{m.timestamp}</span>
                            </div>
                            <button
                              onClick={() => handleRedlineInSketch(m.attachment!, m.attachmentTitle)}
                              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9px] uppercase rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <PenTool className="w-3 h-3" />
                              <span>REDLINE IN SKETCH</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import {
  ImagePlus,
  Search,
  Plus,
  ChevronDown,
  Paperclip,
  Send,
  Hash,
  Users,
  UserPlus,
  X,
  PlusCircle,
  FolderKanban,
  MessageSquare,
  ArrowLeft,
  PenTool,
  Images,
  Maximize2,
  ExternalLink,
  Check,
  CheckCircle2,
  Info,
  Smile,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Copy,
  Edit3,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PROJECTS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const STUDIO_EMOJIS = [
  '📐', '📏', '🏗️', '🏛️', '🏢', '🏠', '🎨', '✏️',
  '👍', '👏', '🙌', '✅', '🔥', '👀', '⭐', '💡',
  '😀', '😊', '😎', '🤔', '🫡', '🎉', '☕', '💪',
  '🚀', '🎯', '💯', '❤️', '🤝', '🙏', '👌', '📌'
];

export interface StudioMemberContact {
  id: string;
  name: string;
  role: string;
  roleBadge: string;
  email: string;
  avatarColor: string;
}

export const ALL_STUDIO_MEMBERS: StudioMemberContact[] = [
  {
    id: 'usr-1',
    name: 'Arch. Leandro Locsin',
    role: 'Principal Partner',
    roleBadge: 'Partner',
    email: 'locsin@arkipelago.ph',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'usr-2',
    name: 'Arch. Carlos Mendoza',
    role: 'Lead Project Architect',
    roleBadge: 'Senior Architect',
    email: 'mendoza@arkipelago.ph',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'usr-3',
    name: 'Arch. Sofia Reyes',
    role: 'Architectural Designer',
    roleBadge: 'Junior Architect',
    email: 'reyes@arkipelago.ph',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'usr-4',
    name: 'Engr. Roberto Cruz',
    role: 'Lead Structural Consultant',
    roleBadge: 'Structural',
    email: 'cruz@cruz-engineering.com',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'usr-5',
    name: 'Elena Gomez',
    role: 'Client Development Rep',
    roleBadge: 'Client Rep',
    email: 'elena.gomez@ayalahorizon.com',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'usr-6',
    name: 'Foreman Danilo',
    role: 'Site General Contractor',
    roleBadge: 'Contractor',
    email: 'danilo@primebuilders.ph',
    avatarColor: 'bg-slate-600',
  },
  {
    id: 'usr-7',
    name: 'Arch. Testing1',
    role: 'Studio Partner',
    roleBadge: 'Partner',
    email: 'partner@arkipelago.com',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'usr-8',
    name: 'Arch. Testing2',
    role: 'Senior Project Lead',
    roleBadge: 'Senior Architect',
    email: 'senior@arkipelago.com',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'usr-9',
    name: 'Arch. Testing3',
    role: 'Junior Project Architect',
    roleBadge: 'Junior Architect',
    email: 'junior@arkipelago.com',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'usr-10',
    name: 'Engr. Testing4',
    role: 'Consulting Engineer',
    roleBadge: 'Contractor',
    email: 'contractor@arkipelago.com',
    avatarColor: 'bg-rose-600',
  },
];

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  attachment?: string;
  attachmentTitle?: string;
  isSystem?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of usernames
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
    name: '[MT-2024] Schematic Revision & Massing',
    category: 'PROJECT_TOPIC',
    projectCode: 'MT-2024',
    projectName: 'Makati Commercial Tower',
    topicName: 'Schematic Revision & 3D Massing Review',
    participants: ['Arch. Carlos Mendoza', 'Arch. Testing2', 'Elena Gomez'],
  },
  {
    id: 'thread-002',
    name: '[CV-2024] Material Board & Marble Specs',
    category: 'PROJECT_TOPIC',
    projectCode: 'CV-2024',
    projectName: 'Casa Verde Residence',
    topicName: 'Italian Marble & Timber Veneer Selection',
    participants: ['Arch. Leandro Locsin', 'Engr. Roberto Cruz', 'Foreman Danilo'],
  },
  {
    id: 'thread-003',
    name: '[BCP-2024] Structural Permit & Beams',
    category: 'PROJECT_TOPIC',
    projectCode: 'BCP-2024',
    projectName: 'BGC Cultural Pavilion',
    topicName: 'Foundation Soil Test & City Permits',
    participants: ['Arch. Sofia Reyes', 'Arch. Testing1', 'Engr. Roberto Cruz'],
  },
  {
    id: 'dm-001',
    name: 'Arch. Carlos Mendoza',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Consultation',
    participants: ['Arch. Leandro Locsin', 'Arch. Carlos Mendoza'],
  },
  {
    id: 'dm-002',
    name: 'Engr. Roberto Cruz',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Structural Consultation',
    participants: ['Arch. Leandro Locsin', 'Engr. Roberto Cruz'],
  },
];

function getInitialThreadAndTab() {
  if (typeof window === 'undefined') {
    return { threadId: INITIAL_THREADS[0].id, activeTab: 'wall' as const, mobileView: 'list' as const };
  }
  const params = new URLSearchParams(window.location.search);
  const targetTab = params.get('tab');
  const targetThread = params.get('thread');
  const targetDm = params.get('dm');

  if (targetTab === 'wall') {
    return { threadId: INITIAL_THREADS[0].id, activeTab: 'wall' as const, mobileView: 'list' as const };
  }
  if (targetTab === 'chat') {
    return { threadId: INITIAL_THREADS[0].id, activeTab: 'chat' as const, mobileView: 'list' as const };
  }
  if (targetThread) {
    const match = INITIAL_THREADS.find(
      (t) => t.id === targetThread || t.projectCode === targetThread || t.name.toLowerCase().includes(targetThread.toLowerCase())
    );
    if (match) {
      return { threadId: match.id, activeTab: 'chat' as const, mobileView: 'chat' as const };
    }
  } else if (targetDm) {
    const match = INITIAL_THREADS.find(
      (t) => t.category === 'DIRECT_MESSAGE' && t.name.toLowerCase().includes(targetDm.toLowerCase())
    );
    if (match) {
      return { threadId: match.id, activeTab: 'chat' as const, mobileView: 'chat' as const };
    }
  }
  return { threadId: INITIAL_THREADS[0].id, activeTab: 'wall' as const, mobileView: 'list' as const };
}

function getInitialAttachedSketch(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('attached') === 'sketch') {
    try {
      const pending = localStorage.getItem('arkipelago_pending_chat_attachment');
      if (pending) {
        localStorage.removeItem('arkipelago_pending_chat_attachment');
        return pending;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export default function ChatPage() {
  const router = useRouter();
  const [initialRouteState] = useState(getInitialThreadAndTab);
  const [activeTab, setActiveTab] = useState<'wall' | 'chat'>(initialRouteState.activeTab);
  const [postContent, setPostContent] = useState('');
  const [wallAttachments, setWallAttachments] = useState<string[]>([]);
  const { user } = useAuth();
  const {
    posts,
    addPost,
    editPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment
  } = useWallPosts();

  // Wall Posts interaction state
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentEmojiOpenPostIds, setCommentEmojiOpenPostIds] = useState<Record<string, boolean>>({});
  const [postMenuOpenId, setPostMenuOpenId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState<string>('');

  // Threads & Topics State
  const [threads, setThreads] = useState<ThreadChannel[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(initialRouteState.threadId);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>(initialRouteState.mobileView);
  const [isGalleryDrawerOpen, setIsGalleryDrawerOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(getInitialAttachedSketch);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title?: string } | null>(null);

  // In-Thread Member Management State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isMembersRosterOpen, setIsMembersRosterOpen] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const chatFileRef = useRef<HTMLInputElement>(null);
  const wallFileRef = useRef<HTMLInputElement>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const wallEmojiRef = useRef<HTMLDivElement>(null);
  const chatEmojiRef = useRef<HTMLDivElement>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const commentEmojiRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isWallEmojiOpen, setIsWallEmojiOpen] = useState(false);
  const [isChatEmojiOpen, setIsChatEmojiOpen] = useState(false);

  // Chat Messages State per Thread with Sample Blueprints and Reactions
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'thread-001': [
      {
        id: 'msg-1',
        sender: 'Arch. Carlos Mendoza',
        text: 'Hi team! Here is the latest floor 14-16 massing diagram. Please review cantilever support and core alignment.',
        timestamp: '10:15 AM',
        attachment: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
        attachmentTitle: 'Makati Tower Massing Diagram - Rev 01',
        reactions: {
          '📐': ['Arch. Leandro Locsin'],
          '👍': ['Elena Gomez', 'Arch. Carlos Mendoza'],
        },
      },
      {
        id: 'msg-2',
        sender: 'Arch. Leandro Locsin',
        text: 'Reviewing now. The cantilever looks structurally viable. I will redline the facade mullions on the sketch board.',
        timestamp: '10:20 AM',
        reactions: {
          '👀': ['Elena Gomez'],
        },
      },
      {
        id: 'msg-3',
        sender: 'Elena Gomez',
        text: 'Ayala dev team reviewed this in our weekly brief. Please ensure all stamped revisions are uploaded to the project vault before Friday.',
        timestamp: '10:35 AM',
        reactions: {
          '✅': ['Arch. Carlos Mendoza', 'Arch. Leandro Locsin'],
        },
      },
    ],
    'thread-002': [
      {
        id: 'msg-4',
        sender: 'Engr. Roberto Cruz',
        text: 'For Casa Verde Residence, we received 3 marble sample slabs for the foyer. Photo attached.',
        timestamp: '09:45 AM',
        attachment: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
        attachmentTitle: 'Carrara Marble Sample Slab',
        reactions: {
          '👍': ['Arch. Leandro Locsin'],
        },
      },
      {
        id: 'msg-5',
        sender: 'Arch. Leandro Locsin',
        text: 'Received Engr. Roberto. Let us schedule a material board review with the Verde family this afternoon.',
        timestamp: '09:50 AM',
      },
    ],
    'thread-003': [
      {
        id: 'msg-6',
        sender: 'Engr. Roberto Cruz',
        text: 'Foundation soil test report and city structural permits are ready for submission to Taguig City Hall.',
        timestamp: '08:30 AM',
        reactions: {
          '✅': ['Arch. Sofia Reyes'],
        },
      },
    ],
    'dm-001': [
      {
        id: 'msg-7',
        sender: 'Arch. Carlos Mendoza',
        text: 'Please review the facade engineering submittal when you get a chance.',
        timestamp: '11:00 AM',
      },
    ],
    'dm-002': [
      {
        id: 'msg-8',
        sender: 'Engr. Roberto Cruz',
        text: 'Direct structural channel active for quick consultations on foundation pours.',
        timestamp: '11:30 AM',
      },
    ],
  });

  // Load threads and messages from Supabase + Realtime sync
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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

  // Modal State for New Topic Thread with Multi-Member selection
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [topicError, setTopicError] = useState('');
  const [newTopicProject, setNewTopicProject] = useState(MOCK_PROJECTS[0]?.code || 'GENERAL');
  const [newTopicParticipants, setNewTopicParticipants] = useState<string[]>([
    ALL_STUDIO_MEMBERS[1].name,
    ALL_STUDIO_MEMBERS[3].name,
  ]);
  const [initialNote, setInitialNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWallDropActive, setIsWallDropActive] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Synchronize activeTab with URL params reactively
  useEffect(() => {
    const updateTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'wall') {
        setActiveTab('wall');
      } else if (tab === 'chat' || params.get('thread') || params.get('dm')) {
        setActiveTab('chat');
      }
    };
    updateTabFromUrl();
    window.addEventListener('popstate', updateTabFromUrl);
    return () => window.removeEventListener('popstate', updateTabFromUrl);
  }, []);

  // Close roster and emoji / options popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (rosterRef.current && !rosterRef.current.contains(e.target as Node)) {
        setIsMembersRosterOpen(false);
      }
      if (wallEmojiRef.current && !wallEmojiRef.current.contains(e.target as Node)) {
        setIsWallEmojiOpen(false);
      }
      if (chatEmojiRef.current && !chatEmojiRef.current.contains(e.target as Node)) {
        setIsChatEmojiOpen(false);
      }
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setPostMenuOpenId(null);
      }
      // Check comment emoji refs
      const target = e.target as Node;
      let clickedInsideCommentEmoji = false;
      Object.values(commentEmojiRefs.current).forEach((el) => {
        if (el && el.contains(target)) {
          clickedInsideCommentEmoji = true;
        }
      });
      if (!clickedInsideCommentEmoji) {
        setCommentEmojiOpenPostIds({});
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleWallDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWallDropActive(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    Array.from(e.dataTransfer.files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          if (url) {
            setWallAttachments((prev) => [...prev, url]);
            showToast(`Attached "${file.name}" to wall post`);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleInsertWallEmoji = (emoji: string) => {
    setPostContent((prev) => prev + emoji);
    setIsWallEmojiOpen(false);
  };

  const handleInsertChatEmoji = (emoji: string) => {
    setChatInput((prev) => prev + emoji);
    setIsChatEmojiOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) setLightboxImage(null);
        else if (isAddMemberModalOpen) setIsAddMemberModalOpen(false);
        else if (isMembersRosterOpen) setIsMembersRosterOpen(false);
        else if (isWallEmojiOpen) setIsWallEmojiOpen(false);
        else if (isChatEmojiOpen) setIsChatEmojiOpen(false);
        else if (postMenuOpenId) setPostMenuOpenId(null);
        else if (editingPostId) setEditingPostId(null);
        else if (isTopicModalOpen) {
          setIsTopicModalOpen(false);
          setTopicError('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, isAddMemberModalOpen, isMembersRosterOpen, isWallEmojiOpen, isChatEmojiOpen, postMenuOpenId, editingPostId, isTopicModalOpen]);

  const currentThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const activeMessages = messages[currentThread?.id] || [];

  const handlePost = () => {
    if (!postContent.trim() && wallAttachments.length === 0) return;
    if (!user) return;
    addPost(postContent, user, wallAttachments);
    setPostContent('');
    setWallAttachments([]);
    showToast('Post published to Estudio Wall');
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
    const senderName = user?.name ? user.name : 'Arch. Leandro Locsin';
    const messageText = chatInput.trim();
    const attachmentUrl = attachedImage || undefined;
    const attachmentHeader = attachedImage ? 'Studio Sketch Markup' : undefined;

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
      localStorage.setItem('arkipelago_pending_sketch_title', title || 'Chat Markup');
    } catch {
      // ignore
    }
    router.push('/sketch');
  };

  // Add members to currently active thread
  const handleAddMembersToCurrentThread = async () => {
    if (selectedMembersToAdd.length === 0 || !currentThread) return;
    const currentParticipants = currentThread.participants || [];
    const updatedParticipants = Array.from(new Set([...currentParticipants, ...selectedMembersToAdd]));

    setThreads((prev) =>
      prev.map((t) => (t.id === currentThread.id ? { ...t, participants: updatedParticipants } : t))
    );

    const inviter = user?.name || 'Arch. Leandro Locsin';
    const addedNames = selectedMembersToAdd.join(', ');
    const sysMsg: ChatMessage = {
      id: 'sys-' + Date.now(),
      sender: 'System',
      text: `${inviter} added ${addedNames} to the thread.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    setMessages((prev) => ({
      ...prev,
      [currentThread.id]: [...(prev[currentThread.id] || []), sysMsg],
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('chat_threads')
        .update({ participants: updatedParticipants })
        .eq('id', currentThread.id);
    }

    showToast(`✓ Added ${selectedMembersToAdd.length} member(s) to #${currentThread.name}!`);
    setSelectedMembersToAdd([]);
    setIsAddMemberModalOpen(false);
  };

  // Slack/Discord-Style Message Reactions
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const currentUserName = user?.name || 'Arch. Leandro Locsin';
    setMessages((prev) => {
      const threadMsgs = prev[currentThread.id] || [];
      const updated = threadMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = { ...(msg.reactions || {}) };
        const usersReacted = currentReactions[emoji] || [];
        const hasReacted = usersReacted.includes(currentUserName);

        if (hasReacted) {
          const filtered = usersReacted.filter((u) => u !== currentUserName);
          if (filtered.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = filtered;
          }
        } else {
          currentReactions[emoji] = [...usersReacted, currentUserName];
        }

        return {
          ...msg,
          reactions: currentReactions,
        };
      });

      return {
        ...prev,
        [currentThread.id]: updated,
      };
    });
  };

  // Create new topic thread with multi-member selection
  const handleCreateTopicThread = async () => {
    if (!newTopicName.trim()) {
      setTopicError('Topic name / title is required.');
      return;
    }
    setTopicError('');

    const matchedProject = MOCK_PROJECTS.find((p) => p.code === newTopicProject);
    const newId = 'thread-' + Date.now();
    const creatorName = user?.name || 'Arch. Leandro Locsin';
    const participantsList = Array.from(new Set([creatorName, ...newTopicParticipants]));

    const createdThread: ThreadChannel = {
      id: newId,
      name: `[${newTopicProject}] ${newTopicName}`,
      category: 'PROJECT_TOPIC',
      projectCode: newTopicProject,
      projectName: matchedProject?.name || 'Studio Project',
      topicName: newTopicName,
      participants: participantsList,
    };

    setThreads((prev) => [createdThread, ...prev]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('chat_threads').insert({
        id: newId,
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
      const initText = initialNote.trim();
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
    showToast(`✓ Topic thread "${createdThread.name}" created with ${participantsList.length} members!`);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Collect all blueprints and media shared in this thread
  const threadMediaList = activeMessages.filter((m) => !!m.attachment);

  return (
    <div className="flex flex-col h-full bg-bg-main text-text-main font-sans transition-colors pb-8 relative">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={wallFileRef}
        onChange={handleWallFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Image Attachment Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxImage(null);
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-4xl w-full p-5 space-y-4 shadow-2xl relative cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-accent-cyan" />
                <h3 className="font-bold text-sm text-text-main">
                  {lightboxImage.title || 'Attached Media Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRedlineInSketch(lightboxImage.src, lightboxImage.title)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Redline in Sketch</span>
                </button>
                <a
                  href={lightboxImage.src}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 border border-border-main hover:bg-surface-hover rounded-lg text-muted-main hover:text-text-main transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-hidden rounded-xl bg-black/5 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.src}
                alt="Enlarged preview"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBERS TO EXISTING THREAD MODAL */}
      {isAddMemberModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddMemberModalOpen(false);
              setSelectedMembersToAdd([]);
            }
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3.5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent-cyan" />
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Add Members to Thread
                  </h3>
                  <p className="text-[11px] text-muted-main truncate max-w-[280px]">
                    #{currentThread?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedMembersToAdd([]);
                }}
                className="p-1 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Member Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search team members by name or role..."
                className="w-full pl-8 pr-4 py-2 bg-surface-hover border border-border-main rounded-xl text-xs text-text-main placeholder:text-muted-main outline-hidden focus:border-text-main"
              />
            </div>

            {/* Members Selectable List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {ALL_STUDIO_MEMBERS
                .filter(
                  (m) =>
                    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                    m.role.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                    m.roleBadge.toLowerCase().includes(memberSearchQuery.toLowerCase())
                )
                .map((member) => {
                  const isAlreadyIn = currentThread?.participants.includes(member.name);
                  const isSelected = selectedMembersToAdd.includes(member.name);

                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (isAlreadyIn) return;
                        setSelectedMembersToAdd((prev) =>
                          isSelected ? prev.filter((n) => n !== member.name) : [...prev, member.name]
                        );
                      }}
                      className={cn(
                        'p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all',
                        isAlreadyIn
                          ? 'opacity-60 bg-surface-hover/30 border-border-main/40 cursor-not-allowed'
                          : isSelected
                          ? 'border-accent-cyan bg-accent-cyan/15 text-text-main cursor-pointer'
                          : 'border-border-main hover:border-text-main bg-surface-hover/50 cursor-pointer'
                      )}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                            member.avatarColor
                          )}
                        >
                          {member.name.replace('Arch. ', '').replace('Engr. ', '').charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-semibold text-text-main truncate">{member.name}</h4>
                          <p className="text-[10px] text-muted-main truncate">{member.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main">
                          {member.roleBadge}
                        </span>
                        {isAlreadyIn ? (
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>In thread</span>
                          </span>
                        ) : (
                          <div
                            className={cn(
                              'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                              isSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main'
                                : 'border-border-main'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-2 border-t border-border-main">
              <span className="text-xs text-muted-main font-mono">
                {selectedMembersToAdd.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setSelectedMembersToAdd([]);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembersToCurrentThread}
                  disabled={selectedMembersToAdd.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  Add Selected Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* START NEW TOPIC THREAD MODAL (WITH MULTI-MEMBER PICKER) */}
      {isTopicModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTopicModalOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150 overflow-y-auto"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl cursor-default my-auto">
            <div className="flex items-center justify-between border-b border-border-main pb-3.5">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-accent-cyan" />
                <div>
                  <h2 className="font-bold text-sm text-text-main">
                    Start New Topic Thread
                  </h2>
                  <p className="text-xs text-muted-main">
                    Create a dedicated architectural discussion room with multiple team members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Linked Project */}
              <div>
                <label className="block text-xs font-semibold text-muted-main mb-1.5">
                  Link to Project Reference
                </label>
                <select
                  value={newTopicProject}
                  onChange={(e) => setNewTopicProject(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-4 py-2.5 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                >
                  {MOCK_PROJECTS.map((p) => (
                    <option key={p.id} value={p.code}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                  <option value="GENERAL">[GENERAL] Studio General Topics</option>
                </select>
              </div>

              {/* Topic Name */}
              <div>
                <label className="block text-xs font-semibold text-muted-main mb-1.5">
                  Topic Name / Discussion Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Curtain Wall Facade Mullions & Mockup Review"
                  value={newTopicName}
                  onChange={(e) => {
                    setNewTopicName(e.target.value);
                    if (topicError) setTopicError('');
                  }}
                  className={`w-full bg-surface-hover border rounded-xl px-4 py-2.5 text-xs font-sans text-text-main focus:outline-none transition-colors placeholder:text-muted-main/60 ${
                    topicError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border-main focus:border-text-main'
                  }`}
                />
                {topicError && (
                  <p className="text-[11px] text-rose-500 font-sans mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                    <span>⚠</span> {topicError}
                  </p>
                )}
              </div>

              {/* MULTI-MEMBER SELECTOR */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-main">
                    Invite Thread Members ({newTopicParticipants.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newTopicParticipants.length === ALL_STUDIO_MEMBERS.length) {
                        setNewTopicParticipants([]);
                      } else {
                        setNewTopicParticipants(ALL_STUDIO_MEMBERS.map((m) => m.name));
                      }
                    }}
                    className="text-[11px] text-accent-cyan hover:underline font-semibold cursor-pointer"
                  >
                    {newTopicParticipants.length === ALL_STUDIO_MEMBERS.length ? 'Clear All' : 'Select All Studio'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border-main/60 rounded-xl bg-surface-hover/30">
                  {ALL_STUDIO_MEMBERS.map((m) => {
                    const isSelected = newTopicParticipants.includes(m.name);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setNewTopicParticipants((prev) =>
                            isSelected ? prev.filter((n) => n !== m.name) : [...prev, m.name]
                          );
                        }}
                        className={cn(
                          'p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all',
                          isSelected
                            ? 'bg-accent-cyan/15 border-accent-cyan text-text-main font-semibold'
                            : 'bg-surface-main border-border-main hover:border-text-main text-muted-main'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={cn('w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0', m.avatarColor)}>
                            {m.name.replace('Arch. ', '').replace('Engr. ', '').charAt(0)}
                          </div>
                          <span className="truncate text-[11px]">{m.name}</span>
                        </div>
                        <div className={cn(
                          'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                          isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-text-main' : 'border-border-main'
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Initial Note */}
              <div>
                <label className="block text-xs font-semibold text-muted-main mb-1.5">
                  Initial Note / Context Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide background context or initial notes for this discussion topic..."
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl p-3 text-xs font-sans text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-main">
              <button
                onClick={() => {
                  setIsTopicModalOpen(false);
                  setTopicError('');
                }}
                className="px-4 py-2 rounded-xl border border-border-main text-xs font-semibold hover:bg-surface-hover active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTopicThread}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Create Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main/50 pb-3 mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main font-sans">
              Studio Communications
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-hover text-muted-main border border-border-main hidden sm:inline-block">
              {activeTab === 'wall' ? 'Wall Feed' : `${threads.length} Threads`}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 border-l border-border-main/50 pl-3 sm:pl-5">
            <button
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer',
                activeTab === 'wall'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                  : 'text-muted-main hover:text-text-main hover:bg-surface-hover/70'
              )}
              onClick={() => {
                setActiveTab('wall');
                window.history.replaceState(null, '', '/chat?tab=wall');
              }}
            >
              Estudio Wall
            </button>
            <button
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer',
                activeTab === 'chat'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                  : 'text-muted-main hover:text-text-main hover:bg-surface-hover/70'
              )}
              onClick={() => {
                setActiveTab('chat');
                window.history.replaceState(null, '', '/chat?tab=chat');
              }}
            >
              <span>Chat & Threads</span>
              <span className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                activeTab === 'chat'
                  ? 'bg-white/20 dark:bg-black/20 text-current'
                  : 'bg-surface-hover text-muted-main border border-border-main/50'
              )}>
                {threads.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* ESTUDIO WALL VIEW */}
        {activeTab === 'wall' && (
          <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12">
            {/* Post Composer with Drag-and-Drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsWallDropActive(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsWallDropActive(false);
                }
              }}
              onDrop={handleWallDrop}
              className={cn(
                'bg-surface-main border rounded-2xl p-5 flex flex-col gap-4 shadow-sm transition-all relative',
                isWallDropActive
                  ? 'border-accent-cyan ring-2 ring-accent-cyan/20 bg-accent-cyan/5 scale-[1.005]'
                  : 'border-border-main'
              )}
            >
              <textarea
                className="w-full bg-transparent border-none outline-none resize-none min-h-[100px] font-sans text-text-main placeholder:text-muted-main text-xs sm:text-sm"
                placeholder="Share site progress, blueprint updates, or studio announcements (or drag & drop images here)..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />

              {isWallDropActive && (
                <div className="absolute inset-0 z-10 bg-accent-cyan/10 backdrop-blur-xs border-2 border-dashed border-accent-cyan rounded-2xl flex items-center justify-center pointer-events-none animate-in fade-in duration-100">
                  <div className="flex items-center gap-2 text-accent-cyan font-semibold text-xs bg-surface-main px-4 py-2 rounded-xl shadow-lg border border-accent-cyan/40">
                    <ImagePlus className="w-4 h-4 animate-bounce" />
                    <span>Drop photos or sketches to attach</span>
                  </div>
                </div>
              )}

              {/* Multi-Attachment Previews */}
              {wallAttachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-main">
                  {wallAttachments.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border-main bg-black/5 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setWallAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border-main pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => wallFileRef.current?.click()}
                    className="p-2 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Upload Photo from Device"
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Attach Image</span>
                  </button>

                  {/* Wall Emoji Picker */}
                  <div className="relative" ref={wallEmojiRef}>
                    <button
                      type="button"
                      onClick={() => setIsWallEmojiOpen(!isWallEmojiOpen)}
                      className={cn(
                        "p-2 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                        isWallEmojiOpen && "bg-surface-hover text-text-main border-text-main"
                      )}
                      title="Insert Emoji"
                    >
                      <Smile className="w-4 h-4" />
                      <span className="hidden sm:inline">Emoji</span>
                    </button>
                    {isWallEmojiOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-surface-main border border-border-main rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in duration-100">
                        <div className="text-[10px] font-mono text-muted-main uppercase tracking-wider mb-2 px-1">Insert Emoji</div>
                        <div className="grid grid-cols-8 gap-1">
                          {STUDIO_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleInsertWallEmoji(emoji)}
                              className="w-7 h-7 flex items-center justify-center text-base hover:bg-surface-hover rounded-lg transition-transform hover:scale-125 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={!postContent.trim() && wallAttachments.length === 0}
                  className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Post to Wall
                </button>
              </div>
            </div>

            {/* Wall Posts Stream */}
            <div className="space-y-4">
              {posts.map((post) => {
                const isAuthor = Boolean(
                  (user?.id && post.authorId && user.id === post.authorId) ||
                  (user?.name && post.authorName && user.name.trim().toLowerCase() === post.authorName.trim().toLowerCase())
                );
                const canManage = isAuthor || user?.role === 'partner';
                const isLiked = user?.id ? post.likedBy?.includes(user.id) : false;
                const likeCount = post.likes ?? (post.likedBy?.length || 0);
                const comments = post.comments || [];
                const isCommentsOpen = openCommentPostIds[post.id] ?? (comments.length > 0);
                const isEditing = editingPostId === post.id;
                const isMenuOpen = postMenuOpenId === post.id;

                return (
                  <div key={post.id} className="bg-surface-main border border-border-main rounded-2xl p-5 space-y-4 shadow-2xs transition-all relative">
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-surface-hover border border-border-main flex items-center justify-center font-bold text-xs">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-text-main">{post.authorName}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-hover text-muted-main border border-border-main/50 font-mono capitalize">
                              {post.authorRole.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-main">
                            <span>{formatDate(post.createdAt)}</span>
                            {post.updatedAt && <span className="italic text-accent-cyan">(edited)</span>}
                          </div>
                        </div>
                      </div>

                      {/* 3-dot / More Options Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPostMenuOpenId(isMenuOpen ? null : post.id)}
                          className="p-1.5 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                          title="Post options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={postMenuRef}
                            className="absolute right-0 top-full mt-1 w-48 bg-surface-main border border-border-main rounded-xl shadow-xl py-1 z-30 animate-in fade-in duration-100 text-xs font-sans"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  navigator.clipboard.writeText(window.location.origin + `/chat?tab=wall&post=${post.id}`);
                                }
                                showToast('Post link copied to clipboard!');
                                setPostMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-main" />
                              <span>Copy Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  navigator.clipboard.writeText(post.content);
                                }
                                showToast('Post text copied to clipboard!');
                                setPostMenuOpenId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-muted-main" />
                              <span>Copy Post Content</span>
                            </button>

                            {typeof navigator !== 'undefined' && 'share' in navigator && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.share({
                                    title: `Estudio Wall Post by ${post.authorName}`,
                                    text: post.content,
                                    url: window.location.origin + `/chat?tab=wall&post=${post.id}`,
                                  }).catch(() => {});
                                  setPostMenuOpenId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-muted-main" />
                                <span>Share via Device</span>
                              </button>
                            )}

                            {canManage && (
                              <>
                                <div className="border-t border-border-main my-1" />
                                {isAuthor && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPostId(post.id);
                                      setEditingPostContent(post.content);
                                      setPostMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-muted-main" />
                                    <span>Edit Post</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this wall post?')) {
                                      const success = await deletePost(post.id, user);
                                      if (success !== false) {
                                        showToast('Wall post deleted');
                                      } else {
                                        showToast('Unauthorized to delete this post');
                                      }
                                    }
                                    setPostMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-red-500/10 flex items-center gap-2 text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Post</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content / Inline Editor */}
                    {isEditing ? (
                      <div className="space-y-3 pt-1">
                        <textarea
                          value={editingPostContent}
                          onChange={(e) => setEditingPostContent(e.target.value)}
                          className="w-full bg-surface-hover/50 border border-border-main rounded-xl p-3 text-xs font-sans text-text-main focus:outline-none focus:border-text-main min-h-[90px] resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPostId(null)}
                            className="px-3 py-1.5 rounded-lg border border-border-main hover:bg-surface-hover text-xs font-semibold text-muted-main cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingPostContent.trim()) return;
                              editPost(post.id, editingPostContent);
                              setEditingPostId(null);
                              showToast('Post updated successfully');
                            }}
                            className="px-4 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed text-text-main whitespace-pre-wrap font-sans">
                        {post.content}
                      </p>
                    )}

                    {/* Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden pt-1">
                        {post.attachments.map((src, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxImage({ src, title: `Wall Post by ${post.authorName}` })}
                            className="aspect-video bg-black/10 rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="Post attachment" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Bar (Like, Comment, Share) */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border-main/70 text-xs font-medium text-muted-main">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            showToast('Please log in to like posts');
                            return;
                          }
                          toggleLike(post.id, user.id);
                        }}
                        className={cn(
                          'flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-hover',
                          isLiked ? 'text-red-500 font-semibold bg-red-500/10' : 'hover:text-text-main'
                        )}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={cn('w-4 h-4', isLiked && 'fill-current text-red-500')} />
                        <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenCommentPostIds((prev) => ({
                            ...prev,
                            [post.id]: !isCommentsOpen,
                          }));
                        }}
                        className={cn(
                          'flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-hover',
                          isCommentsOpen ? 'text-text-main font-semibold bg-surface-hover' : 'hover:text-text-main'
                        )}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Reply' : 'Replies'}` : 'Reply'}</span>
                      </button>

                      {/* Quick Share Action */}
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.origin + `/chat?tab=wall&post=${post.id}`);
                          }
                          showToast('Post link copied to clipboard!');
                        }}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-hover hover:text-text-main ml-auto"
                        title="Share Post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Expanded Comments & Replies Section */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-border-main/50 space-y-3 animate-in fade-in duration-100">
                        {/* Comments List */}
                        {comments.length > 0 && (
                          <div className="space-y-2.5">
                            {comments.map((comment) => {
                              const canDeleteComment = Boolean(
                                (user?.id && comment.authorId && user.id === comment.authorId) ||
                                (user?.name && comment.authorName && user.name.trim().toLowerCase() === comment.authorName.trim().toLowerCase()) ||
                                user?.role === 'partner'
                              );
                              return (
                                <div key={comment.id} className="flex items-start justify-between gap-2.5 bg-surface-hover/30 rounded-xl p-3 border border-border-main/40 group">
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-surface-hover border border-border-main flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                      {comment.authorName.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-text-main">{comment.authorName}</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-surface-hover text-muted-main border border-border-main/50 font-mono capitalize">
                                          {comment.authorRole.replace('_', ' ')}
                                        </span>
                                        <span className="text-[9px] text-muted-main">{formatDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-xs text-text-main whitespace-pre-wrap font-sans leading-relaxed">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>

                                  {canDeleteComment && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const success = await deleteComment(post.id, comment.id, user);
                                        if (success !== false) {
                                          showToast('Reply deleted');
                                        } else {
                                          showToast('Unauthorized to delete this reply');
                                        }
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-main hover:text-red-500 rounded transition-opacity cursor-pointer"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Reply Composer */}
                        <div className="flex items-center gap-2 pt-1 relative">
                          <div className="w-7 h-7 rounded-full bg-surface-hover border border-border-main flex items-center justify-center font-bold text-[10px] shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (!user || !(commentInputs[post.id] || '').trim()) return;
                                  addComment(post.id, commentInputs[post.id], user);
                                  setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                                  showToast('Reply added');
                                }
                              }}
                              placeholder="Write a reply or comment..."
                              className="w-full pl-3 pr-8 py-2 rounded-xl border border-border-main bg-surface-hover/40 text-xs text-text-main placeholder:text-muted-main focus:outline-none focus:border-text-main transition-colors"
                            />
                            
                            {/* Comment Emoji Picker */}
                            <div className="absolute right-2" ref={(el) => { commentEmojiRefs.current[post.id] = el; }}>
                              <button
                                type="button"
                                onClick={() => setCommentEmojiOpenPostIds((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                                className="p-1 text-muted-main hover:text-text-main transition-colors cursor-pointer"
                                title="Insert Emoji"
                              >
                                <Smile className="w-3.5 h-3.5" />
                              </button>
                              {commentEmojiOpenPostIds[post.id] && (
                                <div className="absolute right-0 bottom-full mb-2 w-56 bg-surface-main border border-border-main rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                                  <div className="text-[9px] font-mono text-muted-main uppercase tracking-wider mb-1.5 px-1">Insert Emoji</div>
                                  <div className="grid grid-cols-7 gap-1">
                                    {STUDIO_EMOJIS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => {
                                          setCommentInputs((prev) => ({
                                            ...prev,
                                            [post.id]: (prev[post.id] || '') + emoji,
                                          }));
                                          setCommentEmojiOpenPostIds((prev) => ({ ...prev, [post.id]: false }));
                                        }}
                                        className="w-6 h-6 flex items-center justify-center text-sm hover:bg-surface-hover rounded-lg transition-transform hover:scale-125 cursor-pointer"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!(commentInputs[post.id] || '').trim()}
                            onClick={() => {
                              if (!user || !(commentInputs[post.id] || '').trim()) return;
                              addComment(post.id, commentInputs[post.id], user);
                              setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                              showToast('Reply added');
                            }}
                            className="px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHAT & THREADS VIEW */}
        {activeTab === 'chat' && (
          <div className="flex h-[calc(100vh-12rem)] border border-border-main rounded-2xl overflow-hidden bg-surface-main shadow-xs">
            
            {/* LEFT SIDEBAR: THREADS & TOPIC CHANNELS */}
            <div
              className={cn(
                'w-full md:w-80 border-r border-border-main flex flex-col bg-surface-main shrink-0',
                mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'
              )}
            >
              {/* Search Bar + New Topic Button */}
              <div className="p-3 border-b border-border-main flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
                  <input
                    type="text"
                    placeholder="Search threads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-surface-hover/70 border border-border-main rounded-xl text-xs text-text-main placeholder:text-muted-main outline-hidden"
                  />
                </div>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="p-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-2xs"
                  title="Start New Topic Thread"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Subheader: Quick Action */}
              <div className="px-4 py-2 border-b border-border-main bg-surface-hover/40 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-main tracking-wider uppercase">
                  Studio Workspace
                </span>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="text-[11px] font-semibold text-accent-cyan hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>New Topic</span>
                </button>
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border-main/30">
                {/* 1. PROJECT TOPIC THREADS */}
                <div>
                  <button
                    onClick={() => setIsProjectThreadsOpen(!isProjectThreadsOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-bold text-text-main bg-surface-hover/60 tracking-wide border-b border-border-main/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-muted-main" />
                      <span>Project Topic Threads ({threads.filter((t) => t.category === 'PROJECT_TOPIC').length})</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform text-muted-main',
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
                                'p-3 flex items-start gap-3 cursor-pointer transition-all border-l-4',
                                isSelected
                                  ? 'bg-surface-hover border-l-black dark:border-l-white font-semibold'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-7 h-7 rounded-lg bg-surface-hover border border-border-main text-text-main flex items-center justify-center shrink-0 mt-0.5">
                                <Hash className="w-3.5 h-3.5" />
                              </div>
                              <div className="overflow-hidden flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-surface-hover text-text-main border border-border-main">
                                    {thread.projectCode || 'PROJECT'}
                                  </span>
                                  <span className="text-[9px] text-muted-main font-mono">
                                    {thread.participants.length} members
                                  </span>
                                </div>
                                <div className="text-xs font-semibold truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[11px] text-muted-main truncate font-sans">
                                  {lastMsg ? `${lastMsg.sender}: ${lastMsg.text}` : thread.topicName || 'Topic room ready'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* 2. DIRECT 1-ON-1 MESSAGES */}
                <div>
                  <button
                    onClick={() => setIsDirectMessagesOpen(!isDirectMessagesOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-bold text-text-main bg-surface-hover/60 tracking-wide border-b border-border-main/30 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-main" />
                      <span>Direct Messages ({threads.filter((t) => t.category === 'DIRECT_MESSAGE').length})</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform text-muted-main',
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
                                'p-3 flex items-start gap-3 cursor-pointer transition-all border-l-4',
                                isSelected
                                  ? 'bg-surface-hover border-l-black dark:border-l-white font-semibold'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-7 h-7 rounded-full bg-surface-hover border border-border-main text-text-main flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                {thread.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-muted-main">Direct Chat</span>
                                </div>
                                <div className="text-xs font-semibold truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[11px] text-muted-main truncate font-sans">
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
              {/* SLACK/DISCORD-STYLE ACTIVE THREAD HEADER BAR */}
              <div className="p-3.5 sm:p-4 border-b border-border-main flex items-center justify-between bg-surface-hover/30 shrink-0 gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => setMobileActiveView('list')}
                    className="md:hidden p-1.5 rounded-lg border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main shrink-0"
                    title="Back to Threads List"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-surface-hover border border-border-main text-text-main flex items-center justify-center shrink-0 font-bold text-xs">
                    {currentThread?.category === 'DIRECT_MESSAGE' ? (
                      currentThread?.name?.charAt(0) || 'D'
                    ) : (
                      <Hash className="w-4 h-4 text-accent-cyan" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      {currentThread?.projectCode && (
                        <button
                          onClick={() => router.push(`/projects?code=${currentThread.projectCode}`)}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-surface-hover hover:bg-border-main text-text-main border border-border-main rounded transition-colors cursor-pointer"
                          title="Open Project Vault"
                        >
                          Project: {currentThread.projectCode} ↗
                        </button>
                      )}
                      <span className="text-[10px] text-muted-main capitalize">
                        {currentThread?.category?.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold text-text-main truncate mt-0.5">
                      {currentThread?.name}
                    </h2>
                  </div>
                </div>

                {/* Right Header Actions: Member Stack, + Add Member, Gallery Drawer */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Interactive Member Avatars Stack with Roster Popover */}
                  <div className="relative" ref={rosterRef}>
                    <div
                      onClick={() => setIsMembersRosterOpen(!isMembersRosterOpen)}
                      className="flex items-center -space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
                      title="View thread participants roster"
                    >
                      {currentThread?.participants.slice(0, 4).map((pName, i) => {
                        const contact = ALL_STUDIO_MEMBERS.find((m) => m.name === pName);
                        return (
                          <div
                            key={i}
                            className={cn(
                              'w-7 h-7 rounded-full border-2 border-surface-main text-white flex items-center justify-center text-[10px] font-bold shadow-xs',
                              contact?.avatarColor || 'bg-accent-cyan text-black'
                            )}
                            title={pName}
                          >
                            {pName.replace('Arch. ', '').replace('Engr. ', '').charAt(0)}
                          </div>
                        );
                      })}
                      {currentThread && currentThread.participants.length > 4 && (
                        <div className="w-7 h-7 rounded-full border-2 border-surface-main bg-surface-hover text-text-main flex items-center justify-center text-[9px] font-bold shadow-xs font-mono">
                          +{currentThread.participants.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Member Roster Popover */}
                    {isMembersRosterOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-surface-main border border-border-main rounded-2xl shadow-2xl p-4 z-40 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between border-b border-border-main pb-2.5">
                          <div>
                            <h4 className="text-xs font-bold text-text-main">
                              Thread Members ({currentThread?.participants.length})
                            </h4>
                            <p className="text-[10px] text-muted-main">Active contributors in this topic</p>
                          </div>
                          <button
                            onClick={() => setIsMembersRosterOpen(false)}
                            className="p-1 text-muted-main hover:text-text-main cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                          {currentThread?.participants.map((pName) => {
                            const contact = ALL_STUDIO_MEMBERS.find((m) => m.name === pName);
                            return (
                              <div
                                key={pName}
                                className="flex items-center justify-between p-2 rounded-xl bg-surface-hover/50 border border-border-main/50"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0',
                                      contact?.avatarColor || 'bg-accent-cyan text-black'
                                    )}
                                  >
                                    {pName.replace('Arch. ', '').replace('Engr. ', '').charAt(0)}
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="text-xs font-semibold text-text-main truncate">{pName}</div>
                                    <div className="text-[10px] text-muted-main truncate">
                                      {contact?.role || 'Contributor'}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-main border border-border-main text-muted-main font-mono shrink-0">
                                  {contact?.roleBadge || 'Member'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => {
                            setIsMembersRosterOpen(false);
                            setIsAddMemberModalOpen(true);
                          }}
                          className="w-full py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Members to Thread</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* + Add Member Header Action Button */}
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                    title="Invite members to this topic thread"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-accent-cyan" />
                    <span className="hidden sm:inline">Add Member</span>
                  </button>

                  {/* Toggle Thread Drawing Gallery Drawer */}
                  <button
                    onClick={() => setIsGalleryDrawerOpen(!isGalleryDrawerOpen)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-2xs',
                      isGalleryDrawerOpen
                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                        : 'border-border-main hover:bg-surface-hover text-text-main'
                    )}
                    title="Open Blueprint & Drawing Gallery for this Thread"
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Blueprints ({threadMediaList.length})</span>
                  </button>
                </div>
              </div>

              {/* Chat Body & Media Gallery Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Message Stream */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-main">
                    {activeMessages.map((msg) => {
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="w-full flex items-center justify-center my-3">
                            <div className="px-3.5 py-1.5 rounded-full bg-surface-hover border border-border-main text-[11px] text-muted-main font-semibold flex items-center gap-2 shadow-2xs">
                              <Info className="w-3.5 h-3.5 text-muted-main" />
                              <span>{msg.text}</span>
                              <span className="text-[10px] font-mono opacity-60">· {msg.timestamp}</span>
                            </div>
                          </div>
                        );
                      }

                      const isMe =
                        msg.sender === (user?.name || 'Arch. Leandro Locsin') ||
                        msg.sender === 'Arch. Leandro Locsin';

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex gap-2.5 max-w-xl group/msg relative',
                            isMe ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                          )}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-surface-hover border border-border-main flex items-center justify-center text-[10px] font-bold text-text-main shrink-0 mt-1 shadow-2xs">
                              {msg.sender.replace('Arch. ', '').replace('Engr. ', '').charAt(0)}
                            </div>
                          )}

                          <div className={cn('space-y-1 relative', isMe ? 'items-end' : 'items-start')}>
                            <div
                              className={cn(
                                'flex items-center gap-2 text-[10px] text-muted-main px-1',
                                isMe ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <span className="font-semibold text-text-main">{msg.sender}</span>
                              <span className="font-mono">{msg.timestamp}</span>
                            </div>

                            {/* Message Card */}
                            <div
                              className={cn(
                                'p-3.5 rounded-2xl text-xs font-sans leading-relaxed border space-y-2 shadow-2xs relative',
                                isMe
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-medium'
                                  : 'bg-surface-hover text-text-main border-border-main'
                              )}
                            >
                              {/* HOVER SLACK/DISCORD-STYLE REACTION BAR */}
                              <div
                                className={cn(
                                  'opacity-0 group-hover/msg:opacity-100 transition-opacity absolute -top-3.5 bg-surface-main border border-border-main rounded-xl px-1.5 py-0.5 shadow-md flex items-center gap-0.5 z-20',
                                  isMe ? 'left-2' : 'right-2'
                                )}
                              >
                                {['👍', '📐', '✅', '👀', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                    className="p-1 hover:bg-surface-hover rounded-md text-xs transition-transform hover:scale-125 cursor-pointer"
                                    title={`React ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              {msg.attachment && (
                                <div className="rounded-xl overflow-hidden border border-border-main/50 bg-black/10 dark:bg-white/10 p-2 space-y-2">
                                  <div className="text-[10px] font-semibold flex items-center justify-between gap-2">
                                    <span className="truncate">{msg.attachmentTitle || 'Attached Blueprint'}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => setLightboxImage({ src: msg.attachment!, title: msg.attachmentTitle })}
                                        className="p-1 rounded hover:bg-black/20 text-text-main cursor-pointer"
                                        title="Maximize preview"
                                      >
                                        <Maximize2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleRedlineInSketch(msg.attachment!, msg.attachmentTitle)}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      >
                                        <PenTool className="w-3 h-3" />
                                        <span>Redline</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() => setLightboxImage({ src: msg.attachment!, title: msg.attachmentTitle })}
                                    className="cursor-pointer group relative overflow-hidden rounded-lg"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={msg.attachment}
                                      alt="Attachment"
                                      className="max-h-60 w-full rounded-lg object-contain bg-white transition-transform group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                      <Maximize2 className="w-4 h-4" />
                                      <span>Click to enlarge</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {msg.text && <div>{msg.text}</div>}
                            </div>

                            {/* ACTIVE EMOJI REACTION PILLS */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className={cn('flex flex-wrap items-center gap-1 pt-0.5', isMe ? 'justify-end' : 'justify-start')}>
                                {Object.entries(msg.reactions).map(([emoji, users]) => {
                                  const hasMe = users.includes(user?.name || 'Arch. Leandro Locsin');
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleToggleReaction(msg.id, emoji)}
                                      className={cn(
                                        'px-2 py-0.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs',
                                        hasMe
                                          ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold'
                                          : 'bg-surface-hover/80 border-border-main text-muted-main hover:text-text-main'
                                      )}
                                      title={`Reacted by: ${users.join(', ')}`}
                                    >
                                      <span>{emoji}</span>
                                      <span className="font-mono text-[10px]">{users.length}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {activeMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                        <MessageSquare className="w-10 h-10 text-muted-main/40" />
                        <p className="text-xs text-muted-main font-mono">
                          This topic thread is ready for discussion. Send a message below.
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
                        <span className="text-[10px] font-semibold text-accent-cyan">
                          Sketch / Blueprint attached
                        </span>
                      </div>
                      <button
                        onClick={() => setAttachedImage(null)}
                        className="p-1 rounded-lg text-muted-main hover:text-text-main cursor-pointer"
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
                      className="p-2.5 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors shrink-0 cursor-pointer shadow-2xs"
                      title="Attach Blueprint or Photo"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Chat Emoji Picker */}
                    <div className="relative" ref={chatEmojiRef}>
                      <button
                        type="button"
                        onClick={() => setIsChatEmojiOpen(!isChatEmojiOpen)}
                        className={cn(
                          "p-2.5 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors shrink-0 cursor-pointer shadow-2xs",
                          isChatEmojiOpen && "bg-surface-hover text-text-main border-text-main"
                        )}
                        title="Insert Emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      {isChatEmojiOpen && (
                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-surface-main border border-border-main rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in duration-100">
                          <div className="text-[10px] font-mono text-muted-main uppercase tracking-wider mb-2 px-1">Insert Emoji</div>
                          <div className="grid grid-cols-8 gap-1">
                            {STUDIO_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleInsertChatEmoji(emoji)}
                                className="w-7 h-7 flex items-center justify-center text-base hover:bg-surface-hover rounded-lg transition-transform hover:scale-125 cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder={`Send a message to ${currentThread?.name || 'thread'}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 bg-surface-hover border border-border-main rounded-xl px-4 py-2.5 text-xs font-sans text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() && !attachedImage}
                      className="p-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-xs cursor-pointer active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* THREAD DRAWING & MEDIA GALLERY SLIDE-OUT DRAWER */}
                {isGalleryDrawerOpen && (
                  <div className="w-72 border-l border-border-main bg-surface-main flex flex-col shrink-0 animate-in slide-in-from-right-4">
                    <div className="p-3.5 border-b border-border-main flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Images className="w-4 h-4 text-accent-cyan" />
                        <span className="text-xs font-bold text-text-main">
                          Thread Media
                        </span>
                      </div>
                      <button
                        onClick={() => setIsGalleryDrawerOpen(false)}
                        className="p-1 rounded text-muted-main hover:text-text-main cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 border-b border-border-main bg-surface-hover/30 text-[10px] text-muted-main font-semibold">
                      Blueprints &amp; Markups ({threadMediaList.length})
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {threadMediaList.length === 0 ? (
                        <div className="text-center py-10 text-xs text-muted-main italic">
                          No media attachments shared yet
                        </div>
                      ) : (
                        threadMediaList.map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-xl border border-border-main bg-surface-hover/60 space-y-2 shadow-2xs"
                          >
                            <div
                              onClick={() => setLightboxImage({ src: m.attachment!, title: m.attachmentTitle })}
                              className="aspect-video bg-white rounded-lg overflow-hidden border border-border-main cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.attachment!} alt="Drawing" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-[11px] font-semibold text-text-main truncate">
                              {m.attachmentTitle || 'Drawing Attachment'}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-main">
                              <span>By: {m.sender}</span>
                              <span className="font-mono">{m.timestamp}</span>
                            </div>
                            <button
                              onClick={() => handleRedlineInSketch(m.attachment!, m.attachmentTitle)}
                              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <PenTool className="w-3 h-3" />
                              <span>Redline in Sketch</span>
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

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
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
  Trash2,
  Hash,
  Tag,
  Users,
  X,
  PlusCircle,
  FolderKanban,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRESET_ACCOUNTS, MOCK_PROJECTS } from '@/lib/constants';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
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
  const [activeTab, setActiveTab] = useState<'wall' | 'chat'>('chat');
  const [postContent, setPostContent] = useState('');
  const { user } = useAuth();
  const { posts, addPost } = useWallPosts();

  // Threads & Topics State
  const [threads, setThreads] = useState<ThreadChannel[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(INITIAL_THREADS[0].id);

  // Chat Messages State per Thread
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'thread-001': [
      {
        id: 'msg-1',
        sender: 'Arch. Testing2',
        text: 'Hi Arch. Testing3! Have you checked the latest testing chat for Makati Tower floor 14-16 massing model?',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-2',
        sender: 'Arch. Testing3',
        text: 'Yes Arch. Testing2! Testing chat: The cantilever looks great. I am finishing the schematic drawings set for review.',
        timestamp: '10:20 AM',
      },
      {
        id: 'msg-3',
        sender: 'Arch. Testing1',
        text: 'Testing chat report: Great progress team. Please make sure all PDF revisions are ready for tomorrow briefing.',
        timestamp: '10:35 AM',
      },
    ],
    'thread-002': [
      {
        id: 'msg-4',
        sender: 'Engr. Testing4',
        text: 'Testing chat: For Casa Verde, we received 3 marble samples for the foyer. Will upload specs.',
        timestamp: '09:45 AM',
      },
      {
        id: 'msg-5',
        sender: 'Arch. Testing3',
        text: 'Testing chat: Received Engr. Testing4. Let us schedule a material board review with Arch. Testing1.',
        timestamp: '09:50 AM',
      },
    ],
    'thread-003': [
      {
        id: 'msg-6',
        sender: 'Engr. Testing4',
        text: 'Testing chat: Foundation soil test and city permits are ready for submission.',
        timestamp: '08:30 AM',
      },
    ],
    'dm-001': [
      {
        id: 'msg-7',
        sender: 'Arch. Testing2',
        text: 'Testing chat: Please review the HR overtime approval when you get a chance.',
        timestamp: '11:00 AM',
      },
    ],
    'dm-002': [
      {
        id: 'msg-8',
        sender: 'Engr. Testing4',
        text: 'Testing chat: Direct chat channel active for structural coordination.',
        timestamp: '11:30 AM',
      },
    ],
  });

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
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: user?.name ? user.name : 'Arch. Testing3',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [currentThread.id]: [...(prev[currentThread.id] || []), newMsg],
    }));
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleCreateTopicThread = () => {
    if (!newTopicName.trim()) {
      alert('THREAD / TOPIC NAME IS REQUIRED.');
      return;
    }

    const matchedProject = MOCK_PROJECTS.find((p) => p.code === newTopicProject);
    const newId = 'thread-' + Date.now();
    const createdThread: ThreadChannel = {
      id: newId,
      name: `[${newTopicProject}] ${newTopicName.toUpperCase()}`,
      category: 'PROJECT_TOPIC',
      projectCode: newTopicProject,
      projectName: matchedProject?.name || 'Studio Project',
      topicName: newTopicName,
      participants: [user?.name || 'Arch. Testing3', newTopicParticipant],
    };

    setThreads((prev) => [createdThread, ...prev]);

    if (initialNote.trim()) {
      setMessages((prev) => ({
        ...prev,
        [newId]: [
          {
            id: 'msg-init-' + Date.now(),
            sender: user?.name || 'Arch. Testing3',
            text: `[TOPIC INITIALIZED] ${initialNote.trim()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
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

  return (
    <div className="flex flex-col h-full bg-bg-main text-text-main font-mono transition-colors pb-8 relative">
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
          <div className="flex flex-col md:flex-row h-[calc(100vh-13rem)] min-h-[500px] border border-border-main bg-surface-main rounded-2xl overflow-hidden shadow-sm">
            {/* LEFT SIDEBAR: THREADS & TOPICS */}
            <div className="w-full md:w-80 border-r border-border-main bg-surface-main flex flex-col shrink-0">
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

              {/* Threads & Channels List Accordion */}
              <div className="flex-1 overflow-y-auto divide-y divide-border-main/30">
                {/* 1. PROJECT TOPIC THREADS SECTION (Refined Corporate Slate Colors) */}
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
                              onClick={() => setSelectedThreadId(thread.id)}
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
                              onClick={() => setSelectedThreadId(thread.id)}
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
            <div className="flex-1 flex flex-col bg-surface-main">
              {/* Header Bar for Active Thread */}
              <div className="p-4 border-b border-border-main flex items-center justify-between bg-surface-hover/30">
                <div className="flex items-center gap-3 overflow-hidden">
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
                    {currentThread.topicName && (
                      <p className="text-[10px] text-muted-main flex items-center gap-1 uppercase truncate font-sans">
                        <Tag className="w-3 h-3 text-muted-main" />
                        <span>TOPIC: {currentThread.topicName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsTopicModalOpen(true)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-border-main hover:bg-surface-hover rounded-xl text-xs font-bold uppercase tracking-wider text-text-main transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>NEW TOPIC</span>
                  </button>
                  <button className="p-2 rounded-xl hover:bg-surface-hover text-muted-main hover:text-text-main">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-main">
                {activeMessages.map((msg) => {
                  const isMe = msg.sender === (user?.name || 'Arch. Testing3') || msg.sender === 'Arch. Testing3';

                  return (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col max-w-xl space-y-1', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-main px-1">
                        <span>{msg.sender}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={cn(
                          'p-4 rounded-2xl text-xs font-sans leading-relaxed shadow-2xs border',
                          isMe
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-medium'
                            : 'bg-surface-hover text-text-main border-border-main'
                        )}
                      >
                        {msg.text}
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

              {/* Chat Input Field Bar */}
              <div className="p-4 border-t border-border-main bg-surface-main flex items-center gap-3">
                <button className="p-2 rounded-xl border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors shrink-0">
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
                  disabled={!chatInput.trim()}
                  className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

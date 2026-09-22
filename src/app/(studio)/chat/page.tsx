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
    projectName: 'Makati Tower Phase 2',
    topicName: 'Schematic Revision & 3D Massing Review',
    participants: ['TESTING3', 'ARCH. MARIA CRUZ'],
  },
  {
    id: 'thread-002',
    name: '[CV-2024] MATERIAL BOARD & MARBLE SPECS',
    category: 'PROJECT_TOPIC',
    projectCode: 'CV-2024',
    projectName: 'Casa Verde Residence',
    topicName: 'Italian Marble & Timber Veneer Selection',
    participants: ['TESTING3', 'ENGR. ANA VILLANUEVA'],
  },
  {
    id: 'thread-003',
    name: '[BCP-2024] STRUCTURAL PERMIT & BEAMS',
    category: 'PROJECT_TOPIC',
    projectCode: 'BCP-2024',
    projectName: 'BGC Cultural Pavilion',
    topicName: 'Foundation Soil Test & City Permits',
    participants: ['TESTING3', 'ARCH. DIEGO REYES'],
  },
  {
    id: 'dm-001',
    name: 'ARCH. MARIA CRUZ',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Communication',
    participants: ['TESTING3', 'ARCH. MARIA CRUZ'],
  },
  {
    id: 'dm-002',
    name: 'ENGR. ANA VILLANUEVA',
    category: 'DIRECT_MESSAGE',
    topicName: 'Direct 1-on-1 Communication',
    participants: ['TESTING3', 'ENGR. ANA VILLANUEVA'],
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
        sender: 'ARCH. MARIA CRUZ',
        text: 'Hi! Have you checked the latest 3D massing model for Makati Tower floor 14-16?',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-2',
        sender: 'TESTING3',
        text: 'Yes! The cantilever looks great. I am finishing the schematic drawings set for review.',
        timestamp: '10:20 AM',
      },
    ],
    'thread-002': [
      {
        id: 'msg-3',
        sender: 'ENGR. ANA VILLANUEVA',
        text: 'For Casa Verde, we received 3 marble samples for the foyer. Will upload specs.',
        timestamp: '09:45 AM',
      },
    ],
    'dm-001': [
      {
        id: 'msg-4',
        sender: 'ARCH. MARIA CRUZ',
        text: 'Please review the HR overtime approval when you get a chance.',
        timestamp: '11:00 AM',
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
  const [newTopicParticipant, setNewTopicParticipant] = useState(PRESET_ACCOUNTS[1]?.name || 'ARCH. MARIA CRUZ');
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
      sender: user?.name ? user.name.toUpperCase() : 'TESTING3',
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
      name: `[${newTopicProject}] ${newTopicName.trim().toUpperCase()}`,
      category: 'PROJECT_TOPIC',
      projectCode: newTopicProject,
      projectName: matchedProject?.name || 'Studio Project',
      topicName: newTopicName.trim(),
      participants: [user?.name?.toUpperCase() || 'TESTING3', newTopicParticipant.toUpperCase()],
    };

    setThreads((prev) => [createdThread, ...prev]);

    // Initial message if typed
    if (initialNote.trim()) {
      setMessages((prev) => ({
        ...prev,
        [newId]: [
          {
            id: 'msg-init-' + Date.now(),
            sender: user?.name ? user.name.toUpperCase() : 'TESTING3',
            text: initialNote.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }

    setSelectedThreadId(newId);
    setIsTopicModalOpen(false);

    // Reset Form
    setNewTopicName('');
    setInitialNote('');
  };

  const handleClearMessages = () => {
    setMessages((prev) => ({ ...prev, [currentThread.id]: [] }));
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
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-border-main mb-4">
        <button
          className={cn(
            'px-6 py-4 uppercase font-extrabold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors',
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
            'px-6 py-4 uppercase font-extrabold text-xs tracking-wider border-b-2 -mb-[2px] transition-colors flex items-center gap-2',
            activeTab === 'chat'
              ? 'border-text-main text-text-main font-extrabold'
              : 'border-transparent text-muted-main hover:text-text-main'
          )}
          onClick={() => setActiveTab('chat')}
        >
          <span>CHAT & THREADS</span>
          <span className="bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan px-2 py-0.5 rounded text-[10px]">
            {threads.length} TOPICS
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* ESTUDIO WALL VIEW */}
        {activeTab === 'wall' && (
          <div className="max-w-2xl mx-auto space-y-8 pt-4">
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
            </div>
          </div>
        )}

        {/* CHAT & TOPIC THREADS VIEW */}
        {activeTab === 'chat' && (
          <div className="flex flex-col md:flex-row h-[calc(100vh-13rem)] min-h-[500px] border border-border-main bg-surface-main rounded-xl overflow-hidden shadow-sm">
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
                    className="w-full bg-surface-hover/70 border border-border-main rounded-md py-1.5 pl-8 pr-3 text-xs font-mono text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                  />
                </div>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity text-xs font-bold uppercase tracking-wider shrink-0"
                  title="Create New Topic Thread"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>THREAD</span>
                </button>
              </div>

              {/* Subheader: START TOPIC THREAD quick action */}
              <div className="p-3 border-b border-border-main/50 bg-surface-hover/30 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-main">
                  STUDIO WORKSPACE THREADS
                </span>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="text-[10px] font-bold text-accent-cyan uppercase hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ NEW TOPIC</span>
                </button>
              </div>

              {/* Threads & Channels List Accordion */}
              <div className="flex-1 overflow-y-auto divide-y divide-border-main/30">
                {/* 1. PROJECT TOPIC THREADS SECTION */}
                <div>
                  <button
                    onClick={() => setIsProjectThreadsOpen(!isProjectThreadsOpen)}
                    className="w-full px-4 py-2 flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 uppercase tracking-wider border-b border-border-main/30"
                  >
                    <span className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5" />
                      PROJECT TOPIC THREADS ({threads.filter((t) => t.category === 'PROJECT_TOPIC').length})
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform',
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
                                  ? 'bg-surface-hover border-l-black dark:border-l-white shadow-2xs'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Hash className="w-4 h-4" />
                              </div>
                              <div className="overflow-hidden flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-surface-hover border border-border-main text-muted-main rounded">
                                    {thread.projectCode || 'PROJECT'}
                                  </span>
                                  <span className="text-[9px] font-bold text-muted-main">
                                    {thread.participants.length} USERS
                                  </span>
                                </div>
                                <div className="text-xs font-extrabold uppercase truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[10px] text-muted-main truncate">
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
                    className="w-full px-4 py-2 flex items-center justify-between text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 uppercase tracking-wider border-b border-border-main/30"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      DIRECT MESSAGES ({threads.filter((t) => t.category === 'DIRECT_MESSAGE').length})
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform',
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
                            t.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                                'p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4',
                                isSelected
                                  ? 'bg-surface-hover border-l-black dark:border-l-white shadow-2xs'
                                  : 'hover:bg-surface-hover/50 border-l-transparent'
                              )}
                            >
                              <div className="w-9 h-9 rounded-full bg-surface-hover border border-border-strong flex items-center justify-center shrink-0 font-bold uppercase text-xs text-text-main">
                                {thread.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden flex-1">
                                <div className="text-[10px] font-bold text-muted-main uppercase tracking-wider">
                                  1-ON-1 CHAT
                                </div>
                                <div className="text-xs font-extrabold uppercase truncate text-text-main">
                                  {thread.name}
                                </div>
                                <div className="text-[10px] text-muted-main truncate">
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

            {/* MAIN CHAT THREAD CONVERSATION PANEL */}
            <div className="flex-1 flex flex-col bg-surface-main">
              {/* Active Thread Header Banner (Displays Topic, Project & Participants) */}
              <div className="p-4 border-b border-border-main bg-surface-main flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentThread.projectCode && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-extrabold uppercase tracking-wider">
                        PROJECT: {currentThread.projectCode}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-surface-hover border border-border-main text-muted-main rounded text-[10px] font-bold uppercase tracking-wider">
                      {currentThread.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-text-main flex items-center gap-2">
                    <Hash className="w-4 h-4 text-accent-cyan" />
                    <span>{currentThread.name}</span>
                  </h2>
                  {currentThread.topicName && (
                    <p className="text-xs text-muted-main font-sans flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-muted-main shrink-0" />
                      <span>TOPIC: {currentThread.topicName}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[10px] text-right font-bold text-muted-main uppercase hidden lg:block">
                    <div>TOPIC PARTICIPANTS:</div>
                    <div className="text-text-main font-mono">{currentThread.participants.join(', ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-main hover:text-text-main border border-border-main rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleClearMessages}
                      className="p-2 text-muted-main hover:text-accent-red border border-border-main rounded-lg transition-colors"
                      title="Clear Thread Messages"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-main">
                    <Hash className="w-10 h-10 opacity-30" />
                    <p className="text-xs uppercase tracking-widest italic font-bold">
                      NO MESSAGES YET IN THIS TOPIC THREAD
                    </p>
                    <p className="text-[11px] max-w-sm">
                      Start the topic conversation by sending a message below with your team.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isSelf = msg.sender === (user?.name ? user.name.toUpperCase() : 'TESTING3');
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex flex-col max-w-lg', isSelf ? 'ml-auto items-end' : 'mr-auto items-start')}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-muted-main uppercase font-bold mb-1">
                          <span>{msg.sender}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={cn(
                            'p-3.5 rounded-xl text-xs leading-relaxed font-sans shadow-xs',
                            isSelf
                              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                              : 'bg-surface-hover border border-border-main text-text-main'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Footer Bar */}
              <div className="p-4 border-t border-border-main flex items-center gap-3 bg-surface-main">
                <button className="p-2.5 border border-border-main hover:bg-surface-hover text-muted-main hover:text-text-main rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="px-3.5 py-2.5 border border-border-main hover:bg-surface-hover text-xs font-bold uppercase tracking-wider text-muted-main hover:text-text-main rounded-lg transition-colors flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  <span>STICKER</span>
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Send message in ${currentThread.name}...`}
                  className="flex-1 bg-surface-hover/40 border border-border-main rounded-lg py-2.5 px-4 font-mono text-xs text-text-main focus:outline-none focus:border-text-main placeholder:text-muted-main/60"
                />

                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 shadow-sm"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW TOPIC THREAD MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-[#262626] border border-[#3F3F46] w-full max-w-lg rounded-2xl shadow-2xl p-7 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#3F3F46] pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#E4E4E7]">
                  START NEW TOPIC THREAD
                </h3>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  TOPIC / THREAD TITLE *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="E.G. FACADE GLASS SPECIFICATIONS"
                  className="w-full bg-[#18181B] border-2 border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                    TAG PROJECT
                  </label>
                  <select
                    value={newTopicProject}
                    onChange={(e) => setNewTopicProject(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                  >
                    {MOCK_PROJECTS.map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                    CONNECT WITH USER *
                  </label>
                  <select
                    value={newTopicParticipant}
                    onChange={(e) => setNewTopicParticipant(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                  >
                    {PRESET_ACCOUNTS.map((acc) => (
                      <option key={acc.email} value={acc.name.toUpperCase()}>
                        {acc.name.toUpperCase()} ({acc.role.replace('_', ' ').toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  INITIAL TOPIC NOTE / MESSAGE (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder="Share context or questions for this topic thread..."
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none resize-none placeholder-[#52525B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCreateTopicThread}
                className="py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                CREATE THREAD
              </button>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="py-3 bg-[#3F3F46]/60 border border-[#52525B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-[#3F3F46] transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


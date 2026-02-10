import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatState, CompanionMood } from './types';
import { initializeChat, sendMessageToGemini, resetChat } from './services/geminiService';
import { WELCOME_MESSAGE } from './constants';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import Avatar from './components/Avatar';
import { Sparkles, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        text: WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ],
    isLoading: false,
    error: null,
  });

  const [mood, setMood] = useState<CompanionMood>(CompanionMood.NEUTRAL);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat service on mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const handleSendMessage = async (text: string, image?: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      image,
      timestamp: Date.now(),
    };

    // Update UI with user message
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true,
      error: null,
    }));
    setMood(CompanionMood.THINKING);

    try {
      const responseText = await sendMessageToGemini(text, image);

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newBotMessage],
        isLoading: false,
      }));
      setMood(CompanionMood.HAPPY); // Happy when responding
      
      // Reset mood to neutral after a few seconds
      setTimeout(() => setMood(CompanionMood.NEUTRAL), 3000);

    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Oops! I lost my train of thought. Can you try again?",
      }));
      setMood(CompanionMood.WAITING);
    }
  };

  const handleReset = () => {
    if (window.confirm("Do you want to start a new topic? This will clear our current chat.")) {
      resetChat();
      setChatState({
        messages: [
          {
            id: Date.now().toString(),
            role: 'model',
            text: "Ready for a new adventure! What's next?",
            timestamp: Date.now(),
          },
        ],
        isLoading: false,
        error: null,
      });
      setMood(CompanionMood.HAPPY);
      setTimeout(() => setMood(CompanionMood.NEUTRAL), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-100 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-accent-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-white/70 sticky top-0 border-b border-primary-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-500 rounded-xl text-white shadow-lg shadow-accent-500/30">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Leo</h1>
            <p className="text-xs text-slate-500 font-semibold">Your Learning Companion</p>
          </div>
        </div>
        
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-accent-600 transition-colors shadow-sm"
        >
          <RefreshCcw size={14} />
          <span>New Topic</span>
        </button>
      </header>

      {/* Main Content Area - Split View on Large Screens if needed, but keeping it simple focused stack */}
      <main className="flex-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Avatar Section - Sticky on top or floating */}
        <div className="flex justify-center py-6 shrink-0">
          <Avatar mood={mood} />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 scroll-smooth" id="chat-container">
          <div className="max-w-4xl mx-auto">
            {chatState.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {chatState.isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm ml-14 mb-4 animate-pulse">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-3
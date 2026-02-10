import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatState, CompanionMood } from './types';
import { initializeChat, sendMessageToGemini, resetChat, generateSpeech, getFunFact } from './services/geminiService';
import { WELCOME_MESSAGE } from './constants';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import Avatar from './components/Avatar';
import FunFactCard from './components/FunFactCard';
import { Sparkles, RefreshCcw, Volume2, VolumeX, Lightbulb } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize chat service on mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Handle Audio Playback
  const playAudio = async (base64String: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      
      // Resume if suspended (browser policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Stop previous
      stopAudio();

      // Decode Base64 to ArrayBuffer
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      
      // Play
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      
      audioSourceRef.current = source;
      setIsSpeaking(true);
      source.start(0);

    } catch (e) {
      console.error("Audio playback error", e);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopAudio();
    }
    setIsMuted(!isMuted);
  };

  const handleGetFunFact = async (context?: string) => {
    // Don't show if already loading chat
    if (chatState.isLoading) return;

    setFunFact(null);
    const fact = await getFunFact(context);
    setFunFact(fact);

    if (!isMuted) {
      generateSpeech(fact).then((audioData) => {
        if (audioData) playAudio(audioData);
      });
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    stopAudio(); // Stop any current speech when new interaction starts
    setFunFact(null); // Clear previous fact if any

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

    const currentInteractionCount = interactionCount + 1;
    setInteractionCount(currentInteractionCount);

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
      setMood(CompanionMood.HAPPY);
      
      // Generate and play speech if not muted
      if (!isMuted) {
        // We do this in parallel to mood reset to not block UI
        generateSpeech(responseText).then((audioData) => {
           if (audioData) {
             playAudio(audioData);
           }
        });
      }

      // Check if we should trigger a fun fact automatically (e.g., every 5 messages)
      if (currentInteractionCount % 5 === 0) {
        setTimeout(() => {
          handleGetFunFact(text); // Use current topic as context
        }, 5000); // Small delay after the answer
      }

      // Reset mood to neutral after a few seconds (unless speaking, but Avatar handles that override visually)
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
      stopAudio();
      setFunFact(null);
      setInteractionCount(0);
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
        
        <div className="flex items-center gap-2">
          {/* Fun Fact Button */}
          <button
            onClick={() => handleGetFunFact()}
            className="p-2 rounded-full text-accent-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            title="Spark Curiosity"
          >
            <Lightbulb size={20} />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1"></div>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-colors ${isMuted ? 'text-slate-400 bg-slate-100' : 'text-primary-600 bg-primary-50'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-accent-600 transition-colors shadow-sm"
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">New Topic</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full overflow-hidden">
        
        {/* Avatar Section */}
        <div className="flex justify-center py-6 shrink-0">
          <Avatar mood={mood} isSpeaking={isSpeaking} />
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
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-300"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fun Fact Popup */}
        {funFact && <FunFactCard fact={funFact} onClose={() => setFunFact(null)} />}

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />

      </main>
    </div>
  );
};

export default App;
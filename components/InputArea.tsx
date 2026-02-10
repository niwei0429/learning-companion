import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    
    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    setSpeechError(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        // use abort() to stop immediately and stop listening to incoming audio
        recognitionRef.current.abort(); 
      } catch (e) {
        // Ignore errors if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    setSpeechError(null);
    
    // Stop any existing instance
    if (recognitionRef.current) {
      stopListening();
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false; // Keep false to avoid complex state management for now
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => {
        const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + spacer + transcript;
      });
      // Automatically stop after one sentence/result if continuous is false
      // UI update happens in onend
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      
      if (event.error === 'aborted') {
        // User stopped manually, no error
        return;
      }

      switch (event.error) {
        case 'network':
          setSpeechError("Connection trouble. Please type your message.");
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          setSpeechError("Microphone access denied. Please allow permissions.");
          break;
        case 'no-speech':
          // Don't show error for no speech, just stop
          break;
        default:
          setSpeechError(`Voice input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Don't nullify ref here immediately if we want to restart, 
      // but since continuous=false, we are done.
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition", err);
      setSpeechError("Could not start voice input.");
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isLoading) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pb-4">
      {/* Image Preview */}
      {selectedImage && (
        <div className="mb-2 relative inline-block animate-fade-in-up">
          <div className="relative rounded-xl overflow-hidden border-2 border-primary-200 shadow-md h-24 w-24">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className={`relative flex items-end gap-2 bg-white p-2 rounded-3xl shadow-lg border transition-shadow focus-within:shadow-xl focus-within:border-primary-300 ${speechError ? 'border-red-300 ring-2 ring-red-50' : 'border-primary-100'}`}>
        
        {/* Image Upload Button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-all"
          title="Upload an image"
          disabled={isLoading}
        >
          <ImageIcon size={24} />
        </button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Type your question or problem here..."}
          className="flex-1 max-h-32 py-3 px-2 bg-transparent border-none focus:ring-0 resize-none text-slate-700 placeholder-slate-400 leading-relaxed scrollbar-thin scrollbar-thumb-primary-200"
          rows={1}
          disabled={isLoading}
        />

        {/* Mic Button */}
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50'}`}
          title="Speak"
          disabled={isLoading}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !selectedImage) || isLoading}
          className={`p-3 rounded-full transition-all duration-200 
            ${(!inputText.trim() && !selectedImage) || isLoading 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-accent-500 hover:bg-accent-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </div>
      
      {/* Error Message */}
      {speechError && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-red-500 font-medium animate-fade-in">
          <AlertCircle size={12} />
          <span>{speechError}</span>
        </div>
      )}
      
      <div className="text-center mt-2">
         {!speechError && <p className="text-xs text-slate-400 font-medium">Leo guides you step-by-step. Let's think together!</p>}
      </div>
    </div>
  );
};

export default InputArea;
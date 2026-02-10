import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Icon/Avatar Bubble */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-primary-100 text-primary-600'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Message Bubble */}
        <div 
          className={`relative px-5 py-4 rounded-2xl shadow-sm text-base leading-relaxed break-words
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
            }
          `}
        >
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
              <img src={message.image} alt="Uploaded content" className="max-w-full h-auto max-h-60 object-contain" />
            </div>
          )}
          
          <div className={`markdown-content ${isUser ? 'text-indigo-50' : 'text-slate-700'}`}>
             <ReactMarkdown
               components={{
                 // Tailor markdown rendering for chat
                 p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                 ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                 ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                 li: ({node, ...props}) => <li className="mb-1" {...props} />,
                 code: ({node, ...props}) => <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-indigo-700' : 'bg-slate-200'} font-mono text-sm`} {...props} />,
               }}
             >
               {message.text}
             </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
import React from 'react';
import { Lightbulb, X } from 'lucide-react';

interface FunFactCardProps {
  fact: string;
  onClose: () => void;
}

const FunFactCard: React.FC<FunFactCardProps> = ({ fact, onClose }) => {
  return (
    <div className="absolute bottom-24 right-4 md:right-8 z-20 max-w-sm w-full animate-fade-in-up">
       <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-5 rounded-2xl shadow-xl border-4 border-white/30 relative overflow-hidden transform hover:scale-[1.02] transition-transform">
          {/* Background pattern */}
          <div className="absolute -right-6 -top-6 text-white/10 rotate-12 pointer-events-none">
            <Lightbulb size={140} />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 font-extrabold text-yellow-100 uppercase tracking-widest text-xs bg-black/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Lightbulb size={14} className="text-yellow-300" />
                <span>Did you know?</span>
              </div>
              <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
                aria-label="Close fact"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="font-bold text-lg md:text-xl leading-snug drop-shadow-md">
              {fact}
            </p>
          </div>
       </div>
    </div>
  );
};

export default FunFactCard;
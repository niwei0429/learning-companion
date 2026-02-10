import React from 'react';
import { CompanionMood } from '../types';

interface AvatarProps {
  mood: CompanionMood;
  isSpeaking?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ mood, isSpeaking = false }) => {
  // Simple CSS-based robot face that changes expressions
  
  const getEyeExpression = () => {
    switch (mood) {
      case CompanionMood.THINKING:
        return (
          <div className="flex gap-1.5 items-center justify-center -mt-1">
            <div className="w-2 h-2 bg-yellow-50 rounded-full animate-pulse delay-0"></div>
            <div className="w-2 h-2 bg-yellow-50 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-yellow-50 rounded-full animate-pulse delay-150"></div>
          </div>
        );
      case CompanionMood.HAPPY:
        return (
          <>
             <div className="w-4 h-2 border-t-2 border-white rounded-t-full rotate-180"></div>
             <div className="w-4 h-2 border-t-2 border-white rounded-t-full rotate-180"></div>
          </>
        );
      case CompanionMood.WAITING:
      default:
        return (
          <>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </>
        );
    }
  };

  const getMouthExpression = () => {
    // Override mouth if speaking
    if (isSpeaking) {
       return <div className="w-6 h-2 bg-white rounded-full animate-pulse transition-all duration-100" style={{ animationDuration: '0.3s' }}></div>;
    }

    switch (mood) {
      case CompanionMood.THINKING:
        return <div className="w-4 h-0.5 bg-white/70 rounded-full"></div>; // Flat, thinking mouth
      case CompanionMood.HAPPY:
        return <div className="w-6 h-3 border-b-2 border-white rounded-b-full"></div>; // Smile
      default:
        return <div className="w-6 h-1 bg-white rounded-full"></div>;
    }
  };

  const getBorderColor = () => {
    if (mood === CompanionMood.THINKING) return 'border-yellow-400';
    if (isSpeaking) return 'border-accent-400';
    return 'border-primary-300';
  };

  return (
    <div className={`relative w-24 h-24 flex items-center justify-center animate-float ${isSpeaking ? 'scale-105' : ''} transition-transform`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-accent-500 blur-xl opacity-30 rounded-full transition-all duration-500 ${mood === CompanionMood.THINKING || isSpeaking ? 'scale-125 opacity-50' : 'scale-100'}`}></div>
      
      {/* Robot Head */}
      <div className={`relative w-20 h-20 bg-primary-500 rounded-3xl shadow-lg flex flex-col items-center justify-center border-4 transition-colors duration-300 ${getBorderColor()}`}>
        
        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-primary-400"></div>
        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${mood === CompanionMood.THINKING || isSpeaking ? 'bg-yellow-300 animate-pulse' : 'bg-red-400'} border-2 border-white shadow transition-colors`}></div>

        {/* Face Screen */}
        <div className="w-16 h-12 bg-primary-800 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner relative">
           {/* Eyes */}
           <div className={`flex ${mood === CompanionMood.THINKING ? 'gap-0' : 'gap-3'} mt-1 transition-all`}>
             {getEyeExpression()}
           </div>
           {/* Mouth */}
           <div className="mt-1">
             {getMouthExpression()}
           </div>
           
           {/* Screen Glare (aesthetic) */}
           <div className="absolute top-0 right-0 w-8 h-8 bg-white opacity-5 rounded-full -mr-2 -mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
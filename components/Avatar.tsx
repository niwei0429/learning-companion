import React from 'react';
import { CompanionMood } from '../types';

interface AvatarProps {
  mood: CompanionMood;
}

const Avatar: React.FC<AvatarProps> = ({ mood }) => {
  // Simple CSS-based robot face that changes expressions
  
  const getEyeExpression = () => {
    switch (mood) {
      case CompanionMood.THINKING:
        return (
          <>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
          </>
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
     switch (mood) {
      case CompanionMood.THINKING:
        return <div className="w-4 h-1 bg-white rounded-full"></div>; // Straight mouth
      case CompanionMood.HAPPY:
        return <div className="w-6 h-3 border-b-2 border-white rounded-b-full"></div>; // Smile
      default:
        return <div className="w-6 h-1 bg-white rounded-full"></div>;
    }
  };

  return (
    <div className="relative w-24 h-24 flex items-center justify-center animate-float">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-accent-500 blur-xl opacity-30 rounded-full transition-all duration-500 ${mood === CompanionMood.THINKING ? 'scale-125 opacity-50' : 'scale-100'}`}></div>
      
      {/* Robot Head */}
      <div className="relative w-20 h-20 bg-primary-500 rounded-3xl shadow-lg flex flex-col items-center justify-center border-4 border-primary-300 transition-colors duration-300">
        
        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-primary-400"></div>
        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${mood === CompanionMood.THINKING ? 'bg-yellow-300 animate-pulse' : 'bg-red-400'} border-2 border-white shadow`}></div>

        {/* Face Screen */}
        <div className="w-16 h-12 bg-primary-800 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner">
           {/* Eyes */}
           <div className="flex gap-3 mt-1">
             {getEyeExpression()}
           </div>
           {/* Mouth */}
           <div className="mt-1">
             {getMouthExpression()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
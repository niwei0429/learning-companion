import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'bottom' }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div 
        className={`absolute ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} 
          left-1/2 -translate-x-1/2 px-2.5 py-1.5 
          bg-slate-800/90 text-white text-xs font-semibold rounded-lg shadow-xl 
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 
          pointer-events-none whitespace-nowrap z-50 animate-fade-in backdrop-blur-sm`}
      >
        {content}
        {/* Arrow */}
        <div 
          className={`absolute ${position === 'bottom' ? '-top-1' : '-bottom-1'} 
            left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800/90 rotate-45`}
        ></div>
      </div>
    </div>
  );
};

export default Tooltip;
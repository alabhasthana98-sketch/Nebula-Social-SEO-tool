import React from 'react';

const StarField: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-800 via-space-950 to-space-950 opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30 animate-pulse-slow" 
           style={{
             backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }}>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-20" 
           style={{
             backgroundImage: 'radial-gradient(rgba(6,182,212,0.5) 1px, transparent 1px)',
             backgroundSize: '120px 120px'
           }}>
      </div>
    </div>
  );
};

export default StarField;
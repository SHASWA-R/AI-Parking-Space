import React, { useEffect, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const InteractiveSonarRipple: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't create ripple on modal backdrops or if event target is disabled
      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev.slice(-8), newRipple]);

      // Remove ripple after animation finishes (900ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 950);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (ripples.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff88]/60 shadow-[0_0_15px_rgba(0,255,136,0.3)] animate-sonar-click"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '120px',
            height: '120px',
          }}
        />
      ))}
    </div>
  );
};

export default InteractiveSonarRipple;

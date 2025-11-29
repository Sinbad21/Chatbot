'use client';

import React from 'react';

// --- GLASS CARD ---
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  const baseStyle = 'bg-gradient-to-br from-[#2d1b4e]/90 to-[#150a25]/90 border-purple-500/20 shadow-purple-900/10 text-purple-50 backdrop-blur-md';

  const hoverStyle = hoverEffect
    ? 'hover:border-fuchsia-500/40 hover:shadow-[0_0_15px_rgba(192,38,211,0.15)]'
    : '';

  return (
    <div
      {...props}
      className={`border rounded-2xl p-6 transition-all duration-500 ${baseStyle} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
};

// --- GRADIENT TEXT ---
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
}) => {
  const gradient = 'from-fuchsia-400 via-purple-400 to-pink-400';

  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${className}`}>
      {children}
    </span>
  );
};

// --- STATUS BADGE ---
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colors = '';
  if (
    status === 'Active' ||
    status === 'Confirmed' ||
    status === 'Hot' ||
    status === 'Connected'
  ) {
    colors = 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
  } else if (status === 'Pending' || status === 'Training' || status === 'Warm') {
    colors = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  } else {
    colors = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
  }

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors}`}
    >
      {status}
    </span>
  );
};

// --- SPACE BACKGROUND ---
export const SpaceBackground: React.FC = () => {
  // Generate random stars (static for SSR compatibility)
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    top: `${(i * 7) % 100}%`,
    left: `${(i * 13) % 100}%`,
    size: (i % 3) + 1,
    duration: (i % 3) + 2,
    delay: (i % 5) * 0.4,
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050014] overflow-hidden">
      {/* Deep Space Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(26,11,46,0.8),rgba(5,0,20,1))]"></div>

      {/* Nebula Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/30 blur-[120px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-900/25 blur-[100px] animate-pulse"
          style={{ animationDuration: '15s' }}
        />
      </div>

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" />
    </div>
  );
};

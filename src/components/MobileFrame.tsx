import React from 'react';

interface MobileFrameProps {
  portalContainerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  portalContainerRef,
  children,
}) => {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#06070A] md:p-6">
      {/* Centered mobile-proportioned iPhone frame on desktop; edge-to-edge full screen on mobile */}
      <div
        ref={portalContainerRef}
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-black md:h-[852px] md:max-h-[calc(100dvh-48px)] md:w-[393px] md:rounded-[52px] md:border md:border-white/[0.14] md:shadow-[0_32px_90px_rgba(0,0,0,0.85),0_0_0_6px_#141519]"
      >
        {/* iOS Status Bar with Dynamic Island (visible inside the desktop mobile frame) */}
        <div
          aria-hidden="true"
          className="relative z-20 hidden h-[48px] shrink-0 items-center justify-between px-7 pt-1 text-[13.5px] font-semibold tracking-[-0.01em] text-white select-none md:flex"
        >
          <span className="tabular-nums">4:35</span>

          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-[11px] flex h-[28px] w-[108px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-3 ring-1 ring-white/[0.06]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#FF9F0A]" />
          </div>

          {/* Signal / LTE / Battery */}
          <div className="flex items-center gap-[5px]">
            <svg viewBox="0 0 18 12" className="h-[11px] w-[16px] fill-current">
              <rect x="0" y="8" width="3" height="4" rx="0.8" />
              <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.8" />
              <rect x="9" y="3" width="3" height="9" rx="0.8" />
              <rect x="13.5" y="0.5" width="3" height="11.5" rx="0.8" fillOpacity="0.35" />
            </svg>
            <span className="text-[11px] font-semibold tracking-tight">LTE</span>
            <span className="inline-flex h-[13px] min-w-[22px] items-center justify-center rounded-[4px] border border-white/40 px-1 text-[9px] font-bold leading-none tabular-nums">
              19
            </span>
          </div>
        </div>

        {/* Main Screen Viewport */}
        <main className="relative flex-1 min-h-0 overflow-hidden">
          {children}
        </main>

        {/* Home Indicator bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[6px] z-[90] flex justify-center"
        >
          <div className="h-[4px] w-[134px] rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { IOSSwitch } from './ui/switch';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useSheetDrag } from '../lib/useSheetDrag';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationEnabled: boolean;
  onToggleLocation: () => void;
  hapticEnabled: boolean;
  onToggleHaptic: (checked: boolean) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  open,
  onOpenChange,
  locationEnabled,
  onToggleLocation,
  hapticEnabled,
  onToggleHaptic,
  portalContainer,
  onTriggerHaptic,
}) => {
  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: () => onOpenChange(false),
    thresholdPx: 100,
    projectedThresholdPx: 165,
    elasticTop: 0.06,
    elasticBottom: 0.5,
    onTriggerHaptic,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[4px]"
              />
            </DialogOverlay>

            <DialogContent asChild forceMount>
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.16 }
                    : { type: 'spring', bounce: 0, duration: 0.34 }
                }
                {...sheetMotionDragProps}
                className="absolute inset-x-0 bottom-0 top-[54px] z-50 flex flex-col rounded-t-[32px] bg-[var(--surface-sheet)] border-t border-[var(--border-glass)] shadow-[0_-16px_48px_rgba(0,0,0,0.75)] overflow-hidden"
              >
                {/* Dedicated Grabber + Header Drag Region */}
                <div
                  onPointerDown={startDrag}
                  className="shrink-0 touch-none cursor-grab active:cursor-grabbing"
                >
                  <div className="flex justify-center pt-2.5">
                    <div
                      aria-hidden="true"
                      className="h-[4px] w-[38px] rounded-full bg-white/25"
                    />
                  </div>

                  <div className="relative flex items-center justify-center px-4 pt-3 pb-4">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      aria-label="Close Settings"
                      className="glass-circle hit-target-44 pressable-strong absolute left-4 flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    >
                      <X size={18} {...UI_ICON_PROPS} />
                    </button>

                    <DialogTitle className="text-[16.5px] font-semibold tracking-[-0.015em] text-white">
                      Settings
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      App preferences for Location and Haptic Feedback
                    </DialogDescription>
                  </div>
                </div>

                {/* Content: strictly Preferences -> Location & Haptic Feedback (drag-free) */}
                <div className="flex-1 px-4 pt-2">
                  <h2 className="mb-2.5 px-1 text-[13px] font-medium text-[var(--text-secondary)]">
                    Preferences
                  </h2>

                  <div className="overflow-hidden rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border-hairline)]">
                    {/* Row 1: Location */}
                    <button
                      type="button"
                      onClick={onToggleLocation}
                      className="pressable flex min-h-[54px] w-full items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-blue)]"
                    >
                      <span className="text-[15.5px] font-normal text-white">
                        Location
                      </span>
                      <span className="flex items-center gap-1.5 text-[14px] text-[var(--text-secondary)]">
                        <span>{locationEnabled ? 'While Using' : 'Off'}</span>
                        <ChevronRight
                          size={17}
                          {...UI_ICON_PROPS}
                          className="text-[var(--text-tertiary)]"
                        />
                      </span>
                    </button>

                    <div className="mx-4 h-px bg-[var(--border-divider)]" />

                    {/* Row 2: Haptic Feedback */}
                    <div className="flex min-h-[54px] items-center justify-between px-4 py-3">
                      <label
                        htmlFor="haptic-feedback-switch"
                        className="text-[15.5px] font-normal text-white cursor-pointer select-none"
                      >
                        Haptic Feedback
                      </label>
                      <IOSSwitch
                        id="haptic-feedback-switch"
                        checked={hapticEnabled}
                        onCheckedChange={onToggleHaptic}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

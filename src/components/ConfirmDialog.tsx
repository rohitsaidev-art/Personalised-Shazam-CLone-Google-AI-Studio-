import React, { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
  portalContainer: HTMLElement | null;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
  onCancel,
  portalContainer,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="absolute inset-0 z-[85] bg-black/68 backdrop-blur-[6px]"
              />
            </DialogOverlay>

            <DialogContent
              asChild
              forceMount
              onOpenAutoFocus={(e) => {
                // Keep focus on the safe Cancel action by default per Apple HIG
                e.preventDefault();
                cancelButtonRef.current?.focus();
              }}
            >
              <div
                onClick={onCancel}
                className="absolute inset-0 z-[95] flex items-center justify-center px-7"
              >
                <motion.div
                  role="alertdialog"
                  onClick={(e) => e.stopPropagation()}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.94 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96 }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.12 }
                      : { type: 'spring', bounce: 0, duration: 0.22 }
                  }
                  className="glass-popover w-full max-w-[296px] overflow-hidden rounded-[22px] text-center shadow-[0_24px_60px_rgba(0,0,0,0.82)]"
                >
                  <div className="px-5 pt-5 pb-4">
                    <DialogTitle className="text-[17px] font-semibold leading-[1.25] tracking-[-0.015em] text-white">
                      {title}
                    </DialogTitle>
                    <DialogDescription className="mt-1.5 text-[13.5px] leading-[1.4] text-[var(--text-secondary)]">
                      {description}
                    </DialogDescription>
                  </div>

                  <div className="h-px w-full bg-[var(--border-divider)]" />

                  <div className="grid grid-cols-2 divide-x divide-[var(--border-divider)]">
                    <button
                      ref={cancelButtonRef}
                      type="button"
                      onClick={onCancel}
                      className="pressable flex min-h-[48px] items-center justify-center px-3 text-[15.5px] font-medium text-white hover:bg-white/[0.06] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      {cancelLabel}
                    </button>

                    <button
                      type="button"
                      onClick={onConfirm}
                      className={cn(
                        'pressable flex min-h-[48px] items-center justify-center px-3 text-[15.5px] font-semibold hover:bg-white/[0.06] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]',
                        variant === 'destructive'
                          ? 'text-[var(--accent-red)]'
                          : 'text-[var(--accent-blue)]'
                      )}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

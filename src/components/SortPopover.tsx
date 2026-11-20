import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpDown, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from './ui/popover';
import { SortConfig, SortField, SortOrder } from '../types/music';
import { CHECK_ICON_PROPS, UI_ICON_PROPS } from '../lib/iconConfig';
import { useMenuKeyboardNav } from '../lib/useMenuKeyboardNav';
import { cn } from '../lib/utils';

interface SortPopoverProps {
  sort: SortConfig;
  onChangeSort: (next: SortConfig) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

const FIELD_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: 'dateFound', label: 'Date Found' },
  { value: 'title', label: 'Song Title' },
  { value: 'artist', label: 'Artist Name' },
];

const ORDER_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const SortPopover: React.FC<SortPopoverProps> = ({
  sort,
  onChangeSort,
  portalContainer,
  onTriggerHaptic,
}) => {
  const [open, setOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { menuRef, handleMenuKeyDown } = useMenuKeyboardNav(open, () =>
    setOpen(false)
  );

  const handleField = (field: SortField) => {
    onTriggerHaptic?.();
    onChangeSort({ ...sort, field });
    setOpen(false);
  };

  const handleOrder = (order: SortOrder) => {
    onTriggerHaptic?.();
    onChangeSort({ ...sort, order });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Sort library"
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'glass-circle hit-target-44 pressable-strong flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
            open && 'bg-white/[0.18]'
          )}
        >
          <ArrowUpDown size={17} {...UI_ICON_PROPS} />
        </button>
      </PopoverTrigger>

      <AnimatePresence>
        {open && (
          <PopoverPortal forceMount container={portalContainer ?? undefined}>
            <PopoverContent
              asChild
              forceMount
              useOwnPortal={false}
              align="end"
              sideOffset={8}
              className="w-[228px] origin-top-right"
            >
              <motion.div
                ref={menuRef}
                onKeyDown={handleMenuKeyDown}
                role="menu"
                aria-label="Sort library"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.92, y: -4 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.94, y: -4 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.12 }
                    : { type: 'spring', bounce: 0, duration: 0.22 }
                }
                className="glass-popover overflow-hidden rounded-[18px] py-1.5 text-white"
              >
                <div className="px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)]">
                  Sort By:
                </div>

                <div role="group" aria-label="Sort field">
                  {FIELD_OPTIONS.map((opt) => {
                    const active = sort.field === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => handleField(opt.value)}
                        className="pressable flex min-h-[44px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] text-white hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                      >
                        <span className="flex w-[18px] shrink-0 items-center justify-center">
                          {active && (
                            <Check size={15} {...CHECK_ICON_PROPS} className="text-white" />
                          )}
                        </span>
                        <span className="font-normal tracking-[-0.01em]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div role="separator" className="my-1 h-px bg-[var(--border-divider)]" />

                <div role="group" aria-label="Sort order">
                  {ORDER_OPTIONS.map((opt) => {
                    const active = sort.order === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => handleOrder(opt.value)}
                        className="pressable flex min-h-[44px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] text-white hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                      >
                        <span className="flex w-[18px] shrink-0 items-center justify-center">
                          {active && (
                            <Check size={15} {...CHECK_ICON_PROPS} className="text-white" />
                          )}
                        </span>
                        <span className="font-normal tracking-[-0.01em]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </Popover>
  );
};

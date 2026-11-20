import React, { useCallback, useEffect, useRef } from 'react';

const MENU_ITEM_SELECTOR =
  '[role="menuitem"]:not([disabled]), [role="menuitemradio"]:not([disabled])';

/**
 * Shared roving-focus keyboard navigation hook for Radix Popover & Dialog menus.
 * Supports ArrowDown, ArrowUp, Home, End, and Escape with initial focus on the
 * currently checked item (if any) or the first item when opened.
 */
export function useMenuKeyboardNav(
  isOpen: boolean,
  onClose?: () => void
): {
  menuRef: React.RefObject<HTMLDivElement | null>;
  handleMenuKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
} {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const rafId = window.requestAnimationFrame(() => {
      const container = menuRef.current;
      if (!container) return;
      const checkedItem = container.querySelector<HTMLElement>(
        '[role="menuitemradio"][aria-checked="true"]:not([disabled])'
      );
      const firstItem = container.querySelector<HTMLElement>(MENU_ITEM_SELECTOR);
      const target = checkedItem ?? firstItem;
      if (target && !container.contains(document.activeElement)) {
        target.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [isOpen]);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const container = menuRef.current;
      if (!container) return;

      if (e.key === 'Escape') {
        if (onClose) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        return;
      }

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)
      );
      if (items.length === 0) return;

      const currentIdx = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % items.length : 0;
        items[nextIdx]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx =
          currentIdx > 0 ? currentIdx - 1 : items.length - 1;
        items[prevIdx]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    },
    [onClose]
  );

  return { menuRef, handleMenuKeyDown };
}

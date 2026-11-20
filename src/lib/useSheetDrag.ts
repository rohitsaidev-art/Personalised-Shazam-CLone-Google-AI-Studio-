import React from 'react';
import { PanInfo, useDragControls, useReducedMotion } from 'motion/react';

export interface SheetDragConfig {
  onDismiss: () => void;
  thresholdPx: number;
  projectedThresholdPx: number;
  elasticTop?: number;
  elasticBottom?: number;
  decelerationRate?: number;
  onTriggerHaptic?: () => void;
  enabled?: boolean;
}

export function projectMomentum(
  velocityPxPerSec: number,
  decelerationRate = 0.992
): number {
  return ((velocityPxPerSec / 1000) * decelerationRate) / (1 - decelerationRate);
}

const INTERACTIVE_GUARD_SELECTOR =
  'button, input, textarea, select, a, [role="slider"], [role="switch"], [data-no-sheet-drag="true"]';

/**
 * Shared sheet-drag engine with per-sheet thresholds, grabber-only dragListener=false,
 * interactive-target guarding, Apple momentum projection, and reduced-motion support.
 */
export function useSheetDrag({
  onDismiss,
  thresholdPx,
  projectedThresholdPx,
  elasticTop = 0.05,
  elasticBottom = 0.5,
  decelerationRate = 0.992,
  onTriggerHaptic,
  enabled = true,
}: SheetDragConfig) {
  const prefersReducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const isDragActive = enabled && !prefersReducedMotion;

  const startDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDragActive) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement | null;
    if (target?.closest(INTERACTIVE_GUARD_SELECTOR)) return;
    dragControls.start(e);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isDragActive) return;
    const projectedY =
      info.offset.y + projectMomentum(info.velocity.y, decelerationRate);
    if (info.offset.y > thresholdPx || projectedY > projectedThresholdPx) {
      onTriggerHaptic?.();
      onDismiss();
    }
  };

  return {
    prefersReducedMotion: Boolean(prefersReducedMotion),
    dragControls,
    startDrag,
    sheetMotionDragProps: {
      drag: isDragActive ? ('y' as const) : (false as const),
      dragControls,
      dragListener: false,
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: { top: elasticTop, bottom: elasticBottom },
      onDragEnd: handleDragEnd,
    },
  };
}

import React from 'react';
import { cn } from '../lib/utils';

export const ShazamMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className={cn('block', className)}
    aria-hidden="true"
  >
    <path
      d="M57.8 25.4C67.1 29.8 72.1 40.3 68.7 50.1C67.3 54.1 64.8 57.5 61.5 60.1L51.3 67.8C48.8 69.7 45.2 69.2 43.3 66.7C41.4 64.2 41.9 60.6 44.4 58.7L54.6 51C56.3 49.7 57.5 47.9 58.1 45.9C59.4 41.7 57.2 37.2 53.1 35.4C49.5 33.8 45.3 34.8 42.7 37.7L36.2 44.8C34.1 47.1 30.5 47.3 28.2 45.2C25.9 43.1 25.7 39.5 27.8 37.2L34.3 30.1C40.4 23.4 50.1 21.7 57.8 25.4Z"
      fill="currentColor"
    />
    <path
      d="M42.2 74.6C32.9 70.2 27.9 59.7 31.3 49.9C32.7 45.9 35.2 42.5 38.5 39.9L48.7 32.2C51.2 30.3 54.8 30.8 56.7 33.3C58.6 35.8 58.1 39.4 55.6 41.3L45.4 49C43.7 50.3 42.5 52.1 41.9 54.1C40.6 58.3 42.8 62.8 46.9 64.6C50.5 66.2 54.7 65.2 57.3 62.3L63.8 55.2C65.9 52.9 69.5 52.7 71.8 54.8C74.1 56.9 74.3 60.5 72.2 62.8L65.7 69.9C59.6 76.6 49.9 78.3 42.2 74.6Z"
      fill="currentColor"
    />
  </svg>
);

export const ShazamCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn('block', className)} aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <g transform="translate(2.5 2.5) scale(0.19)">
      <path
        d="M57.8 25.4C67.1 29.8 72.1 40.3 68.7 50.1C67.3 54.1 64.8 57.5 61.5 60.1L51.3 67.8C48.8 69.7 45.2 69.2 43.3 66.7C41.4 64.2 41.9 60.6 44.4 58.7L54.6 51C56.3 49.7 57.5 47.9 58.1 45.9C59.4 41.7 57.2 37.2 53.1 35.4C49.5 33.8 45.3 34.8 42.7 37.7L36.2 44.8C34.1 47.1 30.5 47.3 28.2 45.2C25.9 43.1 25.7 39.5 27.8 37.2L34.3 30.1C40.4 23.4 50.1 21.7 57.8 25.4Z"
        fill="#14161B"
      />
      <path
        d="M42.2 74.6C32.9 70.2 27.9 59.7 31.3 49.9C32.7 45.9 35.2 42.5 38.5 39.9L48.7 32.2C51.2 30.3 54.8 30.8 56.7 33.3C58.6 35.8 58.1 39.4 55.6 41.3L45.4 49C43.7 50.3 42.5 52.1 41.9 54.1C40.6 58.3 42.8 62.8 46.9 64.6C50.5 66.2 54.7 65.2 57.3 62.3L63.8 55.2C65.9 52.9 69.5 52.7 71.8 54.8C74.1 56.9 74.3 60.5 72.2 62.8L65.7 69.9C59.6 76.6 49.9 78.3 42.2 74.6Z"
        fill="#14161B"
      />
    </g>
  </svg>
);

export const LibraryTabIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn('block', className)} aria-hidden="true">
    <path
      d="M7 4.25H17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      opacity="0.72"
    />
    <rect x="4.5" y="7" width="15" height="13.5" rx="3" fill="currentColor" />
    <path
      d="M11 16.4V11.2L15 10.3V15.4"
      stroke="#14161B"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.8" cy="16.4" r="1.4" fill="#14161B" />
    <circle cx="13.8" cy="15.4" r="1.4" fill="#14161B" />
  </svg>
);

/* Uniform 3.4px horizontal intervals centered at x = 12 */
export const NowPlayingTabIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn('block', className)} aria-hidden="true">
    <line x1="3.5" y1="10.5" x2="3.5" y2="13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="6.9" y1="7.5" x2="6.9" y2="16.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="10.3" y1="4.5" x2="10.3" y2="19.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="13.7" y1="8.2" x2="13.7" y2="15.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="17.1" y1="6.5" x2="17.1" y2="17.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="20.5" y1="10.5" x2="20.5" y2="13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const FilterLinesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" className={cn('block', className)} aria-hidden="true">
    <line x1="3.5" y1="6" x2="16.5" y2="6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="5.75" y1="10" x2="14.25" y2="10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const ExplicitBadge: React.FC = () => (
  <span
    aria-label="Explicit"
    className="ml-1 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] bg-[#787A82] text-[9px] font-bold leading-none text-[#121318] align-middle"
  >
    E
  </span>
);

import React from 'react';

export default function StoreXLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 font-sans ${className}`}>
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <defs>
          <linearGradient id="stx-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0062ff" />
            <stop offset="100%" stopColor="#00bfff" />
          </linearGradient>
          <linearGradient id="stx-x-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0077ff" />
            <stop offset="100%" stopColor="#00d5ff" />
          </linearGradient>
        </defs>

        {/* S-Cart Icon */}
        <g transform="translate(10, 8)">
          {/* Top curve of S */}
          <path
            d="M 50 10 C 25 10 12 22 12 32 C 12 44 26 46 44 48 C 58 50 64 56 64 64 C 64 74 48 80 26 80 L 10 80"
            stroke="url(#stx-blue-grad)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          {/* Cart handle line */}
          <path
            d="M 4 44 L 14 44"
            stroke="url(#stx-blue-grad)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Wheels */}
          <circle cx="22" cy="74" r="5.5" fill="url(#stx-blue-grad)" />
          <circle cx="48" cy="74" r="5.5" fill="url(#stx-blue-grad)" />
        </g>

        {/* Brand Text "Store" */}
        <text
          x="95"
          y="58"
          fill="#06122e"
          fontSize="48"
          fontWeight="900"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-1.5"
        >
          Store
        </text>

        {/* Brand Text "X" */}
        <text
          x="235"
          y="58"
          fill="url(#stx-x-grad)"
          fontSize="52"
          fontWeight="900"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-1"
        >
          X
        </text>
      </svg>
    </div>
  );
}

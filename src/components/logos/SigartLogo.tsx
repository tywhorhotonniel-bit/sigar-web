import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SigartLogo: React.FC<LogoProps> = ({ className = '', size = 90, showText = true }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
    >
      {/* Background circular glow */}
      <circle cx="250" cy="225" r="165" fill="#f8fafc" />

      {/* Shield Crest Borders */}
      {/* Left Navy Arc */}
      <path
        d="M 250 65 C 155 65 140 160 140 245 C 140 330 220 375 250 395"
        fill="none"
        stroke="#0c355e"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Right Champagne Gold Arc */}
      <path
        d="M 250 65 C 345 65 360 160 360 245 C 360 330 280 375 250 395"
        fill="none"
        stroke="#c49a45"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Inner subtle shield fill */}
      <path
        d="M 250 78 C 165 78 152 165 152 242 C 152 318 225 360 250 378 C 275 360 348 318 348 242 C 348 165 335 78 250 78 Z"
        fill="#f1f5f9"
      />

      {/* Laptop Screen Body */}
      <rect
        x="185"
        y="135"
        width="130"
        height="95"
        rx="8"
        fill="#ffffff"
        stroke="#0c355e"
        strokeWidth="10"
      />
      {/* Screen Display Area */}
      <rect
        x="195"
        y="145"
        width="110"
        height="75"
        rx="4"
        fill="#e2e8f0"
      />

      {/* Circuit Traces on and emerging from Screen */}
      <g stroke="#0c355e" strokeWidth="4" fill="none" strokeLinecap="round">
        {/* Main central bus */}
        <path d="M 225 185 L 245 165 L 270 165" />
        <path d="M 225 185 L 245 200 L 275 200" />
        
        {/* Branching out to top-right */}
        <path d="M 260 145 L 260 100 L 290 85" stroke="#c49a45" strokeWidth="4.5" />
        <path d="M 285 145 L 285 115 L 320 115" stroke="#0c355e" strokeWidth="4.5" />
        <path d="M 305 165 L 340 165" stroke="#0c355e" strokeWidth="4" />
        <path d="M 305 185 L 335 185 L 345 205" stroke="#c49a45" strokeWidth="4" />
      </g>

      {/* Circuit Nodes (Dots) */}
      <g fill="#0c355e">
        <circle cx="225" cy="185" r="5" />
        <circle cx="270" cy="165" r="4.5" />
        <circle cx="275" cy="200" r="4.5" />
        <circle cx="320" cy="115" r="5" />
        <circle cx="340" cy="165" r="5" />
      </g>
      <g fill="#c49a45">
        <circle cx="290" cy="85" r="5.5" />
        <circle cx="345" cy="205" r="5" />
        <circle cx="225" cy="115" r="3.5" />
      </g>

      {/* Binary numbers "01" */}
      <text x="232" y="112" fontFamily="'Courier New', monospace" fontSize="13" fontWeight="bold" fill="#0c355e">01</text>
      <text x="202" y="166" fontFamily="'Courier New', monospace" fontSize="11" fontWeight="bold" fill="#c49a45">01</text>
      <text x="202" y="180" fontFamily="'Courier New', monospace" fontSize="11" fontWeight="bold" fill="#c49a45">01</text>

      {/* WiFi Waves (Upper Right) */}
      <g stroke="#0c355e" strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M 325 80 A 18 18 0 0 1 350 80" />
        <path d="M 320 73 A 26 26 0 0 1 355 73" />
        <path d="M 315 66 A 34 34 0 0 1 360 66" />
      </g>
      <circle cx="337.5" cy="86" r="2.5" fill="#0c355e" />

      {/* Small Gear Cog */}
      <g transform="translate(345, 105) scale(0.65)" fill="#c49a45">
        <circle cx="12" cy="12" r="10" stroke="#c49a45" strokeWidth="3" fill="none" />
        <circle cx="12" cy="12" r="4" fill="#c49a45" />
        <rect x="10" y="0" width="4" height="6" rx="1" />
        <rect x="10" y="18" width="4" height="6" rx="1" />
        <rect x="0" y="10" width="6" height="4" rx="1" />
        <rect x="18" y="10" width="6" height="4" rx="1" />
      </g>

      {/* Laptop Base (Keyboard and Trackpad) */}
      <path
        d="M 160 230 L 340 230 L 360 265 C 360 270 355 274 348 274 L 152 274 C 145 274 140 270 140 265 Z"
        fill="#0c355e"
      />

      {/* Keyboard Grid Keys */}
      <g fill="#ffffff" opacity="0.9">
        {/* Row 1 */}
        <rect x="175" y="235" width="12" height="4" rx="1" />
        <rect x="191" y="235" width="12" height="4" rx="1" />
        <rect x="207" y="235" width="12" height="4" rx="1" />
        <rect x="223" y="235" width="12" height="4" rx="1" />
        <rect x="239" y="235" width="12" height="4" rx="1" />
        <rect x="255" y="235" width="12" height="4" rx="1" />
        <rect x="271" y="235" width="12" height="4" rx="1" />
        <rect x="287" y="235" width="12" height="4" rx="1" />
        <rect x="303" y="235" width="18" height="4" rx="1" />

        {/* Row 2 */}
        <rect x="172" y="242" width="14" height="4.5" rx="1" />
        <rect x="190" y="242" width="12" height="4.5" rx="1" />
        <rect x="206" y="242" width="12" height="4.5" rx="1" />
        <rect x="222" y="242" width="12" height="4.5" rx="1" />
        <rect x="238" y="242" width="12" height="4.5" rx="1" />
        <rect x="254" y="242" width="12" height="4.5" rx="1" />
        <rect x="270" y="242" width="12" height="4.5" rx="1" />
        <rect x="286" y="242" width="12" height="4.5" rx="1" />
        <rect x="302" y="242" width="22" height="4.5" rx="1" />

        {/* Row 3 Spacebar */}
        <rect x="169" y="249" width="16" height="5" rx="1" />
        <rect x="189" y="249" width="14" height="5" rx="1" />
        <rect x="207" y="249" width="82" height="5" rx="1" />
        <rect x="293" y="249" width="14" height="5" rx="1" />
        <rect x="311" y="249" width="18" height="5" rx="1" />
      </g>

      {/* Trackpad */}
      <rect
        x="226"
        y="258"
        width="48"
        height="10"
        rx="2"
        fill="#ffffff"
        opacity="0.85"
      />

      {/* Typography: SIGART */}
      {showText && (
        <text
          x="250"
          y="450"
          textAnchor="middle"
          fontFamily="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="68"
          fontWeight="900"
          letterSpacing="4"
          fill="#0c355e"
        >
          SIGART
        </text>
      )}
    </svg>
  );
};

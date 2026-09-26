import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const UnellezLogo: React.FC<LogoProps> = ({ className = '', size = 80 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={className}
    >
      {/* Outer Circle Ring */}
      <circle
        cx="200"
        cy="200"
        r="188"
        fill="#FFFFFF"
        stroke="#E65100"
        strokeWidth="11"
      />

      {/* Iconic UNELLEZ Geometric Flame / Terraced Steps Symbol */}
      <g fill="#F57C00">
        {/* Band 1 (Topmost right) */}
        <polygon points="196,48 200,40 200,105 186,105 186,60" />
        <path d="M198 44 L200 40 L200 108 L188 108 L188 62 Z" fill="#E65100" />

        {/* 6 Layered Angular Ribbon Bars (Official Emblem Geometry) */}
        {/* Bar 1 */}
        <path
          d="M172 68 L200 40 L200 108 L188 108 L188 80 L160 80 Z"
          fill="#EF6C00"
        />
        {/* Bar 2 */}
        <path
          d="M148 90 L188 52 L188 116 L176 116 L176 96 L136 96 Z"
          fill="#F57C00"
        />
        {/* Bar 3 */}
        <path
          d="M124 112 L176 64 L176 124 L164 124 L164 112 L112 112 Z"
          fill="#FB8C00"
        />
        {/* Bar 4 */}
        <path
          d="M100 134 L164 76 L164 132 L152 132 L152 128 L88 128 Z"
          fill="#FF9800"
        />
      </g>

      {/* Official Symmetrical UNELLEZ Motif Group */}
      <g transform="translate(85, 42) scale(0.77)">
        {/* Top-Right L-Shapes */}
        <path d="M182 12 L198 0 L198 86 L182 86 L182 24 L142 24 L152 12 Z" fill="#E65100" />
        <path d="M162 36 L178 24 L178 106 L162 106 L162 48 L118 48 L128 36 Z" fill="#EF6C00" />
        <path d="M142 60 L158 48 L158 126 L142 126 L142 72 L94 72 L104 60 Z" fill="#F57C00" />
        <path d="M122 84 L138 72 L138 146 L122 146 L122 96 L70 96 L80 84 Z" fill="#FB8C00" />
        <path d="M102 108 L118 96 L118 166 L102 166 L102 120 L46 120 L56 108 Z" fill="#FF9800" />
        <path d="M82 132 L98 120 L98 186 L82 186 L82 144 L22 144 L32 132 Z" fill="#FFA726" />

        {/* Lower Inverted Steps */}
        <path d="M118 196 L102 208 L102 278 L118 278 L118 220 L174 220 L164 196 Z" fill="#E65100" />
        <path d="M138 176 L122 188 L122 258 L138 258 L138 200 L194 200 L184 176 Z" fill="#EF6C00" />
        <path d="M158 156 L142 168 L142 238 L158 238 L158 180 L214 180 L204 156 Z" fill="#F57C00" />
        <path d="M178 136 L162 148 L162 218 L178 218 L178 160 L234 160 L224 136 Z" fill="#FB8C00" />
        <path d="M198 116 L182 128 L182 198 L198 198 L198 140 L254 140 L244 116 Z" fill="#FF9800" />
        <path d="M218 96 L202 108 L202 178 L218 178 L218 120 L274 120 L264 96 Z" fill="#FFA726" />
      </g>

      {/* Typography: UNELLEZ */}
      <text
        x="200"
        y="298"
        textAnchor="middle"
        fontFamily="'Times New Roman', Georgia, 'Cinzel', serif"
        fontSize="44"
        fontWeight="bold"
        letterSpacing="4"
        fill="#D84315"
      >
        UNELLEZ
      </text>

      {/* Typography: La Universidad que Siembra */}
      <text
        x="200"
        y="332"
        textAnchor="middle"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="21"
        fill="#263238"
      >
        La Universidad que Siembra
      </text>
    </svg>
  );
};

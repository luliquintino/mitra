interface SvgProps {
  className?: string;
  style?: React.CSSProperties;
}

export function LeafDecoration({ className = '', style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M60 10C60 10 95 30 95 65C95 100 60 110 60 110C60 110 25 100 25 65C25 30 60 10 60 10Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M60 10C60 10 95 30 95 65C95 100 60 110 60 110"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M60 35V95"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
      />
      <path
        d="M60 55L42 42"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
      <path
        d="M60 70L78 58"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
    </svg>
  );
}

export function PawDecoration({ className = '', style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="40" cy="52" rx="14" ry="12" fill="currentColor" opacity="0.2" />
      <circle cx="24" cy="32" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="56" cy="32" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="16" cy="48" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="64" cy="48" r="6" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

export function BlobDecoration({ className = '', style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M140 40C165 55 185 85 175 115C165 145 130 170 100 170C70 170 45 155 30 130C15 105 15 70 35 50C55 30 115 25 140 40Z"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  );
}

export function WaveDivider({ className = '', style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DotPattern({ className = '', style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <circle
            key={i}
            cx={10 + col * 20}
            cy={10 + row * 20}
            r="2"
            fill="currentColor"
            opacity="0.2"
          />
        );
      })}
    </svg>
  );
}

type LogoProps = {
  /** "full" shows icon + wordmark, "icon" shows only the mark */
  variant?: "full" | "icon";
  /** size of the icon tile in px */
  size?: number;
  /** wordmark tone: dark for light backgrounds, light for dark backgrounds */
  tone?: "dark" | "light";
  className?: string;
};

let gradientSeed = 0;

export function MindLatchLogo({ variant = "full", size = 38, tone = "dark", className }: LogoProps) {
  const gid = `ml-grad-${(gradientSeed += 1)}`;

  const icon = (
    <span className="ml-logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size} height={size} role="img">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2388FF" />
            <stop offset="0.5" stopColor="#35D6FF" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="45" height="45" rx="12.5" fill="#0A1430" />
        <rect x="1.5" y="1.5" width="45" height="45" rx="12.5" fill="none" stroke="rgba(255,255,255,0.08)" />
        <path
          d="M16 22.5V18a8 8 0 0 1 16 0v4.5"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="12.5" y="22" width="23" height="15.5" rx="4.5" fill="none" stroke={`url(#${gid})`} strokeWidth="3" />
        <path
          d="M19 29.7l3.4 3.4L29.4 26"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  if (variant === "icon") {
    return (
      <span className={className ? `ml-logo icon-only ${className}` : "ml-logo icon-only"} aria-label="MindLatch logo">
        {icon}
      </span>
    );
  }

  return (
    <span
      className={className ? `ml-logo ${className}` : "ml-logo"}
      data-tone={tone}
      aria-label="MindLatch logo"
    >
      {icon}
      <span className="ml-logo-word">
        Mind<b>Latch</b>
      </span>
    </span>
  );
}

'use client';
interface ViewCounterProps {
  initialViews: number;
}

export default function ViewCounter({ initialViews }: ViewCounterProps) {

  return (
    <span className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
        style={{ verticalAlign: 'baseline' }}
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span>{initialViews}</span>
    </span>
  );
}

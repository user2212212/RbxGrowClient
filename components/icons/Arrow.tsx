export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M10.5 16.625L4.375 10.5L10.5 4.375"
        stroke="currentColor"
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
       />
       <path d="M16.625 10.5H4.375"
          stroke="currentColor"
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
       />
    </svg>
  );
}


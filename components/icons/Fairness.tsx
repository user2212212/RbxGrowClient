import { useId } from "react";

export function FairnessIcon({ className, active }: { className?: string; active?: boolean }) {
  const gradient = useId();

  return (
    <svg 
      width="100%"
      height="100%" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      >
      <path
      d="M6.39583 16.4375C6.3125 16.4236 6.22917 16.4028 6.14583 16.375C4.27083 15.75 2.77778 14.5936 1.66667 12.9058C0.555556 11.2181 0 9.40222 0 7.45833V3.52083C0 3.17361 0.100833 2.86111 0.3025 2.58333C0.504167 2.30556 0.764445 2.10417 1.08333 1.97917L6.08333 0.104167C6.27778 0.0347222 6.47222 0 6.66667 0C6.86111 0 7.05556 0.0347222 7.25 0.104167L12.25 1.97917C12.5694 2.10417 12.83 2.30556 13.0317 2.58333C13.2333 2.86111 13.3339 3.17361 13.3333 3.52083V7.45833C13.3333 9.40278 12.7778 11.2189 11.6667 12.9067C10.5556 14.5944 9.0625 15.7506 7.1875 16.375C7.10417 16.4028 7.02083 16.4236 6.9375 16.4375C6.85417 16.4514 6.76389 16.4583 6.66667 16.4583C6.56944 16.4583 6.47917 16.4514 6.39583 16.4375Z" 
      fill={active ? `url(#${gradient})` : "#626B7F"}
      />
      <defs>
        <linearGradient id={gradient} x1="6.66667" y1="0" x2="6.66667" y2="14.5833" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C58EFE" />
          <stop offset="1" stopColor="#9837FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

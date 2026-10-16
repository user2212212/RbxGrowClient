export function DropdownIcon({
  className,
  strokeWidth = "2",
}: {
  className?: string;
  strokeWidth?: string;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 9 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 4L5.4275 1.38951C5.18141 1.1401 4.84781 1 4.5 1C4.15219 1 3.81859 1.1401 3.5725 1.38951L1 4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
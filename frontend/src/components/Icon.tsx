import type { SVGProps } from "react";

const paths: Record<string, string> = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z",
  factory: "M3 21V9l6 4V9l6 4V5h6v16zM8 17h1m4 0h1m4 0h1",
  chart: "M4 19V5m0 14h17M7 15l4-4 3 2 6-7",
  box: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.8.3l-.1.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.5-1l-.2.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.3-1.8l-.1-.1v-3.4l.2-.1a1.7 1.7 0 0 0 1-1.5l-.1-.2 1.7-2.9.2.1a1.7 1.7 0 0 0 1.8-.3l.1-.1h3.4l.1.2a1.7 1.7 0 0 0 1.5 1l.2-.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .3 1.8l.1.1v3.4Z",
  check: "m5 12 4 4L19 6",
  shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z",
  coins: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm-8-3v5c0 1.7 3.6 3 8 3 1.5 0 2.9-.2 4-.5M4 10v5c0 1.7 3.6 3 8 3M20 8v5m0 0c0 1.7-3.6 3-8 3m8-3c0-1.7-3.6-3-8-3",
  trend: "M3 17l6-6 4 4 8-9m-6 0h6v6",
  calendar: "M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M18 6 6 18",
  menu: "M4 6h16M4 12h16M4 18h16",
  leaf: "M20 4c-9 0-15 4-15 11 0 3 2 5 5 5 7 0 11-6 10-16ZM5 20c2-4 6-7 11-10",
  alert: "M12 9v4m0 4h.01M10.3 3.9 2.7 17.1A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z",
  download: "M12 3v12m-5-5 5 5 5-5M4 20h16",
};

export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: string; size?: number }) {
  const d = paths[name] ?? paths.check;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d={d} />
    </svg>
  );
}

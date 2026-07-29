import { clsx } from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "red" | "blue" | "gray";
};

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  gray: "bg-gray-50 text-gray-700 ring-gray-600/20"
};

export function Badge({ children, tone = "gray" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

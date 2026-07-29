"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type NavigationLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function NavigationLink({ href, label, icon: Icon }: NavigationLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-muted hover:bg-surface hover:text-ink"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="hidden whitespace-nowrap lg:inline">{label}</span>
    </Link>
  );
}

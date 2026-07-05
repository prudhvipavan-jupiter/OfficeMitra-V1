"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
  jupiterLabel?: string;
  icon: LucideIcon;
  exact?: boolean;
};

interface AdminNavProps {
  items: AdminNavItem[];
  variant: "normal" | "jupiter";
}

export function AdminNavBar({ items, variant }: AdminNavProps) {
  const pathname = usePathname();
  const isJupiter = variant === "jupiter";

  return (
    <nav
      className={cn(
        "flex gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        isJupiter ? "px-1" : "px-0"
      )}
      aria-label="Admin navigation"
    >
      {items.map(({ href, label, jupiterLabel, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const text = jupiterLabel && href === "/admin" && isJupiter ? jupiterLabel : label;

        if (isJupiter) {
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn("jarvis-nav-link shrink-0 whitespace-nowrap", active && "active")}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{text}</span>
              <span className="sm:hidden">{label.slice(0, 4)}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3",
              active
                ? "bg-navy-100 text-navy-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-navy-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

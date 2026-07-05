"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, BookOpen, ClipboardList, Home, Search } from "lucide-react";
import { useTranslations } from "@/components/i18n/LanguageProvider";
import { isMitraPublicEnabled } from "@/lib/mitra/config";
import { cn } from "@/lib/utils";

const hiddenPrefixes = ["/admin"];

export function MobileQuickBar() {
  const pathname = usePathname();
  const t = useTranslations();
  const mitraEnabled = isMitraPublicEnabled();

  if (hiddenPrefixes.some((p) => pathname.startsWith(p))) return null;

  const items = [
    { href: "/", label: t.nav.home, icon: Home, match: (p: string) => p === "/" },
    {
      href: "/knowledge",
      label: t.nav.guidesShort,
      icon: BookOpen,
      match: (p: string) => p.startsWith("/knowledge"),
    },
    {
      href: "/procedures",
      label: t.nav.proceduresShort,
      icon: ClipboardList,
      match: (p: string) => p.startsWith("/procedures"),
    },
    ...(mitraEnabled
      ? [
          {
            href: "/mitra",
            label: "Mitra",
            icon: Sparkles,
            match: (p: string) => p.startsWith("/mitra"),
          },
        ]
      : []),
    {
      href: "/search",
      label: t.nav.search,
      icon: Search,
      match: (p: string) => p.startsWith("/search"),
    },
  ];

  return (
    <nav
      className="mobile-quick-bar no-print lg:hidden"
      aria-label={t.a11y.mobileQuickNav}
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn("mobile-quick-bar-item", active && "mobile-quick-bar-item-active")}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="max-w-[4.5rem] truncate text-center">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface JarvisPageHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function JarvisPageHeader({ label, title, subtitle, action }: JarvisPageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-wrap items-end justify-between gap-4")}>
      <div>
        <p className="jarvis-label admin-text-label">{label}</p>
        <h1 className="admin-text-heading text-2xl font-bold">{title}</h1>
        {subtitle && <p className="admin-text-body mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

interface JarvisPageProps {
  children: React.ReactNode;
  className?: string;
}

export function JarvisPage({ children, className }: JarvisPageProps) {
  return (
    <div className={cn("jarvis-content mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

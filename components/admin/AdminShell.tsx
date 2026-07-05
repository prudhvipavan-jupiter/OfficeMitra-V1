"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import { AdminModeToggle } from "@/components/admin/AdminModeToggle";

import { AdminNavBar } from "@/components/admin/AdminNavBar";

import { useAdminTheme } from "@/components/admin/AdminThemeProvider";

import { DbHealthBanner } from "@/components/admin/DbHealthBanner";

import { JarvisBackdrop } from "@/components/admin/jarvis/JarvisBackdrop";

import { Container } from "@/components/ui/Container";

import { siteConfig } from "@/lib/metadata";



const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "CMS", icon: FolderKanban, exact: false },
  { href: "/admin/people", label: "People", icon: Users, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];



export function AdminShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  const { isJupiter } = useAdminTheme();

  const isLogin = pathname === "/admin/login";



  if (isLogin) {

    return <>{children}</>;

  }



  async function logout() {

    await fetch("/api/admin/logout", { method: "POST" });

    window.location.href = "/admin/login";

  }



  if (!isJupiter) {

    return (

      <div className="admin-normal min-h-screen bg-gray-50">

        <header className="border-b border-navy-200 bg-white shadow-sm">

          <Container>

            <div className="flex h-14 items-center justify-between gap-3 border-b border-gray-100">

              <Link href="/admin" className="flex shrink-0 items-center gap-2.5">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-600 text-xs font-bold text-white">

                  OM

                </span>

                <span className="hidden font-semibold text-navy-900 sm:inline">{siteConfig.name} Admin</span>

              </Link>

              <div className="flex shrink-0 items-center gap-2">

                <AdminModeToggle compact />

                <Link

                  href="/admin/settings"

                  className="hidden text-sm text-gray-500 hover:text-navy-700 md:inline"

                >

                  Settings

                </Link>

                <Link

                  href="/admin/guide"

                  className="hidden text-sm text-gray-500 hover:text-navy-700 lg:inline"

                >

                  Guide

                </Link>

                <Link href="/" className="hidden text-sm text-gray-500 hover:text-navy-700 lg:inline">

                  View site

                </Link>

                <button

                  type="button"

                  onClick={logout}

                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-2.5 py-1.5 text-sm text-navy-700 hover:bg-navy-50 sm:px-3"

                >

                  <LogOut className="h-4 w-4" aria-hidden />

                  <span className="hidden sm:inline">Sign out</span>

                </button>

              </div>

            </div>

            <div className="-mx-4 px-4 py-2 sm:-mx-6 sm:px-6">

              <AdminNavBar items={navItems} variant="normal" />

            </div>

          </Container>

        </header>

        <DbHealthBanner />

        <main>{children}</main>

      </div>

    );

  }



  return (

    <div className="jarvis-admin admin-jupiter">

      <JarvisBackdrop />

      <header className="jarvis-content sticky top-0 z-50 border-b border-cyan-500/15 bg-[#020617]/85 backdrop-blur-xl">

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

          <div className="flex h-14 items-center justify-between gap-3">

            <Link href="/admin" className="flex shrink-0 items-center gap-2.5">

              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-transparent text-xs font-bold text-cyan-200">

                OM

                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

              </span>

              <span className="hidden truncate font-semibold text-white sm:inline">

                OM<span className="text-cyan-400">-Jupiter</span>

              </span>

            </Link>

            <div className="flex shrink-0 items-center gap-2">

              <AdminModeToggle compact />

              <Link href="/admin/settings" className="jarvis-nav-link hidden text-xs md:inline-flex">

                Settings

              </Link>

              <Link href="/admin/guide" className="jarvis-nav-link hidden text-xs lg:inline-flex">

                Guide

              </Link>

              <Link href="/" className="jarvis-nav-link hidden text-xs xl:inline-flex">

                Public site

              </Link>

              <button type="button" onClick={logout} className="jarvis-btn text-xs">

                <LogOut className="h-3.5 w-3.5" aria-hidden />

                <span className="hidden sm:inline">Sign out</span>

              </button>

            </div>

          </div>

          <div className="border-t border-cyan-500/10 py-1.5">

            <AdminNavBar items={navItems} variant="jupiter" />

          </div>

        </div>

      </header>

      <DbHealthBanner />

      <main>{children}</main>

    </div>

  );

}



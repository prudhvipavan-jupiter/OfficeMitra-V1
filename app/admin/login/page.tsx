"use client";

import { FormEvent, useState } from "react";
import { Cpu } from "lucide-react";
import { AdminModeToggle } from "@/components/admin/AdminModeToggle";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { JarvisBackdrop } from "@/components/admin/jarvis/JarvisBackdrop";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import "../jarvis-theme.css";

export default function AdminLoginPage() {
  const { isJupiter } = useAdminTheme();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const password = String(new FormData(e.currentTarget).get("password") ?? "").trim();
    if (!password) {
      setError("Enter your password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.assign("/admin");
        return;
      }

      setError(res.status === 401 ? "Invalid password" : "Sign in failed. Restart the dev server and try again.");
    } catch {
      setError("Could not reach the server. Check that npm run dev is running.");
    }
    setLoading(false);
  }

  if (!isJupiter) {
    return (
      <div className="admin-normal flex min-h-screen items-center justify-center px-4">
        <Container narrow className="w-full max-w-md">
          <div className="absolute right-4 top-4">
            <AdminModeToggle />
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-600 text-sm font-bold text-white">
                OM
              </span>
              <h1 className="mt-4 text-2xl font-bold text-navy-900">{siteConfig.name} Admin</h1>
              <p className="mt-1 text-sm text-gray-600">Sign in to manage the platform.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-field mt-1"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-navy-700 px-6 py-2.5 font-medium text-white hover:bg-navy-600 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="jarvis-admin admin-jupiter flex min-h-screen items-center justify-center px-4">
      <JarvisBackdrop />
      <div className="absolute right-4 top-4 z-10">
        <AdminModeToggle />
      </div>
      <div className="jarvis-content relative w-full max-w-md">
        <div className="jarvis-panel jarvis-panel-glow p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10">
              <Cpu className="h-8 w-8 text-cyan-300" />
            </div>
            <p className="jarvis-label mt-4 text-cyan-400">Secure access</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              OM<span className="text-cyan-400">-Jupiter</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">{siteConfig.name} command interface</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="jarvis-label">
                Access code
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field mt-1"
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={cn("jarvis-btn jarvis-btn-gold w-full justify-center py-3")}
            >
              {loading ? "Authenticating…" : "Initialize session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

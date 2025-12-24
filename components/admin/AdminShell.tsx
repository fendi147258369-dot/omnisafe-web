"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";

const nav = [
  { href: "/admin/dashboard", label: "仪表盘" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/deposits", label: "充值审核" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      if (!token) {
        router.replace("/admin");
        setChecking(false);
        return;
      }
      try {
        await adminApi("/internal/me");
        if (!mounted) return;
        setAuthed(true);
      } catch (e) {
        if (!mounted) return;
        localStorage.removeItem("admin_access_token");
        router.replace("/admin"); // 强制回到登录页
      } finally {
        if (mounted) setChecking(false);
      }
    };
    verify();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c6d4ff] via-[#e1e8ff] to-[#c7e6ff] flex items-center justify-center text-slate-700">
        正在验证管理员权限...
      </div>
    );
  }

  if (!authed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c6d4ff] via-[#e1e8ff] to-[#c7e6ff] text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-lg font-bold text-[#1f3f99]">OmniSafe Admin</div>
          <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 hover:bg-slate-100 ${
                  pathname === item.href ? "bg-slate-900 text-white hover:bg-slate-900" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

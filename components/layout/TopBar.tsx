"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

type Provider = "google" | "telegram" | null;

const navItems: { href: string; label: string; requiresAuth?: boolean }[] = [
  { href: "/scan", label: "代币检测" },
  { href: "/abnormal-tokens", label: "今日异常代币" },
  { href: "/new-listings", label: "今日新入市" },
  { href: "/exchange-updates", label: "今日交易所动态" },
  { href: "/pricing", label: "方案定价" },
  { href: "/credits", label: "账单 / 充值", requiresAuth: true },
  { href: "/bots", label: "机器人集成" },
  { href: "/vision", label: "关于 OmniSafe" },
];

const GoogleBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
    <path
      fill="#fbc02d"
      d="M43.6 20.5H42V20H24v8h11.3C33.8 31.9 29.2 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3.4 29.6 1 24 1 11.9 1 2 10.9 2 23s9.9 22 22 22c12.1 0 21-9 21-22 0-1.3-.1-2.3-.4-3.5z"
    />
    <path
      fill="#e53935"
      d="M6.3 14.7l6.6 4.8C14.8 15.3 18.9 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3.4 29.6 1 24 1 16 1 9 5.6 6.3 14.7z"
    />
    <path
      fill="#4caf50"
      d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.2C29.1 36.4 26.7 37 24 37c-5.2 0-9.7-3.3-11.3-7.9l-6.6 5.1C9 42.4 15.9 45 24 45z"
    />
    <path
      fill="#1565c0"
      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.8-6.1 7.4l6.2 5.2C38.9 38.8 42 32.8 42 23c0-1.3-.1-2.3-.4-3.5z"
    />
  </svg>
);

const TelegramBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="h-5 w-5">
    <circle cx="120" cy="120" r="120" fill="#2ca5e0" />
    <path
      d="M170.2 72.5l-20.8 98.2c-1.6 7.1-5.8 8.9-11.8 5.5l-32.5-24-15.7 15.1c-1.7 1.7-3.1 3.1-6.4 3.1l2.3-33.1 60.2-54.3c2.6-2.3-.6-3.6-4-1.3l-74.4 47-32.1-10c-7-2.2-7.1-7 1.5-10.3l125.6-48.5c5.8-2.1 10.8 1.4 8.9 10.2z"
      fill="#fff"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20m6.92 9h-2.08a15 15 0 0 0-.93-4.5A8.02 8.02 0 0 1 18.92 11M12 4c1.08 1.05 2.33 3.13 2.73 6h-5.5C9.63 7.13 10.88 5.05 12 4M8.09 13h7.82c-.4 2.87-1.65 4.95-2.73 6c-1.12-1.05-2.32-3.13-3-6M8.09 9C8.77 6.13 10 4.05 12 2c2 2.05 3.23 4.13 3.91 7H8.09m-2.9 2h2.08c.15 1.44.52 2.78 1.01 3.96A8.01 8.01 0 0 1 5.18 11m3.82 6.5c.82 1.6 1.72 2.8 2.64 3.47A7.99 7.99 0 0 1 7.5 17.5m5.86 3.47c.92-.67 1.82-1.87 2.64-3.47c.6-1.17 1-2.52 1.21-4H7.79c.21 1.48.61 2.83 1.21 4m1.46-1.97c.9-1.05 2.13-3.13 2.73-6h2.08c-.37 2.35-1.21 4.38-2.21 6c-.77 1.27-1.63 2.2-2.6 2.77M11 17c-.77-.57-1.53-1.5-2.21-2.77c-1-1.62-1.84-3.65-2.21-6H8.7c.6 2.87 1.83 4.95 2.73 6c.7.82 1.23 1.28 1.57 1.49c.16.1.25.14.3.14s.14-.04.3-.14"
    />
  </svg>
);

export function TopBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [providerOverride, setProviderOverride] = useState<Provider>(null);
  const [hasToken, setHasToken] = useState(false);
  const [cachedEmail, setCachedEmail] = useState<string | undefined>(undefined);
  const [fetchedCredits, setFetchedCredits] = useState<number>(0);
  const [fetchedPlan, setFetchedPlan] = useState<string>("未订阅");
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const readAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const savedProvider = typeof window !== "undefined" ? localStorage.getItem("auth_provider") : null;
      const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
      setHasToken(!!token);
      setProviderOverride((savedProvider as Provider) || null);
      if (cachedEmail) setCachedEmail(cachedEmail);
    };
    readAuth();
    const handler = () => readAuth();
    window.addEventListener("storage", handler);
    const toastHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) {
        setToast({ message: detail.message });
        setTimeout(() => setToast(null), 1500);
      }
    };
    window.addEventListener("auth-toast", toastHandler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-toast", toastHandler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setFetchedCredits(0);
      setFetchedPlan("未订阅");
      return;
    }

    let alive = true;
    const loadMe = async () => {
      try {
        const data = await api("/auth/me");
        if (!alive) return;
        const total =
          (data?.credits ?? 0) ||
          data?.total_credits ||
          (data?.prepaid_credits ?? 0) + (data?.subscription_credits ?? 0);
        setFetchedCredits(total ?? 0);
        setFetchedPlan(data?.plan_label || "未订阅");
      } catch {
        if (!alive) return;
        setFetchedCredits(0);
        setFetchedPlan("未订阅");
      }
    };

    loadMe();
    const timer = window.setInterval(loadMe, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [hasToken]);

  const isLoggedIn = !!user || hasToken || !!cachedEmail;
  const displayEmail = user?.email || cachedEmail;
  const provider = (user?.provider as Provider) || providerOverride;
  const displayCredits = fetchedCredits || 0;
  const displayPlan = fetchedPlan || "未订阅";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_provider");
      localStorage.removeItem("user_email");
    }
    setHasToken(false);
    setCachedEmail(undefined);
    setFetchedCredits(0);
    setFetchedPlan("未订阅");
    setToast({ message: "退出成功" });
    setTimeout(() => setToast(null), 1500);
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-gradient-to-r from-[#e8eeff] via-[#f3f6ff] to-[#e8f2ff] pl-6 pr-4 md:pl-8">
      <Link href="/" className="flex items-center gap-2 hover:text-slate-800" aria-label="返回首页">
        <img src="/icons/tubiao.png" alt="OmniSafe Logo" className="h-8 w-auto" />
        <span className="text-2xl font-semibold tracking-tight text-slate-900">OmniSafe</span>
      </Link>
      {/* Mobile nav: 语言按钮 + 九宫格菜单（导航/账户） */}
      <div className="ml-auto flex items-center gap-2 md:hidden">
        <button
          type="button"
          aria-label="语言切换"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm hover:bg-slate-100"
        >
          <GlobeIcon />
        </button>
        <div className="relative">
          <button
            type="button"
            aria-label="更多导航"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm hover:bg-slate-100"
          >
            <div className="grid grid-cols-3 gap-0.5 text-slate-700">
              {Array.from({ length: 9 }).map((_, idx) => (
                <span key={idx} className="h-1.5 w-1.5 rounded-full bg-slate-700" />
              ))}
            </div>
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-2 text-sm font-semibold text-slate-800">
              {navItems
                .filter((item) => !item.requiresAuth || isLoggedIn)
                .map((item) => {
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "block px-3 py-2 hover:bg-slate-100",
                        active && "text-indigo-600"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              <div className="my-1 h-px bg-slate-100" />
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-800 hover:bg-slate-100"
                aria-label="语言切换"
              >
                <GlobeIcon />
                <span>语言</span>
              </button>
              <div className="my-1 h-px bg-slate-100" />
              {isLoggedIn ? (
                <div className="px-3 py-2 space-y-1 text-slate-800">
                  <div className="flex items-center gap-2">
                    {provider === "google" ? <GoogleBadge /> : provider === "telegram" ? <TelegramBadge /> : null}
                    <span className="font-semibold text-slate-900">
                      {displayEmail ? `${displayEmail.slice(0, 6)}...` : "已登录"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">Credits: {displayCredits}</div>
                  <div className="text-xs text-slate-600">Plan: {displayPlan}</div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 w-full rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-indigo-600 hover:bg-slate-100"
                >
                  登录
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 桌面：语言 + 账户 */}
      <div className="ml-auto hidden md:flex items-center gap-3 text-sm text-slate-700">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100 transition"
          aria-label="语言切换"
        >
          <GlobeIcon />
          <span className="hidden sm:inline">语言</span>
        </button>
        {isLoggedIn ? (
          <div className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm">
            {provider === "google" && (
              <div className="relative group">
                <GoogleBadge />
                {displayEmail && (
                  <div className="absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-lg group-hover:block">
                    {displayEmail}
                  </div>
                )}
              </div>
            )}
            {provider === "telegram" && <TelegramBadge />}
            {!provider && (
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            )}
            {provider !== "google" && (
              <span className="text-slate-800 font-semibold relative group">
                {displayEmail ? (
                  <>
                    {displayEmail.slice(0, 6)}
                    {"…".repeat(1)}
                    <div className="absolute left-0 top-full mt-1 hidden whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-lg group-hover:block">
                      {displayEmail}
                    </div>
                  </>
                ) : (
                  "未获取身份"
                )}
              </span>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <span>Credits:</span>
              <span className="font-semibold text-slate-900">{displayCredits}</span>
              <span className="ml-2">Plan:</span>
              <span className="font-semibold text-slate-900">{displayPlan}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              退出
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 shadow-sm"
          >
            登录
          </Link>
        )}
      </div>
      {toast && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-[0_20px_60px_-32px_rgba(31,63,153,0.45)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600">
                <path
                  fill="currentColor"
                  d="M9.55 17.6L4.4 12.45l1.4-1.4l3.75 3.75l8.7-8.7l1.4 1.425z"
                />
              </svg>
            </div>
            <div className="text-sm font-semibold text-slate-900">{toast.message}</div>
          </div>
        </div>
      )}
    </header>
  );
}

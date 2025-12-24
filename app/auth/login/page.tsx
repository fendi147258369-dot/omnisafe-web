"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { AppShell } from "../../../components/layout/AppShell";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.omnisafe.info";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6">
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

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="h-9 w-9">
    <circle cx="120" cy="120" r="120" fill="#2ca5e0" />
    <path
      d="M170.2 72.5l-20.8 98.2c-1.6 7.1-5.8 8.9-11.8 5.5l-32.5-24-15.7 15.1c-1.7 1.7-3.1 3.1-6.4 3.1l2.3-33.1 60.2-54.3c2.6-2.3-.6-3.6-4-1.3l-74.4 47-32.1-10c-7-2.2-7.1-7 1.5-10.3l125.6-48.5c5.8-2.1 10.8 1.4 8.9 10.2z"
      fill="#fff"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const initializedRef = useRef(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const clientMissing = !GOOGLE_CLIENT_ID;

  const renderGoogleButton = useCallback(() => {
    if (googleBtnRef.current && typeof window !== "undefined" && window.google?.accounts?.id?.renderButton) {
      googleBtnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "signin_with",
      });
    }
  }, []);

  // 补充轮询：如果脚本已缓存或 onLoad 未触发，检测 window.google 并渲染按钮
  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      const ready = typeof window !== "undefined" && !!(window as any).google?.accounts?.id;
      if (ready) {
        setGoogleReady(true);
        renderGoogleButton();
        window.clearInterval(timer);
      } else if (attempts > 40) {
        window.clearInterval(timer);
      }
      attempts += 1;
    }, 250);
    return () => window.clearInterval(timer);
  }, [renderGoogleButton]);

  // 初始化 Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      setError("缺少 NEXT_PUBLIC_GOOGLE_CLIENT_ID，请配置后刷新。");
      return;
    }
    if (!googleReady || !window.google) return;

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        use_fedcm_for_prompt: false,
        callback: async (response: any) => {
          setLoading(true);
          setError(null);
          try {
            if (!API_BASE) {
              console.warn("NEXT_PUBLIC_API_BASE not set, using relative /auth/google");
            }
            const res = await fetch(`${API_BASE}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: response.credential }),
            });
            if (!res.ok) {
              throw new Error("登录失败");
            }
            const data = await res.json();
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("auth_provider", "google");
            window.dispatchEvent(new Event("auth-changed"));
            window.dispatchEvent(new CustomEvent("auth-toast", { detail: { message: "登录成功" } }));
            setToast("登录成功");
            setTimeout(() => {
              router.push("/");
            }, 1500);
          } catch (e: any) {
            setError(e?.message || "登录失败");
          } finally {
            setLoading(false);
          }
        },
      });
      initializedRef.current = true;
    }

    renderGoogleButton();

    // 若首次打开时 SDK 尚未就绪，准备好后持续尝试渲染按钮，直到渲染成功或超时
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (googleBtnRef.current && googleBtnRef.current.childElementCount === 0) {
        renderGoogleButton();
      }
      if (googleBtnRef.current?.childElementCount || attempts > 20) {
        window.clearInterval(interval);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [router, googleReady, clientMissing, renderGoogleButton]);

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("缺少 NEXT_PUBLIC_GOOGLE_CLIENT_ID，请配置后刷新。");
      return;
    }
    if (!googleReady || typeof window === "undefined" || !window.google) {
      setError("Google 服务未加载，请稍后重试");
      return;
    }
    renderGoogleButton();
    // 仅显示官方按钮，不触发 One Tap prompt
  };

  return (
    <AppShell>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
        async
        defer
      />
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
        <div className="relative w-full max-w-xl md:aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#9fbefc] via-[#b6c9ff] to-[#7aa7ff] shadow-2xl ring-1 ring-[#8bb4ff]/50 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              try {
                router.push("/");
              } catch (e) {
                window.location.href = "/";
              }
            }}
            className="absolute left-3 top-3 h-9 w-9 rounded-full border border-white/70 bg-white text-[#1f3f99] shadow-lg hover:shadow-xl transition z-10"
            aria-label="关闭"
          >
            ×
          </button>
          <div className="relative h-full w-full px-4 py-6 md:px-10 md:py-10 flex items-center justify-start flex-col text-center text-slate-900 overflow-y-auto">
            <div className="space-y-4 text-sm w-full">
              <div className="flex justify-center login-logo-wrapper mt-0">
                <img
                  src="/icons/logo.png"
                  alt="OmniSafe Logo"
                  className="w-[260px] md:w-[520px] max-w-[95%] h-auto mx-auto mb-4 md:mb-6 select-none pointer-events-none"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">欢迎使用 OmniSafe</h2>
                <p className="text-sm text-slate-800">链上代币风险检测工具</p>
              </div>
              <p className="text-center text-slate-800">无需注册 · 不保存密码 · 即点即用</p>
              <p className="text-center text-slate-800">选择以下方式登录</p>
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div
                    ref={googleBtnRef}
                    aria-label="使用 Google 登录"
                    className="flex h-12 items-center justify-center"
                  />
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || !googleReady || clientMissing}
                    className="text-xs text-slate-500 hover:text-slate-700 transition"
                  >
                    Google
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled
                    aria-label="Telegram 即将支持"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2ca5e0] shadow text-white"
                  >
                    <TelegramIcon />
                  </button>
                  <span className="text-xs text-slate-500">Telegram</span>
                </div>
              </div>

              {error && <div className="text-xs text-red-600 text-center">{error}</div>}
              <p className="text-xs text-slate-700 text-center">
                登录即完成注册，我们不会保存密码，也不会发送邮件或短信。
              </p>
              <p className="text-[11px] text-slate-600 text-center">
                本服务仅提供链上数据分析，不构成投资建议。
              </p>
            </div>
          </div>
        </div>
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
            <div className="text-sm font-semibold text-slate-900">{toast}</div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

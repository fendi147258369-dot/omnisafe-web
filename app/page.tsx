// 首页需要平滑滚动 CTA，故使用客户端组件
"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/layout/AppShell";

export default function Home() {
  const router = useRouter();
  const scrollToFeatures = useCallback(() => {
    router.push("/scan");
  }, [router]);

  return (
    <AppShell>
      <div className="space-y-5 -mt-6">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 py-9 md:px-9 md:py-11 bg-transparent">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-1 space-y-4 text-left text-slate-900 -mt-2 md:-mt-6">
              <div className="text-base md:text-lg font-semibold text-[#1f3f99]">OmniSafe</div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">看见风险，而不是猜测</h1>
              <p className="text-base md:text-lg text-slate-800">输入一个代币，我们帮你把链上的事实展开。</p>
              <div className="mt-4 space-y-1 text-sm md:text-base text-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-slate-800">不需要注册、使用</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-7 w-7" aria-label="Google">
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
                  </span>
                  <span className="inline-flex h-7 w-7 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="h-7 w-7" aria-label="Telegram">
                      <circle cx="120" cy="120" r="120" fill="#2ca5e0" />
                      <path
                        d="M170.2 72.5l-20.8 98.2c-1.6 7.1-5.8 8.9-11.8 5.5l-32.5-24-15.7 15.1c-1.7 1.7-3.1 3.1-6.4 3.1l2.3-33.1 60.2-54.3c2.6-2.3-.6-3.6-4-1.3l-74.4 47-32.1-10c-7-2.2-7.1-7 1.5-10.3l125.6-48.5c5.8-2.1 10.8 1.4 8.9 10.2z"
                        fill="#fff"
                      />
                    </svg>
                  </span>
                  <span className="text-sm md:text-base text-slate-800">登陆</span>
                </div>
                <div className="text-sm md:text-base text-[#0b5ed7] font-semibold">限时免费！每一位新用户都能获得一次检测的体验机会</div>
              </div>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#1f3f99] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1a357f]"
              >
                开始检测
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="/assets/hero-structure.png"
                alt="OmniSafe brand illustration"
                className="w-full max-w-[520px] h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </section>

        <style jsx>{`
          @media (max-width: 768px) {
            /* 动画已删除 */
          }
          @media (max-width: 480px) {
            /* 动画已删除 */
          }
        `}</style>

        {/* 结论型差异 */}
        <section className="space-y-4" id="feature-block">
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="feature-card"
              style={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                background:
                  "linear-gradient(135deg, rgba(220,228,255,0.92) 0%, rgba(238,243,255,0.94) 45%, rgba(215,232,255,0.88) 100%)",
                boxShadow: "0 18px 48px -22px rgba(31,63,153,0.45)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="feature-icon flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900">你看到的是风险结构，而不是单一结论</div>
                  <p className="mt-2 text-sm text-slate-700">合约结构、权限、流动性、资金行为被同时展开。</p>
                </div>
              </div>
            </div>
            <div
              className="feature-card"
              style={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                background:
                  "linear-gradient(135deg, rgba(220,228,255,0.92) 0%, rgba(238,243,255,0.94) 45%, rgba(215,232,255,0.88) 100%)",
                boxShadow: "0 18px 48px -22px rgba(31,63,153,0.45)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="feature-icon flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="4" cy="12" r="2" />
                    <circle cx="20" cy="12" r="2" />
                    <circle cx="12" cy="4" r="2" />
                    <circle cx="12" cy="20" r="2" />
                    <line x1="12" y1="9" x2="12" y2="6" />
                    <line x1="12" y1="15" x2="12" y2="18" />
                    <line x1="9" y1="12" x2="6" y2="12" />
                    <line x1="15" y1="12" x2="18" y2="12" />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900">你看到的是全量池子与主池来源</div>
                  <p className="mt-2 text-sm text-slate-700">所有池子分布与异常情况同步呈现。</p>
                </div>
              </div>
            </div>
            <div
              className="feature-card"
              style={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                background:
                  "linear-gradient(135deg, rgba(220,228,255,0.92) 0%, rgba(238,243,255,0.94) 45%, rgba(215,232,255,0.88) 100%)",
                boxShadow: "0 18px 48px -22px rgba(31,63,153,0.45)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="feature-icon flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <path d="M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900">你看到的是可复核的链上事实</div>
                  <p className="mt-2 text-sm text-slate-700">每一条提示均来自当前链上数据，可被独立验证。</p>
                </div>
              </div>
            </div>
            <div
              className="feature-card"
              style={{
                borderColor: "rgba(255, 255, 255, 0.5)",
                background:
                  "linear-gradient(135deg, rgba(220,228,255,0.92) 0%, rgba(238,243,255,0.94) 45%, rgba(215,232,255,0.88) 100%)",
                boxShadow: "0 18px 48px -22px rgba(31,63,153,0.45)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="feature-icon flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-900">你得到的是风控视角，而不是投资建议</div>
                  <p className="mt-2 text-sm text-slate-700">不替你做判断，只提示需要注意的事实。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 为什么要使用 OmniSafe */}
        <section className="rounded-2xl border border-white/30 bg-gradient-to-br from-[#c6d4ffcc] via-[#e1e8ffcc] to-[#c7e6ffcc] px-4 py-5 md:px-6 md:py-6 shadow-[0_14px_32px_-22px_rgba(31,63,153,0.42)]">
          <div className="space-y-3 text-slate-900">
            <h3 className="text-lg font-semibold">为什么要使用 OmniSafe？</h3>
            <p className="text-sm md:text-base font-semibold text-slate-900">
              你真正需要的并不是一个评分的玩具，而是一个真正依据事实进行风控的系统。
            </p>
            <p className="text-xs md:text-sm text-slate-700">您能够更加聪明，是因为你能看到更多的事实。</p>
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 pt-2">
              <div className="rounded-xl border border-white/35 bg-white/12 p-4 shadow-[0_10px_28px_-20px_rgba(31,63,153,0.4)]">
                <div className="text-sm font-semibold text-slate-900 mb-1">不依赖缓存结论</div>
                <p className="text-xs md:text-sm text-slate-800">
                  只展示当前区块的真实状态，而不是提前算好的评分或标签。
                </p>
              </div>
              <div className="rounded-xl border border-white/35 bg-white/12 p-4 shadow-[0_10px_28px_-20px_rgba(31,63,153,0.4)]">
                <div className="text-sm font-semibold text-slate-900 mb-1">看结构，而不是打勾</div>
                <p className="text-xs md:text-sm text-slate-800">
                  权限、流动性、资金行为如何相互连接，一次性展开。
                </p>
              </div>
              <div className="rounded-xl border border-white/35 bg-white/12 p-4 shadow-[0_10px_28px_-20px_rgba(31,63,153,0.4)]">
                <div className="text-sm font-semibold text-slate-900 mb-1">实时链上事实</div>
                <p className="text-xs md:text-sm text-slate-800">
                  不使用缓存数据，只反映当前链上正在发生的行为。
                </p>
              </div>
              <div className="rounded-xl border border-white/35 bg-white/12 p-4 shadow-[0_10px_28px_-20px_rgba(31,63,153,0.4)]">
                <div className="text-sm font-semibold text-slate-900 mb-1">你自己做决定</div>
                <p className="text-xs md:text-sm text-slate-800">
                  OmniSafe 只标出需要注意的地方，不告诉你该不该买。
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-white/30 my-2" />
            <p className="text-xs md:text-sm text-slate-800">
              市场唯一能够确定的就是不确定，而任何定论性的报告结果都可能让你落入市场的陷阱。你应该做的是看清每一步的风险，而不是被告知往哪走。
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

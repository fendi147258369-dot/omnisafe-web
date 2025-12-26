"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";

const COPY = {
  hero: {
    title: "今日 Solana 新币",
    subtitle: "基于 Solana 链上新 Token / 新交易池事件整理，仅展示新鲜出现的可交易标的",
    liveLabel: "Live",
  },
  summary: {
    totalTitle: "今日新币数量",
    totalValue: "124",
    totalHint: "最近 1 小时",
    totalSub: "37",
    sourceTitle: "新币主要来源",
    sourceItems: ["Pump.fun", "Raydium"],
    liquidityTitle: "新币平均初始流动性",
    liquidityValue: "$3.2k",
  },
  list: {
    title: "Solana 新币实时列表",
    subtitle: "以下为链上池子创建事件，不代表项目是否安全",
    timeFilters: [
      { id: "10m", label: "前 10 分钟" },
      { id: "1h", label: "前 1 小时" },
      { id: "today", label: "今日" },
      { id: "all", label: "全新" },
    ],
    flowLabel: "流动",
    flowOptions: [
      { id: "lt1k", label: "< $1k" },
      { id: "1k-5k", label: "$1k - $5k" },
      { id: "gt5k", label: "> $5k" },
      { id: "all", label: "全部" },
    ],
    statusLabel: "可交易",
    actionLabel: "查看检测（付费）",
  },
  footerNote: "风险提示：以下新币以链上交易池创建事件为基础，仅反映可交易性，不构成投资建议。",
} as const;

type TimeFilterId = (typeof COPY.list.timeFilters)[number]["id"];

type SolanaToken = {
  symbol: string;
  address: string;
  time: string;
  source: string;
  tradable: boolean;
  iconStyle: "violet" | "amber" | "indigo" | "sky" | "emerald" | "blue";
};

const API_ENDPOINT = "/api/abnormal-tokens";

const MOCK_TOKENS: SolanaToken[] = [
  {
    symbol: "$WIFDOGE",
    address: "CE5h8W2dfVp9MbdG3g5Vh2RnQzL7aQK9QFpump",
    time: "6 分钟前",
    source: "Pump.fun",
    tradable: true,
    iconStyle: "violet",
  },
  {
    symbol: "$FLOKI",
    address: "1127abzQ9oEokp3Wvtsq8Z2v4n8H1kiCK",
    time: "7 分钟前",
    source: "Pump.fun",
    tradable: true,
    iconStyle: "amber",
  },
  {
    symbol: "$LUNA",
    address: "7Np3w9hR8d6k9yM4rPqV2GmJ1BurFx",
    time: "10 分钟前",
    source: "Pump.fun",
    tradable: true,
    iconStyle: "indigo",
  },
  {
    symbol: "$PUTIN",
    address: "8LiepQ9Vy2RZ1sM4tK8mPY520",
    time: "8 分钟前",
    source: "Raydium",
    tradable: true,
    iconStyle: "sky",
  },
  {
    symbol: "$LUNA",
    address: "7Np3w9hR8d6k9yM4rPqV2GmJ1BurFx",
    time: "10 分钟前",
    source: "Raydium",
    tradable: true,
    iconStyle: "blue",
  },
  {
    symbol: "$SCHEEMS",
    address: "31WAx9LM7zQ2Jv1rP5FNytT",
    time: "12 分钟前",
    source: "Raydium",
    tradable: true,
    iconStyle: "emerald",
  },
];

async function getSolanaNewTokens(): Promise<SolanaToken[]> {
  void API_ENDPOINT;
  return MOCK_TOKENS;
}

const ICON_STYLES: Record<SolanaToken["iconStyle"], string> = {
  violet: "from-indigo-500 to-purple-500",
  amber: "from-amber-400 to-orange-400",
  indigo: "from-indigo-500 to-sky-500",
  sky: "from-sky-500 to-indigo-400",
  emerald: "from-emerald-400 to-teal-400",
  blue: "from-blue-500 to-indigo-500",
};

const truncateAddress = (value: string) => {
  if (value.length <= 10) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-5)}`;
};

export default function AbnormalTokensPage() {
  const [tokens, setTokens] = useState<SolanaToken[]>([]);
  const [activeTime, setActiveTime] = useState<TimeFilterId>(COPY.list.timeFilters[2].id);
  const [activeFlow, setActiveFlow] = useState(COPY.list.flowOptions[0].id);

  useEffect(() => {
    getSolanaNewTokens().then(setTokens);
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f2f5ff] to-[#e8ecff] p-6 shadow-sm">
          <div className="absolute inset-0 hero-sheen" aria-hidden="true" />
          <div className="relative flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{COPY.hero.title}</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
                {COPY.hero.liveLabel}
              </span>
            </div>
            <p className="text-sm text-slate-600">{COPY.hero.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#e9e4ff] via-white to-[#f6f2ff] p-5 shadow-sm">
            <div className="absolute inset-0 stat-wave" aria-hidden="true" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">{COPY.summary.totalTitle}</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>{COPY.summary.totalHint}</span>
                  <span className="text-slate-900">{COPY.summary.totalSub}</span>
                </div>
              </div>
              <div className="text-4xl font-semibold text-slate-900">{COPY.summary.totalValue}</div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="absolute inset-0 stat-wave" aria-hidden="true" />
            <div className="relative">
              <div className="text-sm font-semibold text-slate-700">{COPY.summary.sourceTitle}</div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {COPY.summary.sourceItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="absolute inset-0 stat-wave" aria-hidden="true" />
            <div className="relative">
              <div className="text-sm font-semibold text-slate-700">{COPY.summary.liquidityTitle}</div>
              <div className="mt-4 flex items-center gap-2 text-3xl font-semibold text-slate-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                  $ 
                </span>
                {COPY.summary.liquidityValue}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{COPY.list.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{COPY.list.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              {COPY.list.timeFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTime(item.id)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    activeTime === item.id
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
            >
              {COPY.list.flowLabel}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {COPY.list.flowOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFlow(item.id)}
                className={clsx(
                  "rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold transition",
                  activeFlow === item.id
                    ? "bg-indigo-500 text-white border-indigo-400"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {tokens.map((item, index) => (
              <div
                key={`${item.symbol}-${item.address}`}
                className="token-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute inset-0 card-wave" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm",
                        "bg-gradient-to-br",
                        ICON_STYLES[item.iconStyle]
                      )}
                    >
                      <span className="text-sm font-semibold">◎</span>
                    </span>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{item.symbol}</div>
                      <div className="text-sm text-slate-500">{truncateAddress(item.address)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      {item.time}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      {item.source}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {COPY.list.statusLabel}
                    </span>
                    <Link
                      href={`/scan?token_address=${encodeURIComponent(item.address)}`}
                      className="ml-auto inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                    >
                      {COPY.list.actionLabel}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                        <path
                          d="M5 12h12m0 0l-4-4m4 4l-4 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          {COPY.footerNote}
        </div>
      </div>

      <style jsx>{`
        .hero-sheen {
          background: radial-gradient(520px circle at 10% 0%, rgba(99, 102, 241, 0.18), transparent 60%),
            radial-gradient(520px circle at 90% 0%, rgba(56, 189, 248, 0.16), transparent 55%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.7));
          background-size: 200% 200%;
          animation: heroGlow 10s ease-in-out infinite;
          opacity: 0.8;
        }

        .stat-wave {
          background: radial-gradient(240px circle at 90% 50%, rgba(99, 102, 241, 0.15), transparent 70%),
            radial-gradient(320px circle at 30% 10%, rgba(167, 139, 250, 0.15), transparent 65%);
          opacity: 0.6;
        }

        .card-wave {
          background: radial-gradient(300px circle at 85% 50%, rgba(99, 102, 241, 0.18), transparent 70%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
          opacity: 0.55;
        }

        .pulse-dot {
          animation: pulse 1.6s ease-in-out infinite;
        }

        .token-card {
          animation: fadeUp 0.5s ease both;
        }

        @keyframes heroGlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-sheen,
          .pulse-dot,
          .token-card {
            animation: none !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

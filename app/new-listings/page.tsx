"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Section } from "../../components/ui/Section";

const COPY = {
  title: "今日新入市代币",
  subtitle: "基于链上池子创建事件整理，仅展示可验证的事实数据",
  liveLabel: "Live",
  summary: {
    title: "今日链上热度",
    metricLabel: "新增交易池",
  },
  filters: {
    title: "筛选条件",
    chainLabel: "链选择",
    timeLabel: "时间范围",
    sortLabel: "排序方式",
    chains: [
      { id: "Ethereum", label: "Ethereum" },
      { id: "BSC", label: "BSC" },
      { id: "Base", label: "Base" },
      { id: "Arbitrum", label: "Arbitrum" },
    ],
    timeRanges: [
      { id: "24h", label: "24h" },
      { id: "7d", label: "7d" },
    ],
    sortOptions: [
      { id: "created_at", label: "创建时间" },
      { id: "liquidity", label: "流动性" },
    ],
  },
  riskHints: {
    notChecked: "未检测",
    detectable: "可检测",
  },
  list: {
    title: "新入市代币列表",
    headers: {
      chain: "链",
      token: "代币",
      tokenAddress: "代币地址",
      pairAddress: "交易池地址",
      createdAt: "创建时间",
      liquidity: "流动性",
      risk: "风险提示",
      action: "操作",
    },
    actionLabel: "查看检测",
    empty: "暂无新入市代币",
  },
  footerNote: "本页面展示的是新创建交易池的代币信息，不构成任何投资建议。",
} as const;

type RiskHint = (typeof COPY.riskHints)[keyof typeof COPY.riskHints];
type TimeRangeId = (typeof COPY.filters.timeRanges)[number]["id"];
type SortById = (typeof COPY.filters.sortOptions)[number]["id"];

type Listing = {
  chain: "Ethereum" | "BSC" | "Base" | "Arbitrum";
  token_symbol: string;
  token_address: string;
  pair_address: string;
  created_at: string;
  liquidity_usd: string | null;
  risk_hint: RiskHint;
};

type SummaryStat = {
  chain: Listing["chain"];
  count: number;
};

const API_ENDPOINT = "/api/new-listings";

const MOCK_LISTINGS: Listing[] = [
  {
    chain: "Ethereum",
    token_symbol: "TURBO",
    token_address: "0x4f7c0f0a2b6c3f8ad2fb1d8e7a6f7b2c4d9a8e10",
    pair_address: "0x9a1b2c3d4e5f678901234567890abcdef1234567",
    created_at: "3 分钟前",
    liquidity_usd: "$8.7k",
    risk_hint: COPY.riskHints.notChecked,
  },
  {
    chain: "BSC",
    token_symbol: "PEPE2",
    token_address: "0x2c9a2b3c4d5e6f7081928374655647382910abcd",
    pair_address: "0x3f9d4e5c6b7a8091827364556677889900aabbcc",
    created_at: "6 分钟前",
    liquidity_usd: "$2.5k",
    risk_hint: COPY.riskHints.detectable,
  },
  {
    chain: "Base",
    token_symbol: "RBTZ",
    token_address: "0x6b7c8d9e0f11223344556677889900aabbccdde1",
    pair_address: "0xaabbccddeeff0011223344556677889900aabbcc",
    created_at: "12 分钟前",
    liquidity_usd: "$22.1k",
    risk_hint: COPY.riskHints.detectable,
  },
  {
    chain: "Base",
    token_symbol: "MOONCAT",
    token_address: "0x9f0e1d2c3b4a59687766554433221100ffeeddcc",
    pair_address: "0x1a2b3c4d5e6f7081928374655647382910fedcba",
    created_at: "18 分钟前",
    liquidity_usd: null,
    risk_hint: COPY.riskHints.notChecked,
  },
  {
    chain: "Arbitrum",
    token_symbol: "ARBX",
    token_address: "0x7c6b5a493827161514131211100f0e0d0c0b0a09",
    pair_address: "0xabc1234567890defabc1234567890defabc12345",
    created_at: "26 分钟前",
    liquidity_usd: "$13.5k",
    risk_hint: COPY.riskHints.detectable,
  },
];

const MOCK_SUMMARY: SummaryStat[] = [
  { chain: "Ethereum", count: 54 },
  { chain: "BSC", count: 30 },
  { chain: "Base", count: 21 },
  { chain: "Arbitrum", count: 12 },
];

async function getNewListings(): Promise<Listing[]> {
  return MOCK_LISTINGS;
}

const CHAIN_ICONS: Record<Listing["chain"], string> = {
  Ethereum: "/icons/ethereum.png",
  BSC: "/icons/bsc.png",
  Base: "/icons/base.png",
  Arbitrum: "/icons/arbitrum.png",
};

const CHAIN_STYLES: Record<
  Listing["chain"],
  {
    bar: string;
    chip: string;
    icon: string;
    text: string;
  }
> = {
  Ethereum: {
    bar: "bg-blue-500",
    chip: "from-blue-50 to-indigo-50",
    icon: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
  },
  BSC: {
    bar: "bg-amber-400",
    chip: "from-amber-50 to-orange-50",
    icon: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
  },
  Base: {
    bar: "bg-sky-500",
    chip: "from-sky-50 to-blue-50",
    icon: "bg-sky-100 text-sky-700",
    text: "text-sky-700",
  },
  Arbitrum: {
    bar: "bg-indigo-500",
    chip: "from-indigo-50 to-slate-50",
    icon: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
  },
};

const getChainStyle = (chain: Listing["chain"]) => CHAIN_STYLES[chain];

const truncateAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const riskBadgeClass = (hint: Listing["risk_hint"]) =>
  hint === COPY.riskHints.detectable
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
    : "border-slate-200 bg-slate-100 text-slate-600";

export default function NewListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedChains, setSelectedChains] = useState<Listing["chain"][]>(
    COPY.filters.chains.map((item) => item.id as Listing["chain"])
  );
  const [timeRange, setTimeRange] = useState<TimeRangeId>(COPY.filters.timeRanges[0].id);
  const [sortBy, setSortBy] = useState<SortById>(COPY.filters.sortOptions[0].id);

  useEffect(() => {
    getNewListings().then(setListings);
  }, []);

  const displayListings = listings;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f4f7ff] to-[#eef3ff] p-6 shadow-sm">
          <div className="absolute inset-0 hero-sheen" aria-hidden="true" />
          <div className="relative flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{COPY.title}</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
                {COPY.liveLabel}
              </span>
            </div>
            <p className="text-sm text-slate-600">{COPY.subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {COPY.summary.title}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {MOCK_SUMMARY.map((item, index) => {
              const style = getChainStyle(item.chain);
              return (
                <div
                  key={item.chain}
                  className={clsx(
                    "stat-card flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r px-4 py-3 shadow-sm",
                    style.chip
                  )}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx("flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/80", style.icon)}>
                      <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-5 w-5" />
                    </span>
                    <div>
                      <div className={clsx("text-sm font-semibold", style.text)}>{item.chain}</div>
                      <div className="text-xs text-slate-500">{COPY.summary.metricLabel}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Section title={COPY.filters.title} description="">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600">{COPY.filters.chainLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {COPY.filters.chains.map((chain) => {
                    const active = selectedChains.includes(chain.id as Listing["chain"]);
                    return (
                      <button
                        key={chain.id}
                        type="button"
                        onClick={() =>
                          setSelectedChains((prev) =>
                            prev.includes(chain.id as Listing["chain"])
                              ? prev.filter((item) => item !== chain.id)
                              : [...prev, chain.id as Listing["chain"]]
                          )
                        }
                        className={clsx(
                          "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {chain.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600">{COPY.filters.timeLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {COPY.filters.timeRanges.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setTimeRange(range.id)}
                      className={clsx(
                        "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                        timeRange === range.id
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <span className="text-xs font-semibold text-slate-600">{COPY.filters.sortLabel}</span>
              <div className="flex gap-1">
                {COPY.filters.sortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id)}
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      sortBy === option.id
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title={COPY.list.title} description="">
          <div className="rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
            <div className="hidden md:grid grid-cols-[140px_160px_1fr_1fr_130px_130px_120px_140px] gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50 px-5 py-3 text-xs font-semibold text-slate-500">
              <div>{COPY.list.headers.chain}</div>
              <div>{COPY.list.headers.token}</div>
              <div>{COPY.list.headers.tokenAddress}</div>
              <div>{COPY.list.headers.pairAddress}</div>
              <div>{COPY.list.headers.createdAt}</div>
              <div>{COPY.list.headers.liquidity}</div>
              <div>{COPY.list.headers.risk}</div>
              <div>{COPY.list.headers.action}</div>
            </div>
            <div className="space-y-3 p-3">
              {displayListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  {COPY.list.empty}
                </div>
              ) : (
                displayListings.map((item, index) => {
                  const style = getChainStyle(item.chain);
                  const tokenInitial = item.token_symbol.slice(0, 1);
                  return (
                    <div
                      key={`${item.chain}-${item.token_address}`}
                      className={clsx(
                        "listing-row group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <span className={clsx("absolute left-0 top-0 h-full w-1.5", style.bar)} />
                      <div className="hidden md:grid grid-cols-[140px_160px_1fr_1fr_130px_130px_120px_140px] items-center gap-3 pl-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                            <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                          </span>
                          <span className={clsx("font-semibold", style.text)}>{item.chain}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={clsx("flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 text-sm font-semibold", style.icon)}>
                            {tokenInitial}
                          </span>
                          <span className="font-semibold text-slate-900">{item.token_symbol}</span>
                        </div>
                        <div className="font-mono text-xs text-slate-600">{truncateAddress(item.token_address)}</div>
                        <div className="font-mono text-xs text-slate-600">{truncateAddress(item.pair_address)}</div>
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                            {item.created_at}
                          </span>
                        </div>
                        <div className={clsx("font-semibold", item.liquidity_usd ? "text-slate-900" : "text-slate-400")}>
                          {item.liquidity_usd ?? "--"}
                        </div>
                        <div>
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                              riskBadgeClass(item.risk_hint)
                            )}
                          >
                            {item.risk_hint}
                          </span>
                        </div>
                        <div>
                          <Link
                            href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
                      <div className="md:hidden space-y-3 pl-3 text-sm text-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={clsx("flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                              <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.token_symbol}</div>
                              <div className={clsx("text-xs", style.text)}>{item.chain}</div>
                            </div>
                          </div>
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                              riskBadgeClass(item.risk_hint)
                            )}
                          >
                            {item.risk_hint}
                          </span>
                        </div>
                        <div className="grid gap-2 text-xs text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.createdAt}</span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                              {item.created_at}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.liquidity}</span>
                            <span className={clsx("font-semibold", item.liquidity_usd ? "text-slate-700" : "text-slate-400")}>
                              {item.liquidity_usd ?? "--"}
                            </span>
                          </div>
                          <div>
                            {COPY.list.headers.tokenAddress}:{" "}
                            <span className="font-mono text-slate-600">{truncateAddress(item.token_address)}</span>
                          </div>
                          <div>
                            {COPY.list.headers.pairAddress}:{" "}
                            <span className="font-mono text-slate-600">{truncateAddress(item.pair_address)}</span>
                          </div>
                        </div>
                        <Link
                          href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
                  );
                })
              )}
            </div>
          </div>
        </Section>

        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          {COPY.footerNote}
        </div>
      </div>
      <style jsx>{`
        .hero-sheen {
          background: radial-gradient(420px circle at 10% 0%, rgba(99, 102, 241, 0.18), transparent 60%),
            radial-gradient(420px circle at 90% 0%, rgba(56, 189, 248, 0.16), transparent 55%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.6));
          background-size: 200% 200%;
          animation: heroGlow 10s ease-in-out infinite;
          opacity: 0.7;
        }

        .pulse-dot {
          animation: pulse 1.6s ease-in-out infinite;
        }

        .stat-card {
          animation: floatCard 6s ease-in-out infinite;
        }

        .listing-row {
          animation: fadeUp 0.5s ease both;
          will-change: transform, opacity;
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

        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-sheen,
          .pulse-dot,
          .stat-card,
          .listing-row {
            animation: none !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

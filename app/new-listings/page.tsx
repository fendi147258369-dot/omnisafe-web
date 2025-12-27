"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";

const COPY = {
  hero: {
    title: "今日链上动态 - 新建池子 & 热点排行",
    subtitle: "基于链上池子创建事件整理，仅展示可验证的事实数据",
    liveLabel: "Live",
    chainLabel: "提速链",
  },
  ranking: {
    title: "近7日池子创建活跃榜",
    subtitle: "按代币池子创建次数排序（非价格、非热度）",
    rangeLabel: "时间筛选",
    poolsTitle: "近7日新建池子",
    poolsEmpty: "暂无该代币近7日池子记录",
  },
  list: {
    title: "今日新建交易池",
    tag: "实时更新",
    subtitle: "以下为链上池子创建事件，不代表项目是否安全",
    headers: {
      chain: "链",
      token: "代币",
      tokenAddress: "代币地址",
      pairAddress: "交易池地址",
      poolAge: "池龄",
      liquidity: "状态",
      action: "操作",
    },
    actionLabel: "查看池子",
    empty: "暂无新建交易池",
  },
  footerNote: "本页面展示的是新创建交易池的代币信息，不构成任何投资建议。",
} as const;

type RiskHint = "未检测" | "可检测";

type Listing = {
  chain: "Ethereum" | "BSC" | "Base" | "Arbitrum";
  token_symbol: string;
  token_address: string;
  pair_address: string;
  created_at: string;
  pool_age: string;
  liquidity_usd: string | null;
  risk_hint: RiskHint;
};

type TrendCard = {
  chain: Listing["chain"];
  token_symbol: string;
  count: number;
  chains: string;
  last_active: string;
  featured?: boolean;
};

type HeatRangeId = "7d" | "24h";

type ChainTabId = Listing["chain"];

type TrendPool = {
  chain: Listing["chain"];
  token_symbol: string;
  token_address: string;
  pair_address: string;
  created_at: string;
};

const API_ENDPOINT = "/api/new-listings";

const MOCK_LISTINGS: Listing[] = [
  {
    chain: "Ethereum",
    token_symbol: "TURBO",
    token_address: "0x4f7c0f0a2b6c3f8ad2fb1d8e7a6f7b2c4d9a8e10",
    pair_address: "0x9a1b2c3d4e5f678901234567890abcdef1234567",
    created_at: "4 分钟前",
    pool_age: "4 分钟前",
    liquidity_usd: "$9.8k",
    risk_hint: "可检测",
  },
  {
    chain: "BSC",
    token_symbol: "PEPE",
    token_address: "0x2c9a2b3c4d5e6f7081928374655647382910abcd",
    pair_address: "0x3f8d4e5c6b7a8091827364556677889900aabbcc",
    created_at: "3 分钟前",
    pool_age: "3 分钟前",
    liquidity_usd: "$2.5k",
    risk_hint: "未检测",
  },
];

const MOCK_TRENDS: TrendCard[] = [
  {
    chain: "Ethereum",
    token_symbol: "TURBO",
    count: 12,
    chains: "Ethereum / BSC",
    last_active: "1 分钟前",
    featured: true,
  },
  {
    chain: "Base",
    token_symbol: "OOZI",
    count: 10,
    chains: "Base",
    last_active: "1 分钟前",
  },
  {
    chain: "BSC",
    token_symbol: "$BANANA",
    count: 9,
    chains: "BSC",
    last_active: "1 分钟前",
  },
  {
    chain: "Ethereum",
    token_symbol: "LIZARD",
    count: 8,
    chains: "Ethereum",
    last_active: "3 分钟前",
  },
];

const MOCK_TREND_POOLS: Record<string, TrendPool[]> = {
  TURBO: [
    {
      chain: "Ethereum",
      token_symbol: "TURBO",
      token_address: "0x4f7c0f0a2b6c3f8ad2fb1d8e7a6f7b2c4d9a8e10",
      pair_address: "0x6e7a8b9c0d1e2f30405060718293a4b5c6d7e8f9",
      created_at: "12 分钟前",
    },
    {
      chain: "BSC",
      token_symbol: "TURBO",
      token_address: "0x9b7a6c5d4e3f2019182736455647382910abcd12",
      pair_address: "0x7c8d9e0f1a2b3c4d5e6f70819283746556473829",
      created_at: "38 分钟前",
    },
  ],
  OOZI: [
    {
      chain: "Base",
      token_symbol: "OOZI",
      token_address: "0x8e7d6c5b4a3928171615141312111000ffeedcba",
      pair_address: "0x0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6",
      created_at: "1 小时前",
    },
  ],
  $BANANA: [
    {
      chain: "BSC",
      token_symbol: "$BANANA",
      token_address: "0x8b7a6c5d4e3f2019182736455647382910abcdee",
      pair_address: "0x4a5b6c7d8e9f0011223344556677889900aabbcc",
      created_at: "2 小时前",
    },
  ],
  LIZARD: [
    {
      chain: "Ethereum",
      token_symbol: "LIZARD",
      token_address: "0x1a2b3c4d5e6f7081928374655647382910abcdff",
      pair_address: "0x11223344556677889900aabbccddeeff00112233",
      created_at: "3 小时前",
    },
  ],
};

const CHAIN_TABS: { id: ChainTabId; label: string }[] = [
  { id: "Ethereum", label: "Ethereum" },
  { id: "BSC", label: "BSC" },
  { id: "Base", label: "Base" },
  { id: "Arbitrum", label: "Ars" },
];

const TABLE_COLS = "grid-cols-[120px_160px_minmax(150px,1fr)_minmax(150px,1fr)_120px_120px_120px]";

const HEAT_RANGES: { id: HeatRangeId; label: string }[] = [
  { id: "7d", label: "7d" },
  { id: "24h", label: "24h" },
];

async function getNewListings(): Promise<Listing[]> {
  void API_ENDPOINT;
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
    card: string;
  }
> = {
  Ethereum: {
    bar: "bg-blue-500",
    chip: "from-blue-50 to-indigo-50",
    icon: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
    card: "from-blue-50/80 via-white to-indigo-50",
  },
  BSC: {
    bar: "bg-amber-400",
    chip: "from-amber-50 to-orange-50",
    icon: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
    card: "from-amber-50/70 via-white to-amber-100/60",
  },
  Base: {
    bar: "bg-sky-500",
    chip: "from-sky-50 to-blue-50",
    icon: "bg-sky-100 text-sky-700",
    text: "text-sky-700",
    card: "from-sky-50/70 via-white to-blue-50",
  },
  Arbitrum: {
    bar: "bg-indigo-500",
    chip: "from-indigo-50 to-slate-50",
    icon: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
    card: "from-indigo-50/70 via-white to-slate-50",
  },
};

const truncateAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const riskBadgeClass = (hint: Listing["risk_hint"]) =>
  hint === "可检测"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";

export default function NewListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeChain, setActiveChain] = useState<ChainTabId>("Ethereum");
  const [heatRange, setHeatRange] = useState<HeatRangeId>("7d");
  const [activeTrendToken, setActiveTrendToken] = useState<string | null>(
    MOCK_TRENDS[0]?.token_symbol ?? null
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getNewListings().then(setListings);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (value: string) => {
    if (!navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopiedAddress(value);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedAddress(null);
      }, 1600);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const displayListings = listings;
  const trendPools = activeTrendToken ? MOCK_TREND_POOLS[activeTrendToken] ?? [] : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f4f7ff] to-[#eef3ff] p-6 shadow-sm">
          <div className="absolute inset-0 hero-sheen" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">{COPY.hero.title}</h1>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
                  {COPY.hero.liveLabel}
                </span>
              </div>
              <p className="text-sm text-slate-600">{COPY.hero.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">
              <span className="text-xs font-semibold text-slate-600">{COPY.hero.chainLabel}</span>
              <div className="flex items-center gap-2">
                {CHAIN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveChain(tab.id)}
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      activeChain === tab.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="text-xl">🔥</span>
                {COPY.ranking.title}
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500">
                  i
                </span>
              </div>
              <p className="text-sm text-slate-600">{COPY.ranking.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
              <span>{COPY.ranking.rangeLabel}</span>
              {HEAT_RANGES.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setHeatRange(range.id)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    heatRange === range.id
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {MOCK_TRENDS.map((item, index) => {
              const style = CHAIN_STYLES[item.chain];
              return (
                <div
                  key={`${item.chain}-${item.token_symbol}`}
                  className={clsx(
                    "rank-card relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-4 shadow-sm",
                    style.card,
                    item.featured && "ring-1 ring-amber-200",
                    activeTrendToken === item.token_symbol && "ring-1 ring-indigo-200"
                  )}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={clsx("flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                        <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.token_symbol}</div>
                        <div className="text-xs text-slate-500">新增交易池</div>
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900">{item.count}</div>
                  </div>
                  <div className="mt-4 space-y-3 text-xs text-slate-500">
                    <div className="text-slate-600">近7日创建池子次数</div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-indigo-300" />
                      热门链：{item.chains}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    {item.featured ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveTrendToken(item.token_symbol)}
                          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          查看代币
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                            <path
                              d="M5 12h12m0 0l-4-4m4 4l-4 4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                        >
                          安全检测
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                            <path
                              d="M5 12h12m0 0l-4-4m4 4l-4 4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.last_active}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTrendToken(item.token_symbol)}
                          className="ml-auto inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          查看代币
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                            <path
                              d="M5 12h12m0 0l-4-4m4 4l-4 4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">
                {activeTrendToken ? `${activeTrendToken} · ${COPY.ranking.poolsTitle}` : COPY.ranking.poolsTitle}
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {trendPools.length} 条
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200">
              <div className="hidden md:grid grid-cols-[160px_1fr_140px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                <div>{COPY.list.headers.chain}</div>
                <div>{COPY.list.headers.pairAddress}</div>
                <div>池龄</div>
              </div>
              <div className="space-y-2 p-3">
                {trendPools.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                    {COPY.ranking.poolsEmpty}
                  </div>
                ) : (
                  trendPools.map((pool) => {
                    const style = CHAIN_STYLES[pool.chain];
                    return (
                      <div
                        key={`${pool.chain}-${pool.pair_address}`}
                        className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 md:grid-cols-[160px_1fr_140px] md:items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className={clsx("flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                            <img src={CHAIN_ICONS[pool.chain]} alt={pool.chain} className="h-4 w-4" />
                          </span>
                          <span className={clsx("font-semibold", style.text)}>{pool.chain}</span>
                        </div>
                        <div className="font-mono text-xs text-slate-600">{truncateAddress(pool.pair_address)}</div>
                        <div className="text-xs font-semibold text-slate-700">{pool.created_at}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{COPY.list.title}</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {COPY.list.tag}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{COPY.list.subtitle}</p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90">
            <div className="px-3">
              <div
                className={clsx(
                  "hidden md:grid justify-items-center gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50 pl-8 pr-6 py-3 text-center text-xs font-semibold text-slate-500",
                  TABLE_COLS
                )}
              >
                <div className="min-w-0">{COPY.list.headers.chain}</div>
                <div className="min-w-0">{COPY.list.headers.token}</div>
                <div className="min-w-0">{COPY.list.headers.tokenAddress}</div>
                <div className="min-w-0">{COPY.list.headers.pairAddress}</div>
                <div className="min-w-0">{COPY.list.headers.poolAge}</div>
                <div className="min-w-0">{COPY.list.headers.liquidity}</div>
                <div className="min-w-0">{COPY.list.headers.action}</div>
              </div>
            </div>
            <div className="space-y-3 p-3">
              {displayListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  {COPY.list.empty}
                </div>
              ) : (
                displayListings.map((item, index) => {
                  const style = CHAIN_STYLES[item.chain];
                  const tokenInitial = item.token_symbol.slice(0, 1);
                  return (
                    <div
                      key={`${item.chain}-${item.token_address}`}
                      className={clsx(
                        "table-row group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <span className={clsx("absolute left-0 top-0 h-full w-1.5", style.bar)} />
                      <div
                        className={clsx(
                          "hidden md:grid items-center justify-items-center gap-4 pl-8 pr-6 text-center text-sm text-slate-700",
                          TABLE_COLS
                        )}
                      >
                        <div className="flex min-w-0 items-center justify-center gap-2">
                          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                            <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                          </span>
                          <span className={clsx("font-semibold", style.text)}>{item.chain}</span>
                        </div>
                        <div className="flex min-w-0 items-center justify-center gap-3">
                          <span className={clsx("flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 text-sm font-semibold", style.icon)}>
                            {tokenInitial}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">{item.token_symbol}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.token_address)}
                          className="group inline-flex min-w-0 items-center justify-center gap-2 font-mono text-xs text-slate-600 transition hover:text-slate-900"
                        >
                          <span className="truncate">{truncateAddress(item.token_address)}</span>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400 group-hover:text-slate-500">
                            {copiedAddress === item.token_address ? "已复制" : "复制"}
                          </span>
                        </button>
                        <div className="min-w-0 font-mono text-xs text-slate-600">
                          <span className="truncate">{truncateAddress(item.pair_address)}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                            {item.pool_age}
                          </span>
                        </div>
                        <div className="flex min-w-0 justify-center">
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                              riskBadgeClass("未检测")
                            )}
                          >
                            未检测
                          </span>
                        </div>
                        <div className="flex min-w-0 justify-center">
                          <Link
                            href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
                        </div>
                        <div className="grid gap-2 text-xs text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.poolAge}</span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                              {item.pool_age}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.liquidity}</span>
                            <span
                              className={clsx(
                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                                riskBadgeClass("未检测")
                              )}
                            >
                              未检测
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.tokenAddress}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.token_address)}
                              className="group inline-flex items-center justify-between gap-2 font-mono text-xs text-slate-600 transition hover:text-slate-900"
                            >
                              {truncateAddress(item.token_address)}
                              <span className="shrink-0 text-[11px] font-semibold text-slate-400 group-hover:text-slate-500">
                                {copiedAddress === item.token_address ? "已复制" : "复制"}
                              </span>
                            </button>
                          </div>
                          <div>
                            {COPY.list.headers.pairAddress}: {" "}
                            <span className="font-mono text-slate-600">{truncateAddress(item.pair_address)}</span>
                          </div>
                        </div>
                        <Link
                          href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
        </div>

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

        .rank-card {
          animation: floatCard 6s ease-in-out infinite;
        }

        .table-row {
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
          .rank-card,
          .table-row {
            animation: none !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

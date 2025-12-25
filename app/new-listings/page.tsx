"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Section } from "../../components/ui/Section";

const COPY = {
  title: "今日新入市代币",
  subtitle: "基于链上池子创建事件整理，仅展示可验证的事实数据",
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

async function getNewListings(): Promise<Listing[]> {
  return MOCK_LISTINGS;
}

const CHAIN_ICONS: Record<Listing["chain"], string> = {
  Ethereum: "/icons/ethereum.png",
  BSC: "/icons/bsc.png",
  Base: "/icons/base.png",
  Arbitrum: "/icons/arbitrum.png",
};

const truncateAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const riskBadgeClass = (hint: Listing["risk_hint"]) =>
  hint === COPY.riskHints.detectable
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
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
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">{COPY.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{COPY.subtitle}</p>
        </div>

        <Section title={COPY.filters.title} description="">
          <div className="grid gap-4 md:grid-cols-3">
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
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
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
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      timeRange === range.id
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.sortLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.sortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id)}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      sortBy === option.id
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden md:grid grid-cols-[130px_120px_1fr_1fr_120px_110px_110px_120px] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
              <div>{COPY.list.headers.chain}</div>
              <div>{COPY.list.headers.token}</div>
              <div>{COPY.list.headers.tokenAddress}</div>
              <div>{COPY.list.headers.pairAddress}</div>
              <div>{COPY.list.headers.createdAt}</div>
              <div>{COPY.list.headers.liquidity}</div>
              <div>{COPY.list.headers.risk}</div>
              <div>{COPY.list.headers.action}</div>
            </div>
            <div className="divide-y divide-slate-200">
              {displayListings.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">{COPY.list.empty}</div>
              ) : (
                displayListings.map((item) => (
                  <div key={`${item.chain}-${item.token_address}`} className="px-4 py-4">
                    <div className="hidden md:grid grid-cols-[130px_120px_1fr_1fr_120px_110px_110px_120px] items-center gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 shadow-sm">
                          <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-slate-800">{item.chain}</span>
                      </div>
                      <div className="font-semibold text-slate-900">{item.token_symbol}</div>
                      <div className="font-mono text-xs text-slate-600">{truncateAddress(item.token_address)}</div>
                      <div className="font-mono text-xs text-slate-600">{truncateAddress(item.pair_address)}</div>
                      <div className="text-slate-700">{item.created_at}</div>
                      <div className="text-slate-700">{item.liquidity_usd ?? "--"}</div>
                      <div>
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                            riskBadgeClass(item.risk_hint)
                          )}
                        >
                          {item.risk_hint}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                          className="inline-flex items-center justify-center rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          {COPY.list.actionLabel}
                        </Link>
                      </div>
                    </div>
                    <div className="md:hidden space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shadow-sm">
                            <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.token_symbol}</div>
                            <div className="text-xs text-slate-500">{item.chain}</div>
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
                      <div className="grid gap-1 text-xs text-slate-500">
                        <div>
                          {COPY.list.headers.tokenAddress}:{" "}
                          <span className="font-mono text-slate-600">{truncateAddress(item.token_address)}</span>
                        </div>
                        <div>
                          {COPY.list.headers.pairAddress}:{" "}
                          <span className="font-mono text-slate-600">{truncateAddress(item.pair_address)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>
                            {COPY.list.headers.createdAt}: {item.created_at}
                          </span>
                          <span>
                            {COPY.list.headers.liquidity}: {item.liquidity_usd ?? "--"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                        className="inline-flex items-center justify-center rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        {COPY.list.actionLabel}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Section>

        <div className="text-xs text-slate-600">{COPY.footerNote}</div>
      </div>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Section } from "../../components/ui/Section";
import { TagPills } from "../../components/ui/TagPills";

const COPY = {
  title: "今日异常代币",
  subtitle: "基于链上可验证事实整理，仅展示异常行为信号，不构成结论",
  filters: {
    title: "异常筛选",
    chainLabel: "链筛选",
    timeLabel: "时间范围",
    typeLabel: "异常类型",
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
    types: [
      { id: "liquidity", label: "流动性异常" },
      { id: "permission", label: "权限异常" },
      { id: "trading", label: "交易行为异常" },
      { id: "deployer", label: "部署者异常" },
    ],
  },
  list: {
    title: "异常代币列表",
    headers: {
      chain: "链",
      token: "代币",
      tokenAddress: "代币地址",
      pairAddress: "交易池地址",
      createdAt: "创建时间",
      tags: "异常标签",
      level: "异常等级",
      action: "操作",
    },
    actionLabel: "查看检测",
    empty: "暂无异常代币记录",
  },
  riskLevels: {
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  footerNote: "本页面展示的是链上出现异常行为信号的代币，仅用于信息展示，不构成任何投资建议。",
} as const;

type TimeRangeId = (typeof COPY.filters.timeRanges)[number]["id"];
type AbnormalTypeId = (typeof COPY.filters.types)[number]["id"];
type RiskLevel = (typeof COPY.riskLevels)[keyof typeof COPY.riskLevels];

type AbnormalToken = {
  chain: "Ethereum" | "BSC" | "Base" | "Arbitrum";
  token_name: string;
  token_symbol: string;
  token_address: string;
  pair_address: string;
  created_at: string;
  abnormal_tags: string[];
  risk_level: RiskLevel;
};

const API_ENDPOINT = "/api/abnormal-tokens";

const MOCK_TOKENS: AbnormalToken[] = [
  {
    chain: "Ethereum",
    token_name: "TURBO",
    token_symbol: "TURBO",
    token_address: "0x4f7c0f0a2b6c3f8ad2fb1d8e7a6f7b2c4d9a8e10",
    pair_address: "0x9a1b2c3d4e5f678901234567890abcdef1234567",
    created_at: "12 分钟前",
    abnormal_tags: ["权限未放弃", "交易高度集中"],
    risk_level: COPY.riskLevels.medium,
  },
  {
    chain: "BSC",
    token_name: "PEPE2",
    token_symbol: "PEPE2",
    token_address: "0x2c9a2b3c4d5e6f7081928374655647382910abcd",
    pair_address: "0x3f9d4e5c6b7a8091827364556677889900aabbcc",
    created_at: "18 分钟前",
    abnormal_tags: ["低流动性高交易", "LP 快速移除"],
    risk_level: COPY.riskLevels.high,
  },
  {
    chain: "Ethereum",
    token_name: "ETHX",
    token_symbol: "ETHX",
    token_address: "0x0a7d39b2c4d56e7019283746556473829100c4a5",
    pair_address: "0x8b7d6a5c4e3f2109876543210fedcba987654321",
    created_at: "32 分钟前",
    abnormal_tags: ["权限未放弃"],
    risk_level: COPY.riskLevels.low,
  },
  {
    chain: "Base",
    token_name: "BASECAT",
    token_symbol: "BSCAT",
    token_address: "0x2a4a99d7c6d9e01f1234567890abcdefabcdef12",
    pair_address: "0x1f2e3d4c5b6a79880796a5b4c3d2e1f0a9b8c7d6",
    created_at: "45 分钟前",
    abnormal_tags: ["部署者异常", "交易行为异常"],
    risk_level: COPY.riskLevels.medium,
  },
  {
    chain: "Arbitrum",
    token_name: "ARBX",
    token_symbol: "ARBX",
    token_address: "0x6fe8b0ad9c8d7c6b5a4938271615141312111011",
    pair_address: "0xabc1234567890defabc1234567890defabc12345",
    created_at: "56 分钟前",
    abnormal_tags: ["交易高度集中"],
    risk_level: COPY.riskLevels.low,
  },
];

async function getAbnormalTokens(): Promise<AbnormalToken[]> {
  return MOCK_TOKENS;
}

const CHAIN_ICONS: Record<AbnormalToken["chain"], string> = {
  Ethereum: "/icons/ethereum.png",
  BSC: "/icons/bsc.png",
  Base: "/icons/base.png",
  Arbitrum: "/icons/arbitrum.png",
};

const CHAIN_STYLES: Record<
  AbnormalToken["chain"],
  { bar: string; icon: string; text: string; chip: string }
> = {
  Ethereum: {
    bar: "bg-blue-500",
    icon: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
    chip: "from-blue-50 to-indigo-50",
  },
  BSC: {
    bar: "bg-amber-400",
    icon: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
    chip: "from-amber-50 to-orange-50",
  },
  Base: {
    bar: "bg-sky-500",
    icon: "bg-sky-100 text-sky-700",
    text: "text-sky-700",
    chip: "from-sky-50 to-blue-50",
  },
  Arbitrum: {
    bar: "bg-indigo-500",
    icon: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
    chip: "from-indigo-50 to-slate-50",
  },
};

const riskLevelClass = (level: RiskLevel) => {
  if (level === COPY.riskLevels.high) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (level === COPY.riskLevels.medium) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
};

const truncateAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

export default function AbnormalTokensPage() {
  const [tokens, setTokens] = useState<AbnormalToken[]>([]);
  const [selectedChains, setSelectedChains] = useState<AbnormalToken["chain"][]>(
    COPY.filters.chains.map((item) => item.id as AbnormalToken["chain"])
  );
  const [timeRange, setTimeRange] = useState<TimeRangeId>(COPY.filters.timeRanges[0].id);
  const [selectedTypes, setSelectedTypes] = useState<AbnormalTypeId[]>(
    COPY.filters.types.map((item) => item.id)
  );

  useEffect(() => {
    getAbnormalTokens().then(setTokens);
  }, []);

  const displayTokens = tokens;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f5f7ff] to-[#edf2ff] p-6 shadow-sm">
          <div className="absolute inset-0 header-glow" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="m12 3l9 16H3Zm0 5.6c-.4 0-.7.3-.7.7v4.4c0 .4.3.7.7.7s.7-.3.7-.7V9.3c0-.4-.3-.7-.7-.7m0 7.7a.9.9 0 1 0 0 1.8a.9.9 0 0 0 0-1.8"
                />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{COPY.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{COPY.subtitle}</p>
            </div>
          </div>
        </div>

        <Section title={COPY.filters.title} description="">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.chainLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.chains.map((chain) => {
                  const active = selectedChains.includes(chain.id as AbnormalToken["chain"]);
                  const style = CHAIN_STYLES[chain.id as AbnormalToken["chain"]];
                  return (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() =>
                        setSelectedChains((prev) =>
                          prev.includes(chain.id as AbnormalToken["chain"])
                            ? prev.filter((item) => item !== chain.id)
                            : [...prev, chain.id as AbnormalToken["chain"]]
                        )
                      }
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full", style.icon)}>
                          <img src={CHAIN_ICONS[chain.id as AbnormalToken["chain"]]} alt={chain.label} className="h-3 w-3" />
                        </span>
                        {chain.label}
                      </span>
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
                      "rounded-full border px-4 py-1 text-xs font-semibold transition",
                      timeRange === range.id
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.typeLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.types.map((item) => {
                  const active = selectedTypes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelectedTypes((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((type) => type !== item.id)
                            : [...prev, item.id]
                        )
                      }
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-slate-400 bg-slate-100 text-slate-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section title={COPY.list.title} description="">
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="hidden md:grid grid-cols-[120px_180px_1fr_1fr_120px_220px_110px_130px] gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50 px-5 py-3 text-xs font-semibold text-slate-500">
              <div>{COPY.list.headers.chain}</div>
              <div>{COPY.list.headers.token}</div>
              <div>{COPY.list.headers.tokenAddress}</div>
              <div>{COPY.list.headers.pairAddress}</div>
              <div>{COPY.list.headers.createdAt}</div>
              <div>{COPY.list.headers.tags}</div>
              <div>{COPY.list.headers.level}</div>
              <div>{COPY.list.headers.action}</div>
            </div>
            <div className="space-y-3 p-3">
              {displayTokens.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  {COPY.list.empty}
                </div>
              ) : (
                displayTokens.map((item, index) => {
                  const style = CHAIN_STYLES[item.chain];
                  return (
                    <div
                      key={`${item.chain}-${item.token_address}`}
                      className="abnormal-row group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <span className={clsx("absolute left-0 top-0 h-full w-1.5", style.bar)} />
                      <div className="hidden md:grid grid-cols-[120px_180px_1fr_1fr_120px_220px_110px_130px] items-center gap-3 pl-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                            <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                          </span>
                          <span className={clsx("font-semibold", style.text)}>{item.chain}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{item.token_name}</div>
                          <div className="text-xs text-slate-500">{item.token_symbol}</div>
                        </div>
                        <div className="font-mono text-xs text-slate-600">{truncateAddress(item.token_address)}</div>
                        <div className="font-mono text-xs text-slate-600">{truncateAddress(item.pair_address)}</div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 pulse-dot" />
                          {item.created_at}
                        </div>
                        <TagPills tags={item.abnormal_tags} />
                        <span className={clsx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", riskLevelClass(item.risk_level))}>
                          {item.risk_level}
                        </span>
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
                      <div className="md:hidden space-y-3 pl-3 text-sm text-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className={clsx("flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-slate-200", style.icon)}>
                              <img src={CHAIN_ICONS[item.chain]} alt={item.chain} className="h-4 w-4" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.token_name}</div>
                              <div className={clsx("text-xs", style.text)}>{item.token_symbol}</div>
                            </div>
                          </div>
                          <span className={clsx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", riskLevelClass(item.risk_level))}>
                            {item.risk_level}
                          </span>
                        </div>
                        <div className="grid gap-2 text-xs text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>{COPY.list.headers.createdAt}</span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 pulse-dot" />
                              {item.created_at}
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
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500">{COPY.list.headers.tags}</div>
                          <TagPills tags={item.abnormal_tags} />
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
        .header-glow {
          background: radial-gradient(420px circle at 10% 0%, rgba(99, 102, 241, 0.16), transparent 60%),
            radial-gradient(420px circle at 90% 0%, rgba(56, 189, 248, 0.14), transparent 55%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.7));
          background-size: 200% 200%;
          animation: headerGlow 12s ease-in-out infinite;
          opacity: 0.7;
        }

        .pulse-dot {
          animation: pulse 1.6s ease-in-out infinite;
        }

        .abnormal-row {
          animation: fadeUp 0.5s ease both;
          will-change: transform, opacity;
        }

        @keyframes headerGlow {
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
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.45);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(56, 189, 248, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
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
          .header-glow,
          .pulse-dot,
          .abnormal-row {
            animation: none !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

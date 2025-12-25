"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";

const COPY = {
  title: "今日交易所动态",
  subtitle: "汇总主流交易所当日新增交易对与合约信息，仅作信息展示",
  filters: {
    title: "筛选条件",
    exchangeLabel: "交易所筛选",
    typeLabel: "类型筛选",
    timeLabel: "时间范围",
    exchanges: [
      { id: "Binance", label: "Binance" },
      { id: "OKX", label: "OKX" },
      { id: "Bybit", label: "Bybit" },
      { id: "Gate", label: "Gate" },
    ],
    types: [
      { id: "spot", label: "现货" },
      { id: "perp", label: "永续合约" },
    ],
    times: [
      { id: "today", label: "今日" },
      { id: "7d", label: "7 天" },
    ],
  },
  cards: {
    sortLabel: "默认排序",
  },
  sections: {
    binance: "新增成交交易对",
    okx: "新增永续合约",
    bybit: "新增合约交易",
    gate: "新增现货交易对",
  },
  list: {
    actionLabel: "查看检测",
    empty: "暂无更新",
  },
  footerNote: "本页面信息来源于公开渠道整理，不构成任何投资建议。",
} as const;

type Exchange = (typeof COPY.filters.exchanges)[number]["id"];

type ExchangeUpdate = {
  token_symbol: string;
  pair_name: string;
  market_type: "现货" | "永续";
  leverage: string;
  listed_at: string;
  token_address: string;
  meta?: string;
};

type ExchangeSection = {
  title: string;
  items: ExchangeUpdate[];
};

type ExchangeCard = {
  exchange: Exchange;
  sections: ExchangeSection[];
  layout: "rows" | "panels";
};

const API_ENDPOINT = "/api/exchange-updates";

const MOCK_CARDS: ExchangeCard[] = [
  {
    exchange: "Binance",
    layout: "rows",
    sections: [
      {
        title: COPY.sections.binance,
        items: [
          {
            token_symbol: "ZETA",
            pair_name: "ZETA/USDT",
            market_type: "现货",
            leverage: "20x",
            listed_at: "2 小时前",
            token_address: "0x1111111111111111111111111111111111111111",
            meta: "Solana 链",
          },
          {
            token_symbol: "OSHI",
            pair_name: "OSHI/USDT",
            market_type: "现货",
            leverage: "10x",
            listed_at: "3 小时前",
            token_address: "0x2222222222222222222222222222222222222222",
            meta: "ETH 链",
          },
          {
            token_symbol: "BONK",
            pair_name: "BONK/USDT",
            market_type: "永续",
            leverage: "50x",
            listed_at: "4 小时前",
            token_address: "0x3333333333333333333333333333333333333333",
            meta: "Solana 链",
          },
        ],
      },
    ],
  },
  {
    exchange: "OKX",
    layout: "panels",
    sections: [
      {
        title: COPY.sections.okx,
        items: [
          {
            token_symbol: "MAV",
            pair_name: "MAV/USDT",
            market_type: "永续",
            leverage: "20x",
            listed_at: "1 小时前",
            token_address: "0x4444444444444444444444444444444444444444",
          },
          {
            token_symbol: "SHIB1000",
            pair_name: "SHIB1000/USDT",
            market_type: "永续",
            leverage: "25x",
            listed_at: "1 小时前",
            token_address: "0x5555555555555555555555555555555555555555",
          },
        ],
      },
      {
        title: COPY.sections.okx,
        items: [
          {
            token_symbol: "OKX",
            pair_name: "OKX/USDT",
            market_type: "永续",
            leverage: "15x",
            listed_at: "1 小时前",
            token_address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          },
          {
            token_symbol: "MAV",
            pair_name: "MAV/USDT",
            market_type: "永续",
            leverage: "20x",
            listed_at: "1 小时前",
            token_address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          },
        ],
      },
    ],
  },
  {
    exchange: "Bybit",
    layout: "panels",
    sections: [
      {
        title: COPY.sections.bybit,
        items: [
          {
            token_symbol: "ZRO",
            pair_name: "ZRO/USDT",
            market_type: "永续",
            leverage: "10x",
            listed_at: "3 小时前",
            token_address: "0x6666666666666666666666666666666666666666",
          },
          {
            token_symbol: "GME",
            pair_name: "GME/USDT",
            market_type: "永续",
            leverage: "5x",
            listed_at: "5 小时前",
            token_address: "0x7777777777777777777777777777777777777777",
          },
        ],
      },
      {
        title: COPY.sections.bybit,
        items: [
          {
            token_symbol: "ZRO",
            pair_name: "ZRO/USDT",
            market_type: "永续",
            leverage: "10x",
            listed_at: "3 小时前",
            token_address: "0x8888888888888888888888888888888888888888",
          },
          {
            token_symbol: "GME",
            pair_name: "GME/USDT",
            market_type: "永续",
            leverage: "5x",
            listed_at: "5 小时前",
            token_address: "0x9999999999999999999999999999999999999999",
          },
        ],
      },
    ],
  },
  {
    exchange: "Gate",
    layout: "panels",
    sections: [
      {
        title: COPY.sections.gate,
        items: [
          {
            token_symbol: "VISTA",
            pair_name: "VISTA/USDT",
            market_type: "现货",
            leverage: "10x",
            listed_at: "6 小时前",
            token_address: "0x1010101010101010101010101010101010101010",
          },
          {
            token_symbol: "HYPE",
            pair_name: "HYPE/USDT",
            market_type: "现货",
            leverage: "10x",
            listed_at: "7 小时前",
            token_address: "0x2020202020202020202020202020202020202020",
          },
        ],
      },
      {
        title: COPY.sections.gate,
        items: [
          {
            token_symbol: "LUNA",
            pair_name: "LUNA/USDT",
            market_type: "现货",
            leverage: "10x",
            listed_at: "8 小时前",
            token_address: "0x3030303030303030303030303030303030303030",
          },
          {
            token_symbol: "META",
            pair_name: "META/USDT",
            market_type: "现货",
            leverage: "10x",
            listed_at: "9 小时前",
            token_address: "0x4040404040404040404040404040404040404040",
          },
        ],
      },
    ],
  },
];

async function getExchangeUpdates(): Promise<ExchangeCard[]> {
  return MOCK_CARDS;
}

const EXCHANGE_META: Record<Exchange, { label: string; short: string; iconBg: string; text: string }> = {
  Binance: {
    label: "Binance",
    short: "B",
    iconBg: "bg-amber-100",
    text: "text-amber-700",
  },
  OKX: {
    label: "OKX",
    short: "OKX",
    iconBg: "bg-slate-100",
    text: "text-slate-700",
  },
  Bybit: {
    label: "Bybit",
    short: "BY",
    iconBg: "bg-orange-100",
    text: "text-orange-700",
  },
  Gate: {
    label: "Gate",
    short: "G",
    iconBg: "bg-emerald-100",
    text: "text-emerald-700",
  },
};

const TOKEN_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-fuchsia-500",
];

const getTokenColor = (symbol: string) => {
  const sum = symbol.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TOKEN_COLORS[sum % TOKEN_COLORS.length];
};

const chunkItems = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const buildMetaLine = (item: ExchangeUpdate) => {
  const parts = [item.meta, item.market_type, item.leverage, item.listed_at].filter(Boolean);
  return parts.join(" · ");
};

export default function ExchangeUpdatesPage() {
  const [cards, setCards] = useState<ExchangeCard[]>([]);

  useEffect(() => {
    getExchangeUpdates().then(setCards);
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f5f7ff] to-[#eef2ff] p-6 shadow-sm">
          <div className="flex items-start gap-3">
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

        <div className="space-y-4">
          {cards.map((card) => {
            const meta = EXCHANGE_META[card.exchange];
            return (
              <div key={card.exchange} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold",
                        meta.iconBg,
                        meta.text
                      )}
                    >
                      {meta.short}
                    </span>
                    <div className="text-lg font-semibold text-slate-900">{meta.label}</div>
                  </div>
                  {card.exchange === "Binance" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                          <path d="M6 9l6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {COPY.cards.sortLabel}
                    </span>
                  )}
                </div>

                {card.layout === "rows" ? (
                  card.sections.map((section) => {
                    const rows = chunkItems(section.items, 2);
                    return (
                      <div key={section.title} className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          {section.title}
                        </div>
                        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                          {rows.map((row, rowIdx) => (
                            <div
                              key={`${section.title}-${rowIdx}`}
                              className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="grid w-full gap-4 md:grid-cols-2">
                                {row.map((item, idx) => (
                                  <div
                                    key={`${item.pair_name}-${idx}`}
                                    className={clsx(
                                      "flex items-center gap-3",
                                      idx === 0 && row.length > 1 ? "md:border-r md:border-slate-200 md:pr-4" : "md:pl-0"
                                    )}
                                  >
                                    <span
                                      className={clsx(
                                        "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
                                        getTokenColor(item.token_symbol)
                                      )}
                                    >
                                      {item.token_symbol.slice(0, 1)}
                                    </span>
                                    <div>
                                      <div className="text-sm font-semibold text-slate-900">{item.pair_name}</div>
                                      <div className="text-xs text-slate-500">{buildMetaLine(item)}</div>
                                    </div>
                                  </div>
                                ))}
                                {row.length === 1 && <div className="hidden md:block" />}
                              </div>
                              <Link
                                href={`/scan?token_address=${encodeURIComponent(row[0].token_address)}`}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5b7dfb] to-[#3e67e5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
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
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
                    {card.sections.map((section, sectionIdx) => (
                      <div
                        key={`${card.exchange}-${sectionIdx}`}
                        className="rounded-xl border border-slate-200 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {section.title}
                        </div>
                        <div className="divide-y divide-slate-200">
                          {section.items.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-slate-500">{COPY.list.empty}</div>
                          ) : (
                            section.items.map((item) => (
                              <div key={item.pair_name} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={clsx(
                                      "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
                                      getTokenColor(item.token_symbol)
                                    )}
                                  >
                                    {item.token_symbol.slice(0, 1)}
                                  </span>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">{item.pair_name}</div>
                                    <div className="text-xs text-slate-500">{buildMetaLine(item)}</div>
                                  </div>
                                </div>
                                <Link
                                  href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5b7dfb] to-[#3e67e5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
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
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          {COPY.footerNote}
        </div>
      </div>
    </AppShell>
  );
}

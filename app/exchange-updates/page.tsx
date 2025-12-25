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
    suffix: "· 今日新增",
    listLabel: "新增交易对",
  },
  list: {
    headers: {
      pair: "交易对",
      market: "类型",
      leverage: "杠杆",
      listedAt: "上线时间",
    },
    actionLabel: "查看检测",
    empty: "暂无更新",
  },
  footerNote: "本页面信息来源于公开渠道整理，不构成任何投资建议。",
} as const;

type Exchange = (typeof COPY.filters.exchanges)[number]["id"];
type MarketTypeId = (typeof COPY.filters.types)[number]["id"];
type TimeRangeId = (typeof COPY.filters.times)[number]["id"];

type ExchangeUpdate = {
  exchange: Exchange;
  token_symbol: string;
  pair_name: string;
  market_type: "现货" | "永续";
  leverage: string;
  listed_at: string;
  token_address: string;
};

const API_ENDPOINT = "/api/exchange-updates";

const MOCK_UPDATES: ExchangeUpdate[] = [
  {
    exchange: "Binance",
    token_symbol: "ZETA",
    pair_name: "ZETA/USDT",
    market_type: "现货",
    leverage: "20x",
    listed_at: "2 小时前",
    token_address: "0x1111111111111111111111111111111111111111",
  },
  {
    exchange: "Binance",
    token_symbol: "OSHI",
    pair_name: "OSHI/USDT",
    market_type: "现货",
    leverage: "10x",
    listed_at: "3 小时前",
    token_address: "0x2222222222222222222222222222222222222222",
  },
  {
    exchange: "Binance",
    token_symbol: "BONK",
    pair_name: "BONK/USDT",
    market_type: "永续",
    leverage: "50x",
    listed_at: "4 小时前",
    token_address: "0x3333333333333333333333333333333333333333",
  },
  {
    exchange: "OKX",
    token_symbol: "MAV",
    pair_name: "MAV/USDT",
    market_type: "永续",
    leverage: "20x",
    listed_at: "1 小时前",
    token_address: "0x4444444444444444444444444444444444444444",
  },
  {
    exchange: "OKX",
    token_symbol: "SHIB1000",
    pair_name: "SHIB1000/USDT",
    market_type: "永续",
    leverage: "25x",
    listed_at: "1 小时前",
    token_address: "0x5555555555555555555555555555555555555555",
  },
  {
    exchange: "Bybit",
    token_symbol: "ZRO",
    pair_name: "ZRO/USDT",
    market_type: "永续",
    leverage: "10x",
    listed_at: "3 小时前",
    token_address: "0x6666666666666666666666666666666666666666",
  },
  {
    exchange: "Bybit",
    token_symbol: "GME",
    pair_name: "GME/USDT",
    market_type: "永续",
    leverage: "5x",
    listed_at: "5 小时前",
    token_address: "0x7777777777777777777777777777777777777777",
  },
  {
    exchange: "Gate",
    token_symbol: "VISTA",
    pair_name: "VISTA/USDT",
    market_type: "现货",
    leverage: "10x",
    listed_at: "6 小时前",
    token_address: "0x8888888888888888888888888888888888888888",
  },
  {
    exchange: "Gate",
    token_symbol: "HYPE",
    pair_name: "HYPE/USDT",
    market_type: "现货",
    leverage: "10x",
    listed_at: "7 小时前",
    token_address: "0x9999999999999999999999999999999999999999",
  },
];

async function getExchangeUpdates(): Promise<ExchangeUpdate[]> {
  return MOCK_UPDATES;
}

const EXCHANGE_META: Record<
  Exchange,
  { label: string; short: string; iconBg: string; text: string }
> = {
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

const truncatePair = (value: string) => value;

const marketBadgeClass = (type: ExchangeUpdate["market_type"]) =>
  type === "现货"
    ? "border-slate-200 bg-slate-100 text-slate-600"
    : "border-indigo-200 bg-indigo-50 text-indigo-700";

export default function ExchangeUpdatesPage() {
  const [updates, setUpdates] = useState<ExchangeUpdate[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<Exchange[]>(
    COPY.filters.exchanges.map((item) => item.id as Exchange)
  );
  const [selectedTypes, setSelectedTypes] = useState<MarketTypeId[]>(
    COPY.filters.types.map((item) => item.id as MarketTypeId)
  );
  const [timeRange, setTimeRange] = useState<TimeRangeId>(COPY.filters.times[0].id);

  useEffect(() => {
    getExchangeUpdates().then(setUpdates);
  }, []);

  const grouped = COPY.filters.exchanges.map((exchange) => ({
    exchange: exchange.id as Exchange,
    label: exchange.label,
    items: updates.filter((item) => item.exchange === exchange.id),
  }));

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

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.exchangeLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.exchanges.map((exchange) => {
                  const active = selectedExchanges.includes(exchange.id as Exchange);
                  return (
                    <button
                      key={exchange.id}
                      type="button"
                      onClick={() =>
                        setSelectedExchanges((prev) =>
                          prev.includes(exchange.id as Exchange)
                            ? prev.filter((item) => item !== exchange.id)
                            : [...prev, exchange.id as Exchange]
                        )
                      }
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {exchange.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.typeLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.types.map((type) => {
                  const active = selectedTypes.includes(type.id as MarketTypeId);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setSelectedTypes((prev) =>
                          prev.includes(type.id as MarketTypeId)
                            ? prev.filter((item) => item !== type.id)
                            : [...prev, type.id as MarketTypeId]
                        )
                      }
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "border-slate-300 bg-slate-100 text-slate-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{COPY.filters.timeLabel}</div>
              <div className="flex flex-wrap gap-2">
                {COPY.filters.times.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setTimeRange(range.id)}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
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
          </div>
        </div>

        <div className="space-y-4">
          {grouped.map((group) => {
            const meta = EXCHANGE_META[group.exchange];
            return (
              <div key={group.exchange} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {meta.label} {COPY.cards.suffix}
                      </div>
                      <div className="text-xs text-slate-500">{COPY.cards.listLabel}</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    默认排序
                  </span>
                </div>
                <div className="divide-y divide-slate-200">
                  {group.items.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-slate-500">{COPY.list.empty}</div>
                  ) : (
                    group.items.map((item) => (
                      <div
                        key={`${item.exchange}-${item.pair_name}`}
                        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                            {item.token_symbol.slice(0, 1)}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {truncatePair(item.pair_name)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.token_symbol} · {item.market_type}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className={clsx("rounded-full border px-2 py-1 font-semibold", marketBadgeClass(item.market_type))}>
                            {item.market_type}
                          </span>
                          <span>
                            {COPY.list.headers.leverage}: {item.leverage}
                          </span>
                          <span>
                            {COPY.list.headers.listedAt}: {item.listed_at}
                          </span>
                        </div>
                        <Link
                          href={`/scan?token_address=${encodeURIComponent(item.token_address)}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
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

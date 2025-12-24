"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../../../components/admin/AdminShell";
import { adminApi } from "../../../lib/api";

type TrendPoint = { date: string; value: number };
type DashboardData = {
  users_today: number;
  active_users_today: number;
  total_users: number;
  users_7d: TrendPoint[];
  deposits_today_usd: number;
  month_deposits_usd: number;
  deposits_7d: TrendPoint[];
  total_engine_calls: number;
  engine_calls_today: number;
  logs?: { action: string; user: string; time: string }[];
};

const formatLocal = (value?: string) => {
  if (!value) return "";
  const hasTZ = /[zZ]|[+-]\d\d:?\d\d$/.test(value);
  const normalized = hasTZ ? value : `${value.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date(value);
    if (Number.isNaN(fallback.getTime())) return value;
    return fallback.toLocaleString();
  }
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi("/internal/dashboard");
        setStats(res);
      } catch (e: any) {
        setError(e?.message || "获取仪表盘数据失败");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fallbackStats: DashboardData = useMemo(
    () => ({
      users_today: 0,
      active_users_today: 0,
      total_users: 0,
      users_7d: Array.from({ length: 7 }).map((_, i) => ({
        date: "--",
        value: 0,
      })),
      deposits_today_usd: 0,
      month_deposits_usd: 0,
      deposits_7d: Array.from({ length: 7 }).map((_, i) => ({
        date: "--",
        value: 0,
      })),
      total_engine_calls: 0,
      engine_calls_today: 0,
      logs: [],
    }),
    []
  );

const data = stats || fallbackStats;
const normalizeTrend = (series: TrendPoint[]) => {
  const merged = series.reduce<Record<string, number>>((acc, cur) => {
    if (!cur?.date) return acc;
    acc[cur.date] = (acc[cur.date] || 0) + (cur.value || 0);
    return acc;
  }, {});
  return Object.entries(merged)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const usersTrend = normalizeTrend(data.users_7d);
const depositsTrend = normalizeTrend(data.deposits_7d);

  const toPolyline = (values: { value: number }[], width = 300, height = 120) => {
    if (!values.length) return "";
    const nums = values.map((v) => v.value);
    const max = Math.max(...nums);
    const min = Math.min(...nums);
    const span = max === min ? 1 : max - min;
    const stepX = width / Math.max(values.length - 1, 1);
    return values
      .map((item, i) => {
        const x = i * stepX;
        const y = height - ((item.value - min) / span) * (height * 0.9) - height * 0.05;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">仪表盘</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当日新增用户</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {data.users_today}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当日活跃用户</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {data.active_users_today ?? 0}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当前用户总量</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {data.total_users}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当日入金（USD）</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            ${data.deposits_today_usd}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当月入金总量（USD）</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            ${data.month_deposits_usd}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">引擎总调用次数</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {data.total_engine_calls}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="text-sm text-slate-600">当日引擎调用</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {data.engine_calls_today ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">7 日用户增长</div>
              <div className="mt-1 text-xs text-slate-500">最近 7 天新增趋势</div>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {data.users_7d[data.users_7d.length - 1]?.value ?? 0} 今日
            </span>
          </div>
          <svg viewBox="0 0 380 180" className="mt-3 w-full">
            {usersTrend.map((d, i) => {
              const barWidth = 32;
              const gap = 18;
              const x = i * (barWidth + gap);
              const values = usersTrend.map((v) => v.value);
              const max = Math.max(...values, 1);
              const barHeight = (d.value / max) * 110;
              const y = 140 - barHeight;
              return (
                <g key={d.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="#4f46e5"
                    opacity={0.85}
                  />
                  <text x={x + barWidth / 2} y={y - 6} fontSize="11" textAnchor="middle" fill="#1f3f99">
                    {d.value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={160}
                    fontSize="12"
                    fontWeight={600}
                    textAnchor="middle"
                    fill="#475569"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-white/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">7 日入金趋势（USD）</div>
              <div className="mt-1 text-xs text-slate-500">最近 7 天入金波动</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              ${data.deposits_today_usd} 今日
            </span>
          </div>
          <svg viewBox="0 0 380 180" className="mt-3 w-full">
            {depositsTrend.map((d, i) => {
              const barWidth = 32;
              const gap = 18;
              const x = i * (barWidth + gap);
              const values = depositsTrend.map((v) => v.value);
              const max = Math.max(...values, 1);
              const barHeight = (d.value / max) * 110;
              const y = 140 - barHeight;
              return (
                <g key={d.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="#10b981"
                    opacity={0.85}
                  />
                  <text x={x + barWidth / 2} y={y - 6} fontSize="11" textAnchor="middle" fill="#0f766e">
                    {d.value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={160}
                    fontSize="12"
                    fontWeight={600}
                    textAnchor="middle"
                    fill="#475569"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-white/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-slate-600">操作日志</div>
            <div className="mt-1 text-xs text-slate-500">最近管理员关键操作</div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {data.logs?.length ?? 0} 条
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {data.logs?.length
            ? data.logs.map((log) => (
              <div key={`${log.time}-${log.action}`} className="py-3 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                  {(log.user || "").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-900">{log.action}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatLocal(log.time)} · 由 {log.user}
                  </div>
                </div>
              </div>
            ))
            : (
              <div className="py-3 text-sm text-slate-500">暂无日志</div>
            )}
        </div>
      </div>
    </AdminShell>
  );
}

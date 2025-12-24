"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminShell } from "../../../components/admin/AdminShell";
import { adminApi } from "../../../lib/api";

type LedgerItem = {
  id: number;
  user_id: number;
  delta: number;
  balance_after?: number | null;
  source_type?: string | null;
  source_id?: number | null;
  note?: string | null;
  created_at?: string | null;
  email?: string | null;
  google_sub?: string | null;
  telegram_id?: string | null;
};

const formatLocal = (value: string | null | undefined) => {
  if (!value) return "";
  const hasTZ = /[zZ]|[+-]\d\d:?\d\d$/.test(value);
  const normalized = hasTZ ? value : `${value.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
};

function LedgerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user_id");
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = userId ? `?user_id=${userId}` : "";
        const res = await adminApi(`/internal/ledger${query}`);
        setItems(res);
      } catch (e: any) {
        setError(e?.message || "获取资金记录失败");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">资金记录</h1>
          {userId && <div className="text-sm text-slate-600">仅显示用户 #{userId} 的资金变动</div>}
        </div>
        <button
          onClick={() => router.push("/admin/users")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          返回用户管理
        </button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading && <div className="mb-3 text-sm text-slate-600">加载中...</div>}
      {!loading && !items.length && <div className="text-sm text-slate-500">暂无资金记录</div>}
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white border border-white/60 shadow-sm">
          <table className="min-w-full text-sm text-slate-900">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                {!userId && <th className="px-4 py-3 text-left font-semibold">用户</th>}
                <th className="px-4 py-3 text-left font-semibold">变动</th>
                <th className="px-4 py-3 text-left font-semibold">余额</th>
                <th className="px-4 py-3 text-left font-semibold">来源</th>
                <th className="px-4 py-3 text-left font-semibold">时间</th>
                <th className="px-4 py-3 text-left font-semibold">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold">#{item.id}</td>
                  {!userId && (
                    <td className="px-4 py-3">
                      <div className="text-slate-900 font-medium">#{item.user_id}</div>
                      <div className="text-xs text-slate-500">
                        邮箱：{item.email || "-"} · Telegram：{item.telegram_id || "-"}
                      </div>
                    </td>
                  )}
                  <td className={`px-4 py-3 font-semibold ${item.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {item.delta >= 0 ? `+${item.delta}` : item.delta}
                  </td>
                  <td className="px-4 py-3">{item.balance_after ?? "-"}</td>
                  <td className="px-4 py-3">
                    {item.source_type || "-"}
                    {item.source_id ? ` #${item.source_id}` : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatLocal(item.created_at)}</td>
                  <td className="px-4 py-3 text-slate-700">{item.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminLedgerPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-600">加载中...</div>}>
      <LedgerContent />
    </Suspense>
  );
}

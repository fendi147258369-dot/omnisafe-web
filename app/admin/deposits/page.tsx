"use client";

import { useEffect, useRef, useState } from "react";
import { AdminShell } from "../../../components/admin/AdminShell";
import { adminApi } from "../../../lib/api";

type Deposit = {
  id: number;
  user_id: number;
  email?: string | null;
  google_sub?: string | null;
  telegram_id?: string | null;
  tx_hash: string;
  token: string;
  amount_usd: number;
  order_mode?: string | null;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  note?: string | null;
};

const formatLocal = (value?: string) => {
  if (!value) return "";
  // 若缺少时区信息，按 UTC 解析再转本地显示
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

export default function AdminDepositsPage() {
  const [deps, setDeps] = useState<Deposit[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<number>(0);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const initialLoaded = useRef(false);

  const fetchDeps = async () => {
    if (!initialLoaded.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await adminApi("/internal/deposits/pending");
      setDeps(res);
    } catch (e: any) {
      setError(e?.message || "获取待审核充值失败");
    } finally {
      if (!initialLoaded.current) {
        setLoading(false);
        initialLoaded.current = true;
      }
    }
  };

  useEffect(() => {
    fetchDeps();
    const timer = setInterval(fetchDeps, 1000); // 加快轮询至 1s
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (
    id: number,
    action: "confirmed" | "rejected",
    overrideAmount?: number
  ) => {
    setError(null);
    setMessage(null);
    try {
      if (action === "confirmed") {
        const amount = overrideAmount;
        await adminApi(`/internal/deposits/${id}/approve`, {
          method: "POST",
          body: {
            amount_usd: amount,
            note: "",
          },
        });
        setMessage(`充值 #${id} 已通过，已入账${amount ?? "原提交金额"}。`);
      } else {
        await adminApi(`/internal/deposits/${id}/reject`, {
          method: "POST",
          body: { note: "" },
        });
        setMessage(`充值 #${id} 已拒绝。`);
      }
      // 操作后刷新列表，保持实时
      await fetchDeps();
    } catch (e: any) {
      setError(e?.message || "操作失败");
    }
  };

  return (
    <>
      <AdminShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">充值审核</h1>
      {message && <div className="mb-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading && <div className="mb-3 text-sm text-slate-600">加载中...</div>}
      {deps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          暂无待审核充值。
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {deps.map((d) => {
            const statusCls =
              d.status === "pending"
                ? "bg-amber-50 text-amber-700"
                : d.status === "confirmed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700";
            const statusLabel =
              d.status === "pending"
                ? "待审核"
                : d.status === "confirmed"
                ? "充值成功"
                : "充值失败";
            return (
              <div
                key={d.id}
                className="relative rounded-xl border border-white/60 bg-white p-3 shadow-sm flex flex-col gap-3 max-w-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="text-sm text-slate-700">ID：#{d.id}</div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCls}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-slate-800">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-500">用户：</span>
                    <span className="flex-1 text-left break-all">
                      {d.email || (d.telegram_id ? `TG: ${d.telegram_id}` : d.google_sub) || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Tx Hash：</span>
                    <div className="flex-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(d.tx_hash);
                          setCopiedHash(d.tx_hash);
                          setTimeout(() => setCopiedHash(null), 1500);
                        }}
                        className="font-mono text-xs text-left break-all flex-1 text-indigo-700 underline-offset-2 hover:underline"
                        title="点击复制"
                      >
                        {d.tx_hash}
                      </button>
                      {copiedHash === d.tx_hash && (
                        <span className="text-emerald-600 text-xs font-semibold whitespace-nowrap">
                          已复制
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">币种：</span>
                      <span>{d.token}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">金额：</span>
                      <span>${d.amount_usd}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">订购模式：</span>
                    <span>
                      {d.order_mode === "subscription"
                        ? "套餐订购"
                        : d.order_mode === "payg"
                        ? "按需订购"
                        : d.order_mode || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">时间：</span>
                    <span>{formatLocal(d.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setConfirmId(d.id);
                      setConfirmAmount(d.amount_usd);
                    }}
                    disabled={d.status !== "pending"}
                    className="flex-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => setRejectId(d.id)}
                    disabled={d.status !== "pending"}
                    className="flex-1 rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </AdminShell>
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg space-y-4">
            <div className="text-sm font-semibold text-slate-900">确认入账金额</div>
            <div className="text-xs text-slate-600">显示用户提交金额，可手动修改后入账</div>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              value={confirmAmount}
              onChange={(e) => setConfirmAmount(Number(e.target.value))}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                className="rounded px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => setConfirmId(null)}
              >
                取消
              </button>
              <button
                className="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  if (confirmId !== null) {
                    handleAction(confirmId, "confirmed", confirmAmount);
                    setConfirmId(null);
                  }
                }}
              >
                入账
              </button>
            </div>
          </div>
        </div>
      )}
      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg space-y-4">
            <div className="text-sm font-semibold text-slate-900">确认拒绝入账？</div>
            <div className="text-xs text-slate-600">点击“是”将标记该充值为拒绝，不入账。</div>
            <div className="flex items-center justify-end gap-2">
              <button
                className="rounded px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => setRejectId(null)}
              >
                否
              </button>
              <button
                className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  if (rejectId !== null) {
                    handleAction(rejectId, "rejected");
                    setRejectId(null);
                  }
                }}
              >
                是
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

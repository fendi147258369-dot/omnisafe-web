"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Section } from "../../components/ui/Section";
import Image from "next/image";
import { api } from "../../lib/api";

const PAY_ADDRESS = "0xSAFE…PAY (示例)";

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width={16} height={16}>
    <circle cx="120" cy="120" r="120" fill="#2ca5e0" />
    <path
      d="M170.2 72.5l-20.8 98.2c-1.6 7.1-5.8 8.9-11.8 5.5l-32.5-24-15.7 15.1c-1.7 1.7-3.1 3.1-6.4 3.1l2.3-33.1 60.2-54.3c2.6-2.3-.6-3.6-4-1.3l-74.4 47-32.1-10c-7-2.2-7.1-7 1.5-10.3l125.6-48.5c5.8-2.1 10.8 1.4 8.9 10.2z"
      fill="#fff"
    />
  </svg>
);

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

export default function CreditsPage() {
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [bills, setBills] = useState<
    { id: string; time: string; mode: string; payMode: string; amount: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [token, setToken] = useState("USDT");
  const [amount, setAmount] = useState<string>("");
  const [orderMode, setOrderMode] = useState("payg");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const initialLoaded = useRef(false);
  const [showMore, setShowMore] = useState(false);

  const statusLabel = (raw: string) => {
    if (!raw) return "-";
    const s = raw.toLowerCase();
    if (s === "pending") return "审核中";
    if (s === "confirmed" || s === "success") return "充值成功";
    if (s === "rejected" || s === "failed") return "充值失败";
    return raw;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!initialLoaded.current) {
        setLoading(true);
      }
      setError(null);
      try {
        const [meRes, creditsRes, billingRes] = await Promise.allSettled([
          api("/auth/me"),
          api("/billing/credits"),
          api("/billing/deposit/history"),
        ]);

        if (meRes.status === "fulfilled") {
          setPlan(meRes.value?.plan_label || null);
          if (creditsRes.status !== "fulfilled") {
            const total =
              (meRes.value?.prepaid_credits ?? 0) +
              (meRes.value?.subscription_credits ?? 0);
            setCredits(total);
          }
        }
        if (creditsRes.status === "fulfilled") {
          const total =
            creditsRes.value?.total_available ??
            (creditsRes.value?.prepaid_credits ?? 0) +
              (creditsRes.value?.subscription_credits ?? 0);
          setCredits(total);
        }
        if (billingRes.status === "fulfilled" && Array.isArray(billingRes.value)) {
          const mapped = billingRes.value.map((b: any, idx: number) => {
            const payMode =
              b.order_mode === "subscription"
                ? "套餐订购"
                : b.order_mode === "payg"
                ? "按需订购"
                : b.order_mode || "-";
            return {
              id: String(b.id ?? idx),
              time: formatLocal(b.created_at ?? b.time ?? ""),
              mode: b.token ? `${b.token} 充值` : b.plan_name ?? "充值",
              payMode,
              amount: b.amount_usd
                ? `${b.amount_usd} USD`
                : b.amount_raw
                ? `${b.amount_raw}`
                : b.amount ?? "",
              status: b.status ?? "审核中",
            };
          });
          setBills(mapped);
        }
      } catch (e: any) {
        setError(e?.message || "加载失败，请稍后重试");
      } finally {
        if (!initialLoaded.current) {
          setLoading(false);
          initialLoaded.current = true;
        }
      }
    };
    fetchData();
    const timer = setInterval(fetchData, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    setError(null);
    const amtNum = Number(amount);
    if (!txHash) {
      setError("请填写 Tx Hash");
      return;
    }
    if (Number.isNaN(amtNum) || amtNum < 10) {
      setError("金额需填写且不少于 10 USD");
      return;
    }
    try {
      await api("/billing/deposit/submit", {
        method: "POST",
        body: {
          token,
          tx_hash: txHash,
          amount_usd: Math.floor(amtNum),
          amount_raw: Math.floor(amtNum * 1e6),
          order_mode: orderMode,
        },
      });
      setSubmitMsg("已提交审核，请等待人工确认");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      // 立即在本地账单列表中追加一条“审核中”记录，避免用户必须刷新
      const payMode =
        orderMode === "subscription"
          ? "套餐订购"
          : orderMode === "payg"
          ? "按需订购"
          : orderMode || "-";
      setBills((prev) => [
        {
          id: `temp-${Date.now()}`,
          time: new Date().toLocaleString(),
          mode: `${token} 充值`,
          payMode,
          amount: `${Math.floor(amtNum)} USD`,
          status: "pending",
        },
        ...prev,
      ]);
      setTxHash("");
      setAmount("");
    } catch (err: any) {
      setError(err?.message || "提交失败，请稍后重试");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PAY_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <AppShell>
      <Section title="充值 / 额度" description="">
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {loading && <div className="mb-3 text-sm text-slate-700">加载中…</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 左侧：用户状态 + 官方收款 + 流程 */}
          <div className="flex flex-col gap-4">
            {/* 用户状态卡片 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span className="font-semibold text-slate-800">用户状态</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("bill-records");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  账单记录
                </button>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-4xl font-bold text-emerald-600">{credits ?? 0}</div>
                  <div className="text-sm font-semibold text-slate-900">Credits</div>
                  <div className="text-xs text-slate-600">当前可使用额度</div>
                </div>
                <div className="grid gap-1 text-sm text-slate-700 pl-4 self-center">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                        <path
                          fill="currentColor"
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 2l4 4h-4ZM8 12h8v2H8Zm0 4h5v2H8Z"
                        />
                      </svg>
                    </span>
                    <span>Explorer</span>
                  </div>
                  <div>最近订阅</div>
                </div>
              </div>
            </div>

            {/* 官方收款账户 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="text-lg">📘</span> 官方收款账户
              </h3>
              <ul className="text-sm text-slate-700 leading-7 space-y-1.5">
                <li>网络：Ethereum Mainnet</li>
                <li>支持币种：USDT / USDC (ERC20)</li>
                <li className="flex flex-col gap-2">
                  <span className="font-mono text-base text-slate-900">
                    收款地址：0xSAFE…PAY
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex w-max items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <span className="text-slate-500">📋</span>
                      <span>复制地址</span>
                    </button>
                    {copied && <span className="text-xs text-emerald-600">✅ 已复制</span>}
                  </div>
                  <span className="text-xs text-amber-700">
                    ⚠️ 仅支持 ERC20 充值，其他链无法找回
                  </span>
                </li>
                <li>最低充值：10 USDT / USDC</li>
              </ul>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                ⚠️ 请注意，转账成功后再使用你的 Tx Hash 提交审核。
              </div>
            </div>

            {/* 流程步骤 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">充值流程</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                    1
                  </span>
                  <span>转账</span>
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                    2
                  </span>
                  <span>提交 Tx</span>
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                    3
                  </span>
                  <span>人工审核</span>
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                    4
                  </span>
                  <span>额度到账</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div>提交后金额会自动到账，通常需 5–30 分钟人工确认。</div>
                <div>无需联系客服，审核完成后状态会更新。</div>
              </div>
            </div>
          </div>

          {/* 右侧：提交凭证表单 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-900">提交充值凭证</h3>
            <form className="grid gap-4 text-sm text-slate-900" onSubmit={handleSubmit}>
              <label className="grid gap-1.5">
                <span className="text-xs text-slate-600">订购确认</span>
                <select
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-accent focus:outline-none"
                  value={orderMode}
                  onChange={(e) => setOrderMode(e.target.value)}
                >
                  <option value="payg">按需订购</option>
                  <option value="subscription">套餐订购</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs text-slate-600">Tx Hash</span>
                <input
                  placeholder="如：0xabc...（来自区块浏览器）"
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs text-slate-600">币种</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setToken("USDT")}
                    className={`flex flex-1 items-center gap-2 rounded border px-3 py-2 text-sm font-semibold ${
                      token === "USDT"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Image src="/icons/usdt.png" alt="USDT" width={20} height={20} />
                    <span>USDT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setToken("USDC")}
                    className={`flex flex-1 items-center gap-2 rounded border px-3 py-2 text-sm font-semibold ${
                      token === "USDC"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Image src="/icons/usdc.png" alt="USDC" width={20} height={20} />
                    <span>USDC</span>
                  </button>
                </div>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs text-slate-600">金额（USD）</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="输入已转账金额"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none"
                />
                <span className="text-xs text-slate-600">不少于 10 USD，填写后方便审核入账</span>
              </label>
              <div className="text-xs text-slate-600 space-y-1">
                <div>提交后金额自动到账，通常需 5–30 分钟人工确认。</div>
                <div>提交金额后方便核对，无需联系客服。</div>
              </div>
              <button
                type="submit"
                className="mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
              >
                提交审核
              </button>
              {submitMsg && <div className="text-xs text-emerald-700">{submitMsg}</div>}
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-indigo-600 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      fill="currentColor"
                      d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 3.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 12 5.25m1.5 12.25h-3a1 1 0 0 1 0-2h1v-4h-1a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v5h1a1 1 0 0 1 0 2Z"
                    />
                  </svg>
                </span>
                <span className="flex-1 leading-5">
                  如果超时未到账请联系官方客服：
                  <a
                    href="https://t.me/your_telegram"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-indigo-700 hover:bg-indigo-100"
                  >
                    <TelegramIcon />
                    <span className="font-semibold">Telegram</span>
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
      </Section>

      <Section id="bill-records" title="账单记录" description="查看充值时间、模式、金额与状态">
        {bills.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            暂无账单记录。
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* 桌面表格 */}
            <div className="hidden md:block overflow-hidden">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-center w-32">时间</th>
                    <th className="px-4 py-3 text-center w-32">币种</th>
                    <th className="px-4 py-3 text-center w-28">订购模式</th>
                    <th className="px-4 py-3 text-center w-24">金额</th>
                    <th className="px-4 py-3 text-center w-24">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(showMore ? bills : bills.slice(0, 5)).map((bill) => (
                    <tr key={bill.id}>
                      <td className="px-4 py-3 text-center text-slate-900">{bill.time}</td>
                      <td className="px-4 py-3 text-center text-slate-800">{bill.mode}</td>
                      <td className="px-4 py-3 text-center text-slate-800">{bill.payMode}</td>
                      <td className="px-4 py-3 text-center text-slate-800">{bill.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            bill.status === "已充值" ||
                            bill.status === "充值成功" ||
                            bill.status === "confirmed" ||
                            bill.status === "success"
                              ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                              : bill.status === "充值失败" ||
                                bill.status === "rejected" ||
                                bill.status === "failed"
                              ? "rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                              : "rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                          }
                        >
                          {statusLabel(bill.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bills.length > 5 && (
              <div className="hidden md:flex justify-center bg-slate-50 py-3">
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {showMore ? "收起" : "展开更多"}
                </button>
              </div>
            )}

            {/* 移动端卡片列表 */}
            <div className="md:hidden space-y-3 p-3">
              {bills.length > 5 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowMore((v) => !v)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    {showMore ? "收起" : "展开更多"}
                  </button>
                </div>
              )}
              {(showMore ? bills : bills.slice(0, 5)).map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-sm"
                >
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{bill.time}</span>
                    <span
                      className={
                        bill.status === "已充值" ||
                        bill.status === "充值成功" ||
                        bill.status === "confirmed" ||
                        bill.status === "success"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                          : bill.status === "充值失败" ||
                            bill.status === "rejected" ||
                            bill.status === "failed"
                          ? "rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                          : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                      }
                    >
                      {statusLabel(bill.status)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">币种</span>
                      <span className="font-semibold text-slate-900">{bill.mode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">订购模式</span>
                      <span className="font-semibold text-slate-900">{bill.payMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">金额</span>
                      <span className="font-semibold text-slate-900">{bill.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </Section>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-8 shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-2xl text-emerald-600">✔</span>
            </div>
            <div className="text-base font-semibold text-slate-900">
              提交成功，等待审核
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl text-red-600">!</span>
            </div>
            <div className="text-base font-semibold text-slate-900">提交失败</div>
            <div className="max-w-sm text-center text-sm text-slate-700">{error}</div>
            <button
              type="button"
              className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={() => setError(null)}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Client component because we use useState for form state & mock display
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Accordion } from "../../components/ui/Accordion";
import { api } from "../../lib/api";

const notices = [
  {
    id: "notice-1",
    title: "1️⃣ 检测通常在约 1 分钟内完成",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>OmniSafe 基于实时链上数据，不使用缓存；检测时间会随链上状态与合约复杂度略有波动。</p>
      </div>
    ),
  },
  {
    id: "notice-2",
    title: "2️⃣ 部分模块在特定情况下会选择「不检测」",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>当链上数据不完整、不可验证或可能产生误导性结论时，该模块会被跳过或标记未覆盖，避免在信息不足时输出看似完整但错误的结论。</p>
      </div>
    ),
  },
  {
    id: "notice-3",
    title: "3️⃣ 新币与热点币需特别注意",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>
          刚部署或刚加池的代币，权限、流动性、资金行为可能尚未完全展开，状态变化频繁。OmniSafe 对当下的准确度更高，但新币变化快，参考时效更短。
        </p>
      </div>
    ),
  },
  {
    id: "notice-4",
    title: "4️⃣ 未检测到不等于不存在",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>“未检测到 / 当前未发现 / 条件不足”仅表示当前链上数据无法证明其存在，而不是它一定不存在。OmniSafe 不会基于猜测补全结果。</p>
      </div>
    ),
  },
  {
    id: "notice-5",
    title: "5️⃣ 检测结果具有时效性",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>链上是动态的，权限、流动性、资金行为可能随时变化。结果仅对应检测当下的状态，不应视为长期结论。</p>
      </div>
    ),
  },
  {
    id: "notice-6",
    title: "6️⃣ OmniSafe 不提供投资建议",
    content: (
      <div className="space-y-2 text-sm text-slate-800">
        <p>OmniSafe 展示链上事实、拆解结构、指出需要注意的地方，但不会给出买卖建议或替你判断安全与否，最终决策由你自行完成。</p>
      </div>
    ),
  },
];

export default function ScanPage() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "queued" | "running" | "done" | "failed">(
    "idle",
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<string>("");
  const [submittedChain, setSubmittedChain] = useState<string>("");
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<"zh" | "en">("zh");
  const [aiExpanded, setAiExpanded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStep, setRatingStep] = useState<1 | 2 | 3>(1);
  const [ratingValue, setRatingValue] = useState<number>(100);
  const ratingTimer = useRef<NodeJS.Timeout | null>(null);
  const expiryTimer = useRef<NodeJS.Timeout | null>(null);
  const statusModalTimer = useRef<NodeJS.Timeout | null>(null);
  const [copyHint, setCopyHint] = useState<{ ai?: string; raw?: string }>({});
  const [aiUsed, setAiUsed] = useState(false);
  const [showAiLockedModal, setShowAiLockedModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const CACHE_KEY = "last_scan_result";
  const EXPIRY_MS = 30 * 60 * 1000; // 30 分钟

  const saveCache = (payload: any) => {
    if (typeof window === "undefined") return;
    const data = {
      ts: Date.now(),
      ...payload,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  };

  // 每次新的 jobId 出现时重置 AI 使用状态
  useEffect(() => {
    setAiUsed(false);
    setAiText(null);
    setAiExpanded(false);
  }, [jobId]);

  const copyText = async (text: string, type: "ai" | "raw") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint((prev) => ({ ...prev, [type]: "已复制" }));
      setTimeout(() => setCopyHint((prev) => ({ ...prev, [type]: undefined })), 1500);
    } catch (e) {
      setCopyHint((prev) => ({ ...prev, [type]: "复制失败" }));
      setTimeout(() => setCopyHint((prev) => ({ ...prev, [type]: undefined })), 1500);
    }
  };

  // 提取分组事实，缺省时尝试用平铺的 recommendations 兜底
  const groupedFacts = useMemo(() => {
    const g = result?.grouped_recommendations || {};
    // 如果没有分组但有平铺的 recommendations，则放到合约结构分组中兜底展示
    if (
      (!g.contract_structure || g.contract_structure.length === 0) &&
      Array.isArray(result?.recommendations) &&
      result.recommendations.length > 0
    ) {
      return {
        ...g,
        contract_structure: result.recommendations,
      };
    }
    return g;
  }, [result]);

  // 模块数据兜底：如果没有 modules，但有 recommendations，则生成一个综合模块
  const modulesData = useMemo(() => {
    const mods = result?.modules || [];
    if ((!mods || mods.length === 0) && Array.isArray(result?.recommendations)) {
      return [
        {
          name: "综合说明",
          status: "FULL",
          recommendations: result.recommendations,
        },
      ];
    }
    return mods;
  }, [result]);

  const chains = [
    { value: "ethereum", label: "Ethereum", icon: "/icons/ethereum.png" },
    { value: "bsc", label: "BSC", icon: "/icons/bsc.png" },
    { value: "arbitrum", label: "Arbitrum", icon: "/icons/arbitrum.png" },
    { value: "base", label: "Base", icon: "/icons/base.png" },
  ];

  const currentChain = chains.find((c) => c.value === chain) || chains[0];

  const isValidAddress = useMemo(() => {
    if (!address) return true;
    // 简单校验：EVM 地址 0x 开头 + 40 hex
    if (chain === "ethereum" || chain === "bsc" || chain === "arbitrum" || chain === "base") {
      return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
    }
    return true;
  }, [address, chain]);

  const clearReportState = () => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
    if (ratingTimer.current) {
      clearInterval(ratingTimer.current);
      ratingTimer.current = null;
    }
    setSubmitted(false);
    setJobId(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setShowStatusModal(false);
    setShowRaw(false);
    setAiText(null);
    setAiUsed(false);
    setAiExpanded(false);
    setShowAiModal(false);
    setShowAiLockedModal(false);
    if (statusModalTimer.current) {
      clearTimeout(statusModalTimer.current);
      statusModalTimer.current = null;
    }
    localStorage.removeItem(CACHE_KEY);
  };

  const scheduleExpire = (delay: number = EXPIRY_MS) => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
    }
    expiryTimer.current = setTimeout(() => {
      clearReportState();
    }, Math.max(0, delay));
  };

  useEffect(() => {
    if (!jobId) return;
    if (status === "done" || status === "failed") return;
    const timer = setInterval(async () => {
      try {
        const res = await api(`/detect/${jobId}`);
        setStatus(res.status as any);
        setResult(res.result ?? null);
        setError(res.error ?? null);
        saveCache({
          jobId,
          status: res.status,
          result: res.result ?? null,
          error: res.error ?? null,
          submittedAddress,
          submittedChain,
        });
        if (res.status === "done" || res.status === "failed") {
          clearInterval(timer);
        }
      } catch (err: any) {
        const msg = err?.message || "获取状态失败";
        setError(msg);
        if (msg.includes("Not Found") || msg.includes("404")) {
          clearReportState();
        }
        clearInterval(timer);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [jobId, status, submittedAddress, submittedChain]);

  // 恢复上次检测结果（完成状态）以便刷新后仍可查看，过期则清理
  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const ts = parsed?.ts || 0;
        const isFresh = Date.now() - ts < EXPIRY_MS;
        if (isFresh && parsed?.jobId) {
          setSubmitted(true);
          setJobId(parsed.jobId || null);
          setStatus(parsed.status || "queued");
          setResult(parsed.result || null);
          setError(parsed.error || null);
          setSubmittedAddress(parsed.submittedAddress || "");
          setSubmittedChain(parsed.submittedChain || "");
          // 已完成则直接展示卡片；未完成则继续轮询（不强制弹窗）
          if (parsed.status === "done" && parsed.result) {
            setShowStatusModal(false);
          }
          scheduleExpire(EXPIRY_MS - (Date.now() - ts));
        } else if (!isFresh) {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return () => {
      if (expiryTimer.current) {
        clearTimeout(expiryTimer.current);
        expiryTimer.current = null;
      }
      if (ratingTimer.current) {
        clearInterval(ratingTimer.current);
        ratingTimer.current = null;
      }
      if (statusModalTimer.current) {
        clearTimeout(statusModalTimer.current);
        statusModalTimer.current = null;
      }
    };
  }, []);

  // 检测成功后，状态弹窗 5 分钟后自动关闭
  useEffect(() => {
    if (statusModalTimer.current) {
      clearTimeout(statusModalTimer.current);
      statusModalTimer.current = null;
    }
    if (status === "done") {
      statusModalTimer.current = setTimeout(() => {
        setShowStatusModal(false);
      }, 5 * 60 * 1000);
    }
    return () => {
      if (statusModalTimer.current) {
        clearTimeout(statusModalTimer.current);
        statusModalTimer.current = null;
      }
    };
  }, [status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidAddress) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api("/detect", {
        method: "POST",
        body: {
          chain,
          token_address: address.trim(),
        },
      });
      setJobId(res.job_id);
      setStatus(res.status as any);
      setSubmitted(true);
      setSubmittedAddress(address.trim());
      setSubmittedChain(chain);
      setShowStatusModal(true);
      saveCache({
        jobId: res.job_id,
        status: res.status,
        result: null,
        error: null,
        submittedAddress: address.trim(),
        submittedChain: chain,
      });
    } catch (err: any) {
      const msg = err?.message || "提交失败";
      if (msg.toLowerCase().includes("credit") || msg.includes("额度不足") || msg.includes("余额不足")) {
        setShowCreditModal(true);
      } else {
        setError(msg);
        setErrorMessage(msg);
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (!submitted || !jobId || !showStatusModal) return null;
    const stages = [
      { key: "queued", label: "列队中" },
      { key: "running", label: "正在检测" },
      { key: "done", label: "检测成功" },
    ] as const;

    const currentStageIndex =
      status === "done"
        ? 2
        : status === "running"
        ? 1
        : status === "queued"
        ? 0
        : -1;

    const canClose = status === "done" || status === "failed";

    const renderStageIcon = (idx: number) => {
      const stageKey = stages[idx].key;
      if (status === "failed") {
        return (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xl">
            ✕
          </span>
        );
      }
      // stage: queued → 始终勾
      if (stageKey === "queued") {
        if (status === "queued") {
          return (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-indigo-500 border-t-transparent text-indigo-500 animate-spin">
              ●
            </span>
          );
        }
        return (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">
            ✓
          </span>
        );
      }
      // stage: running
      if (stageKey === "running") {
        if (status === "done") {
          return (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">
              ✓
            </span>
          );
        }
        if (status === "running") {
          return (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-indigo-500 border-t-transparent text-indigo-500 animate-spin">
              ●
            </span>
          );
        }
        return (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl">
            ✓
          </span>
        );
      }
      // stage: done
      if (stageKey === "done") {
        if (status === "done") {
          return (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">
              ✓
            </span>
          );
        }
        return (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl">
            ✓
          </span>
        );
      }
      return null;
    };

    return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/tubiao.png" alt="engine" className="h-12 w-12 object-contain" />
                <div className="text-base font-semibold text-slate-900 text-center">成功启动引擎</div>
              </div>

          <div className="mt-4 space-y-6">
            <div className="text-sm text-slate-700 flex items-center gap-2 justify-center">
              <span>链路：</span>
              {(() => {
                const meta =
                  chains.find((c) => c.value === (submittedChain || result?.chain)) || currentChain;
                return (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meta.icon} alt={meta.label} className="h-4 w-4 object-contain" />
                    <span>{meta.label}</span>
                  </span>
                );
              })()}
            </div>

            <div className="flex w-full items-center justify-center gap-3 sm:gap-5">
              {stages.map((stage, idx) => {
                const nextIdx = idx + 1;
                const lineActive =
                  status === "done" ? idx < stages.length - 1 : idx < currentStageIndex;
                return (
                  <div key={stage.key} className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className="flex flex-col items-center gap-2 min-w-[64px]">
                      {renderStageIcon(idx)}
                      <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {stage.label}
                      </div>
                    </div>
                    {nextIdx < stages.length && (
                      <div
                        className={`h-[2px] w-10 sm:w-16 rounded-full ${
                          lineActive ? "bg-indigo-400" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-slate-600">
              检测最长时间约为 5 分钟，超时或失败请重新检测。
            </div>

            {status === "failed" && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 text-center">
                检测失败，如已扣款将自动退回。
              </div>
            )}
          </div>

          {status === "done" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  const panel = document.getElementById("ai-panel");
                  if (panel) {
                    setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                  }
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                查看报告
              </button>
              <p className="mt-2 text-center text-xs text-slate-600">
                ⚠️ 请点击「用 AI 解读这份报告」，原始数据为检测引擎返回的原始 JSON。
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAIPanel = () => {
    if (!submitted || status !== "done" || !jobId) return null;
    return (
      <div
        id="ai-panel"
        className="mx-auto mt-6 w-full max-w-5xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/tubiao.png"
                alt="Report"
                className="h-11 w-11 object-contain"
              />
            </div>
            <div className="space-y-1">
              <div className="text-base font-semibold text-slate-900">报告已生成</div>
              <p className="text-sm text-slate-700 leading-6">
                链上检测完成。如需可读性更高的文字说明，请使用 AI 解读。原始 JSON 将默认折叠，仅供专业查看。
              </p>
              <div className="text-xs text-amber-600 font-semibold">
                {renderExpireText() ||
                  "报告将在 30 分钟后自动清除；每次检测均为实时生成，请尽快查看。"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRatingStep(1);
              setRatingValue(100);
              if (ratingTimer.current) {
                clearInterval(ratingTimer.current);
                ratingTimer.current = null;
              }
              setShowRatingModal(true);
            }}
            className="mt-1 hidden shrink-0 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 sm:inline-flex"
          >
            点击进行评分
          </button>
        </div>
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <button
                type="button"
                onClick={() => setShowRaw((v) => !v)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:w-40"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>🗂</span>
                  {showRaw ? "隐藏原始数据" : "查看原始数据"}
                </span>
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => {
                  if (aiUsed) {
                    setShowAiLockedModal(true);
                    return;
                  }
                  setShowAiModal(true);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-600 disabled:opacity-60 sm:w-48"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>🧠</span>
                  {aiLoading ? "AI 解读生成中..." : "用 AI 解读这份报告"}
                </span>
              </button>
            </div>
          <button
            type="button"
            onClick={() => {
              setRatingStep(1);
              setRatingValue(100);
              if (ratingTimer.current) {
                clearInterval(ratingTimer.current);
                ratingTimer.current = null;
              }
              setShowRatingModal(true);
            }}
            className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 sm:hidden"
          >
            点击进行评分
          </button>
        </div>
        {aiText && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setAiExpanded((v) => !v)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {aiExpanded ? "收起 AI 解读" : "翻译完成，点击展开"}
            </button>
            {aiExpanded && (
              <div className="space-y-2">
                <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
                  {copyHint.ai && <span className="text-emerald-600">{copyHint.ai}</span>}
                  <button
                    type="button"
                    onClick={() => copyText(aiText || "", "ai")}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    复制 AI 解读
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 leading-6 space-y-2 break-words">
                  {(aiText || "")
                    .split(/\n+/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, idx) => (
                      <p key={idx} className="whitespace-pre-wrap break-words">
                        {p}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        {showRaw && (
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
              {copyHint.raw && <span className="text-emerald-600">{copyHint.raw}</span>}
              <button
                type="button"
                onClick={() => copyText(JSON.stringify(result, null, 2) || "", "raw")}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                复制原始数据
              </button>
            </div>
            <pre className="mt-2 max-h-[480px] overflow-auto rounded bg-slate-900 px-3 py-2 text-xs text-slate-50">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderAiModal = () => {
    if (!showAiModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
          <div className="text-base font-semibold text-slate-900">选择 AI 解读语言</div>
          <div className="grid gap-3">
            {[
              { key: "zh" as const, label: "使用中文解读" },
              { key: "en" as const, label: "Use English summary" },
            ].map((opt) => (
              <button
                key={opt.key}
                disabled={aiLoading}
                onClick={async () => {
                  setAiLanguage(opt.key);
                  setShowAiModal(false);
                  setAiLoading(true);
                  setError(null);
                  try {
                    if (!jobId) throw new Error("缺少 job_id");
                    const res = await api(`/detect/${jobId}/ai`, {
                      method: "POST",
                      body: { lang: opt.key },
                    });
                    setAiText(res.ai_summary);
                    setAiExpanded(false);
                    setAiUsed(true);
                  } catch (err: any) {
                    setError(err?.message || "AI 解读失败");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAiModal(false)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  const renderAiLockedModal = () => {
    if (!showAiLockedModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl">
            ✕
          </div>
          <div className="text-center text-sm leading-6 text-slate-800">
            该份报告已被翻译
          </div>
          <button
            type="button"
            onClick={() => setShowAiLockedModal(false)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            知道了
          </button>
        </div>
      </div>
    );
  };

  const renderCreditModal = () => {
    if (!showCreditModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-2xl">
            !
          </div>
          <div className="text-center text-sm leading-6 text-slate-800">
            当前检测额度不足，请充值后再试。
          </div>
          <button
            type="button"
            onClick={() => setShowCreditModal(false)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            我知道了
          </button>
        </div>
      </div>
    );
  };

  const renderErrorModal = () => {
    if (!showErrorModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl">
            !
          </div>
          <div className="text-center text-sm leading-6 text-slate-800">
            {errorMessage || "发生错误，请稍后重试。"}
          </div>
          <button
            type="button"
            onClick={() => setShowErrorModal(false)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            知道了
          </button>
        </div>
      </div>
    );
  };

  const renderRatingModal = () => {
    if (!showRatingModal) return null;
    const stopAnimation = () => {
      if (ratingTimer.current) {
        clearInterval(ratingTimer.current);
        ratingTimer.current = null;
      }
    };
    const handleClose = () => {
      stopAnimation();
      setRatingStep(1);
      setRatingValue(100);
      setShowRatingModal(false);
    };
    const handleNext = () => {
      if (ratingStep === 1) {
        stopAnimation();
        setRatingStep(2);
        setRatingValue(47);
        return;
      }
      if (ratingStep === 2) {
        setRatingStep(3);
        // 启动缓慢变化的动画
        stopAnimation();
        ratingTimer.current = setInterval(() => {
          setRatingValue((prev) => {
            // 随机在 11-100 之间缓慢跳动
            const delta = Math.floor(Math.random() * 15) + 1;
            let next = prev + (Math.random() > 0.5 ? delta : -delta);
            if (next > 100) next = 100;
            if (next < 11) next = 11;
            return next;
          });
        }, 200);
        return;
      }
      // 第 3 步点击返回事实报告
      handleClose();
    };
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
        onClick={() => {
          // 屏蔽蒙层点击关闭
        }}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`text-center text-5xl font-extrabold ${
              ratingStep === 3 ? "text-orange-500" : ratingStep === 2 ? "text-orange-500" : "text-emerald-500"
            }`}
          >
            {ratingStep === 1 ? "100" : ratingStep === 2 ? "47" : ratingValue.toFixed(0)}
          </div>
          {ratingStep === 2 ? (
            <div className="space-y-2 text-sm leading-6 text-slate-800">
              <p>有点意外，对吗？</p>
              <p>刚才它还是 100，</p>
              <p>现在却变成了 47。</p>
              <p>不是因为合约变了，</p>
              <p>也不是因为链上发生了什么。</p>
              <p>只是因为你又点了一次。</p>
              <p>那么你可以再点一次看看结果</p>
            </div>
          ) : ratingStep === 3 ? (
            <div className="space-y-2 text-sm leading-6 text-slate-800">
              <p>它还在变。</p>
              <p>你没有做任何新的操作，</p>
              <p>合约也没有发生任何变化。</p>
              <p>只是因为你又点了一次。</p>
              <p>如果你继续点击，</p>
              <p>它还会继续变化。</p>
              <p>这不是 Bug。</p>
              <p>只是因为这个分数，</p>
              <p>本来就没有一个</p>
              <p>“应该让你不掉入陷阱”的答案。</p>
            </div>
          ) : (
            <div className="space-y-2 text-sm leading-6 text-slate-800">
              <p>很好，</p>
              <p>你已经得到了你想看到的那个分数。</p>
              <p>它看起来清晰、直接、让人安心。</p>
              <p>也正是大多数检测工具选择提供的东西。</p>
              <p>你可以相信它。 但是我希望——</p>
              <p>你也可以再点一次，重新评分。</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            {ratingStep === 3 ? "返回事实报告" : "重新评分"}
          </button>
        </div>
      </div>
    );
  };

  // 缓存最后一次完成的结果，便于刷新后查看（30 分钟内有效），并设置自动清理
  useEffect(() => {
    if (status === "done" && result) {
      try {
        const payload = {
          jobId,
          status,
          result,
          submittedAddress,
          submittedChain,
          ts: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (e) {
        // ignore
      }
      scheduleExpire(EXPIRY_MS);
      return () => {
        if (expiryTimer.current) {
          clearTimeout(expiryTimer.current);
          expiryTimer.current = null;
        }
      };
    }
  }, [status, result, jobId, submittedAddress, submittedChain]);

  const renderExpireText = () => {
    return "报告在 30 分钟后将会自动删除，请尽快阅读";
  };

  return (
    <AppShell>
      <div className="page-detect min-h-screen px-4 pb-14 pt-10 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-2 text-left">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            币种链上风险分析报告
          </h1>
          <p className="text-base text-slate-700">基于当前链上可验证事实生成</p>
        </div>

        <div className="detect-panel relative mx-auto mt-8 w-full max-w-5xl">
          <div className="relative z-10 flex flex-col gap-6">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">检测目标</div>
              <div className="text-sm text-slate-700">
                输入代币地址后，点击启动检测引擎，系统将检测合约结构、权限、流动性与资金行为。
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative w-full">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 pr-16 py-2 text-base text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setChainMenuOpen((o) => !o)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-md bg-white/90 px-2 py-2 text-sm text-slate-800 hover:bg-slate-100 focus:outline-none shadow-sm"
                >
                  {currentChain?.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentChain.icon}
                      alt={currentChain.label}
                      className="h-6 w-6 rounded-sm object-contain"
                    />
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-slate-300 text-[10px] text-slate-700">
                      {currentChain?.label?.[0] ?? "·"}
                    </span>
                  )}
                  <span className="hidden sm:inline">{currentChain?.label ?? "选择链路"}</span>
                  <span className="text-xs text-slate-500">▼</span>
                </button>
                {chainMenuOpen && (
                  <div className="absolute right-2 z-20 mt-2 w-52 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="py-1">
                      {chains.map((c) => (
                        <button
                          type="button"
                          key={c.value}
                          onClick={() => {
                            setChain(c.value);
                            setChainMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
                        >
                          {c.icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.icon}
                              alt={c.label}
                              className="h-6 w-6 rounded-sm object-contain"
                            />
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-slate-300 text-[10px] text-slate-700">
                              {c.label[0]}
                            </span>
                          )}
                          <span className="flex-1 text-left hidden sm:inline">{c.label}</span>
                          {c.value === chain && (
                            <span className="text-xs text-indigo-600">已选</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {touched && !isValidAddress && (
                <div className="text-sm text-red-600">请输入对应链路的有效区块链地址</div>
              )}
            <div className="flex flex-col items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-52 rounded-lg bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1b3378] disabled:opacity-60"
                >
                  {loading ? "提交中..." : "启动检测引擎"}
                </button>
                <span className="text-xs text-slate-600">每次检测将消耗 1 Credits</span>
              </div>
            </form>

            <div className="mt-2 flex justify-end text-xs text-slate-500">
              如果你只想要一个“结论”，OmniSafe 可能不适合你。
            </div>

            <p className="text-sm text-slate-600">
              本系统不提供投资建议，仅展示链上事实与注意事项。
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold text-slate-900">检测注意事项</div>
              <Accordion
                items={notices.map((n, idx) => ({
                  ...n,
                  id: n.id || `notice-${idx + 1}`,
                  title: `${idx + 1}. ${n.title.replace(/^[0-9️⃣\\s]+/, "")}`,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      {renderStatus()}
      {renderAiModal()}
      {renderAiLockedModal()}
      {renderCreditModal()}
      {renderErrorModal()}
      {renderRatingModal()}

      {renderAIPanel()}
    </AppShell>
  );
}

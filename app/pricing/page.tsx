"use client";

import { AppShell } from "../../components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";

const plans = [
  {
    name: "按次付费",
    price: "$1 / 次",
    quota: "适合临时验证 / 新币快速检查",
    icon: "💡",
    perks: ["随用随付", "完整报告输出", "AI 翻译报告内容", "标准优先级"],
  },
  {
    name: "个人订阅",
    price: "$49 / 60次",
    quota: "适合个人高频验证",
    icon: "🎯",
    perks: ["完整报告", "AI 翻译报告内容", "正常优先级", "适合个人研究"],
  },
  {
    name: "专业订阅",
    price: "$199 / 300次",
    quota: "团队级实时监控",
    icon: "🚀",
    perks: ["完整报告", "AI 翻译报告内容", "高优先级", "适合团队与高频使用"],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const readToken = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      setHasToken(!!token);
    };
    readToken();
    const handler = () => readToken();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isLoggedIn = !!user || hasToken;

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    } else {
      router.push("/credits");
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-8 md:px-8 lg:px-12">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-semibold text-slate-900">方案定价</h1>
          <p className="mt-2 text-slate-700">使用次数：</p>
          <p className="text-slate-600 text-sm">
            找到最适合你的方案，我们为不同使用强度提供灵活的额度与优先级。👉 不是更强，是更忙。
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex h-full flex-col rounded-xl border border-white/30 bg-gradient-to-br from-[#3f68ff] via-[#5b7dff] to-[#79a8ff] px-6 py-8 shadow-[0_18px_45px_-22px_rgba(31,63,153,0.55)] text-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl">
                  {plan.icon}
                </div>
                <div className="text-right">
                  <span className="text-sm text-white/80">{plan.quota}</span>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-2 text-2xl font-semibold text-white">{plan.price}</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-white/90 flex-1">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70 inline-block" />
                    <span className="leading-tight">{perk}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-6 w-full rounded-lg border border-white/50 bg-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/30"
                onClick={handleSubscribe}
              >
                订阅
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-5xl rounded-xl border border-white/25 bg-gradient-to-br from-[#c6d4ffb0] via-[#e1e8ffb0] to-[#c7e6ffb0] p-5 shadow-[0_12px_28px_-20px_rgba(31,63,153,0.35)]">
          <p className="mb-1 text-sm font-semibold text-slate-800">订阅说明：</p>
          <h2 className="text-lg font-semibold text-slate-900">
            所有方案，提供相同的完整分析能力
          </h2>
          <div className="mt-2 space-y-2 text-sm leading-6 text-slate-800">
            <p>
              OmniSafe 不区分“简版 / 高级版报告”。每一次检测，系统都会完整执行同一套链上风险分析引擎，覆盖合约结构、权限控制、流动性分布、资金行为与可复核链上证据。
            </p>
            <p>
              不同方案之间的价格差异，仅体现在使用频率与系统优先级，而不影响任何分析维度、数据完整性或结果内容。
            </p>
            <p>
              我们的初衷是让普通用户也能使用原本只存在于机构内部的风控分析能力，因此不会基于价格对分析能力做任何形式的功能阉割。即使未来引入更多风险分析模块，所有用户也将始终获得完整、统一、可复核的分析服务。
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import type { ReactNode } from "react";
import { AppShell } from "../../components/layout/AppShell";

const COPY = {
  title: "工具与自动化定制",
  subtitle: "为专业用户提供链上数据、监控、分析与自动化工具的定制能力",
  sections: {
    monitor: {
      title: "链上监控类",
      items: [
        "新币 / 新池子实时监控",
        "异常交易行为监控",
        "流动性变化监控",
        "权限变更监控（Owner / Fee / Mint）",
      ],
      channels: {
        title: "支持推送渠道：",
        telegram: "Telegram",
        web: "Web 页面",
        api: "API 回调",
      },
    },
    risk: {
      title: "风险与分析类",
      items: ["自动化币种报告", "机器化风险评分", "自定义风险预警", "AI 风险研究模板定制"],
    },
    community: {
      title: "社区 / 群组工具",
      items: ["新币自动回复机器人", "新币提醒", "风险提示预警", "用户合约锁定检测"],
    },
    api: {
      title: "API 与数据服务",
      items: ["链上数据接口", "新币 / 头部 / 池子数据订阅", "私有 API Key", "高级 / 低延迟数据流"],
    },
  },
  footerNote: "OmniSafe 提供链上异常与工具能力，不构成投资建议，不参与交易行为。",
  telegramLink: "https://t.me/your_telegram",
} as const;

const CardShell = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">{children}</div>
);

const CardHeader = ({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 shadow-sm">
      {icon}
    </span>
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
  </div>
);

const BulletList = ({ items }: { items: ReadonlyArray<string> }) => (
  <ul className="mt-4 grid gap-2 text-sm text-slate-700">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2">
        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-300" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
    <path
      fill="currentColor"
      d="M12 2l7 3v6c0 5-3.8 9.4-7 11c-3.2-1.6-7-6-7-11V5l7-3m0 5a4 4 0 0 0-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4a4 4 0 0 0-4-4"
    />
  </svg>
);

const GraphIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
    <path fill="currentColor" d="M4 19h16v2H2V3h2v16m5-8h2v6H9v-6m4-4h2v10h-2V7m4-3h2v13h-2V4" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
    <path
      fill="currentColor"
      d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2"
    />
  </svg>
);

const ApiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
    <path fill="currentColor" d="M3 7h18v4H3V7m0 6h18v4H3v-4m2-9h2v2H5V4m0 6h2v2H5v-2m0 6h2v2H5v-2" />
  </svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="h-4 w-4">
    <circle cx="120" cy="120" r="120" fill="#2ca5e0" />
    <path
      d="M170.2 72.5l-20.8 98.2c-1.6 7.1-5.8 8.9-11.8 5.5l-32.5-24-15.7 15.1c-1.7 1.7-3.1 3.1-6.4 3.1l2.3-33.1 60.2-54.3c2.6-2.3-.6-3.6-4-1.3l-74.4 47-32.1-10c-7-2.2-7.1-7 1.5-10.3l125.6-48.5c5.8-2.1 10.8 1.4 8.9 10.2z"
      fill="#fff"
    />
  </svg>
);

export default function BotsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">{COPY.title}</h1>
          <p className="mt-3 text-sm text-slate-700">{COPY.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <CardShell>
            <CardHeader icon={<ShieldIcon />} title={COPY.sections.monitor.title} />
            <BulletList items={COPY.sections.monitor.items} />
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {COPY.sections.monitor.channels.title}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={COPY.telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <TelegramIcon />
                  {COPY.sections.monitor.channels.telegram}
                </a>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M4 4h16v10H4V4m0 12h10v2H4v-2m12 0h4v2h-4v-2" />
                    </svg>
                  </span>
                  {COPY.sections.monitor.channels.web}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M4 7h16v2H4V7m0 4h16v2H4v-2m0 4h10v2H4v-2" />
                    </svg>
                  </span>
                  {COPY.sections.monitor.channels.api}
                </span>
              </div>
            </div>
          </CardShell>

          <div className="grid gap-6 lg:grid-cols-2">
            <CardShell>
              <CardHeader icon={<GraphIcon />} title={COPY.sections.risk.title} />
              <BulletList items={COPY.sections.risk.items} />
            </CardShell>
            <CardShell>
              <CardHeader icon={<ChatIcon />} title={COPY.sections.community.title} />
              <BulletList items={COPY.sections.community.items} />
            </CardShell>
            <div className="lg:col-span-2">
              <CardShell>
                <CardHeader icon={<ApiIcon />} title={COPY.sections.api.title} />
                <BulletList items={COPY.sections.api.items} />
              </CardShell>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600">{COPY.footerNote}</div>
      </div>
    </AppShell>
  );
}

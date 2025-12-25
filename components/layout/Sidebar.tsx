// This component uses usePathname, so mark as client.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useUser } from "../../contexts/UserContext";

const navItems: { href: string; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
  {
    href: "/scan",
    label: "代币检测",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    href: "/abnormal-tokens",
    label: "今日异常代币",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 3l9 16H3l9-16z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    href: "/new-listings",
    label: "今日新入市",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h12" />
      </svg>
    ),
  },
  {
    href: "/pricing",
    label: "方案定价",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>
        <path d="m12 2 7 7-7 7-7-7 7-7z"></path>
      </svg>
    ),
  },
  {
    href: "/credits",
    label: "账单 / 充值",
    requiresAuth: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    ),
  },
  {
    href: "/bots",
    label: "机器人集成",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="3" y="3" width="18" height="12" rx="2" />
        <path d="M7 15v4" />
        <path d="M17 15v4" />
        <path d="M7 19h10" />
        <circle cx="9" cy="9" r="1.2" />
        <circle cx="15" cy="9" r="1.2" />
      </svg>
    ),
  },
  {
    href: "/vision",
    label: "关于 OmniSafe",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const authed = !!user;
  return (
    <aside className="hidden md:block w-40 md:w-48 flex-shrink-0 border-r border-slate-200 bg-[#eef1f5]">
      <nav className="sticky top-14 h-[calc(100vh-56px)] flex flex-col gap-1 px-2 py-4 text-base font-medium text-slate-700 overflow-y-auto items-stretch">
        {navItems
          .filter((item) => !item.requiresAuth || authed)
          .map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded px-3 py-2 hover:bg-slate-200 transition flex items-center gap-3 text-left",
                active && "bg-slate-300 text-slate-900 font-semibold"
              )}
            >
              <span className="w-5 text-base leading-none text-slate-700 flex items-center justify-center">
                {item.icon}
              </span>
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

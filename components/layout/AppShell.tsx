import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c6d4ff] via-[#e1e8ff] to-[#c7e6ff] text-slate-900">
      <TopBar />
      <div className="flex w-full h-[calc(100vh-56px)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-[#c6d4ff] via-[#e1e8ff] to-[#c7e6ff]">
          {children}
        </main>
      </div>
    </div>
  );
}

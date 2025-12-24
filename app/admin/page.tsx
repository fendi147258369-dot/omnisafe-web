"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!username || !password || !otp) {
        throw new Error("请填写完整信息");
      }
      const res = await api("/internal/auth/login", {
        method: "POST",
        body: { username, password, otp },
      });
      if (res?.access_token) {
        localStorage.setItem("admin_access_token", res.access_token);
        router.push("/admin/dashboard");
      } else {
        throw new Error("登录失败");
      }
    } catch (err: any) {
      setError(err?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c6d4ff] via-[#e1e8ff] to-[#c7e6ff] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-8">
        <div className="mb-6 text-center">
          <div className="text-sm font-semibold text-slate-600">Admin Console</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">管理员登录</h1>
          <p className="mt-2 text-sm text-slate-600">请输入用户名、密码和 Google 令牌</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold">用户名</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#4b6bff] focus:outline-none focus:ring-1 focus:ring-[#4b6bff]"
              placeholder="admin"
              autoComplete="username"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold">密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#4b6bff] focus:outline-none focus:ring-1 focus:ring-[#4b6bff]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Google 令牌</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-[#4b6bff] focus:outline-none focus:ring-1 focus:ring-[#4b6bff]"
              placeholder="6 位动态验证码"
              inputMode="numeric"
            />
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#4b6bff] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#3e5cf0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "验证中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

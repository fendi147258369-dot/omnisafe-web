"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../../../components/admin/AdminShell";
import { adminApi } from "../../../lib/api";
import { useRouter } from "next/navigation";

type UserRow = {
  id: number;
  google_sub?: string;
  email?: string;
  telegram_id?: string;
  telegram_username?: string;
  display_name?: string;
  avatar_url?: string;
  is_active: boolean;
  plan_label: string;
  created_at?: string;
  last_login_at?: string;
  credits: number;
};

const planOptions = ["Pay-As-You-Go", "Explorer", "Analyst"];

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const router = useRouter();
  const [confirmUser, setConfirmUser] = useState<UserRow | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<UserRow | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi("/internal/users");
      setUsers(res);
    } catch (e: any) {
      setError(e?.message || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (u: UserRow) => {
    setError(null);
    try {
      const res = await adminApi(`/internal/users/${u.id}`, {
        method: "PUT",
        body: {
          is_active: !u.is_active,
        },
      });
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, ...res } : item)));
      setMessage(`用户 A${u.id} 已${res.is_active ? "启用" : "停用"}`);
    } catch (e: any) {
      setError(e?.message || "切换状态失败");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (id: number, key: keyof UserRow, value: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [key]: value } : u))
    );
  };

  const handleSaveUser = async (u: UserRow) => {
    setMessage(null);
    setError(null);
    setModalError(null);
    setSuccessModal(false);
    try {
      const res = await adminApi(`/internal/users/${u.id}`, {
        method: "PUT",
        body: {
          prepaid_credits: u.prepaid_credits,
          credits: u.credits,
          is_active: u.is_active,
          display_name: u.display_name,
          plan_label: u.plan_label,
        },
      });
      // 用后端返回刷新该条，并触发一次整体刷新保证最新
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, ...res } : item)));
      setMessage(`用户 #${u.id} 已保存`);
      setEditingId(null);
      setConfirmUser(null);
      setSuccessModal(true);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.message || "保存失败";
      setError(msg);
      setModalError(msg);
    }
  };

  const filtered = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(u.id).includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.google_sub || "").toLowerCase().includes(q) ||
      (u.telegram_id || "").toLowerCase().includes(q) ||
      (u.telegram_username || "").toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q) ||
      (u.plan_label || "").toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="搜索用户（邮箱 / Google Sub / Telegram / ID / Plan）"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {message && <div className="mb-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading && <div className="mb-3 text-sm text-slate-600">加载中...</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paged.map((u) => (
          <div
            key={u.id}
            className="rounded-xl bg-white shadow-sm border border-white/60 p-4 flex flex-col gap-3"
          >
            {(() => {
              const isEditing = editingId === u.id;
              const displayId = `A${u.id}`;
              return (
                <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">用户 ID</div>
                <div className="text-lg font-semibold text-slate-900">{displayId}</div>
              </div>
              <button
                onClick={() =>
                  u.is_active ? setConfirmDisable(u) : toggleActive(u)
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  u.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {u.is_active ? "已启用" : "已停用"}
              </button>
            </div>

            <div className="space-y-1 text-sm">
              <div className="text-slate-900 font-medium">{u.display_name || "未设置昵称"}</div>
              <div className="text-xs text-slate-500">
                创建于：{formatLocal(u.created_at) || "未知"} · 最后登录：{formatLocal(u.last_login_at) || "未登录"}
              </div>
            </div>

            {!isEditing && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span className="text-slate-500 font-medium">检测余额</span>
                  <span>{u.credits ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span className="text-slate-500 font-medium">Plan</span>
                  <span>{u.plan_label || "Pay-As-You-Go"}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500">Google 邮箱</span>
                <span className="font-medium text-slate-900 max-w-[60%] text-right break-all">
                  {u.email && u.google_sub ? u.email : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500">Google Sub</span>
                <span className="font-medium text-slate-900 max-w-[60%] text-right break-all">
                  {u.google_sub || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500">Telegram ID</span>
                <span className="font-medium text-slate-900 text-right">
                  {u.telegram_id || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500">Telegram 用户名</span>
                <span className="font-medium text-slate-900 text-right break-all">
                  {u.telegram_username || "-"}
                </span>
              </div>
            </div>

            {isEditing && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-500 space-y-1">
                    <span>检测余额</span>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm"
                      value={u.credits}
                      onChange={(e) => handleChange(u.id, "credits", Number(e.target.value))}
                    />
                  </label>
                  <label className="text-xs text-slate-500 space-y-1">
                    <span>Plan</span>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={u.plan_label || "Pay-As-You-Go"}
                      onChange={(e) => handleChange(u.id, "plan_label", e.target.value)}
                    >
                      {planOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
                  提示：身份字段（Google Sub / 邮箱 / Telegram ID / 用户名）不可编辑，其余额度支持修改。
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => router.push(`/admin/ledger?user_id=${u.id}`)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                资金记录
              </button>
              {!isEditing ? (
                <button
                  onClick={() => setEditingId(u.id)}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                >
                  编辑
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmUser(u)}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      fetchUsers();
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-700">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
        >
          上一页
        </button>
        <span>
          第 {page} / {totalPages} 页
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
        >
          下一页
        </button>
      </div>

      {/* 确认修改弹窗 */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5 space-y-4">
            <div className="text-lg font-semibold text-slate-900">确认修改用户数据</div>
            <div className="text-sm text-slate-600">
              将保存对用户 A{confirmUser.id} 的修改，是否继续？
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={() => setConfirmUser(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleSaveUser(confirmUser)}
                className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white shadow hover:bg-indigo-500"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认禁用弹窗 */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5 space-y-4">
            <div className="text-lg font-semibold text-slate-900">确认禁用该用户？</div>
            <div className="text-sm text-slate-600">
              禁用后，用户 A{confirmDisable.id} 将无法登录。是否继续？
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={() => setConfirmDisable(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await toggleActive(confirmDisable);
                  setConfirmDisable(null);
                }}
                className="rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white shadow hover:bg-rose-500"
              >
                确认禁用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功弹窗 */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5 space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-2xl">
              ✓
            </div>
            <div className="text-base font-semibold text-slate-900">修改成功</div>
            <button
              onClick={() => setSuccessModal(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 错误弹窗 */}
      {modalError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5 space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700 text-2xl">
              !
            </div>
            <div className="text-base font-semibold text-rose-700">保存失败</div>
            <div className="text-sm text-slate-600">{modalError}</div>
            <button
              onClick={() => setModalError(null)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-500"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

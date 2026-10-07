import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LogIn, RefreshCw, Search, ShieldCheck, Trash2, Trophy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  adminLogin,
  clearAdminToken,
  deleteLeaderboardEntry,
  getAdminToken,
  listLeaderboardEntries,
  type LeaderboardRow,
} from "@/lib/activation";

const Admin = () => {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  const [pass, setPass] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      setBoard(await listLeaderboardEntries());
    } catch (error) {
      if ((error as Error)?.message === "unauthorized") {
        clearAdminToken();
        setAuthed(false);
        toast.error("انتهت صلاحية جلسة الإدارة، يرجى تسجيل الدخول من جديد");
      } else {
        toast.error("تعذر تحميل لوحة الشرف");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void loadBoard();
  }, [authed, loadBoard]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    const ok = await adminLogin(pass);
    setLoggingIn(false);
    if (!ok) {
      toast.error("كلمة السر الإدارية غير صحيحة");
      return;
    }
    setPass("");
    setAuthed(true);
    toast.success("تم تسجيل الدخول بنجاح");
  };

  const deleteEntry = async (row: LeaderboardRow) => {
    if (!window.confirm(`سيتم حذف الاسم «${row.student_name}» نهائياً من لوحة الشرف. هل تريد المتابعة؟`)) return;
    setDeletingId(row.id);
    try {
      await deleteLeaderboardEntry(row.id);
      setBoard((current) => current.filter((item) => item.id !== row.id));
      toast.success("تم حذف الاسم من لوحة الشرف");
    } catch {
      toast.error("تعذر حذف الاسم، حاول لاحقاً");
    } finally {
      setDeletingId(null);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <form onSubmit={handleLogin} className="neu-card p-6 w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-emerald flex items-center justify-center"><ShieldCheck className="text-primary-foreground" /></div>
            <h1 className="text-2xl font-extrabold text-heading">لوحة تحكم الإدارة</h1>
          </div>
          <p className="text-body-blue font-bold">أدخل كلمة السر الإدارية لإدارة أسماء لوحة الشرف.</p>
          <input type="password" value={pass} onChange={(event) => setPass(event.target.value)} placeholder="كلمة سر الإدارة" className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card font-bold text-lg focus:outline-none focus:border-primary" />
          <button type="submit" disabled={loggingIn || !pass} className="adventure-button w-full py-3 rounded-lg font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-60"><LogIn />{loggingIn ? "جارٍ التحقق" : "دخول"}</button>
          <Link to="/" className="block text-center text-muted-foreground text-sm font-bold">العودة إلى المنصة</Link>
        </form>
      </main>
    );
  }

  const filtered = board.filter((row) => row.student_name.toLowerCase().includes(filter.trim().toLowerCase()));
  return (
    <main className="min-h-screen px-4 py-6 pb-28">
      <Link to="/" className="mb-5 flex items-center gap-2 text-lg font-bold text-muted-foreground"><ArrowRight /> رجوع إلى المنصة</Link>
      <section className="mx-auto max-w-3xl space-y-4">
        <header className="text-center">
          <div className="adventure-icon mx-auto mb-3"><Trophy /></div>
          <h1 className="text-3xl font-extrabold text-heading">إدارة لوحة الشرف</h1>
          <p className="mt-2 font-bold text-muted-foreground">راجع أسماء الطلاب واحذف الأسماء غير المناسبة.</p>
        </header>
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="ابحث باسم الطالب" className="w-full rounded-lg border-2 border-border bg-card py-3 pl-4 pr-11 font-bold" /></div>
          <button onClick={loadBoard} disabled={loading} className="neu-btn px-4 font-extrabold"><RefreshCw className={loading ? "animate-spin" : ""} /></button>
        </div>
        <div className="space-y-2">
          {filtered.length === 0 && !loading && <div className="neu-card p-6 text-center font-bold text-muted-foreground">لا توجد أسماء مطابقة.</div>}
          {filtered.map((row, index) => (
            <article key={row.id} className="neu-card flex items-center gap-3 p-4">
              <span className="w-8 text-center font-extrabold text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1"><h2 className="truncate font-extrabold text-heading">{row.student_name}</h2><p className="text-sm font-bold text-muted-foreground">{row.xp.toLocaleString("en-US")} نجمة</p></div>
              <button onClick={() => deleteEntry(row)} disabled={deletingId === row.id} className="rounded-lg bg-destructive p-3 text-destructive-foreground" aria-label={`حذف ${row.student_name}`}><Trash2 /></button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Admin;
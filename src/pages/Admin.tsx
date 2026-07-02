import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, LogIn, Users, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { PLAN_PRICES } from "@/lib/payment-config";
import {
  activateSubscriptionRequest,
  adminLogin,
  clearAdminToken,
  getAdminToken,
  listSubscriptionRequests,
  type SubscriptionRequestRow,
} from "@/lib/activation";

const formatDate = (iso: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const Admin = () => {
  const [authed, setAuthed] = useState(() => !!getAdminToken());
  const [pass, setPass] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [rows, setRows] = useState<SubscriptionRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSubscriptionRequests();
      setRows(data);
    } catch (err) {
      if ((err as Error)?.message === "unauthorized") {
        clearAdminToken();
        setAuthed(false);
        toast.error("انتهت صلاحية جلسة الإدارة، يرجى تسجيل الدخول من جديد");
      } else {
        toast.error("تعذّر تحميل قائمة الطلبات");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const ok = await adminLogin(pass);
      if (ok) {
        setAuthed(true);
        setPass("");
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        toast.error("كلمة سر الإدارة غير صحيحة");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleActivate = async (row: SubscriptionRequestRow) => {
    setActivatingId(row.id);
    try {
      const updated = await activateSubscriptionRequest(row.id);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(`تم تفعيل حساب الطالب ${updated.student_name}`);
    } catch (err) {
      if ((err as Error)?.message === "unauthorized") {
        clearAdminToken();
        setAuthed(false);
        toast.error("انتهت صلاحية جلسة الإدارة، يرجى تسجيل الدخول من جديد");
      } else {
        toast.error("تعذّر تفعيل الحساب، حاول لاحقاً");
      }
    } finally {
      setActivatingId(null);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <form onSubmit={handleLogin} className="neu-card p-6 w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-heading">لوحة تحكم الإدارة</h1>
          </div>
          <p className="text-body-blue text-base leading-7">
            أدخل كلمة سر الإدارة للاطلاع على طلبات الاشتراك وتفعيلها بضغطة زر واحدة.
          </p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="كلمة سر الإدارة"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card font-bold text-lg focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-emerald disabled:opacity-60"
          >
            <LogIn className="w-5 h-5" />
            {loggingIn ? "جارٍ التحقق..." : "دخول"}
          </button>
          <Link to="/" className="block text-center text-muted-foreground text-sm hover:text-foreground font-bold">
            العودة إلى المنصة
          </Link>
        </form>
      </main>
    );
  }

  const pending = rows.filter((r) => r.status === "pending");
  const active = rows.filter((r) => r.status === "active");

  return (
    <main className="min-h-screen px-4 py-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-5 font-bold text-lg"
      >
        <ArrowRight className="w-5 h-5" />
        رجوع إلى المنصة
      </Link>

      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading mb-2">طلبات الاشتراك</h1>
          <p className="text-muted-foreground text-base leading-7">
            بعد التأكد من وصول الحوالة البنكية، فعّل حساب الطالب مباشرةً بضغطة زر واحدة، وستتحول تجربته المجانية إلى اشتراك نشط فوراً.
          </p>
        </header>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-heading">
              <Clock className="w-4 h-4" /> قيد الانتظار: {pending.length}
            </span>
            <span className="mx-1">|</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 className="w-4 h-4" /> نشط: {active.length}
            </span>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-border bg-card font-extrabold text-sm active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        <section className="space-y-3">
          {rows.length === 0 && !loading && (
            <div className="neu-card p-6 text-center text-muted-foreground font-bold">
              لا توجد طلبات اشتراك بعد.
            </div>
          )}
          {rows.map((row) => {
            const isActive = row.status === "active";
            return (
              <article
                key={row.id}
                className={`neu-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-2 ${
                  isActive ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-heading font-extrabold text-lg truncate">{row.student_name}</h3>
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-matte-gold/20 text-matte-gold border border-matte-gold/40"
                      }`}
                    >
                      {isActive ? "مشترك نشط" : "قيد الانتظار"}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {PLAN_PRICES[row.plan].label} · {PLAN_PRICES[row.plan].price} ريال
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-6">
                    <span>تاريخ الطلب: {formatDate(row.requested_at)}</span>
                    {isActive && (
                      <span className="block">تاريخ التفعيل: {formatDate(row.activated_at)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleActivate(row)}
                  disabled={isActive || activatingId === row.id}
                  className={`shrink-0 py-3 px-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                    isActive
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "gradient-emerald text-primary-foreground shadow-emerald"
                  } disabled:opacity-70`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isActive
                    ? "مُفعّل"
                    : activatingId === row.id
                      ? "جارٍ التفعيل..."
                      : "تفعيل الحساب مباشرة"}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default Admin;

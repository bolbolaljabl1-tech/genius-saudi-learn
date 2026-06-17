import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Copy, KeyRound, ShieldCheck, LogIn } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { ADMIN_PASSPHRASE, PLAN_PRICES, type PlanId } from "@/lib/payment-config";
import { generateActivationCode } from "@/lib/activation";

const Admin = () => {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("genius_admin_authed") === "1"
  );
  const [pass, setPass] = useState("");
  const [studentName, setStudentName] = useState("");
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [code, setCode] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.trim() === ADMIN_PASSPHRASE) {
      sessionStorage.setItem("genius_admin_authed", "1");
      setAuthed(true);
      toast.success("تم تسجيل الدخول بنجاح");
    } else {
      toast.error("كلمة سر الإدارة غير صحيحة");
    }
  };

  const handleGenerate = async () => {
    const name = studentName.trim();
    if (!name) {
      toast.error("يرجى إدخال اسم الطالب كما هو مسجل في المنصة");
      return;
    }
    setGenerating(true);
    try {
      const c = await generateActivationCode(name, plan);
      setCode(c);
      toast.success("تم توليد رمز التفعيل بنجاح");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success("تم نسخ الرمز، أرسله للطالب عبر واتساب");
    } catch {
      toast.error("تعذّر النسخ، يرجى نسخ الرمز يدوياً");
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleLogin}
          className="neu-card p-6 w-full max-w-md space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-heading">
              لوحة تحكم الإدارة
            </h1>
          </div>
          <p className="text-body-blue text-base leading-7">
            أدخل كلمة سر الإدارة للوصول إلى أداة التفعيل اليدوي لحسابات الطلاب المشتركين عبر التحويل البنكي.
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
            className="w-full py-3 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-emerald"
          >
            <LogIn className="w-5 h-5" />
            دخول
          </button>
          <Link
            to="/"
            className="block text-center text-muted-foreground text-sm hover:text-foreground font-bold"
          >
            العودة إلى المنصة
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-5 font-bold text-lg"
      >
        <ArrowRight className="w-5 h-5" />
        رجوع إلى المنصة
      </Link>

      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald mb-4">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading mb-2">
            التفعيل اليدوي للاشتراكات
          </h1>
          <p className="text-muted-foreground text-base leading-7">
            بعد تأكدك من وصول الحوالة البنكية، ولّد رمز التفعيل الخاص بالطالب وأرسله له عبر واتساب لتفعيل حسابه فوراً.
          </p>
        </header>

        <section className="neu-card p-5 space-y-4">
          <div>
            <label className="block text-heading font-extrabold mb-2 text-base">
              اسم الطالب (كما هو مسجل في المنصة)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="أدخل اسم الطالب بدقة"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card font-bold text-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-heading font-extrabold mb-2 text-base">
              الباقة
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PLAN_PRICES) as PlanId[]).map((p) => {
                const active = plan === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`text-right p-3 rounded-xl border-2 transition-all ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="font-extrabold text-heading text-base">
                      {PLAN_PRICES[p].label}
                    </div>
                    <div className="text-primary font-extrabold mt-1">
                      {PLAN_PRICES[p].price} ريال
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 rounded-2xl gradient-gold text-gold-foreground font-extrabold text-lg active:scale-[0.98] transition shadow-gold disabled:opacity-60"
          >
            {generating ? "جارٍ التوليد..." : "توليد رمز التفعيل"}
          </button>

          {code && (
            <div className="mt-2 p-4 rounded-xl bg-primary/5 border-2 border-primary/30 space-y-3">
              <div className="text-sm font-bold text-muted-foreground text-center">
                رمز التفعيل الخاص بالطالب
              </div>
              <div
                dir="ltr"
                className="text-center font-mono font-extrabold text-heading text-2xl tracking-widest"
              >
                {code}
              </div>
              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-xl bg-card border-2 border-primary text-primary font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <Copy className="w-5 h-5" />
                نسخ الرمز
              </button>
            </div>
          )}
        </section>

        <section className="neu-card p-5 text-body-blue text-sm leading-7">
          <h2 className="text-heading font-extrabold text-lg mb-2">
            تعليمات العملية
          </h2>
          <ol className="list-decimal pr-5 space-y-1">
            <li>تحقق من وصول مبلغ التحويل في حساب مصرف الراجحي.</li>
            <li>أدخل اسم الطالب كما أرسله لك عبر واتساب بدقة تامة.</li>
            <li>اختر الباقة المتفق عليها (فصل دراسي أو سنة كاملة).</li>
            <li>ولّد الرمز ثم انسخه وأرسله للطالب عبر واتساب.</li>
            <li>سيُدخل الطالب الرمز في صفحة الاشتراك ليتم تفعيل حسابه فوراً.</li>
          </ol>
        </section>
      </div>
    </main>
  );
};

export default Admin;

import { ArrowRight, Check, Lock, Copy, MessageCircle, Building2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { BANK_INFO, ADMIN_WHATSAPP, PLAN_PRICES, type PlanId } from "@/lib/payment-config";
import { requestSubscription } from "@/lib/activation";

interface CheckoutProps {
  onBack: () => void;
  onPaymentSuccess: (plan: PlanId) => void;
  expired: boolean;
}

const PLANS = [
  {
    id: "semester" as PlanId,
    title: PLAN_PRICES.semester.label,
    price: PLAN_PRICES.semester.price,
    period: PLAN_PRICES.semester.period,
    note: "صلاحية حتى نهاية الفصل الدراسي",
  },
  {
    id: "yearly" as PlanId,
    title: PLAN_PRICES.yearly.label,
    price: PLAN_PRICES.yearly.price,
    period: PLAN_PRICES.yearly.period,
    note: "العرض الأفضل قيمة وأطول صلاحية",
    featured: true,
  },
];

const BENEFITS = [
  "وصول كامل لجميع شروحات المرحلتين الابتدائية والمتوسطة",
  "اختبارات ذكية غير محدودة مع تصحيح فوري وتغذية راجعة",
  "ميزة صور سؤالك بالكاميرا والمعرض دون قيود",
  "ألعاب العباقرة وتحديات شبكة خلايا النحل بالكامل",
  "تحديثات مستمرة ومحتوى تعليمي متجدد بانتظام",
];

const STUDENT_NAME_KEY = "genius_student_name";

const Checkout = ({ onBack, onPaymentSuccess: _onPaymentSuccess, expired }: CheckoutProps) => {
  const [selected, setSelected] = useState<PlanId>("yearly");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // suppress unused warning; kept for API compatibility
  void _onPaymentSuccess;

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.iban.replace(/\s/g, ""));
      toast.success("تم نسخ رقم الآيبان بنجاح");
    } catch {
      toast.error("تعذّر النسخ، يرجى نسخ الرقم يدوياً");
    }
  };

  const openWhatsApp = () => {
    const studentName = localStorage.getItem(STUDENT_NAME_KEY) || "الطالب";
    const planLabel = PLAN_PRICES[selected].label;
    const price = PLAN_PRICES[selected].price;
    const msg = `مرحباً أستاذ جابر، أنا الطالب ${studentName}. لقد قمت بالتحويل البنكي بمبلغ ${price} ريالاً للاشتراك في "${planLabel}" بمنصة الطالب العبقري، ومرفق لكم إيصال التحويل لتفعيل الحساب.`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConfirmTransfer = async () => {
    const studentName = localStorage.getItem(STUDENT_NAME_KEY);
    if (!studentName) {
      toast.error("يرجى تسجيل اسم الطالب أولاً من الصفحة الرئيسية");
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestSubscription(studentName, selected);
      if (!res.ok) {
        toast.error("تعذّر إرسال طلبك، يرجى المحاولة مرة أخرى");
        return;
      }
      setConfirmed(true);
      openWhatsApp();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-5 font-bold text-lg"
      >
        <ArrowRight className="w-5 h-5" />
        رجوع
      </button>

      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-gold shadow-gold mb-4">
            <Lock className="w-8 h-8 text-gold-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading mb-2">
            {expired ? "فعّل اشتراكك لمواصلة التفوق" : "ارتقِ بتجربتك التعليمية"}
          </h1>
          <p className="text-muted-foreground text-base leading-7">
            انضم إلى آلاف الطلاب المتفوقين، وافتح كامل محتوى منصة الطالب العبقري عبر التحويل البنكي المباشر بخطوات ميسرة وآمنة.
          </p>
        </header>

        {/* Benefits */}
        <section className="neu-card p-5 animate-scale-in" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-xl font-extrabold text-heading mb-3">ما الذي ستحصل عليه</h2>
          <ul className="space-y-2.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-body-blue text-base leading-7">
                <span className="mt-1 inline-flex w-6 h-6 shrink-0 rounded-full gradient-emerald items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Plans */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-scale-in" style={{ animationDelay: "0.1s" }}>
          {PLANS.map((p) => {
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-right p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                  active
                    ? "border-primary bg-primary/5 shadow-emerald"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-heading text-lg">{p.title}</span>
                  {p.featured && (
                    <span className="text-[11px] font-extrabold gradient-gold text-gold-foreground px-2 py-0.5 rounded-full">
                      العرض الأفضل قيمة
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-primary">{p.price}</span>
                  <span className="text-muted-foreground text-sm font-bold">ريال / {p.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.note}</p>
              </button>
            );
          })}
        </section>

        {/* Bank Transfer Node */}
        <section
          className="neu-card p-5 border-2 border-primary/30 animate-scale-in"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-extrabold text-heading">بيانات التحويل البنكي</h2>
          </div>

          <p className="text-body-blue text-base leading-7 mb-4">
            لإتمام الاشتراك وتفعيل حسابك العبقري، يرجى التحويل البنكي المباشر على الحساب التالي:
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center bg-muted/40 rounded-xl p-3">
              <span className="text-muted-foreground font-bold text-sm">اسم البنك</span>
              <span className="font-extrabold text-heading text-base">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex justify-between items-center bg-muted/40 rounded-xl p-3">
              <span className="text-muted-foreground font-bold text-sm">اسم الحساب</span>
              <span className="font-extrabold text-heading text-base">{BANK_INFO.accountName}</span>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground font-bold text-sm">رقم الآيبان</span>
                <button
                  onClick={copyIban}
                  className="inline-flex items-center gap-1 text-primary font-extrabold text-sm hover:underline"
                >
                  <Copy className="w-4 h-4" />
                  نسخ
                </button>
              </div>
              <div dir="ltr" className="text-center font-mono font-extrabold text-heading text-lg tracking-wider">
                {BANK_INFO.iban}
              </div>
            </div>
          </div>

          <button
            onClick={openWhatsApp}
            className="w-full mt-5 py-4 rounded-2xl bg-[#25D366] text-white font-extrabold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition shadow-lg"
            aria-label="تأكيد التحويل وتفعيل الحساب عبر واتساب"
          >
            <MessageCircle className="w-6 h-6" />
            تأكيد التحويل وتفعيل الحساب فوراً
          </button>

          <p className="text-center text-xs text-muted-foreground leading-6 mt-3">
            سيتم فتح محادثة واتساب مباشرة مع إدارة المنصة لإرسال إيصال التحويل وتفعيل حسابك.
          </p>
        </section>

        {/* Manual Activation Code */}
        <section
          className="neu-card p-5 animate-scale-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6 text-gold-foreground" />
            </div>
            <h2 className="text-xl font-extrabold text-heading">رمز التفعيل من الإدارة</h2>
          </div>
          <p className="text-body-blue text-base leading-7 mb-3">
            بعد تأكيد التحويل، ستصلك رسالة من الإدارة تحتوي على رمز التفعيل الخاص بك. أدخله هنا لتفعيل اشتراكك فوراً.
          </p>
          <input
            type="text"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            placeholder="مثال: YR-AB12CD34EF"
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card font-mono font-extrabold text-lg text-center tracking-wider focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleActivate}
            disabled={verifying}
            className="w-full mt-3 py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-lg active:scale-[0.98] transition shadow-emerald disabled:opacity-60"
          >
            {verifying ? "جارٍ التحقق..." : "تفعيل الاشتراك"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Checkout;

import { ArrowRight, Check, Lock, Loader2 } from "lucide-react";
import { useState } from "react";

interface CheckoutProps {
  onBack: () => void;
  onPaymentSuccess: (plan: "semester" | "yearly") => void;
  expired: boolean;
}

const PLANS = [
  { id: "semester", title: "اشتراك فصل دراسي واحد", price: "30", period: "للفصل الواحد", note: "صلاحية حتى نهاية الفصل الدراسي" },
  { id: "yearly", title: "اشتراك سنة كاملة", price: "50", period: "سنوياً", note: "العرض الأفضل قيمة وأطول صلاحية", featured: true },
];

const BENEFITS = [
  "وصول كامل لجميع شروحات المرحلتين الابتدائية والمتوسطة",
  "اختبارات ذكية غير محدودة مع تصحيح فوري وتغذية راجعة",
  "ميزة صور سؤالك بالكاميرا والمعرض دون قيود",
  "ألعاب العباقرة وتحديات شبكة خلايا النحل بالكامل",
  "تحديثات مستمرة ومحتوى تعليمي متجدد بانتظام",
];

const Checkout = ({ onBack, onPaymentSuccess, expired }: CheckoutProps) => {
  const [selected, setSelected] = useState("yearly");
  const [processing, setProcessing] = useState<string | null>(null);

  const handlePay = (method: "applepay" | "mada") => {
    setProcessing(method);
    setTimeout(() => {
      setProcessing(null);
      onPaymentSuccess(selected as "monthly" | "yearly");
    }, 1400);
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
            انضم إلى آلاف الطلاب المتفوقين، وافتح كامل محتوى منصة الطالب العبقري بضغطة واحدة، بأمان تام وبخطوات ميسرة على جوالك.
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
                      الأفضل قيمة
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

        {/* Payment methods */}
        <section className="space-y-3 animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-extrabold text-heading">اختر طريقة الدفع</h2>

          <button
            onClick={() => handlePay("applepay")}
            disabled={!!processing}
            className="w-full py-4 rounded-2xl bg-black text-white font-extrabold text-xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg disabled:opacity-60"
            aria-label="الدفع عبر Apple Pay"
          >
            {processing === "applepay" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="text-2xl leading-none"></span>
                <span className="tracking-tight">Pay</span>
              </>
            )}
          </button>

          <button
            onClick={() => handlePay("mada")}
            disabled={!!processing}
            className="w-full py-4 rounded-2xl bg-white border-2 border-foreground/15 font-extrabold text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition shadow-md disabled:opacity-60"
            aria-label="الدفع عبر مدى"
          >
            {processing === "mada" ? (
              <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            ) : (
              <span className="inline-flex items-center gap-3">
                <span dir="ltr" className="inline-flex items-baseline tracking-tight text-2xl font-black leading-none">
                  <span className="text-[#84BD00]">m</span>
                  <span className="text-[#231F20]">ada</span>
                </span>
                <span className="text-foreground text-base font-extrabold">الدفع عبر مدى</span>
              </span>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground leading-6 mt-2">
            دفع آمن ومشفر بالكامل. يمكنك إلغاء الاشتراك في أي وقت من إعدادات حسابك.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Checkout;

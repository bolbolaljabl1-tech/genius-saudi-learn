import { X, BadgeCheck, Calendar, AlertTriangle, Crown } from "lucide-react";
import { useState } from "react";
import { useTrial } from "@/hooks/useTrial";
import { toast } from "@/hooks/use-toast";

interface SubscriptionSettingsProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const fmtDate = (ms: number) => {
  if (!ms) return "—";
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleDateString();
  }
};

const SubscriptionSettings = ({ onClose, onUpgrade }: SubscriptionSettingsProps) => {
  const { plan, subscribed, expired, trialStartedAt, trialEndAt, subStartedAt, subEndAt, cancelSubscription } = useTrial();
  const [confirming, setConfirming] = useState(false);

  const planLabel = subscribed
    ? plan === "yearly"
      ? "اشتراك سنوي"
      : "اشتراك شهري"
    : "فترة تجريبية";
  const statusLabel = subscribed ? "نشط" : expired ? "منتهٍ" : "نشط (تجريبي)";
  const startAt = subscribed ? subStartedAt : trialStartedAt;
  const endAt = subscribed ? subEndAt : trialEndAt;

  const handleCancel = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    cancelSubscription();
    toast({ title: "تم إلغاء اشتراكك. يمكنك الاشتراك مجدداً في أي وقت." });
    setConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-heading flex items-center gap-2">
            <Crown className="w-6 h-6 text-matte-gold" />
            إعدادات لوحة الاشتراك
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted" aria-label="إغلاق">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="rounded-2xl border-2 border-matte-gold/30 bg-matte-gold/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-muted-foreground">نوع الاشتراك</span>
              <span className="text-lg font-extrabold text-heading">{planLabel}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-muted-foreground">الحالة</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-extrabold ${
                  subscribed || !expired
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" /> تاريخ البدء
              </span>
              <span className="text-base font-extrabold text-foreground">{fmtDate(startAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {subscribed ? "تاريخ التجديد" : "نهاية التجربة"}
              </span>
              <span className="text-base font-extrabold text-foreground">{fmtDate(endAt)}</span>
            </div>
          </div>

          {confirming && (
            <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-3 text-sm font-bold text-destructive flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>هل أنت متأكد من إلغاء الاشتراك؟ ستفقد الوصول للمحتوى الكامل. اضغط مرة أخرى للتأكيد.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-2xl bg-royal-blue text-matte-gold font-extrabold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Crown className="w-5 h-5" />
            {subscribed && plan === "monthly" ? "ترقية إلى الاشتراك السنوي" : subscribed ? "تجديد الاشتراك" : "ترقية الاشتراك الآن"}
          </button>

          {subscribed && (
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-2xl border-2 border-destructive/40 text-destructive font-extrabold active:scale-95 transition hover:bg-destructive/5"
            >
              {confirming ? "تأكيد إلغاء الاشتراك" : "إلغاء الاشتراك"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;

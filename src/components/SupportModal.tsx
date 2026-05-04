import { useEffect, useState } from "react";
import { X, Send, Bell, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SupportModalProps {
  onClose: () => void;
}

const faqs = [
  {
    q: "كيف أبدأ رحلتي في رحاب منصة الطالب العبقري؟",
    a: "اختر مرحلتك الدراسية من الصفحة الرئيسية، ثم انتقل إلى المادة والدرس الذي تريده. يمكنك أيضاً تجربة 'صور سؤالك' أو 'ألعاب العباقرة' مباشرة.",
  },
  {
    q: "ما هي الكنوز التعليمية التي تنتظرني في المنصة؟",
    a: "ستجد: شروحات ذكية، حلول فورية للأسئلة بالكاميرا، شبكة تحدي العباقرة، تحديات الأصدقاء أونلاين، أوسمة وشهادات، ومعرض العباقرة.",
  },
  {
    q: "كيف أشارك أفكاري أو أطلب العون من المشرف العام؟",
    a: "استخدم زر 'همسة للعبقري' من الشاشة الرئيسية لإرسال رسالتك مباشرة إلى المشرف العام، وسيصلك الرد في أقرب وقت بإذن الله.",
  },
];

const SupportModal = ({ onClose }: SupportModalProps) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const t = setTimeout(() => {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("منصة الطالب العبقري", {
              body: "تم تفعيل الإشعارات بنجاح! 🎓",
            });
          }
        });
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSend = async () => {
    if (!name.trim() || !message.trim()) {
      toast({ title: "يرجى تعبئة الاسم والرسالة", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await supabase.from("messages" as any).insert({ student_name: name.trim(), message: message.trim() });
      await supabase.functions.invoke("send-telegram", { body: { student_name: name.trim(), message: message.trim() } });
      toast({ title: "تم إرسال رسالتك بنجاح! 💚" });
      onClose();
    } catch {
      toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-heading flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-matte-gold" />
            الدعم الفني
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border-2 border-matte-gold/30 bg-matte-gold/5 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-right px-4 py-3 font-bold text-base text-foreground flex items-start gap-2"
              >
                <span className="text-matte-gold flex-shrink-0">{openIdx === i ? "−" : "+"}</span>
                <span className="flex-1">{f.q}</span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 text-body-blue text-base leading-7 font-bold">{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if ("Notification" in window) {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                  new Notification("منصة الطالب العبقري", { body: "تم تفعيل الإشعارات! 🔔" });
                  toast({ title: "تم تفعيل الإشعارات ✅" });
                } else if (perm === "denied") {
                  toast({ title: "تم رفض الإشعارات", variant: "destructive" });
                }
              });
            }
          }}
          className="w-full mb-5 py-3 rounded-2xl bg-royal-blue text-matte-gold font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Bell className="w-5 h-5" />
          تفعيل الإشعارات
        </button>

        <div className="border-t-2 border-matte-gold/20 pt-4 space-y-3">
          <p className="text-base font-bold text-heading">هل تريد إرسال رسالة للمشرف العام؟</p>
          <input
            type="text"
            placeholder="اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            placeholder="اكتب رسالتك هنا..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full gradient-emerald text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? "جاري الإرسال..." : "إرسال"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;

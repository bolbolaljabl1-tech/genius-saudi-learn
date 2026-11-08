import { useState } from "react";
import { Send, Bell, HelpCircle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SupportModalProps {
  onClose: () => void;
}

const faqs = [
  {
    q: "كيف أبدأ رحلتي في رحاب منصة الطالب العبقري؟",
    a: "أهلاً بك! اختر المرحلة الابتدائية أو المتوسطة، ثم المادة والصف والفصل الدراسي. اختر عنوان الدرس لعرض شرحه، وافتح كتاب المادة أو ابدأ المغامرة. الوصول متاح مجاناً لجميع الطلاب.",
  },
  {
    q: "كيف أستفيد من قسم التأسيس؟",
    a: "اختر مادة من مواد التأسيس، ثم محور المهارة الذي تحتاج إليه. يمكنك مراجعة الشرح والبدء في نشاطه، أو فتح السبورة التفاعلية الذكية.",
  },
  {
    q: "كيف أستخدم صور سؤالك؟",
    a: "التقط صورة واضحة للسؤال أو اخترها من المعرض. أضف توضيحاً في الحقل الاختياري إن احتجت، ثم اطلب تحليل السؤال. يمكنك الاستماع إلى الشرح ومشاركة إنجازك بعد إكمال النشاط. راجع الحل مع معلمك عند الحاجة، فقد تخطئ الإجابات المولّدة.",
  },
  {
    q: "ما الألعاب التعليمية المتاحة؟",
    a: "في ألعاب العباقرة اختر الصف واكتب موضوعاً أو اسم درس، ثم اختر نشاط توصيل المفاهيم أو الترتيب أو الذاكرة وابدأ اللعب.",
  },
  {
    q: "كيف أصمّم لعبتي بنفسي؟",
    a: "افتح استوديو صَمِّم لعبتك بنفسك، وحدّد الصف والموضوع. بعد توليد المحتوى اختر نمط الأسئلة متعددة الخيارات أو المطابقة أو الترتيب أو الصواب والخطأ.",
  },
  {
    q: "كيف أختبر نفسي؟",
    a: "حدّد الصف والمادة وعدد الأسئلة ونوعها. يمكنك اختيار دروس محدّدة أو ترك الحقل فارغاً لاختبار شامل. أجب قبل انتهاء الوقت، ثم راجع نتيجتك وإجاباتك.",
  },
  {
    q: "أين أجد إنجازاتي وأشاركها؟",
    a: "اضغط إنجازاتي في الرئيسية لمشاهدة اسمك ومرحلتك ورصيدك وعدد الأنشطة المكتملة. بطاقة الإنجاز في نهاية النشاط تتيح المشاركة عبر جهازك، ولوحة المتصدرين تعرض ترتيب الطلاب. إنجازات هذا الجهاز تُحفظ محلياً، وقد تفقدها عند مسح بيانات المتصفح.",
  },
  {
    q: "ماذا أفعل إذا تعذّر تحميل المحتوى؟",
    a: "تحقّق من اتصال الإنترنت وأعد المحاولة. تستخدم الشروحات وتحليل الصور وتوليد الأنشطة خدمات ذكية تحتاج إلى اتصال. استخدم رجوع للعودة للشاشة السابقة أو راسل إدارة المنصة عند استمرار المشكلة.",
  },
  {
    q: "كيف أشارك أفكاري أو أطلب العون من المشرف العام؟",
    a: "استخدم زر 'راسل إدارة المنصة' من الشاشة الرئيسية لإرسال رسالتك مباشرة إلى الإدارة، وسيصلك الرد في أقرب وقت بإذن الله.",
  },
];

const SupportModal = ({ onClose }: SupportModalProps) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent dir="rtl" className="z-[100] w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] overflow-y-auto rounded-lg bg-card p-5 pt-12 font-amiri [&>button]:left-4 [&>button]:right-auto">
        <div className="mb-4">
          <DialogTitle className="font-andalus text-3xl font-bold text-heading flex items-center gap-2 leading-relaxed tracking-normal">
            <HelpCircle className="w-6 h-6 text-matte-gold" />
            دليل استكشاف المنصة
          </DialogTitle>
          <DialogDescription className="text-base leading-7">أهلاً بك، نتمنى لك رحلة تعليمية ممتعة ومليئة بالإنجازات.</DialogDescription>
        </div>

        <div className="space-y-3 mb-5">
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-border overflow-hidden">
              <Button variant="ghost"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i} aria-controls={`guide-answer-${i}`}
                className="h-auto whitespace-normal w-full text-right px-1 py-3 font-bold text-lg text-foreground flex items-start gap-2"
              >
                {openIdx === i ? <Minus className="mt-1 shrink-0 text-matte-gold" /> : <Plus className="mt-1 shrink-0 text-matte-gold" />}
                <span className="flex-1">{f.q}</span>
              </Button>
              {openIdx === i && (
                <div id={`guide-answer-${i}`} className="px-1 pb-4 text-royal-blue text-lg leading-8">{f.a}</div>
              )}
            </div>
          ))}
        </div>

        <a
          href="https://wa.me/966538583621"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-3 py-3 rounded-lg bg-primary text-primary-foreground font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          💬 فتح المحادثة عبر واتساب
        </a>

        <Button
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
          className="h-auto w-full mb-5 py-3 rounded-lg bg-royal-blue text-matte-gold hover:bg-royal-blue/90 font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5" />
          تفعيل الإشعارات
        </Button>

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
          <Button
            onClick={handleSend}
            disabled={sending}
            className="h-auto w-full gradient-emerald text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? "جاري الإرسال..." : "إرسال"}
          </Button>
        </div>
        <p className="text-center text-matte-gold font-bold mt-2">منصة الطالب العبقري - 2026 🎓</p>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;

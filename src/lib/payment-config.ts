// إعدادات قابلة للتعديل لبيانات التحويل البنكي ورقم الإدارة
export const BANK_INFO = {
  bankName: "مصرف الراجحي",
  accountName: "جابر الحسين عبدلي",
  iban: "SA92 8000 0119 6080 1066 4173",
};

// رقم واتساب الإدارة بالصيغة الدولية بدون علامة + وبدون مسافات
export const ADMIN_WHATSAPP = "966534181656";

// ملاحظة أمنية: كلمة سر الإدارة وملح رمز التفعيل لم تعد محفوظة في الواجهة.
// يتم التحقق منها حصراً داخل Edge Function (activation) على الخادم.

export const PLAN_PRICES = {
  semester: { price: 30, label: "اشتراك فصل دراسي واحد", period: "للفصل الواحد" },
  yearly: { price: 50, label: "اشتراك سنة كاملة - عرض خاص", period: "سنوياً" },
} as const;

export type PlanId = keyof typeof PLAN_PRICES;

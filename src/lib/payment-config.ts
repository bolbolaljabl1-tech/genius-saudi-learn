// إعدادات قابلة للتعديل لبيانات التحويل البنكي ورقم الإدارة
export const BANK_INFO = {
  bankName: "مصرف الراجحي",
  accountName: "جابر الحسين عبدلي",
  iban: "SA92 8000 0119 6080 1066 4173",
};

// رقم واتساب الإدارة بالصيغة الدولية بدون علامة + وبدون مسافات
// يمكن تحديثه لاحقاً بالرقم الفعلي للإدارة
export const ADMIN_WHATSAPP = "966534181656";

// مفتاح سري لتوليد رموز التفعيل (يُعرف فقط من قبل لوحة الإدارة والمنصة)
export const ACTIVATION_SALT =
  "iPitGMBi2xw_0-OAUUeDEyAKzg4sHmx18iyqLe5eXCTVUtZ26cM9nICfhlg8QkCr-genius-2026";

// كلمة سر دخول لوحة الإدارة
export const ADMIN_PASSPHRASE = "Jaber66hi";

export const PLAN_PRICES = {
  semester: { price: 30, label: "اشتراك فصل دراسي واحد", period: "للفصل الواحد" },
  yearly: { price: 50, label: "اشتراك سنة كاملة - عرض خاص", period: "سنوياً" },
} as const;

export type PlanId = keyof typeof PLAN_PRICES;

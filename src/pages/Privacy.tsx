import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Mail } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. مقدمة",
    body: [
      "أهلاً بك في منصة الطالب العبقري. نلتزم التزاماً تاماً بحماية خصوصيتك وأمان بياناتك الشخصية عند استخدامك للمنصة، ونوضح في هذه الوثيقة نوع البيانات التي نجمعها وكيفية استخدامها وحمايتها.",
    ],
  },
  {
    title: "2. البيانات التي نجمعها",
    body: [
      "البيانات الشخصية: الاسم الكامل، والبريد الإلكتروني، ومعلومات الحساب والمصادقة.",
      "بيانات الفصول الدراسية: المرحلة والصف والمواد والفصل الدراسي.",
      "بيانات الطلاب والتقييمات: نتائج الاختبارات والدرجات ونقاط الخبرة والأوسمة.",
      "معلومات تقنية: نوع الجهاز ونظام التشغيل وبيانات الاستخدام العامة.",
    ],
  },
  {
    title: "3. تخزين البيانات",
    body: [
      "تُخزَّن البيانات محلياً على جهاز المستخدم، وقد تُخزَّن مستقبلاً على خوادم آمنة لأغراض المزامنة والنسخ الاحتياطي التلقائي بين الأجهزة.",
    ],
  },
  {
    title: "4. استخدام البيانات",
    body: [
      "توفير خدمات المنصة وتحسينها، ومعالجة الطلبات والاشتراكات، وإرسال الإشعارات المهمة، وضمان أمان التطبيق والامتثال للمتطلبات القانونية.",
    ],
  },
  {
    title: "5. مشاركة البيانات مع الأطراف الثالثة",
    body: [
      "لا نبيع البيانات الشخصية لأي طرف ثالث إطلاقاً. وتقتصر المشاركة على مقدمي الخدمات الموثوقين اللازمين لتشغيل المنصة، أو عند وجود ضرورة قانونية أو لحماية الحقوق والسلامة.",
    ],
  },
  {
    title: "6. الإشعارات",
    body: [
      "نستخدم خدمات Firebase لإرسال التنبيهات الفورية والتحديثات المهمة، ويمكن للمستخدم إدارة هذه الإشعارات أو إيقافها من إعدادات جهازه.",
    ],
  },
  {
    title: "7. مسؤولية المستخدم",
    body: [
      "يلتزم المستخدم بحماية جهازه، واستخدام كلمات مرور قوية، وعدم مشاركة بيانات الدخول مع أي شخص آخر.",
    ],
  },
  {
    title: "8. أمان البيانات",
    body: [
      "نطبق تدابير أمنية وتقنيات تشفير معيارية في الصناعة لحماية البيانات الحساسة من الوصول غير المصرح به أو الفقد أو التعديل.",
    ],
  },
  {
    title: "9. حقوق المستخدم",
    body: [
      "حق حذف الحساب نهائياً مع كافة البيانات المرتبطة به.",
      "حق الوصول إلى البيانات الخاصة بالمستخدم.",
      "حق تصحيح البيانات غير الدقيقة أو تحديثها.",
    ],
  },
  {
    title: "10. تحديثات السياسة",
    body: [
      "تاريخ آخر تحديث: 1 يناير 2026. وعند إجراء أي تغييرات جوهرية سيتم إشعار المستخدمين داخل المنصة أو عبر البريد الإلكتروني.",
    ],
  },
];

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <main dir="rtl" className="min-h-screen pt-6 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-btn font-extrabold text-sm active:scale-95 transition"
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <ArrowRight className="w-4 h-4" />
          الرئيسية
        </button>

        <header className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-royal-blue text-matte-gold mb-3 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading leading-relaxed">
            سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="mt-2 text-sm font-bold text-body-blue">
            <span className="brand-name">منصة الطالب العبقري</span> — آخر تحديث: 1 يناير 2026
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="neu-card p-5">
              <h2 className="text-lg font-extrabold text-heading mb-2">{s.title}</h2>
              <ul className="space-y-2">
                {s.body.map((line) => (
                  <li key={line} className="text-body-blue font-bold text-base leading-8">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="neu-card p-5">
            <h2 className="text-lg font-extrabold text-heading mb-2">11. التواصل معنا</h2>
            <p className="text-body-blue font-bold text-base leading-8">
              لأي استفسار يتعلق بالخصوصية أو البيانات، يرجى مراسلتنا عبر البريد الإلكتروني الرسمي للدعم، ونلتزم بالرد خلال أربع وعشرين ساعة.
            </p>
            <a
              href="mailto:support@abqarai.com"
              className="mt-3 inline-flex items-center gap-2 px-4 py-3 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-sm active:scale-95 transition"
            >
              <Mail className="w-4 h-4" />
              support@abqarai.com
            </a>
          </section>
        </div>
      </div>
      <AppFooter />
    </main>
  );
};

export default Privacy;

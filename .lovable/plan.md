

# خطة تحديث "منصة الطالب العبقري" — التوقيع الملكي + همسة للعبقري

## ملخص التغييرات

تحديثان رئيسيان: (1) تذييل "التوقيع الملكي" بخط Amiri وألوان مميزة، (2) زر "همسة للعبقري" العائم مع نموذج يحفظ الرسائل في قاعدة البيانات.

---

## 1. التوقيع الملكي (Royal Signature Footer)

**الملف:** `src/components/AppFooter.tsx`

- استيراد خط **Amiri** (Google Fonts) في `src/index.css`
- تقسيم التذييل إلى سطرين:
  - **الاسم:** "تصميم الأستاذ جابر العبدلي - 2026" بخط Amiri عريض، لون أخضر زمردي غامق (`#047857`)
  - **البريد:** "tchjaber@gmail.com" بخط Courier New، لون ذهبي كهرماني (`#b45309`)
- فصل بصري واضح بخط فاصل رفيع بينهما

**الملف:** `tailwind.config.ts` — إضافة `fontFamily: { amiri: ['Amiri', 'serif'] }`

**الملف:** `src/index.css` — إضافة `@import url('...Amiri...')`

**ملاحظة:** نفس التوقيع يُضاف في نهاية كل استجابة AI في Edge Functions (generate-summary, generate-quiz, analyze-image) — السطر الأخير يبقى كما هو لكن يُعرض في الواجهة بالتنسيق الملكي.

---

## 2. ميزة "همسة للعبقري" (Quick Message Modal)

**قاعدة البيانات:** إنشاء جدول `messages` عبر migration:
```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT TO anon, authenticated USING (true);
```

**الملف الجديد:** `src/components/WhisperModal.tsx`
- نموذج (Modal) يحتوي: حقل الاسم + حقل الرسالة + زر إرسال
- يحفظ مباشرة في جدول `messages` عبر Supabase client
- رسالة تأكيد بعد الإرسال الناجح

**الملف:** `src/pages/Index.tsx`
- إضافة زر عائم (FAB) في الزاوية السفلية اليسرى بعنوان "همسة للعبقري" مع أيقونة رسالة
- يفتح `WhisperModal` عند الضغط

---

## 3. تحسينات بصرية إضافية

- التأكد من أن جميع العناوين `text-heading` (أسود `#000000`) ونصوص الشرح `text-body-blue` (أزرق `#0000FF`)
- الحفاظ على أحجام الخطوط الكبيرة الحالية

---

## ملخص الملفات المتأثرة

| الملف | التغيير |
|---|---|
| `src/index.css` | إضافة خط Amiri |
| `tailwind.config.ts` | إضافة font-family amiri |
| `src/components/AppFooter.tsx` | التوقيع الملكي بسطرين |
| `src/components/WhisperModal.tsx` | **جديد** — نموذج الرسالة |
| `src/pages/Index.tsx` | زر عائم + WhisperModal |
| Migration SQL | جدول messages |


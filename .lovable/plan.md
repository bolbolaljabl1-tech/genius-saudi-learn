

# خطة التحديث: خلية الحروف + مركز الألعاب الذكي + التوقيع

## ملخص

ثلاث تغييرات: (1) توسيع خلية الحروف لتشمل جميع المواد مع واجهة اختيار نوع التحدي، (2) تعديل زر مركز الألعاب الذكي ليبحث في Google عن Wordwall، (3) إضافة التوقيع البرمجي في التذييل.

---

## 1. توسيع لعبة "خلية الحروف" (GamesHub.tsx)

### إضافة بيانات المواد الجديدة
- إضافة `gameData` لكل المواد المتبقية: `social` (الدراسات الاجتماعية)، `digital` (المهارات الرقمية)، `art` (التربية الفنية)، `pe` (التربية البدنية)، `life` (المهارات الحياتية)، `english` (اللغة الإنجليزية) — كل مادة بـ 6 كلمات scrambled و6 pairs و10 أسئلة hunter.
- توسيع مصفوفة `subjects` لتشمل جميع الـ 11 مادة (بدل 5) مع أيقونات وألوان مطابقة لـ `SubjectSelection.tsx`.

### واجهة اختيار نوع التحدي (Glassmorphism)
- إضافة شاشة جديدة `"challenge-mode"` في `GameScreen` type.
- عند اختيار لعبة "خلية الحروف"، تظهر واجهة بتأثير Glassmorphism (`bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl`) تتيح:
  - **تحدي المادة الواحدة**: يسحب الكلمات من المادة المختارة حالياً.
  - **تحدي العبقري الشامل**: يسحب كلمات عشوائية من جميع المواد المتاحة (يخلط `words` من كل المواد ويأخذ 6 عشوائياً).
- نظام XP يبقى كما هو بغض النظر عن نوع التحدي.

---

## 2. تعديل "مركز الألعاب الذكي" (LessonContent.tsx)

- تغيير رابط Wordwall من:
  `https://wordwall.net/ar/community?term=...`
  إلى:
  `https://www.google.com/search?q=site:wordwall.net+${subjectDisplayName}+${lessonTitle}`
- يفتح في نافذة جديدة (`target="_blank"`) — موجود بالفعل.
- إضافة تأثير حركي عند النقر: `active:scale-[0.92] hover:scale-[1.03]` مع `transition-transform duration-200`.

---

## 3. التوقيع البرمجي (AppFooter.tsx)

- إضافة سطر ثاني للتذييل: `تصميم وبرمجة: tchjaber@gmail.com` بخط Courier New ولون ذهبي كهرماني (`#b45309`).

---

## ملخص الملفات المتأثرة

| الملف | التغيير |
|---|---|
| `src/components/GamesHub.tsx` | توسيع المواد + واجهة اختيار التحدي Glassmorphism |
| `src/components/LessonContent.tsx` | تعديل رابط مركز الألعاب الذكي + تأثير حركي |
| `src/components/AppFooter.tsx` | إضافة سطر التوقيع البرمجي |


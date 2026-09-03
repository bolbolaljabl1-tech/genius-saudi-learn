import { useEffect, useMemo, useRef, useState } from "react";
import platformLogo from "@/assets/platform-logo.png";
import { SITE_URL } from "@/lib/site";

interface SplashIntroProps {
  /** يتغير هذا المفتاح لإعادة تشغيل المقدمة عند العودة للصفحة الرئيسية */
  playKey: number | string;
  /** المدة الكاملة قبل الاختفاء التلقائي */
  duration?: number;
  onDone?: () => void;
}

/**
 * مقدمة سينمائية خفيفة تعتمد على CSS keyframes فقط لضمان أداء 60 إطاراً
 * في الثانية على الجوال: حلقة ذهبية متوهجة تتشكل مع جسيمات متلألئة، ثم
 * ظهور الشعار (قبعة التخرج والنخلة)، ثم انزلاق اسم المنصة والنطاق.
 */
const SplashIntro = ({ playKey, duration = 2600, onDone }: SplashIntroProps) => {
  const [closing, setClosing] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 92 + (i % 4) * 12;
        return {
          sx: `${Math.cos(angle) * dist}px`,
          sy: `${Math.sin(angle) * dist}px`,
          delay: `${0.25 + (i % 7) * 0.06}s`,
        };
      }),
    [playKey],
  );

  useEffect(() => {
    setClosing(false);
    const fade = window.setTimeout(() => setClosing(true), Math.max(600, duration - 450));
    const end = window.setTimeout(() => onDone?.(), duration);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(end);
    };
  }, [playKey, duration, onDone]);

  const skip = () => onDone?.();

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-royal-blue overflow-hidden ${
        closing ? "animate-splash-out" : ""
      }`}
      role="presentation"
    >
      {/* توهج خلفي ناعم */}
      <span
        aria-hidden
        className="absolute w-[70vw] h-[70vw] max-w-[420px] max-h-[420px] rounded-full blur-3xl opacity-40 animate-splash-glow"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--matte-gold) / 0.55), transparent 65%)",
        }}
      />

      <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
        {/* الحلقة الذهبية المتشكلة */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-4 border-matte-gold animate-splash-ring"
          style={{ boxShadow: "0 0 26px hsl(var(--matte-gold) / 0.75)" }}
        />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full border-2 border-matte-gold/40 animate-splash-ring-2"
        />

        {/* الجسيمات المتلألئة */}
        {particles.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-matte-gold shadow-[0_0_10px_hsl(var(--matte-gold))] animate-splash-spark"
            style={
              {
                "--sx": p.sx,
                "--sy": p.sy,
                animationDelay: p.delay,
              } as React.CSSProperties
            }
          />
        ))}

        {/* الشعار: قبعة التخرج والنخلة */}
        <img
          src={platformLogo}
          alt="شعار منصة الطالب العبقري"
          width={224}
          height={224}
          decoding="async"
          fetchPriority="high"
          className="relative w-[70%] h-[70%] object-contain rounded-full bg-white animate-splash-logo will-change-transform"
        />
      </div>

      <h2 className="mt-7 text-3xl sm:text-4xl font-ruqaa font-bold brand-name animate-splash-title text-center px-6">
        منصة الطالب العبقري
      </h2>
      <p className="mt-2 text-matte-gold/90 font-amiri text-lg font-bold tracking-wide animate-splash-domain">
        {SITE_URL.replace("https://", "")}
      </p>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 px-5 py-2 rounded-full border border-matte-gold/40 text-matte-gold text-sm font-extrabold bg-black/10 active:scale-95 transition"
        aria-label="تخطي المقدمة"
      >
        تخطي
      </button>
    </div>
  );
};

export default SplashIntro;

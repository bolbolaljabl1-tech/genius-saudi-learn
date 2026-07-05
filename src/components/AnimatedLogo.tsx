import { useEffect, useRef, useState } from "react";
import platformLogo from "@/assets/platform-logo.png";
import { useTTS } from "@/hooks/useTTS";

interface AnimatedLogoProps {
  xp?: number;
  size?: "sm" | "md" | "lg";
  studentName?: string;
}

/**
 * الشعار التفاعلي لمنصة الطالب العبقري:
 * - نبض ناعم دائم لجذب البصر بلطف.
 * - عند النقر: تكبير مرن ودورة خفيفة مع تشغيل ترحيب صوتي فصيح.
 * - عند زيادة نقاط الخبرة: قفزة احتفالية مع هالة ذهبية ناعمة.
 */
const AnimatedLogo = ({ xp = 0, size = "md", studentName }: AnimatedLogoProps) => {
  const { speak } = useTTS();
  const [tapped, setTapped] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevXp = useRef<number>(xp);
  const firstRun = useRef(true);

  const dims =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-14 h-14" : "w-20 h-20";

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prevXp.current = xp;
      return;
    }
    if (xp > prevXp.current) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 1400);
      prevXp.current = xp;
      return () => window.clearTimeout(t);
    }
    prevXp.current = xp;
  }, [xp]);

  const handleClick = () => {
    setTapped(true);
    window.setTimeout(() => setTapped(false), 700);
    const who = studentName && !/^طالب-\d+$/.test(studentName) ? studentName : "أيها الطالب العبقري";
    speak(
      `أهلاً وسهلاً بك يا ${who} في منصة الطالب العبقري. نرحّب بك في رحلة تعليمية ممتعة، فاختر مرحلتك ومادتك، ولتكن بدايتك موفّقة.`
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="شعار منصة الطالب العبقري - اضغط للترحيب"
      className={`relative ${dims} rounded-2xl shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-matte-gold`}
    >
      {/* هالة النبض الناعمة */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-matte-gold/25 blur-md animate-logo-pulse pointer-events-none"
      />
      {/* هالة احتفالية عند حصد نقاط الخبرة */}
      {celebrate && (
        <span
          aria-hidden
          className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-matte-gold/60 via-emerald-300/40 to-matte-gold/60 blur-lg animate-ping pointer-events-none"
        />
      )}
      <img
        src={platformLogo}
        alt="شعار منصة الطالب العبقري"
        width={200}
        height={200}
        decoding="async"
        className={[
          "relative w-full h-full object-contain rounded-2xl bg-white shadow-emerald-lg border border-matte-gold/30 transition-transform duration-300 will-change-transform",
          "animate-logo-soft-pulse",
          tapped ? "animate-logo-tap" : "",
          celebrate ? "animate-logo-bounce" : "",
        ].join(" ")}
      />
    </button>
  );
};

export default AnimatedLogo;

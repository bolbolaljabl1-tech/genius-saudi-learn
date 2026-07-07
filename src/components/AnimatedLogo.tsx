import { useEffect, useMemo, useRef, useState } from "react";
import platformLogo from "@/assets/platform-logo.png";
import { useTTS } from "@/hooks/useTTS";

interface AnimatedLogoProps {
  xp?: number;
  size?: "sm" | "md" | "lg";
  studentName?: string;
}

/**
 * الشعار التفاعلي لمنصة الطالب العبقري:
 * - إطار نيون دائري دوّار مستمر حول الشعار.
 * - كل 30 ثانية: انفجار نجوم ناعم مع رنة موسيقية لطيفة داخل حدود الشعار.
 * - نبض ناعم دائم، ونقر لتشغيل ترحيب صوتي فصيح.
 * - قفزة احتفالية عند حصد نقاط الخبرة.
 */
const AnimatedLogo = ({ xp = 0, size = "md", studentName }: AnimatedLogoProps) => {
  const { speak } = useTTS();
  const [tapped, setTapped] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const prevXp = useRef<number>(xp);
  const firstRun = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const dims =
    size === "lg" ? "w-24 h-24" : size === "sm" ? "w-14 h-14" : "w-20 h-20";

  // مواضع النجوم المتناثرة حول محيط الشعار.
  const sparks = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 46 + Math.random() * 10;
        return {
          sx: `${Math.cos(angle) * dist}px`,
          sy: `${Math.sin(angle) * dist}px`,
          delay: `${Math.random() * 0.15}s`,
        };
      }),
    [burstKey],
  );

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

  // رنة موسيقية لطيفة عبر WebAudio بدون ملفات خارجية.
  const playChime = () => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const notes = [1318.5, 1760, 2093]; // E6 A6 C7
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = now + i * 0.08;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch {
      /* silent */
    }
  };

  // انفجار احتفالي كل 30 ثانية.
  useEffect(() => {
    const id = window.setInterval(() => {
      setBurstKey((k) => k + 1);
      playChime();
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

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
      className={`relative ${dims} rounded-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-matte-gold`}
    >
      {/* إطار النيون الدوّار المستمر */}
      <span
        aria-hidden
        className="absolute -inset-1 rounded-full pointer-events-none animate-neon-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, hsl(var(--matte-gold)) 60deg, transparent 120deg, hsl(var(--matte-gold)) 200deg, transparent 260deg, hsl(var(--matte-gold)) 320deg, transparent 360deg)",
          WebkitMask:
            "radial-gradient(circle, transparent calc(50% - 3px), #000 calc(50% - 2px), #000 50%, transparent calc(50% + 1px))",
          mask: "radial-gradient(circle, transparent calc(50% - 3px), #000 calc(50% - 2px), #000 50%, transparent calc(50% + 1px))",
          filter: "drop-shadow(0 0 6px hsl(var(--matte-gold)))",
        }}
      />
      <span
        aria-hidden
        className="absolute -inset-1 rounded-full pointer-events-none animate-neon-shimmer border-2 border-matte-gold/40"
      />

      {/* هالة احتفالية عند حصد نقاط الخبرة */}
      {celebrate && (
        <span
          aria-hidden
          className="absolute -inset-2 rounded-full bg-gradient-to-tr from-matte-gold/60 via-emerald-300/40 to-matte-gold/60 blur-lg animate-ping pointer-events-none"
        />
      )}

      {/* نجوم الانفجار الدوري */}
      <span
        key={burstKey}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
      >
        {sparks.map((s, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-matte-gold shadow-[0_0_8px_hsl(var(--matte-gold))] animate-spark-fly"
            style={
              {
                "--sx": s.sx,
                "--sy": s.sy,
                animationDelay: s.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </span>

      <img
        src={platformLogo}
        alt="شعار منصة الطالب العبقري"
        width={200}
        height={200}
        decoding="async"
        className={[
          "relative w-full h-full object-contain rounded-full bg-white shadow-emerald-lg border border-matte-gold/30 transition-transform duration-300 will-change-transform",
          "animate-logo-soft-pulse",
          tapped ? "animate-logo-tap" : "",
          celebrate ? "animate-logo-bounce" : "",
        ].join(" ")}
      />
    </button>
  );
};

export default AnimatedLogo;

import { useEffect, useState } from "react";

const NAMES = ["بسّام العيد 🌷", "سلمان لغبي 🌷", "موسى الفيفي 🌷", "فارس عقيلي 🌷"];
const STORAGE_KEY = "abqari_thanks_seen";
const STEP_MS = 1800;

const ThanksBoard = () => {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const fadeTimer = window.setTimeout(() => setFading(true), STEP_MS - 400);
    const nextTimer = window.setTimeout(() => {
      if (index >= NAMES.length - 1) {
        setVisible(false);
      } else {
        setIndex((i) => i + 1);
        setFading(false);
      }
    }, STEP_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(nextTimer);
    };
  }, [visible, index]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[95] px-3 pt-3 pointer-events-none" dir="rtl">
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-royal-blue/90 backdrop-blur-xl border border-matte-gold/40 shadow-2xl px-4 py-3 text-center animate-scale-in">
        <h2 className="text-base sm:text-lg font-extrabold font-amiri brand-name animate-shimmer">
          شكراً لأصحاب الفضل والعطاء
        </h2>
        <p
          className={`mt-1 text-lg sm:text-xl font-extrabold text-matte-gold transition-opacity duration-400 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {NAMES[index]}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="mt-2 text-xs font-bold text-matte-gold/70 hover:text-matte-gold underline underline-offset-4"
          aria-label="تخطي لوحة الشكر"
        >
          تخطي
        </button>
      </div>
    </div>
  );
};

export default ThanksBoard;

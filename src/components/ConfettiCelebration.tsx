import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  trigger: boolean;
}

const ConfettiCelebration = ({ trigger }: ConfettiCelebrationProps) => {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    // Big burst first
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"],
    });

    frame();
  }, [trigger]);

  return null;
};

export default ConfettiCelebration;

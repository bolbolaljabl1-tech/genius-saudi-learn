import { useRef, useState } from "react";
import { Award, Share2, Star } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";

interface AchievementCardProps {
  studentName: string;
  activity: string;
  scoreLabel: string;
  earnedStars: number;
  totalStars: number;
  className?: string;
}

const AchievementCard = ({
  studentName,
  activity,
  scoreLabel,
  earnedStars,
  totalStars,
  className = "",
}: AchievementCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const shareAchievement = async () => {
    if (sharing) return;
    setSharing(true);
    const text = `أنجز ${studentName} مغامرة «${activity}» بنتيجة ${scoreLabel}، وحصل على ${earnedStars} نجمة في منصة الطالب العبقري.\n${SITE_URL}`;

    try {
      let imageFile: File | undefined;
      if (cardRef.current) {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
        const blob = await (await fetch(dataUrl)).blob();
        imageFile = new File([blob], "achievement.png", { type: "image/png" });
      }

      if (navigator.share) {
        const data: ShareData = { title: "بطاقة إنجاز الطالب", text };
        if (imageFile && navigator.canShare?.({ files: [imageFile] })) data.files = [imageFile];
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("تم نسخ بطاقة الإنجاز للمشاركة");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(text);
      toast.success("تم نسخ نص الإنجاز للمشاركة");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div ref={cardRef} className="achievement-card motion-pop-in p-6 text-center">
        <div className="achievement-medal mx-auto mb-4" aria-hidden="true">
          <Award className="h-9 w-9 text-matte-gold" />
        </div>
        <p className="text-sm font-extrabold text-primary mb-1">بطاقة إنجاز الطالب</p>
        <h2 className="text-2xl font-extrabold text-heading break-words">{studentName}</h2>
        <p className="mt-2 text-lg font-bold text-body-blue">{activity}</p>

        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="rounded-lg border border-border bg-background/70 p-3">
            <span className="block text-xs font-bold text-muted-foreground">النتيجة</span>
            <strong className="block mt-1 text-xl text-foreground">{scoreLabel}</strong>
          </div>
          <div className="rounded-lg border border-gold/40 bg-gold-light/50 p-3">
            <span className="block text-xs font-bold text-muted-foreground">نجوم المغامرة</span>
            <strong className="mt-1 inline-flex items-center gap-1 text-xl text-heading">
              <Star className="h-5 w-5 fill-gold text-gold star-soft-pulse" />
              {earnedStars.toLocaleString("en-US")}
            </strong>
          </div>
        </div>

        <p className="inline-flex items-center justify-center gap-2 rounded-full bg-royal-blue px-4 py-2 font-extrabold text-matte-gold">
          <Star className="h-5 w-5 fill-matte-gold star-soft-pulse" />
          الرصيد الكلي {totalStars.toLocaleString("en-US")}
        </p>
        <p className="mt-4 font-ruqaa text-base font-bold text-matte-gold">منصة الطالب العبقري - 2026</p>
      </div>

      <Button
        type="button"
        onClick={shareAchievement}
        disabled={sharing}
        className="adventure-button mt-4 h-14 w-full text-lg font-extrabold"
      >
        <Share2 className="h-5 w-5" />
        {sharing ? "جارٍ تجهيز البطاقة" : "شارك إنجازك"}
      </Button>
    </div>
  );
};

export default AchievementCard;
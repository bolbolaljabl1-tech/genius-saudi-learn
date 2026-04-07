import { Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  context: "camera" | "video" | "win";
  resultContainerRef?: React.RefObject<HTMLDivElement>;
}

const shareMessages: Record<string, { text: string; title: string }> = {
  camera: {
    text: "شاهد حل هذا السؤال عبر العين الذكية في منصة الطالب العبقري 🧠",
    title: "العين الذكية",
  },
  video: {
    text: "وجدتُ شرحاً مبسطاً لهذا الدرس في منصة الطالب العبقري 🎥",
    title: "شرح الدرس",
  },
  win: {
    text: "حققتُ الفوز في تحدي العباقرة! هل تجرؤ على منافستي؟ 🏆",
    title: "تحدي العباقرة",
  },
};

const ShareButton = ({ context, resultContainerRef }: ShareButtonProps) => {
  const handleShare = async () => {
    const msg = shareMessages[context];
    const url = "https://genius-saudi-learn.lovable.app";

    let files: File[] = [];
    if (resultContainerRef?.current) {
      try {
        const dataUrl = await toPng(resultContainerRef.current, { quality: 0.95, backgroundColor: "#ffffff" });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        files = [new File([blob], "result.png", { type: "image/png" })];
      } catch {
        // proceed without image
      }
    }

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: msg.title,
          text: `${msg.text}\n${url}`,
        };
        if (files.length && navigator.canShare?.({ files })) {
          shareData.files = files;
        }
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${msg.text}\n${url}`);
      toast({ title: "تم نسخ رسالة المشاركة! 📋" });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-20 left-4 z-40 bg-royal-blue text-matte-gold rounded-full p-3.5 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 animate-pulse-glow"
      aria-label="مشاركة"
    >
      <Share2 className="w-6 h-6" />
    </button>
  );
};

export default ShareButton;

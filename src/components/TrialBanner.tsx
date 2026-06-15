interface TrialBannerProps {
  daysLeft: number;
  expired: boolean;
  subscribed: boolean;
  onSubscribe: () => void;
}

const TrialBanner = ({ daysLeft, expired, subscribed, onSubscribe }: TrialBannerProps) => {
  if (subscribed) return null;
  const message = expired
    ? "انتهت فترة تجربتك المجانية، يرجى تفعيل الاشتراك لفتح المحتوى"
    : `متبقي ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} على انتهاء تجربتك المجانية، اشترك الآن لضمان استمرار تفوقك`;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[60] px-3 py-2 text-center text-sm font-extrabold shadow-md ${
        expired
          ? "bg-destructive text-destructive-foreground"
          : "bg-royal-blue text-matte-gold"
      }`}
      role="status"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="leading-tight">{message}</span>
        <button
          onClick={onSubscribe}
          className="px-3 py-1 rounded-full bg-matte-gold text-royal-blue font-extrabold text-xs hover:opacity-90 active:scale-95 transition"
        >
          تفعيل الاشتراك
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;

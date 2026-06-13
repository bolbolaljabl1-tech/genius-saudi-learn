import { useState, useRef } from "react";
import { Camera, Loader2, ArrowRight, ImageIcon, Volume2, VolumeX, Youtube, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "./ShareButton";

interface CameraSolverProps {
  onBack: () => void;
  onXP: () => void;
}

const CameraSolver = ({ onBack, onXP }: CameraSolverProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [showHintTip, setShowHintTip] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setShowHintTip(true);
      setAnswer("");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string, userHint = "") => {
    setLoading(true);
    setError("");
    setAnswer("");
    setShowHintTip(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64, hint: userHint },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setAnswer(data.answer);
      onXP();
    } catch (err: any) {
      console.error("Analyze error:", err);
      setError(err.message || "حدث خطأ أثناء تحليل الصورة");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!answer) return;
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-emerald shadow-emerald-lg mb-4">
            <Camera className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-heading mb-2">📸 صور سؤالك</h2>
          <p className="text-muted-foreground text-xl">التقط صورة لأي سؤال من أي مادة وسيشرحه لك الذكاء الاصطناعي</p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />

        {!imagePreview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-14 rounded-2xl border-3 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-5 hover:border-primary/60 hover:bg-primary/10 transition-all active:scale-[0.98] animate-scale-in"
          >
            <div className="w-20 h-20 rounded-full gradient-emerald flex items-center justify-center shadow-emerald-lg">
              <ImageIcon className="w-10 h-10 text-primary-foreground" />
            </div>
            <span className="text-foreground font-extrabold text-2xl">اضغط لالتقاط صورة السؤال</span>
            <span className="text-muted-foreground text-lg">أو اختر صورة من المعرض</span>
          </button>
        )}

        {imagePreview && (
          <div className="neu-card overflow-hidden animate-scale-in">
            <img src={imagePreview} alt="صورة السؤال" className="w-full max-h-64 object-contain bg-muted/30" />
            <div className="p-3 flex justify-center">
              <button
                onClick={() => { setImagePreview(null); setImageBase64(null); setHint(""); setAnswer(""); setError(""); setShowHintTip(false); window.speechSynthesis.cancel(); setIsSpeaking(false); fileInputRef.current?.click(); }}
                className="text-primary font-bold text-lg hover:underline"
              >
                📸 التقاط صورة أخرى
              </button>
            </div>
          </div>
        )}

        {imagePreview && !answer && !loading && (
          <div className="space-y-3 animate-slide-up">
            {showHintTip && (
              <div className="neu-card p-4 border-2 border-matte-gold/40 bg-matte-gold/5 flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-matte-gold flex-shrink-0 mt-0.5" />
                <p className="text-foreground font-bold text-base leading-7">
                  يا عبقري، لكي تكون الإجابة محكمة وأكثر دقة، يمكنك (اختيارياً) إضافة بضع كلمات تشرح فيها سؤالك.. فالإيضاح مفتاح الفلاح! 🌟
                </p>
              </div>
            )}
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="اكتب توضيحاً اختيارياً للسؤال (المادة، الموضوع، ما تريد معرفته)..."
              rows={3}
              className="w-full rounded-2xl border-2 border-input bg-background px-4 py-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              onClick={() => imageBase64 && analyzeImage(imageBase64, hint.trim())}
              className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald-lg active:scale-[0.98] transition-all"
            >
              ✨ حلل السؤال الآن
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 animate-slide-up gap-4">
            <div className="w-24 h-24 rounded-full gradient-emerald shadow-emerald-lg flex items-center justify-center animate-pulse-glow">
              <Camera className="w-12 h-12 text-primary-foreground animate-pulse" />
            </div>
            <p className="text-foreground font-extrabold text-xl text-center">يتم الآن استخراج الكنز.. انتظر قليلاً يا عبقري ✨</p>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="neu-card p-6 border-2 border-destructive/20 text-center animate-slide-up">
            <p className="text-destructive text-lg font-bold mb-3">{error}</p>
            <button onClick={() => fileInputRef.current?.click()} className="text-primary font-bold text-lg hover:underline">حاول مرة أخرى</button>
          </div>
        )}

        {answer && (
          <div ref={resultRef} className="neu-card p-6 border-2 border-primary/20 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-heading flex items-center gap-2">💡 الإجابة والشرح</h3>
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base transition-all active:scale-95 ${isSpeaking ? "gradient-gold text-gold-foreground shadow-gold" : "gradient-emerald text-primary-foreground shadow-emerald"}`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                {isSpeaking ? "إيقاف" : "استمع"}
              </button>
            </div>
            <div className="text-body-blue leading-9 whitespace-pre-line text-lg">{answer}</div>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent("عين دروس " + (hint || "شرح الدرس"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-3 rounded-xl bg-red-600 text-white font-extrabold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Youtube className="w-6 h-6" />
              شاهد شرح الدرس من قناة عين
            </a>
            <p className="font-ruqaa text-matte-gold text-xs mt-3 text-center">منصة الطالب العبقري</p>
          </div>
        )}

        {answer && <ShareButton context="camera" resultContainerRef={resultRef} />}
      </div>
    </div>
  );
};

export default CameraSolver;

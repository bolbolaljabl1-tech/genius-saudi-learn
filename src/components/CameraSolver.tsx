import { useState, useRef } from "react";
import { Camera, Loader2, ArrowRight, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CameraSolverProps {
  onBack: () => void;
  onXP: () => void;
}

const CameraSolver = ({ onBack, onXP }: CameraSolverProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      analyzeImage(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: base64 },
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

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
      >
        <ArrowRight className="w-5 h-5" />
        <span className="font-medium">رجوع</span>
      </button>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-emerald shadow-emerald mb-4">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">📸 أصوّر سؤالك</h2>
          <p className="text-muted-foreground">التقط صورة لأي سؤال من كتابك المدرسي وسيشرحه لك الذكاء الاصطناعي</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />

        {!imagePreview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-12 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/10 transition-all active:scale-[0.98] animate-scale-in"
          >
            <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center shadow-emerald">
              <ImageIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-foreground font-bold text-lg">اضغط لالتقاط صورة السؤال</span>
            <span className="text-muted-foreground text-sm">أو اختر صورة من المعرض</span>
          </button>
        )}

        {imagePreview && (
          <div className="glass-card rounded-2xl overflow-hidden animate-scale-in">
            <img src={imagePreview} alt="صورة السؤال" className="w-full max-h-64 object-contain bg-muted/30" />
            <div className="p-3 flex justify-center">
              <button
                onClick={() => {
                  setImagePreview(null);
                  setAnswer("");
                  setError("");
                  fileInputRef.current?.click();
                }}
                className="text-primary font-medium text-sm hover:underline"
              >
                التقاط صورة أخرى
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8 animate-slide-up">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="mr-3 text-muted-foreground font-medium">جاري تحليل السؤال بالذكاء الاصطناعي...</span>
          </div>
        )}

        {error && (
          <div className="glass-card rounded-2xl p-6 border-2 border-destructive/20 text-center animate-slide-up">
            <p className="text-destructive mb-3">{error}</p>
            <button onClick={() => fileInputRef.current?.click()} className="text-primary font-medium hover:underline">
              حاول مرة أخرى
            </button>
          </div>
        )}

        {answer && (
          <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 animate-slide-up">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              💡 الإجابة والشرح
            </h3>
            <div className="text-foreground/85 leading-8 whitespace-pre-line text-base">
              {answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraSolver;

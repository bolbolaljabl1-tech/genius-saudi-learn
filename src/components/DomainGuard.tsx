import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_HOSTS = ["abqarai.com", "www.abqarai.com"];
const STORAGE_KEY = "abqari_admin_gate_ok";

interface Props {
  children: ReactNode;
}

const DomainGuard = ({ children }: Props) => {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    if (ALLOWED_HOSTS.includes(host)) {
      setUnlocked(true);
      return;
    }
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  if (unlocked) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      // The access code is verified server-side; it is never present in the bundle.
      const { data } = await supabase.functions.invoke("activation", {
        body: { action: "preview_gate", code: code.trim() },
      });
      if ((data as { ok?: boolean } | null)?.ok) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setUnlocked(true);
        return;
      }
      setError("الرمز غير صحيح");
    } catch {
      setError("تعذر التحقق، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-royal-blue p-6" dir="rtl">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border-2 border-matte-gold/40 rounded-2xl p-6 shadow-2xl text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-matte-gold/15 border border-matte-gold/40 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-matte-gold" />
        </div>
        <h1 className="text-xl font-extrabold text-matte-gold mb-2">وصول محمي</h1>
        <p className="text-sm text-foreground/80 mb-4">
          هذه النسخة محمية. يُرجى إدخال رمز دخول الإدارة للمتابعة.
        </p>
        <input
          type="password"
          inputMode="text"
          autoFocus
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          placeholder="رمز دخول الإدارة"
          className="w-full h-11 px-3 rounded-lg bg-background border border-matte-gold/30 text-center text-base font-bold focus:outline-none focus:border-matte-gold"
        />
        {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full h-11 rounded-lg bg-matte-gold text-royal-blue font-extrabold active:scale-95 transition disabled:opacity-60"
        >
          دخول
        </button>
        <p className="mt-4 text-xs text-foreground/60">
          الوصول العام متاح عبر النطاق الرسمي: abqarai.com
        </p>
      </form>
    </div>
  );
};

export default DomainGuard;

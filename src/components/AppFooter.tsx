import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminLogin } from "@/lib/activation";

const AppFooter = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const ok = await adminLogin(pass);
      if (ok) {
        setOpen(false);
        setPass("");
        navigate("/admin");
      } else {
        toast.error("كلمة السر الإدارية غير صحيحة");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <footer className="fixed bottom-0 inset-x-0 py-3 text-center bg-royal-blue/60 backdrop-blur-2xl z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] border-t-0 isolate">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-matte-gold to-transparent opacity-90" />
        <button
          onClick={() => setOpen(true)}
          aria-label="إدارة الموافقات"
          title="إدارة الموافقات"
          className="absolute left-3 bottom-3 w-7 h-7 rounded-full flex items-center justify-center text-matte-gold/50 hover:text-matte-gold active:scale-90 transition"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
        <p className="font-amiri font-bold text-lg animate-footer-pulse">
          <span className="brand-name">منصة الطالب العبقري</span>
          <span className="text-matte-gold"> - 2026 🎓</span>
        </p>
        <p className="text-xs font-bold mt-1 flex items-center justify-center gap-1 text-matte-gold/70">
          <Mail className="w-3 h-3" />
          <span style={{ fontFamily: "'Courier New', monospace" }}>tchjaber@gmail.com</span>
        </p>
      </footer>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            dir="rtl"
            className="neu-card p-5 w-full max-w-sm space-y-4"
          >
            <h2 className="text-xl font-extrabold text-heading">دخول الإدارة</h2>
            <p className="text-body-blue text-sm font-bold leading-6">
              أدخل كلمة السر الإدارية للوصول إلى لوحة تفعيل اشتراكات الطلاب.
            </p>
            <input
              type="password"
              autoFocus
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="كلمة السر الإدارية"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card font-bold text-lg focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || !pass}
                className="flex-1 py-3 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-base active:scale-[0.98] transition disabled:opacity-60"
              >
                {busy ? "جارٍ التحقق..." : "دخول"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl neu-btn font-extrabold text-base"
              >
                إغلاق
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AppFooter;

import { Mail } from "lucide-react";

const AppFooter = () => (
  <footer className="fixed bottom-0 inset-x-0 py-3 text-center bg-royal-blue border-t border-matte-gold/30 z-50">
    <p className="font-ruqaa font-bold text-lg text-matte-gold">
      منصة الطالب العبقري - 2026 🎓
    </p>
    <p className="text-xs font-bold mt-1 flex items-center justify-center gap-1 text-matte-gold/70">
      <Mail className="w-3 h-3" />
      <span style={{ fontFamily: "'Courier New', monospace" }}>tchjaber@gmail.com</span>
    </p>
  </footer>
);

export default AppFooter;

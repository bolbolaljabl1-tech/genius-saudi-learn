import { Mail } from "lucide-react";

const AppFooter = () => (
  <footer className="fixed bottom-0 inset-x-0 py-3 text-center bg-royal-blue/60 backdrop-blur-2xl z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] border-t-0 isolate">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-matte-gold to-transparent opacity-90" />
    <p className="font-amiri font-bold text-lg animate-footer-pulse">
      <span className="brand-name">منصة الطالب العبقري</span>
      <span className="text-matte-gold"> - 2026 🎓</span>
    </p>
    <p className="text-xs font-bold mt-1 flex items-center justify-center gap-1 text-matte-gold/70">
      <Mail className="w-3 h-3" />
      <span style={{ fontFamily: "'Courier New', monospace" }}>tchjaber@gmail.com</span>
    </p>
  </footer>
);

export default AppFooter;

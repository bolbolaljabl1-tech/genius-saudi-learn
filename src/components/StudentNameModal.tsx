import { useState } from "react";
import appIcon from "@/assets/app-icon.png";

interface StudentNameModalProps {
  onSave: (name: string) => void;
}

const StudentNameModal = ({ onSave }: StudentNameModalProps) => {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="neu-card p-8 max-w-sm w-full animate-bounce-in text-center">
        <img src={appIcon} alt="منصة الطالب العبقري" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-emerald" />
        <h2 className="text-2xl font-extrabold text-foreground mb-2">👋 أهلاً بك!</h2>
        <p className="text-muted-foreground mb-6 text-lg">أدخل اسمك للظهور في لوحة المتصدرين</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الطالب"
          className="w-full px-5 py-4 rounded-2xl border-2 border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-bold mb-4"
          dir="rtl"
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          ابدأ التعلم 🚀
        </button>
      </div>
    </div>
  );
};

export default StudentNameModal;

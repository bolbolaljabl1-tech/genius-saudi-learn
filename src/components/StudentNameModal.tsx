import { useState } from "react";

interface StudentNameModalProps {
  onSave: (name: string) => void;
}

const StudentNameModal = ({ onSave }: StudentNameModalProps) => {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full animate-scale-in text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">👋 أهلاً بك!</h2>
        <p className="text-muted-foreground mb-6 text-sm">أدخل اسمك للظهور في لوحة المتصدرين</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الطالب"
          className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg mb-4"
          dir="rtl"
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl gradient-emerald text-primary-foreground font-bold shadow-emerald disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          ابدأ التعلم 🚀
        </button>
      </div>
    </div>
  );
};

export default StudentNameModal;

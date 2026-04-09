import { useState } from "react";
import { ArrowRight, Gamepad2, Hexagon, BookOpen, Calculator, FlaskConical, BookOpenCheck, Landmark, Globe, Monitor, Palette, Dumbbell, Heart, Languages, Wifi } from "lucide-react";
import HexBattleGame from "./HexBattleGame";
import OnlineChallenge from "./OnlineChallenge";

interface GamesHubProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  onBadge: (badge: string) => void;
  studentName: string;
}

interface SubjectDef {
  id: string;
  title: string;
  icon: typeof BookOpen;
  color: string;
}

const subjects: SubjectDef[] = [
  { id: "quran", title: "القرآن الكريم", icon: Landmark, color: "from-green-600 to-emerald-700" },
  { id: "islamic", title: "الدراسات الإسلامية", icon: BookOpenCheck, color: "from-teal-500 to-cyan-600" },
  { id: "math", title: "الرياضيات", icon: Calculator, color: "from-red-500 to-rose-600" },
  { id: "science", title: "العلوم", icon: FlaskConical, color: "from-blue-500 to-indigo-600" },
  { id: "arabic", title: "لغتي الخالدة", icon: BookOpen, color: "from-amber-500 to-orange-600" },
  { id: "social", title: "الدراسات الاجتماعية", icon: Globe, color: "from-sky-500 to-blue-600" },
  { id: "digital", title: "المهارات الرقمية", icon: Monitor, color: "from-indigo-500 to-blue-600" },
  { id: "art", title: "التربية الفنية", icon: Palette, color: "from-pink-500 to-rose-600" },
  { id: "pe", title: "التربية البدنية", icon: Dumbbell, color: "from-green-500 to-lime-600" },
  { id: "life", title: "المهارات الحياتية", icon: Heart, color: "from-red-400 to-pink-500" },
  { id: "english", title: "اللغة الإنجليزية", icon: Languages, color: "from-blue-500 to-indigo-600" },
];

const GamesHub = ({ onBack, onXP, onBadge, studentName }: GamesHubProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showOnline, setShowOnline] = useState(false);

  if (showOnline) {
    return <OnlineChallenge onBack={() => setShowOnline(false)} onXP={onXP} studentName={studentName} />;
  }

  if (selectedSubject) {
    return (
      <HexBattleGame
        onBack={() => setSelectedSubject(null)}
        onXP={onXP}
        onBadge={onBadge}
        studentName={studentName}
        subjectFilter={selectedSubject}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-6 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold shadow-gold mb-4">
          <Gamepad2 className="w-10 h-10 text-gold-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-heading mb-2">🎮 ركن العباقرة</h1>
        <p className="text-muted-foreground text-xl">اختر المادة للبدء في التحدي!</p>
      </div>

      {/* Online Challenge */}
      <button
        onClick={() => setShowOnline(true)}
        className="w-full max-w-md mx-auto mb-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in cursor-pointer ring-2 ring-matte-gold/40"
      >
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-royal-blue shadow-lg flex items-center justify-center">
          <Wifi className="w-9 h-9 text-matte-gold" />
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-xl font-extrabold text-foreground">🌐 تحدي صديقك أونلاين</h3>
          <p className="text-muted-foreground text-sm mt-1">العب مع صديق عن بُعد! 🔥</p>
        </div>
        <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">جديد</span>
      </button>

      {/* All subjects hex battle */}
      <button
        onClick={() => setSelectedSubject("all")}
        className="w-full max-w-md mx-auto mb-5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in cursor-pointer ring-2 ring-primary/30"
      >
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl gradient-emerald shadow-emerald-lg flex items-center justify-center">
          <Hexagon className="w-9 h-9 text-white" />
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-xl font-extrabold text-foreground">⬡ تحدي العبقري الشامل</h3>
          <p className="text-muted-foreground text-sm mt-1">أسئلة من جميع المواد! 🔥</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full pb-20">
        {subjects.map((sub, i) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className="group bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] animate-scale-in cursor-pointer"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${sub.color} shadow-lg mb-3 transition-transform duration-300 group-hover:scale-110`}>
              <sub.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-sm font-extrabold text-heading leading-tight">{sub.title}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamesHub;

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, Copy, Users, Wifi, Clock, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ConfettiCelebration from "./ConfettiCelebration";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "@/hooks/use-toast";

interface OnlineChallengeProps {
  onBack: () => void;
  onXP: (amount: number) => void;
  studentName: string;
}

interface Question {
  q: string;
  opts: string[];
  correct: number;
  subject: string;
}

const allQuestions: Question[] = [
  { q: "كم عدد سور القرآن الكريم؟", opts: ["112", "114", "116", "120"], correct: 1, subject: "quran" },
  { q: "ما ناتج 7 × 8 ؟", opts: ["54", "56", "58", "64"], correct: 1, subject: "math" },
  { q: "ما أقرب كوكب للشمس؟", opts: ["الزهرة", "عطارد", "الأرض", "المريخ"], correct: 1, subject: "science" },
  { q: "كم عدد أركان الإسلام؟", opts: ["3", "4", "5", "6"], correct: 2, subject: "islamic" },
  { q: "ما إعراب 'الطالبُ' في: الطالبُ مجتهدٌ؟", opts: ["مبتدأ مرفوع", "فاعل", "خبر", "بدل"], correct: 0, subject: "arabic" },
  { q: "كم عدد قارات العالم؟", opts: ["5", "6", "7", "8"], correct: 2, subject: "social" },
  { q: "ما وحدة قياس سعة التخزين؟", opts: ["هرتز", "بايت", "واط", "بكسل"], correct: 1, subject: "digital" },
  { q: "ما الألوان الأساسية؟", opts: ["أحمر وأزرق وأصفر", "أخضر وبرتقالي وبنفسجي", "أبيض وأسود ورمادي", "وردي وبني وذهبي"], correct: 0, subject: "art" },
  { q: "كم عدد لاعبي كرة القدم؟", opts: ["9", "10", "11", "12"], correct: 2, subject: "pe" },
  { q: "ما أهم وجبة في اليوم؟", opts: ["الغداء", "العشاء", "الإفطار", "الوجبة الخفيفة"], correct: 2, subject: "life" },
  { q: "What is the past tense of 'go'?", opts: ["goed", "went", "gone", "going"], correct: 1, subject: "english" },
  { q: "ما أطول سورة في القرآن؟", opts: ["آل عمران", "البقرة", "النساء", "المائدة"], correct: 1, subject: "quran" },
  { q: "ما محيط مربع طول ضلعه 5 سم؟", opts: ["15", "20", "25", "10"], correct: 1, subject: "math" },
  { q: "ما الغاز الذي نتنفسه؟", opts: ["النيتروجين", "CO₂", "الأكسجين", "الهيدروجين"], correct: 2, subject: "science" },
  { q: "ما عاصمة المملكة العربية السعودية؟", opts: ["جدة", "مكة", "الرياض", "المدينة"], correct: 2, subject: "social" },
];

const BOARD_SIZE = 5;

const areNeighbors = (r1: number, c1: number, r2: number, c2: number) => {
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (r1 % 2 === 0) {
    return (dr === 0 && Math.abs(dc) === 1) || (dr === -1 && (dc === 0 || dc === -1)) || (dr === 1 && (dc === 0 || dc === -1));
  }
  return (dr === 0 && Math.abs(dc) === 1) || (dr === -1 && (dc === 0 || dc === 1)) || (dr === 1 && (dc === 0 || dc === 1));
};

const checkWin = (cells: Record<string, string>, color: string): boolean => {
  const colorCells = Object.entries(cells).filter(([, c]) => c === color);
  if (colorCells.length === 0) return false;
  const visited = new Set<string>();
  const dfs = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (visited.has(key)) return;
    visited.add(key);
    for (let nr = 0; nr < BOARD_SIZE; nr++) {
      for (let nc = 0; nc < BOARD_SIZE; nc++) {
        const nk = `${nr}-${nc}`;
        if (!visited.has(nk) && cells[nk] === color && areNeighbors(r, c, nr, nc)) dfs(nr, nc);
      }
    }
  };
  if (color === "green") {
    colorCells.filter(([k]) => k.endsWith("-0")).forEach(([k]) => { const [r] = k.split("-").map(Number); dfs(r, 0); });
    return Array.from(visited).some(k => k.endsWith(`-${BOARD_SIZE - 1}`));
  } else {
    colorCells.filter(([k]) => k.startsWith("0-")).forEach(([k]) => { const [, c] = k.split("-").map(Number); dfs(0, c); });
    return Array.from(visited).some(k => k.startsWith(`${BOARD_SIZE - 1}-`));
  }
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

type Phase = "lobby" | "playing" | "finished";

const OnlineChallenge = ({ onBack, onXP, studentName }: OnlineChallengeProps) => {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [myRole, setMyRole] = useState<"creator" | "joiner" | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState("");
  const [cellOwners, setCellOwners] = useState<Record<string, string>>({});
  const [currentPlayer, setCurrentPlayer] = useState<"green" | "red">("green");
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const questionsRef = useRef(shuffleArray(allQuestions));
  const qIndexRef = useRef(0);
  const channelRef = useRef<any>(null);
  const { speak } = useTTS();

  const myColor = myRole === "creator" ? "green" : "red";
  const isMyTurn = currentPlayer === myColor;
  const playerName = studentName || "لاعب";

  // Timer
  useEffect(() => {
    if (!timerStarted || winner) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 200);
    return () => clearInterval(iv);
  }, [timerStarted, startTime, winner]);

  const getNextQuestion = () => {
    if (qIndexRef.current >= questionsRef.current.length) {
      questionsRef.current = shuffleArray(allQuestions);
      qIndexRef.current = 0;
    }
    return questionsRef.current[qIndexRef.current++];
  };

  // Subscribe to room changes
  const subscribeToRoom = useCallback((rId: string) => {
    channelRef.current = supabase
      .channel(`room-${rId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "challenge_rooms", filter: `id=eq.${rId}` }, (payload: any) => {
        const d = payload.new;
        if (d.joiner_name && !opponentName) setOpponentName(d.joiner_name);
        if (d.status === "playing" && phase !== "playing") setPhase("playing");
        if (d.cell_owners) setCellOwners(typeof d.cell_owners === "string" ? JSON.parse(d.cell_owners) : d.cell_owners);
        if (d.current_player) setCurrentPlayer(d.current_player);
        if (d.winner) {
          setWinner(d.winner);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 4000);
          setPhase("finished");
        }
        if (d.selected_cell) setSelectedCell(d.selected_cell);
        if (d.current_question) {
          const q = typeof d.current_question === "string" ? JSON.parse(d.current_question) : d.current_question;
          setCurrentQuestion(q);
          setAnswered(false);
          setSelectedAnswer(null);
        }
      })
      .subscribe();
  }, [opponentName, phase]);

  const createRoom = async () => {
    setLoading(true);
    const code = generateRoomCode();
    const { data, error } = await (supabase as any).from("challenge_rooms").insert({
      room_code: code,
      creator_name: playerName,
      subject: "all",
      status: "waiting",
    }).select().single();
    if (error || !data) { setLoading(false); toast({ title: "خطأ في إنشاء الغرفة" }); return; }
    setRoomCode(code);
    setRoomId(data.id);
    setMyRole("creator");
    subscribeToRoom(data.id);
    setLoading(false);
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    const { data, error } = await (supabase as any).from("challenge_rooms")
      .select("*").eq("room_code", joinCode.trim().toUpperCase()).eq("status", "waiting").single();
    if (error || !data) { setLoading(false); toast({ title: "لم يتم العثور على الغرفة" }); return; }
    
    await (supabase as any).from("challenge_rooms").update({
      joiner_name: playerName,
      status: "playing",
    }).eq("id", data.id);
    
    setRoomId(data.id);
    setRoomCode(data.room_code);
    setMyRole("joiner");
    setOpponentName(data.creator_name);
    setPhase("playing");
    setTimerStarted(true);
    setStartTime(Date.now());
    subscribeToRoom(data.id);
    setLoading(false);
  };

  // When joiner joins, creator starts playing
  useEffect(() => {
    if (myRole === "creator" && opponentName && phase === "lobby") {
      setPhase("playing");
      setTimerStarted(true);
      setStartTime(Date.now());
    }
  }, [opponentName, myRole, phase]);

  const handleCellClick = async (id: string) => {
    if (winner || cellOwners[id] || !isMyTurn || selectedCell) return;
    const q = getNextQuestion();
    setSelectedCell(id);
    setCurrentQuestion(q);
    setAnswered(false);
    setSelectedAnswer(null);
    speak(q.q);
    // Sync to DB
    await (supabase as any).from("challenge_rooms").update({
      selected_cell: id,
      current_question: q,
    }).eq("id", roomId);
  };

  const handleAnswer = async (idx: number) => {
    if (answered || !currentQuestion || !isMyTurn) return;
    setSelectedAnswer(idx);
    setAnswered(true);

    const newOwners = { ...cellOwners };
    if (idx === currentQuestion.correct) {
      newOwners[selectedCell!] = myColor;
    }
    const nextPlayer = myColor === "green" ? "red" : "green";
    const hasWon = idx === currentQuestion.correct && checkWin(newOwners, myColor);

    setTimeout(async () => {
      await (supabase as any).from("challenge_rooms").update({
        cell_owners: newOwners,
        current_player: hasWon ? currentPlayer : nextPlayer,
        selected_cell: null,
        current_question: null,
        winner: hasWon ? myColor : null,
      }).eq("id", roomId);

      setCellOwners(newOwners);
      setSelectedCell(null);
      setCurrentQuestion(null);
      setAnswered(false);
      setSelectedAnswer(null);
      if (hasWon) {
        setWinner(myColor);
        setCelebrate(true);
        onXP(200);
        setPhase("finished");
      } else {
        setCurrentPlayer(nextPlayer);
      }
    }, 1500);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const getCellColor = (id: string) => {
    const owner = cellOwners[id];
    if (owner === "green") return "bg-emerald-500 border-emerald-600 shadow-emerald-500/40";
    if (owner === "red") return "bg-red-500 border-red-600 shadow-red-500/40";
    if (selectedCell === id) return "bg-amber-400 border-amber-500 ring-4 ring-amber-300";
    return "bg-card border-border hover:bg-muted hover:border-primary/40";
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec} ث`;
  };

  // Lobby
  if (phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-lg">رجوع</span>
        </button>

        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-royal-blue shadow-lg mb-4">
            <Wifi className="w-10 h-10 text-matte-gold" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">🌐 تحدي صديقك أونلاين</h1>
          <p className="text-muted-foreground text-lg mt-2">أنشئ غرفة أو انضم لغرفة صديقك!</p>
        </div>

        <div className="max-w-md mx-auto w-full space-y-6">
          {!roomCode ? (
            <>
              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full py-5 rounded-3xl gradient-emerald text-primary-foreground font-extrabold text-xl shadow-emerald-lg active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading ? "جارٍ الإنشاء..." : "🏠 إنشاء غرفة تحدي"}
              </button>

              <div className="text-center text-muted-foreground font-bold">أو</div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="أدخل كود الغرفة"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl font-bold tracking-widest"
                  maxLength={5}
                  dir="ltr"
                />
                <button
                  onClick={joinRoom}
                  disabled={loading || joinCode.length < 5}
                  className="w-full py-4 rounded-2xl bg-royal-blue text-matte-gold font-extrabold text-xl shadow-lg active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  {loading ? "جارٍ الانضمام..." : "🔗 انضم للتحدي"}
                </button>
              </div>
            </>
          ) : (
            <div className="neu-card p-8 text-center animate-scale-in">
              <p className="text-lg font-bold text-muted-foreground mb-3">كود الغرفة:</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl font-extrabold text-primary tracking-[0.3em]" dir="ltr">{roomCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(roomCode); toast({ title: "تم نسخ الكود! 📋" }); }}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-muted-foreground font-bold animate-pulse">⏳ في انتظار الخصم...</p>
              <p className="text-sm text-muted-foreground mt-3">أرسل الكود لصديقك ليدخل التحدي!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game board
  return (
    <div className="min-h-screen flex flex-col px-3 py-4 pb-24">
      <ConfettiCelebration trigger={celebrate} />

      {winner && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="neu-card p-8 max-w-sm w-full animate-bounce-in text-center">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              {winner === myColor ? "🎉 فزت بالتحدي!" : "😔 فاز خصمك!"}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{formatTime(elapsed)}</span>
            </div>
            {winner === myColor && <p className="text-lg font-bold text-primary mb-4">+200 XP 🔥</p>}
            <button onClick={onBack} className="w-full py-3 rounded-2xl gradient-emerald text-primary-foreground font-bold text-lg">
              رجوع 🏠
            </button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 self-start">
        <ArrowRight className="w-5 h-5" />
        <span className="font-bold text-lg">رجوع</span>
      </button>

      <div className="text-center mb-2 animate-slide-up">
        <h1 className="text-xl font-extrabold text-foreground">🌐 تحدي أونلاين</h1>
        <p className="text-sm text-muted-foreground">
          {myRole === "creator" ? `أنت 🟢 vs ${opponentName} 🔴` : `${opponentName} 🟢 vs أنت 🔴`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2 text-lg font-bold">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-primary">{formatTime(elapsed)}</span>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${isMyTurn ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>
          {isMyTurn ? "⚡ دورك!" : "⏳ دور الخصم..."}
        </span>
      </div>

      <div className="flex justify-center gap-4 mb-3 text-xs text-muted-foreground">
        <span>🟢 يسار ← يمين</span>
        <span>🔴 أعلى ← أسفل</span>
      </div>

      {/* Hex Grid */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1.5 rounded-full bg-emerald-500" />
          <div className="absolute -right-3 top-0 bottom-0 w-1.5 rounded-full bg-emerald-500" />
          <div className="absolute top-[-8px] left-0 right-0 h-1.5 rounded-full bg-red-500" />
          <div className="absolute bottom-[-8px] left-0 right-0 h-1.5 rounded-full bg-red-500" />
          <div className="py-2 px-2">
            {Array.from({ length: BOARD_SIZE }, (_, r) => (
              <div key={r} className="flex justify-center gap-1" style={{ marginTop: r === 0 ? 0 : -4, marginRight: r % 2 === 1 ? 24 : 0 }}>
                {Array.from({ length: BOARD_SIZE }, (_, c) => {
                  const id = `${r}-${c}`;
                  const isDisabled = !!winner || !!cellOwners[id] || !!selectedCell || !isMyTurn;
                  return (
                    <button key={id} onClick={() => handleCellClick(id)} disabled={isDisabled}
                      className={`w-12 h-12 rounded-lg border-2 shadow-md transition-all duration-200 text-xs font-bold ${getCellColor(id)} ${!isDisabled ? "active:scale-90 cursor-pointer" : ""}`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", width: 48, height: 48 }}>
                      {cellOwners[id] ? (cellOwners[id] === "green" ? "🟢" : "🔴") : "⬡"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && selectedCell && !winner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-3 pb-20">
          <div className="w-full max-w-md bg-card rounded-3xl p-5 shadow-2xl animate-slide-up border border-border mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-muted-foreground">
                {isMyTurn ? "🎯 أجب الآن!" : "⏳ الخصم يجيب..."}
              </span>
              <button onClick={() => speak(currentQuestion.q)} className="p-1.5 rounded-full bg-primary/10 text-primary">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-lg font-extrabold mb-4 leading-8 text-foreground">{currentQuestion.q}</p>
            <div className="grid grid-cols-1 gap-2 pb-2">
              {currentQuestion.opts.map((opt, i) => {
                let cls = "w-full py-3 px-4 rounded-xl border-2 text-right font-bold text-base transition-all active:scale-[0.97]";
                if (answered) {
                  if (i === currentQuestion.correct) cls += " border-emerald-500 bg-emerald-50 text-emerald-700";
                  else if (i === selectedAnswer) cls += " border-red-500 bg-red-50 text-red-700";
                  else cls += " border-border opacity-40";
                } else cls += " border-border bg-card hover:border-primary/50";
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered || !isMyTurn} className={cls}>
                    <span className="ml-2">{["🅰️", "🅱️", "🅲", "🅳"][i]}</span> {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className={`text-center mt-3 font-bold text-sm ${selectedAnswer === currentQuestion?.correct ? "text-emerald-600" : "text-red-600"}`}>
                {selectedAnswer === currentQuestion?.correct ? "✅ إجابة صحيحة!" : "❌ إجابة خاطئة!"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineChallenge;

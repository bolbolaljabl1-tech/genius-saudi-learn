import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import { BookOpen, Camera, Sparkles, X } from "lucide-react";
import * as THREE from "three";
import guideRobotAsset from "@/assets/guide-robot.glb.asset.json";
import { Button } from "@/components/ui/button";

type GuideScreen = "stage" | "subject" | "search" | "lesson" | "camera" | "foundation" | "studio" | "selftest";

interface GuideMascotProps {
  screen: GuideScreen;
  xp: number;
  studentName: string;
  onCamera: () => void;
  onStudio: () => void;
}

const guidance: Record<GuideScreen, { title: string; text: string }> = {
  stage: { title: "أنا دليلك الذكي", text: "ابدأ باختيار مرحلتك، أو صوّر سؤالك، أو صمّم لعبة تعليمية تناسب درسك." },
  subject: { title: "اختر مادّتك", text: "اختر المادة التي تريد مراجعتها، وسأرافقك حتى التحدي." },
  search: { title: "حدّد درسك", text: "أكمل الاختيارات ثم افتح قارئ الكتاب لمراجعة الدرس داخل المنصة." },
  lesson: { title: "وقت الإتقان", text: "استمع إلى الشرح، ثم ابدأ الاختبار عندما تصبح مستعداً." },
  camera: { title: "اجعل الصورة واضحة", text: "صوّر السؤال كاملاً، ويمكنك كتابة توضيح قصير لتحصل على شرح أدق." },
  foundation: { title: "أساس قوي", text: "اختر مهارة واحدة وكرّر التدريب عليها حتى تتقنها." },
  studio: { title: "صمّم تحديك", text: "اكتب اسم الدرس واختر صفك، وسأساعدك في إنشاء أربعة أنماط لعب." },
  selftest: { title: "اختبر تقدمك", text: "اقرأ السؤال بهدوء، ثم راجع تفسير الإجابة بعد كل محاولة." },
};

function Robot({ reaction }: { reaction: "idle" | "wave" | "celebrate" }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(guideRobotAsset.url);
  const model = useMemo(() => scene.clone(true), [scene]);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const clipName = reaction === "celebrate" ? "Dance" : reaction === "wave" ? "Wave" : "Idle";
    const action = actions[clipName];
    if (!action) return;
    action.reset().fadeIn(0.18).play();
    return () => {
      action.fadeOut(0.18);
    };
  }, [actions, reaction]);

  useFrame((_, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, 0.05);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, reaction === "celebrate" ? -0.25 : 0.12, 6, delta);
  });

  return (
    <group ref={group} position={[0, -1.45, 0]} scale={0.72}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(guideRobotAsset.url);

const GuideMascot = ({ screen, xp, studentName, onCamera, onStudio }: GuideMascotProps) => {
  const [open, setOpen] = useState(false);
  const [reaction, setReaction] = useState<"idle" | "wave" | "celebrate">("idle");
  const previousXp = useRef(xp);
  const timer = useRef<number | null>(null);
  const copy = guidance[screen];

  const reactFor = (next: "wave" | "celebrate") => {
    if (timer.current) window.clearTimeout(timer.current);
    setReaction(next);
    timer.current = window.setTimeout(() => setReaction("idle"), next === "celebrate" ? 2600 : 1700);
  };

  useEffect(() => {
    if (xp > previousXp.current) {
      setOpen(true);
      reactFor("celebrate");
    }
    previousXp.current = xp;
  }, [xp]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return (
    <div className="fixed bottom-36 right-2 z-40 flex items-end gap-2" dir="rtl">
      {open && (
        <div className="guide-bubble mb-2 w-[min(17rem,calc(100vw-6.5rem))] rounded-lg border-2 border-matte-gold/50 bg-card p-3 shadow-emerald-lg animate-scale-in">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="إغلاق إرشادات الشخصية"
            className="absolute left-1 top-1 h-7 w-7 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="pl-6 text-base font-extrabold text-heading">{xp > previousXp.current ? "أحسنت" : copy.title}</p>
          <p className="mt-1 text-sm font-bold leading-6 text-muted-foreground">
            {reaction === "celebrate" ? `رائع يا ${studentName || "عبقري"}، ازدادت نقاط خبرتك. واصل التقدم.` : copy.text}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" onClick={onCamera} size="sm" className="h-9 rounded-lg px-2 text-xs font-extrabold">
              <Camera className="h-4 w-4" /> صور سؤالك
            </Button>
            <Button type="button" onClick={onStudio} variant="outline" size="sm" className="h-9 rounded-lg px-2 text-xs font-extrabold">
              <Sparkles className="h-4 w-4" /> صمّم لعبتك
            </Button>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setOpen((value) => !value);
          reactFor("wave");
        }}
        aria-label="فتح الشخصية المرشدة"
        className={`guide-mascot-button relative h-24 w-[4.75rem] shrink-0 overflow-hidden rounded-[1.4rem] border-2 border-matte-gold bg-secondary/80 p-0 shadow-gold ${reaction === "celebrate" ? "guide-celebrate" : ""}`}
      >
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.25, 4.2], fov: 34 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={1.25} />
          <directionalLight position={[3, 4, 4]} intensity={2.1} />
          <directionalLight position={[-3, 2, 2]} intensity={0.8} color="#e2b93b" />
          <Suspense fallback={null}>
            <Robot reaction={reaction} />
            <ContactShadows position={[0, -1.42, 0]} opacity={0.28} scale={4} blur={2.2} far={3} />
          </Suspense>
        </Canvas>
        <span className="pointer-events-none absolute inset-x-1 bottom-1 rounded-full bg-royal-blue/90 py-0.5 text-[10px] font-extrabold text-matte-gold">
          دليلك
        </span>
      </Button>
    </div>
  );
};

export default GuideMascot;
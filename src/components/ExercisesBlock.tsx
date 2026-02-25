import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Remedy {
  title: string;
  description: string;
  emoji: string;
}

/* ---------------- PERIOD REMEDY POOL ---------------- */

const periodRemedies: Remedy[] = [
  { title: "Child’s Pose (Balasana)", emoji: "🧘‍♀️", description: "Gently relieves lower back pressure and relaxes pelvic muscles." },
  { title: "Knee-to-Chest", emoji: "🌿", description: "Helps release trapped gas and reduces abdominal pressure." },
  { title: "Warm Ginger Tea", emoji: "🫖", description: "Anti-inflammatory warmth that may ease cramps and nausea." },
  { title: "Supta Baddha Konasana", emoji: "🌺", description: "Supported reclined pose promoting pelvic relaxation." },
  { title: "Cat–Cow (Gentle)", emoji: "🐈", description: "Soft spinal motion improving blood flow and tension relief." },
  { title: "Heating Pad Ritual", emoji: "🔥", description: "Local warmth improves uterine blood flow and reduces cramping." },
  { title: "Slow Belly Breathing", emoji: "🌬️", description: "Activates parasympathetic calm and reduces pain perception." },
  { title: "Turmeric Milk", emoji: "🥛", description: "Curcumin may reduce inflammation and muscle soreness." },
  { title: "Legs Supported Rest", emoji: "🛌", description: "Elevated rest reduces fatigue and pelvic heaviness." },
  { title: "Pawanmuktasana Series", emoji: "🌙", description: "Traditional joint release movements reducing stiffness." },
  { title: "Warm Sesame Oil Massage", emoji: "🪔", description: "Improves circulation and provides grounding comfort." },
  { title: "Yoga Nidra Rest", emoji: "💤", description: "Deep nervous system recovery helpful during fatigue-heavy days." },
];

/* ---------------- OTHER PHASE POOLS ---------------- */

const follicularRemedies: Remedy[] = [
  { title: "Creative Movement", emoji: "✨", description: "Use rising energy for exploration and learning." },
  { title: "Sun Salute Lite", emoji: "🌞", description: "Gentle energizing sequence boosting circulation." },
  { title: "Cooling Breath", emoji: "🌬️", description: "Balances temperature and emotional stability." },
];

const lutealRemedies: Remedy[] = [
  { title: "Slow Stretching", emoji: "🌾", description: "Helps reduce PMS tension and irritability." },
  { title: "Evening Walk", emoji: "🚶‍♀️", description: "Light movement stabilizes mood and reduces bloating." },
  { title: "Grounding Journaling", emoji: "📓", description: "Externalizing thoughts may reduce emotional overwhelm." },
];

const ovulationRemedies: Remedy[] = [
  { title: "Dance Freely", emoji: "💃", description: "Channel peak energy into joyful expression." },
  { title: "Hydration Ritual", emoji: "💧", description: "Supports metabolic and hormonal stability." },
  { title: "Outdoor Sunlight", emoji: "🌤️", description: "Improves serotonin and vitality." },
];

interface ExercisesBlockProps {
  currentPhase: string;
}

export function ExercisesBlock({ currentPhase }: ExercisesBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ---------- daily random selection ---------- */

  const remedies = useMemo(() => {
    const pickRandom = (arr: Remedy[], n: number) =>
      [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

    if (currentPhase === "Period") return pickRandom(periodRemedies, 3);
    if (currentPhase === "Follicular") return follicularRemedies;
    if (currentPhase === "Luteal") return lutealRemedies;
    return ovulationRemedies;
  }, [currentPhase]);

  const currentRemedy = remedies[currentIndex];

  const handleNext = () =>
    setCurrentIndex((i) => (i + 1) % remedies.length);

  const handlePrev = () =>
    setCurrentIndex((i) => (i - 1 + remedies.length) % remedies.length);

  return (
    <>
      {/* CARD */}
      <motion.div
        className="rounded-[2rem] p-[1px] cursor-pointer"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
        }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
      >
        <div className="rounded-[2rem] p-6 backdrop-blur-md bg-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <div>
              <p className="text-sm text-white">Remedies & Care</p>
              <p className="text-xs opacity-70 text-white">
                Gentle Indian comfort
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backdropFilter: "blur(8px)", background: "rgba(20,10,30,0.7)" }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="rounded-[2rem] p-8 w-full max-w-sm bg-white/10 backdrop-blur-xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-white"
              >
                <X />
              </button>

              <div className="text-center space-y-5">
                <div className="text-7xl">{currentRemedy.emoji}</div>

                <h3 className="text-2xl text-yellow-200">
                  {currentRemedy.title}
                </h3>

                <p className="text-white opacity-90">
                  {currentRemedy.description}
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={handlePrev}>
                  <ChevronLeft />
                </button>
                <button onClick={handleNext}>
                  <ChevronRight />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
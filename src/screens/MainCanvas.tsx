import { useState, useEffect } from "react";
import { TopCycleBand } from "../components/TopCycleBand";
import { MoodBlock } from "../components/MoodBlock";
import { ExercisesBlock } from "../components/ExercisesBlock";
import { SakhiBlock } from "../components/SakhiBlock";
import { JournalPanel, type JournalEntry } from "../components/JournalPanel";
import { BreathingBlock } from "../components/BreathingBlock";
import { getUserProfile, getJournalHistory, setMood} from "../lib/memory";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  name: string;
  dob: string;
  lastPeriodStart: string;
  cycleLength: string;
  periodDuration: string;
  activityLogs: string[];
  periodHistory: string[];
}

export function MainCanvas() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [_isEditOpen, setIsEditOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    const [profile, history] = await Promise.all([
      getUserProfile(),
      getJournalHistory()
    ]);
    
    if (profile) setUserData(profile);
    if (history) {
      const revived = history.map((h: any) => ({
        ...h,
        date: new Date(h.created_at)
      }));
      setJournalEntries(revived);
    }
    setLoading(false);
  }

  const calculateCycleData = () => {
    if (!userData || !userData.lastPeriodStart) return null;

    const last = new Date(userData.lastPeriodStart);
    const today = new Date();
    
    // Fix NaN: Ensure dates are valid before math
    if (isNaN(last.getTime())) return null;

    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    const cycleLength = parseInt(userData.cycleLength) || 28;
    const periodDuration = parseInt(userData.periodDuration) || 5;
    
    // Normalized day in cycle (1 to cycleLength)
    const day = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    const ovulationDay = Math.floor(cycleLength / 2);

    let phase = "Follicular";
    if (day <= periodDuration) phase = "Period";
    else if (day < ovulationDay) phase = "Follicular";
    else if (day === ovulationDay) phase = "Ovulation";
    else phase = "Luteal";

    const daysToPeriod = cycleLength - day;
    const showLogPeriod = daysToPeriod <= 2 || phase === "Period";

    const getMoon = (d: number) => {
      if (d <= periodDuration) return "🌑";
      if (d < ovulationDay) return "🌓";
      if (d === ovulationDay) return "🌕";
      return "🌗";
    };

    const relativeDays = Array.from({ length: 7 }, (_, i) => {
      const offset = i - 3;
      const d = ((day + offset - 1 + cycleLength) % cycleLength) + 1;
      const date = new Date();
      date.setDate(today.getDate() + offset);
      return {
        label: offset === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
        moon: getMoon(d),
        isToday: offset === 0,
      };
    });

    return {
      phase,
      dayInPhase: day,
      userName: userData.name,
      relativeDays,
      showLogPeriod,
      counterValue: daysToPeriod <= 7 ? daysToPeriod : null,
      counterLabel: "Period" as const,
      phaseLabel: `${phase} phase`
    };
  };

  const cycleData = calculateCycleData();

  if (!isMounted || loading || !userData || !cycleData) {
    return <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">Connecting to Kamakhya...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-purple-950 relative overflow-x-hidden">
      <motion.div className="kamakhya-mandala-bg" animate={{ rotate: 360 }} transition={{ duration: 240, repeat: Infinity, ease: "linear" }} />
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <TopCycleBand
          cycleData={cycleData}
          onEditPeriod={() => setIsEditOpen(true)}
          onLogActivity={() => {/* Logic to add to activityLogs */}} 
          onLogPeriod={() => {/* Logic to mark start of period */}} 
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        <JournalPanel isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} entries={journalEntries} />

        <div className="grid grid-cols-2 gap-4">
          <MoodBlock onMoodLog={async (m,_f,t) => { await setMood(m, t); loadInitialData(); }} />
          <ExercisesBlock currentPhase={cycleData.phase} />
        </div>

        <BreathingBlock />

        <SakhiBlock onOpenJournal={() => setIsJournalOpen(true)} currentPhase={cycleData.phase} />
      </div>

      {/* Calendar Overlay Placeholder */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-purple-950/90 backdrop-blur-xl p-8"
          >
             <button onClick={() => setIsCalendarOpen(false)} className="absolute top-8 right-8 text-white text-2xl">✕</button>
             <h2 className="text-white text-3xl mb-8">Cycle History</h2>
             {/* Integrate your Calendar UI here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
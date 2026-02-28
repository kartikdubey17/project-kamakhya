import { useState, useEffect } from "react";
import { TopCycleBand } from "../components/TopCycleBand";
import { MoodBlock } from "../components/MoodBlock";
import { ExercisesBlock } from "../components/ExercisesBlock";
import { SakhiBlock } from "../components/SakhiBlock";
import { JournalPanel, type JournalEntry } from "../components/JournalPanel";
import { BreathingBlock } from "../components/BreathingBlock";
import { getUserProfile, getJournalHistory, updateUserSettings, setMood } from "../lib/memory";
import { motion } from "framer-motion";
import { X } from "lucide-react";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const todayDateString = new Date().toISOString().split("T")[0];

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
    if (!userData) return null;

    const last = new Date(userData.lastPeriodStart);
    const today = new Date();
    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    const cycleLength = parseInt(userData.cycleLength);
    const periodDuration = parseInt(userData.periodDuration);
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
      getMoon,
      counterValue: daysToPeriod <= 7 ? daysToPeriod : null,
      counterLabel: "Period" as const,
      phaseLabel: `${phase} phase`
    };
  };

  const cycleData = calculateCycleData();

  const handleMoodLog = async (mood: string, _feeling: string, tags: string[]) => {
    await setMood(mood, tags);
    loadInitialData(); // Refresh history from Supabase
  };

  if (!isMounted || loading || !userData || !cycleData) {
    return <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">Connecting to Kamakhya...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-purple-950 relative">
      <motion.div className="kamakhya-mandala-bg" animate={{ rotate: 360 }} transition={{ duration: 240, repeat: Infinity, ease: "linear" }} />
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <TopCycleBand
          cycleData={cycleData}
          onEditPeriod={() => setIsEditOpen(true)}
          onLogActivity={() => {}} 
          onLogPeriod={() => {}} 
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        <JournalPanel isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} entries={journalEntries} />

        <div className="grid grid-cols-2 gap-4">
          <MoodBlock onMoodLog={handleMoodLog} />
          <ExercisesBlock currentPhase={cycleData.phase} />
        </div>

        <BreathingBlock />

        <SakhiBlock onOpenJournal={() => setIsJournalOpen(true)} currentPhase={cycleData.phase} />
      </div>
      
      {/* ... Edit and Calendar modals remain same, but use updateUserSettings(form) on save ... */}
    </div>
  );
}
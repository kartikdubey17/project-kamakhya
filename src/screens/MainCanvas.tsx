import { useState, useEffect } from "react";
import { TopCycleBand } from "../components/TopCycleBand";
import { MoodBlock } from "../components/MoodBlock";
import { ExercisesBlock } from "../components/ExercisesBlock";
import { SakhiBlock } from "../components/SakhiBlock";
import { JournalPanel } from "../components/JournalPanel";
import { BreathingBlock } from "../components/BreathingBlock";
import { getTodayMemory } from "../lib/memory";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface UserData {
  name: string;
  dob: string;
  lastPeriodStart: string;
  cycleLength: string;
  periodDuration: string;
  activityLogs: string[]; // ISO Date strings
  periodHistory: string[]; // ISO Date strings
}

interface JournalEntry {
  date: Date;
  type: "mood" | "sakhi" | "ritual";
  content: string;
  tags?: string[];
}

export function MainCanvas({ userData }: { userData?: Partial<UserData> }) {
  // --- HYDRATION FIX ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // ---------------------

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const todayDateString = new Date().toISOString().split("T")[0];

  const safeUserData: UserData = {
    name: userData?.name ?? "Maya",
    dob: userData?.dob ?? "",
    lastPeriodStart: userData?.lastPeriodStart ?? new Date().toISOString(),
    cycleLength: userData?.cycleLength ?? "28",
    periodDuration: userData?.periodDuration ?? "5",
    activityLogs: userData?.activityLogs ?? [],
    periodHistory: userData?.periodHistory ?? [userData?.lastPeriodStart ?? new Date().toISOString()],
  };

  const [form, setForm] = useState<UserData>(safeUserData);

  useEffect(() => {
    const saved = localStorage.getItem("kamakhya_cycle");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("kamakhya_cycle", JSON.stringify(form));
  }, [form]);

  const calculateCycleData = () => {
    const last = new Date(form.lastPeriodStart);
    const today = new Date();

    const diff = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    const cycleLength = parseInt(form.cycleLength);
    const periodDuration = parseInt(form.periodDuration);

    const day = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    const ovulationDay = Math.floor(cycleLength / 2);

    let phase = "Follicular";
    if (day <= periodDuration) phase = "Period";
    else if (day < ovulationDay) phase = "Follicular";
    else if (day === ovulationDay) phase = "Ovulation";
    else phase = "Luteal";

    /* -------- COUNTER LOGIC -------- */

    let counterValue: number | null = null;
    let counterLabel: "Ovulation" | "Period" | null = null;
    let phaseLabel: string | null = null;

    const daysToOvulation = ovulationDay - day;
    const daysToPeriod = cycleLength - day;

    if (phase === "Period") {
      phaseLabel = "Period phase";
    } else if (daysToOvulation > 0 && daysToOvulation <= 7) {
      counterValue = daysToOvulation;
      counterLabel = "Ovulation";
    } else if (daysToPeriod > 0 && daysToPeriod <= 7) {
      counterValue = daysToPeriod;
      counterLabel = "Period";
    } else {
      phaseLabel = phase + " phase";
    }

    // Determine if Log Period button should show (<= 2 days before, or during predicted period)
    const showLogPeriod = daysToPeriod <= 2 || phase === "Period";

    const getMoon = (d: number) => {
      if (d <= periodDuration) return "🌑";
      if (d < ovulationDay - 3) return "🌒";
      if (d < ovulationDay) return "🌓";
      if (d === ovulationDay) return "🌕";
      if (d < ovulationDay + 4) return "🌖";
      if (d < cycleLength - 2) return "🌗";
      return "🌘";
    };

    const relativeDays = Array.from({ length: 7 }, (_, i) => {
      const offset = i - 3;
      const d = ((day + offset - 1 + cycleLength) % cycleLength) + 1;
      const date = new Date();
      date.setDate(today.getDate() + offset);

      const label =
        offset === 0
          ? "Today"
          : date.toLocaleDateString("en-US", { weekday: "short" });

      return {
        label,
        moon: getMoon(d),
        isToday: offset === 0,
      };
    });

    return {
      phase,
      dayInPhase: day,
      counterValue,
      counterLabel,
      phaseLabel,
      userName: form.name,
      relativeDays,
      showLogPeriod,
      getMoon, // Exported for the calendar to use
    };
  };

  const cycleData = calculateCycleData();

  const handleMoodLog = (m: string, _f: string, t: string[]) => {
    setJournalEntries([
      { date: new Date(), type: "mood", content: m, tags: t },
      ...journalEntries,
    ]);
  };

  const handleLogActivity = () => {
    if (!form.activityLogs.includes(todayDateString)) {
      setForm((prev) => ({
        ...prev,
        activityLogs: [...prev.activityLogs, todayDateString],
      }));
    }
  };

  const handleLogPeriod = () => {
    setForm((prev) => ({
      ...prev,
      lastPeriodStart: new Date().toISOString(),
      periodHistory: [...prev.periodHistory, todayDateString],
    }));
  };

  // NEW: Function to toggle activity for any specific date
  const toggleActivityLog = (targetDateString: string) => {
    setForm((prev) => {
      const logs = prev.activityLogs || [];
      const exists = logs.includes(targetDateString);
      return {
        ...prev,
        activityLogs: exists
          ? logs.filter((d) => d !== targetDateString) // Remove if exists
          : [...logs, targetDateString], // Add if doesn't exist
      };
    });
  };

  const today = getTodayMemory();

  const entries: JournalEntry[] = [
    ...today.journal.map((j: any) => ({
      date: new Date(j.time),
      type: "mood" as const,
      content: j.text,
    })),
    ...today.breathing.map((b: any) => ({
      date: new Date(b.time),
      type: "ritual" as const,
      content: "Completed a calming breathing ritual 🌙",
    })),
  ];

  /* -------- CALENDAR RENDER HELPER -------- */
  const renderCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const days = [];
    // Blanks before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10" />);
    }

    const lastPeriodDate = new Date(form.lastPeriodStart);
    const cycleLength = parseInt(form.cycleLength);
    const periodDuration = parseInt(form.periodDuration);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      // Adjust for local timezone to get correct YYYY-MM-DD string
      const dateString = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split("T")[0];
      const isFuture = dateObj > new Date(new Date().setHours(0,0,0,0)); // GREY OUT FUTURE DATES
      
      // Calculate projected cycle day for this specific calendar date
      const diff = Math.floor((dateObj.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
      
      const moonPhase = cycleData.getMoon(cycleDay);
      const isPeriodPredict = cycleDay <= periodDuration;
      const isLoggedActivity = form.activityLogs.includes(dateString);
      const isLoggedPeriod = form.periodHistory.includes(dateString);

      days.push(
        <div
          key={`day-${i}`}
          onClick={() => {
            if (!isFuture) toggleActivityLog(dateString);
          }}
          title={isFuture ? "" : "Click to log/unlog ❤️ Activity"}
          className={`relative w-10 h-10 flex flex-col items-center justify-center rounded-lg select-none ${
            isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer active:scale-95"
          } transition-all`}
        >
          <span className="text-xs text-purple-200 z-10">{i}</span>
          <span className="text-lg opacity-70 z-0 leading-none">{moonPhase}</span>
          
          {/* Indicators for Activity and Period */}
          <div className="absolute bottom-[-4px] flex gap-[2px]">
            {isLoggedActivity && <span className="text-[8px] animate-in zoom-in duration-200">❤️</span>}
            {(isLoggedPeriod || isPeriodPredict) && <span className="text-[8px]">🩸</span>}
          </div>
        </div>
      );
    }
    return days;
  };

  // --- HYDRATION FIX RETURN ---
  // If the component hasn't mounted in the browser yet, render nothing.
  // This prevents the server HTML (UTC time) from mismatching the client HTML (local time).
  if (!isMounted) return null;
  // ----------------------------

  return (
    <div className="min-h-screen p-6 bg-purple-950 relative">
      <motion.div
        className="kamakhya-mandala-bg"
        animate={{ rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
      />
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <TopCycleBand
          cycleData={cycleData}
          onEditPeriod={() => setIsEditOpen(true)}
          onLogActivity={handleLogActivity}
          onLogPeriod={handleLogPeriod}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        <JournalPanel
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          entries={entries}
        />

        <div className="grid grid-cols-2 gap-4">
          <MoodBlock onMoodLog={handleMoodLog} />
          <ExercisesBlock currentPhase={cycleData.phase} />
        </div>

        <BreathingBlock />

        <SakhiBlock
          onOpenJournal={() => setIsJournalOpen(true)}
          currentPhase={cycleData.phase}
        />
      </div>

      {/* --- EDIT PERIOD MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] p-8 space-y-6 bg-purple-900 relative">
            
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-purple-200 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-lg text-purple-100 text-center mt-2">
              Update your cycle details
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm text-purple-200 opacity-80">
                  When was your last period?
                </p>
                <input
                  type="date"
                  max={todayDateString} // RESTRICTS FUTURE DATES
                  value={form.lastPeriodStart.split("T")[0]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lastPeriodStart: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-purple-200 opacity-80">
                  How long did your period last?
                </p>
                <input
                  type="number"
                  value={form.periodDuration}
                  onChange={(e) =>
                    setForm({ ...form, periodDuration: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-purple-200 opacity-80">
                  What's your usual cycle length?
                </p>
                <input
                  type="number"
                  value={form.cycleLength}
                  onChange={(e) =>
                    setForm({ ...form, cycleLength: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white"
                />
              </div>
            </div>

            <button
              onClick={() => setIsEditOpen(false)}
              className="w-full py-3 rounded-full bg-pink-400 font-medium hover:bg-pink-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* --- CALENDAR MODAL --- */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-[2rem] p-6 space-y-6 bg-purple-900 border border-purple-700 shadow-2xl relative">
            
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-black/20 text-purple-200 hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center pr-8">
              <button 
                onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1))}
                className="p-2 text-purple-300 hover:text-white"
              >
                &larr;
              </button>
              <h3 className="text-lg font-semibold text-purple-100">
                {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1))}
                className="p-2 text-purple-300 hover:text-white"
              >
                &rarr;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs text-purple-400 font-medium">{day}</div>
              ))}
              {renderCalendarDays()}
            </div>

            <div className="flex gap-4 justify-center text-[10px] text-purple-300 pt-2 border-t border-purple-800 mt-2">
              <span className="flex items-center gap-1">🌑 Period</span>
              <span className="flex items-center gap-1">🌕 Ovulation</span>
              <span className="flex items-center gap-1">❤️ Activity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { TopCycleBand } from "../components/TopCycleBand";
import { MoodBlock } from "../components/MoodBlock";
import { ExercisesBlock } from "../components/ExercisesBlock";
import { SakhiBlock } from "../components/SakhiBlock";
import { JournalPanel } from "../components/JournalPanel";
import { BreathingBlock } from "../components/BreathingBlock";

interface UserData {
  name: string;
  dob: string;
  lastPeriodStart: string;
  cycleLength: string;
  periodDuration: string;
}

interface JournalEntry {
  date: Date;
  type: "mood" | "sakhi";
  content: string;
  tags?: string[];
}

export function MainCanvas({ userData }: { userData?: UserData }) {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const safeUserData: UserData = userData ?? {
    name: "Maya",
    dob: "",
    lastPeriodStart: new Date().toISOString(),
    cycleLength: "28",
    periodDuration: "5",
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
    };
  };

  const cycleData = calculateCycleData();

  const handleMoodLog = (m: string, _f: string, t: string[]) => {
    setJournalEntries([
      { date: new Date(), type: "mood", content: m, tags: t },
      ...journalEntries,
    ]);
  };

  return (
    <div className="min-h-screen p-6 bg-purple-950">
      <div className="max-w-2xl mx-auto space-y-6">
        <TopCycleBand
          cycleData={cycleData}
          onEditPeriod={() => setIsEditOpen(true)}
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

      <JournalPanel
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
      />

      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-8 space-y-6 bg-purple-900">
            <input
              type="date"
              value={form.lastPeriodStart.split("T")[0]}
              onChange={(e) =>
                setForm({
                  ...form,
                  lastPeriodStart: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white"
            />

            <input
              type="number"
              value={form.cycleLength}
              onChange={(e) =>
                setForm({ ...form, cycleLength: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white"
            />

            <input
              type="number"
              value={form.periodDuration}
              onChange={(e) =>
                setForm({ ...form, periodDuration: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white"
            />

            <button
              onClick={() => setIsEditOpen(false)}
              className="w-full py-3 rounded-full bg-pink-400"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
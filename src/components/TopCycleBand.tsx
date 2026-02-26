import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

interface RelativeDay {
  label: string;
  moon: string;
  isToday: boolean;
}

interface CycleData {
  phase: string;
  dayInPhase: number;
  counterValue: number | null;
  counterLabel: "Ovulation" | "Period" | null;
  phaseLabel: string | null;
  userName: string;
  relativeDays: RelativeDay[];
}

interface TopCycleBandProps {
  cycleData: CycleData;
  onEditPeriod: () => void;
}

export function TopCycleBand({ cycleData, onEditPeriod }: TopCycleBandProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] p-8 mb-6"
      
      style={{
        background:
          "linear-gradient(135deg, var(--kamakhya-plum), var(--kamakhya-lavender))",
      }}
    >
      <img
        src="/lotus.png"
        className="absolute left-1/2 -translate-x-1/2 bottom-[-120px] w-[700px] pointer-events-none select-none opacity-25"
        style={{
          filter:
            "invert(1) sepia(0.35) saturate(0.7) hue-rotate(330deg) brightness(0.9)blur(0.4px)",
        }}
      />
      {/* ambient glow */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--kamakhya-rose) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full scale-[1.12] origin-top">
        {/* greeting */}
        <div className="flex justify-between items-start -mt-1">
          <div className="pl-3 pt-1">
            <p
              className="text-sm"
              style={{ color: "var(--kamakhya-moon-glow)" }}
            >
              Greetings, {cycleData.userName}
            </p>

            <p
              className="text-base mt-[2px]"
              style={{ color: "var(--kamakhya-text-soft)" }}
            >
              {cycleData.phase} · Day {cycleData.dayInPhase}
            </p>
          </div>

          <button
            onClick={onEditPeriod}
            className="flex items-center gap-2 px-5 py-2 mr-2 -mt-1 rounded-full backdrop-blur-md border
                      hover:scale-[1.03] transition-all"
            style={{
              background: "rgba(255,255,255,0.16)",
              borderColor: "rgba(255,255,255,0.25)",
              color: "var(--kamakhya-text-soft)",
            }}
          >
            <Edit3 className="w-4 h-4 opacity-80" />
            <span className="text-xs tracking-wide">Edit period</span>
          </button>
        </div>

        {/* counter OR phase label */}
        <div className="text-center -mt-1">
          {cycleData.counterValue !== null ? (
            <>
              <p
                className="text-7xl font-semibold"
                style={{ color: "var(--kamakhya-moon-glow)" }}
              >
                {cycleData.counterValue}
              </p>

              <p
                className="text-sm"
                style={{ color: "var(--kamakhya-text-soft)" }}
              >
                Days Until {cycleData.counterLabel}
              </p>
            </>
          ) : (
            <p
              className="text-lg mt-6"
              style={{ color: "var(--kamakhya-text-soft)" }}
            >
              {cycleData.phaseLabel}
            </p>
          )}
        </div>

        {/* moon strip */}
        <div className="flex justify-center gap-4 mt-5 pb-1">
          {cycleData.relativeDays.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p
                className="text-[10px] mb-1"
                style={{
                  color: d.isToday
                    ? "var(--kamakhya-moon-glow)"
                    : "var(--kamakhya-text-soft)",
                }}
              >
                {d.label}
              </p>

              <div className="relative w-11 h-11 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/20" />
                <div className="absolute inset-1 rounded-full border border-white/10" />

                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: d.isToday
                      ? "var(--kamakhya-rose)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  {d.moon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
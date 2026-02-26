import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logBreathingSession } from "../lib/memory";

export function BreathingBlock() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [count, setCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    if (count >= 10) {
      logBreathingSession("guided-breathing");
      setFinished(true);
      setIsActive(false);
      return;
    }

    const duration = phase === "in" ? 3000 : 5000;

    const timer = setTimeout(() => {
      if (phase === "out") setCount((c) => c + 1);
      setPhase((p) => (p === "in" ? "out" : "in"));
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, phase, count]);

  const start = () => {
    setIsActive(true);
    setFinished(false);
    setPhase("in");
    setCount(0);
  };

  const stop = () => {
    setIsActive(false);
    setFinished(false);
    setCount(0);
    setPhase("in");
  };

  return (
    <>
      {/* small trigger card */}
      <motion.div
        onClick={start}
        whileHover={{ scale: 1.02 }}
        className="rounded-[2rem] p-[1px] cursor-pointer"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
        }}
      >
        <div
          className="rounded-[2rem] p-6 backdrop-blur-md text-center"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-sm opacity-80"
            style={{ color: "var(--kamakhya-text-soft)" }}
          >
            Let’s pause for a moment
          </p>

          <p
            className="text-xs mt-1 opacity-60"
            style={{ color: "var(--kamakhya-text-soft)" }}
          >
            Gentle guided breathing
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {(isActive || finished) && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              backdropFilter: "blur(12px)",
              background:
                "linear-gradient(to bottom, rgba(20,10,30,0.95) 0%, rgba(20,10,30,0.7) 40%, rgba(20,10,30,0.6) 100%)"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 🌙 giant faint mandala halo */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundImage: "url('/mandala.svg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "800px",
                opacity: 0.08,
                
              }}
            />

            {/* breathing content */}
            <motion.div
              className="relative z-10 rounded-[2rem] p-10 text-center space-y-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {!finished ? (
                <>
                  <motion.div
                    animate={{
                      scale: phase === "in" ? 1.3 : 0.9,
                    }}
                    transition={{
                      duration: phase === "in" ? 3 : 5,
                      ease: "easeInOut",
                    }}
                    className="w-32 h-32 rounded-full mx-auto"
                    style={{ background: "var(--kamakhya-rose)" }}
                  />

                  <p
                    className="text-lg"
                    style={{ color: "var(--kamakhya-text-soft)" }}
                  >
                    Breathe {phase === "in" ? "in…" : "out…"}
                  </p>

                  <p
                    className="text-xs opacity-60"
                    style={{ color: "var(--kamakhya-text-soft)" }}
                  >
                    Cycle {count + 1} / 10
                  </p>

                  <button
                    onClick={stop}
                    className="mt-4 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm"
                    style={{ color: "var(--kamakhya-text-soft)" }}
                  >
                    Pause & Return
                  </button>
                </>
              ) : (
                <>
                  <p
                    className="text-lg"
                    style={{ color: "var(--kamakhya-moon-glow)" }}
                  >
                    You may feel calmer now 🌙
                  </p>

                  <button
                    onClick={() => setFinished(false)}
                    className="px-6 py-2 rounded-full bg-white/10"
                    style={{ color: "var(--kamakhya-text-soft)" }}
                  >
                    Return
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
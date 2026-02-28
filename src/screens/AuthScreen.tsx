import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export function AuthScreen({ }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // Logic for OTP/Magic Link
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // window.location.origin ensures it works on local and deployed Vercel links
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setStatus("success");
    } catch (error: any) {
      console.error("Auth Error:", error);
      setStatus("error");
      // This often catches the "Failed to fetch" if the URL/Key in supabase.ts is wrong
      setErrorMessage(error.message || "Failed to reach Kamakhya. Please check your connection.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{
        background:
          "linear-gradient(135deg, var(--kamakhya-deep-plum) 0%, var(--kamakhya-plum) 50%, var(--kamakhya-soft-lavender) 100%)",
      }}
    >
      <div className="kamakhya-mandala-bg" />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4"
          >
            🌙
          </motion.div>

          <h1
            className="text-3xl mb-2 tracking-wide"
            style={{ color: "var(--kamakhya-moon-glow)" }}
          >
            Kamakhya
          </h1>

          <p
            className="text-sm opacity-90"
            style={{ color: "var(--kamakhya-text-soft)" }}
          >
            Your menstrual emotional wellbeing companion
          </p>
        </div>

        {status === "success" ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-4"
          >
            <p className="text-lg" style={{ color: "var(--kamakhya-moon-glow)" }}>✨ Magic link sent</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--kamakhya-text-soft)" }}>
              Check <strong>{email}</strong> for your entry link. It might take a minute to arrive in your inbox or spam.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 
                           focus:outline-none focus:border-white/40 transition-all placeholder-white/40 text-center"
                style={{ color: "var(--kamakhya-text-soft)" }}
                required
              />
            </div>

            {status === "error" && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-center text-red-300 bg-red-500/10 py-2 rounded-lg"
              >
                {errorMessage}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 
                         hover:bg-white/30 transition-all disabled:opacity-50 font-medium"
              style={{ color: "var(--kamakhya-moon-glow)" }}
            >
              {status === "loading" ? "Summoning..." : "Enter Kamakhya"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
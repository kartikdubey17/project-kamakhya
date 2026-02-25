import { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthScreenProps {
  onSubmit: (email: string) => void;
}

export function AuthScreen({ onSubmit }: AuthScreenProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, var(--kamakhya-deep-plum) 0%, var(--kamakhya-plum) 50%, var(--kamakhya-soft-lavender) 100%)'
      }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl mb-4"
          >
            🌙
          </motion.div>
          <h1 className="text-3xl mb-2 tracking-wide" style={{ color: 'var(--kamakhya-moon-glow)' }}>
            Project Kamakhya
          </h1>
          <p className="text-sm opacity-90" style={{ color: 'var(--kamakhya-text-soft)' }}>
            Your menstrual wellbeing companion
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 
                         focus:outline-none focus:border-white/40 transition-all"
              style={{ 
                color: 'var(--kamakhya-text-soft)',
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 
                       hover:bg-white/30 transition-all"
            style={{ color: 'var(--kamakhya-moon-glow)' }}
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-center mt-8 opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>
          A safe space for cycle awareness and emotional wellbeing
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-center mb-2 opacity-80" style={{ color: 'var(--kamakhya-text-soft)' }}>
            Try demo account
          </p>
          <p className="text-xs text-center opacity-60" style={{ color: 'var(--kamakhya-text-soft)' }}>
            demo@kamakhya.app
          </p>
        </div>
      </motion.div>
    </div>
  );
}
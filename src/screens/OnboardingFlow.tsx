import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface OnboardingData {
  name: string;
  dob: string;
  lastPeriodStart: string;
  cycleLength: string;
  periodDuration: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    dob: '',
    lastPeriodStart: '',
    cycleLength: '28',
    periodDuration: '5',
  });

  const questions = [
    {
      question: "What would you like me to call you?",
      field: 'name' as keyof OnboardingData,
      type: 'text',
      placeholder: 'Your name',
    },
    {
      question: "When were you born?",
      field: 'dob' as keyof OnboardingData,
      type: 'date',
      placeholder: '',
    },
    {
      question: "When did your last period start?",
      field: 'lastPeriodStart' as keyof OnboardingData,
      type: 'date',
      placeholder: '',
    },
    {
      question: "How long is your typical cycle?",
      field: 'cycleLength' as keyof OnboardingData,
      type: 'number',
      placeholder: '28 days',
    },
    {
      question: "How many days does your period usually last?",
      field: 'periodDuration' as keyof OnboardingData,
      type: 'number',
      placeholder: '5 days',
    },
  ];

  const currentQuestion = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, var(--kamakhya-deep-plum) 0%, var(--kamakhya-plum) 50%, var(--kamakhya-soft-lavender) 100%)'
      }}>
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-5xl mb-6"
          >
            ✨
          </motion.div>
          <p className="text-sm opacity-80" style={{ color: 'var(--kamakhya-text-soft)' }}>
            Sakhi is learning about you...
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <p className="text-xl mb-6 text-center leading-relaxed" 
                 style={{ color: 'var(--kamakhya-moon-glow)' }}>
                {currentQuestion.question}
              </p>

              <input
                type={currentQuestion.type}
                value={data[currentQuestion.field]}
                onChange={(e) => updateData(currentQuestion.field, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 
                           focus:outline-none focus:border-white/40 transition-all text-center"
                style={{ 
                  color: 'var(--kamakhya-text-soft)',
                }}
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: idx === step ? '32px' : '12px',
                      background: idx <= step ? 'var(--kamakhya-rose)' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!data[currentQuestion.field]}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md 
                           border border-white/30 hover:bg-white/30 transition-all disabled:opacity-40"
                style={{ color: 'var(--kamakhya-moon-glow)' }}
              >
                {step === questions.length - 1 ? 'Begin' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

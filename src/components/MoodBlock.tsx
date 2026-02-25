import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';
import { addJournalEntry, setMood } from "../lib/memory";

interface MoodBlockProps {
  onMoodLog: (mood: string, feeling: string, tags: string[]) => void;
}

const moods = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😢', label: 'Difficult' },
];

const emotionalTags = [
  'cramps','headache','bloating','tired','energetic',
  'happy','anxious','peaceful','irritable','focused',
  'emotional','calm','restless','creative','social',
];

export function MoodBlock({ onMoodLog }: MoodBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feeling, setFeeling] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setIsExpanded(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!selectedMood) return;

    /* store mood */
    setMood(selectedMood);

    /* store reflection */
    if (feeling.trim()) {
      addJournalEntry(feeling);
    }

    /* keep your existing flow */
    onMoodLog(selectedMood, feeling, selectedTags);

    setIsExpanded(false);
    setSelectedMood(null);
    setFeeling('');
    setSelectedTags([]);
  };

  return (
    <>
      <div
        className="rounded-[2rem] p-[1px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
        }}
      >
        <motion.div
          className="rounded-[2rem] p-6 cursor-pointer backdrop-blur-md"
          style={{
            background:
              "linear-gradient(135deg, var(--kamakhya-rose) 0%, var(--kamakhya-warm-rose) 100%)",
          }}
          whileHover={{ scale: 1.02 }}
        >
          <p
            className="text-sm mb-4 opacity-90"
            style={{ color: "var(--kamakhya-text-soft)" }}
          >
            How are you feeling?
          </p>

          <div className="flex justify-between gap-2">
            {moods.map((mood) => (
              <motion.button
                key={mood.label}
                onClick={() => handleMoodSelect(mood.label)}
                className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">{mood.emoji}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(30, 20, 40, 0.7)' }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl p-8 relative"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, var(--kamakhya-plum) 0%, var(--kamakhya-lavender) 100%)',
              }}
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                style={{ color: 'var(--kamakhya-text-soft)' }}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <p className="text-lg mb-4" style={{ color: 'var(--kamakhya-moon-glow)' }}>
                    I'm feeling {selectedMood?.toLowerCase()}
                  </p>

                  <textarea
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    placeholder="Tell me more about how you're feeling..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 resize-none"
                    style={{ color: 'var(--kamakhya-text-soft)', minHeight: 100 }}
                  />
                </div>

                <div>
                  <p className="text-sm mb-3 opacity-80" style={{ color: 'var(--kamakhya-text-soft)' }}>
                    What else are you experiencing?
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {emotionalTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-4 py-2 rounded-full text-xs transition-all"
                        style={{
                          background: selectedTags.includes(tag)
                            ? 'var(--kamakhya-rose)'
                            : 'rgba(255,255,255,0.15)',
                          color: 'var(--kamakhya-text-soft)',
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-full bg-white/20"
                  style={{ color: 'var(--kamakhya-moon-glow)' }}
                >
                  Save mood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
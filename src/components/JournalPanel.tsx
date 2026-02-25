import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';

interface JournalEntry {
  date: Date;
  type: 'mood' | 'sakhi';
  content: string;
  tags?: string[];
}

interface JournalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

export function JournalPanel({ isOpen, onClose, entries }: JournalPanelProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(30, 20, 40, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, var(--kamakhya-plum) 0%, var(--kamakhya-deep-plum) 100%)',
            }}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl mb-1" style={{ color: 'var(--kamakhya-moon-glow)' }}>
                    My Journal
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>
                    Your reflections and memories
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center
                             hover:bg-white/30 transition-all"
                  style={{ color: 'var(--kamakhya-text-soft)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>
                      Your journal entries will appear here
                    </p>
                  </div>
                ) : (
                  entries.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span 
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            background: entry.type === 'mood' 
                              ? 'var(--kamakhya-rose)' 
                              : 'var(--kamakhya-lavender)',
                            color: 'var(--kamakhya-deep-plum)',
                          }}
                        >
                          {entry.type === 'mood' ? 'Mood Log' : 'Sakhi Chat'}
                        </span>
                        <span className="text-xs opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>
                          {formatDate(entry.date)}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--kamakhya-text-soft)' }}>
                        {entry.content}
                      </p>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'var(--kamakhya-text-soft)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

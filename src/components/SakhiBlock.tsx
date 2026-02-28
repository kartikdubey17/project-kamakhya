import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from 'lucide-react';
import { getTodayMemory } from "../lib/memory";
import { createPortal } from 'react-dom';

interface Message {
  role: 'sakhi' | 'user';
  text: string;
  timestamp: Date;
}

interface SakhiBlockProps {
  onOpenJournal: () => void;
  currentPhase: string;
}

export function SakhiBlock({ onOpenJournal, currentPhase }: SakhiBlockProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);   // ⭐ NEW
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ---------- LOAD CHAT MEMORY ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("sakhi_messages");

    if (saved) {
      const parsed = JSON.parse(saved);
      const revived = parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(revived);
    } else {
      setMessages([
        {
          role: 'sakhi',
          text: 'Hi, how can I help you today?',
          timestamp: new Date(),
        },
      ]);
    }

  }, []);
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isExpanded]);

  /* ---------- SAVE CHAT MEMORY ---------- */
  useEffect(() => {
    if (messages.length) {
      localStorage.setItem("sakhi_messages", JSON.stringify(messages));
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    'Plan your day',
    'Share something',
    currentPhase === 'Period'
      ? 'I need comfort today'
      : 'How should I nurture myself?',
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;

    const newMessage: Message = {
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    const today = getTodayMemory();

    const context = {
      mood: today.mood?.value ?? null,
      reflection: today.journal.at(-1)?.text ?? null,
      breathingDone: today.breathing.length > 0,
    };

    try {
      const res = await fetch("https://project-kamakhya.vercel.app/api/sakhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          phase: currentPhase,
          history: messages.slice(-6),
          context,
        })
      });

      const data = await res.json();

      const sakhiReply: Message = {
        role: 'sakhi',
        text: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, sakhiReply]);
    } catch (err) {
      const fallback: Message = {
        role: 'sakhi',
        text: "I'm here, but something feels quiet on my side. Try again gently.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallback]);
    }
  };

  const ChatContent = (
    <>
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-xl" style={{ color: 'var(--kamakhya-moon-glow)' }}>
            Sakhi
          </h3>
          <p className="text-xs opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>
            Your emotional companion
          </p>
        </div>

        {isExpanded ? (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full bg-white/10"
            style={{ color: 'var(--kamakhya-text-soft)' }}
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={onOpenJournal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20"
            style={{ color: 'var(--kamakhya-text-soft)' }}
          >
            <BookOpen size={16} />
            <span className="text-xs">My Journal</span>
          </button>
        )}
      </div>

      <div className={`space-y-3 mb-5 overflow-y-auto pr-1 ${isExpanded ? "flex-1" : "max-h-56"}`}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed"
              style={{
                color: 'var(--kamakhya-text-soft)',
                background:
                  msg.role === 'sakhi'
                    ? 'rgba(255,255,255,0.12)'
                    : 'var(--kamakhya-rose)',
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(s);
              setIsExpanded(true);   // ⭐ auto expand on suggestion
            }}
            className="px-3 py-1.5 rounded-full text-xs bg-white/10 border border-white/10"
            style={{ color: 'var(--kamakhya-text-soft)' }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onFocus={() => setIsExpanded(true)}   // ⭐ expand on focus
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 outline-none"
          style={{ color: 'var(--kamakhya-text-soft)' }}
          placeholder="Talk to Sakhi..."
        />

        <button
          onClick={handleSend}
          className="px-6 py-3 rounded-full bg-white/10 border border-white/20"
          style={{ color: 'var(--kamakhya-moon-glow)' }}
        >
          Send
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Normal Block */}
      <div
        className="rounded-[2rem] p-8 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          minHeight: 400,
        }}
      >
        {ChatContent}
      </div>

      {/* Fullscreen Overlay - MOVED TO PORTAL */}
      {/* Make sure createPortal is wrapping everything! */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex justify-center"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <motion.div
                key="modal"
                // Starts tiny and pushed down toward where the input box is
                initial={{ scale: 0.1, y: 150, opacity: 0 }} 
                // Expands to full size in place
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                // Shrinks back down into the input box
                exit={{ scale: 0.1, y: 150, opacity: 0 }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl h-[92vh] my-[4vh] rounded-[2rem] flex flex-col px-6 pt-6 pb-8"
                style={{
                  background: "rgba(45, 10, 74, 0.98)",
                  // THIS is the magic line that makes it grow from the bottom like a funnel!
                  transformOrigin: "bottom center" 
                }}
              >
                {ChatContent}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body // This is the second argument to createPortal, placed correctly now!
      )}
    </>
  );
}
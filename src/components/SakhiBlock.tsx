import { useState, useEffect, useRef } from 'react';
import { BookOpen, X, Send } from 'lucide-react';
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

interface Message {
  role: 'sakhi' | 'user';
  text: string;
  timestamp: Date;
}

interface SakhiBlockProps {
  onOpenJournal: () => void;
  currentPhase: string;
}

export function SakhiBlock({ onOpenJournal }: SakhiBlockProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);

  async function loadChatHistory() {
    const { data } = await supabase.from('sakhi_chats').select('*').order('created_at', { ascending: true });
    if (data && data.length > 0) {
      setMessages(data.map(m => ({ ...m, timestamp: new Date(m.created_at) })));
    } else {
      setMessages([{ role: 'sakhi', text: 'Hi, I am Sakhi. How are you feeling today?', timestamp: new Date() }]);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user' as const, text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    // ... Supabase logic here
  };

  return (
    <motion.div 
      layout
      className={`rounded-[2rem] overflow-hidden transition-all duration-500 ${
        isExpanded 
        ? "fixed inset-0 z-[60] bg-purple-950 flex flex-col p-6 h-screen w-screen" 
        : "relative bg-white/5 backdrop-blur-xl p-8 min-h-[400px]"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl text-white">Sakhi</h3>
          <p className="text-xs opacity-70 text-gray-300">Your emotional companion</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenJournal} className="p-2 rounded-full bg-white/10 text-white">
            <BookOpen size={20} />
          </button>
          {isExpanded && (
            <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full bg-white/10 text-white">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
              msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input 
          value={input} 
          onFocus={() => setIsExpanded(true)}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white outline-none" 
          placeholder="Talk to Sakhi..." 
        />
        <button onClick={handleSend} className="p-4 rounded-full bg-pink-500 text-white shadow-lg">
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
}
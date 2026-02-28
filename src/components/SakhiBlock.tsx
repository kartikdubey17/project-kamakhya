import { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from "../lib/supabase";

// Removed X and createPortal imports as they were unused
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
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  async function loadChatHistory() {
    const { data } = await supabase
      .from('sakhi_chats')
      .select('*')
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setMessages(data.map(m => ({ ...m, timestamp: new Date(m.created_at) })));
    } else {
      setMessages([{ role: 'sakhi', text: 'Hi, I am Sakhi. How are you feeling today?', timestamp: new Date() }]);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMessage = { role: 'user' as const, text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Save user message to Supabase
    await supabase.from('sakhi_chats').insert({ user_id: user.id, role: 'user', text: userMessage.text });

    try {
      const res = await fetch("/api/sakhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          phase: currentPhase,
          history: messages.slice(-5)
        })
      });

      const data = await res.json();
      const sakhiReply = { role: 'sakhi' as const, text: data.reply, timestamp: new Date() };
      
      setMessages(prev => [...prev, sakhiReply]);
      // Save Sakhi reply to Supabase
      await supabase.from('sakhi_chats').insert({ user_id: user.id, role: 'sakhi', text: sakhiReply.text });

    } catch (err) {
      console.error("Sakhi Error:", err);
    }
  };

  const ChatContent = (
    <>
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-xl" style={{ color: 'var(--kamakhya-moon-glow)' }}>Sakhi</h3>
          <p className="text-xs opacity-70" style={{ color: 'var(--kamakhya-text-soft)' }}>Your emotional companion</p>
        </div>
        <button onClick={onOpenJournal} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20" style={{ color: 'var(--kamakhya-text-soft)' }}>
          <BookOpen size={16} /><span className="text-xs">My Journal</span>
        </button>
      </div>

      <div className={`space-y-3 mb-5 overflow-y-auto pr-1 ${isExpanded ? "flex-1" : "max-h-56"}`}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="px-4 py-3 rounded-2xl max-w-[80%] text-sm" style={{ background: msg.role === 'sakhi' ? 'rgba(255,255,255,0.12)' : 'var(--kamakhya-rose)', color: 'var(--kamakhya-text-soft)' }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input value={input} onFocus={() => setIsExpanded(true)} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 outline-none text-white" placeholder="Talk to Sakhi..." />
        <button onClick={handleSend} className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white">Send</button>
      </div>
    </>
  );

  return (
    <div className="rounded-[2rem] p-8 relative overflow-hidden bg-white/5 backdrop-blur-xl" style={{ minHeight: 400 }}>
      {ChatContent}
    </div>
  );
}
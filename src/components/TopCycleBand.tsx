import { Edit3, Droplets } from "lucide-react";

export function TopCycleBand({ cycleData, onEditPeriod, onLogActivity, onLogPeriod, onOpenCalendar }: any) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] p-8 mb-6 bg-gradient-to-br from-plum to-lavender min-h-[300px]">
      {/* Background Decor */}
      <img src="/lotus.png" className="absolute left-1/2 -translate-x-1/2 bottom-[-100px] w-[600px] opacity-20 pointer-events-none" alt="Lotus" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-pink-200">Greetings, {cycleData.userName}</p>
            <p className="text-lg text-white/90 font-medium">{cycleData.phase} · Day {cycleData.dayInPhase}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={onEditPeriod} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 transition-all">
              <Edit3 size={14} /> Edit
            </button>
            <button 
              onClick={cycleData.showLogPeriod ? onLogPeriod : onLogActivity} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                cycleData.showLogPeriod ? "bg-red-500 text-white" : "bg-pink-500/30 text-white border border-pink-400/30"
              }`}
            >
              {cycleData.showLogPeriod ? <><Droplets size={14}/> Log Period</> : "❤️ Activity"}
            </button>
          </div>
        </div>

        <div className="text-center my-8">
          {cycleData.counterValue !== null ? (
            <div>
              <p className="text-8xl font-bold text-white leading-none">{cycleData.counterValue}</p>
              <p className="text-sm text-pink-200 mt-2">Days Until {cycleData.counterLabel}</p>
            </div>
          ) : (
            <p className="text-2xl text-white font-light">{cycleData.phaseLabel}</p>
          )}
        </div>

        {/* Moon Strip - Click opens calendar */}
        <div 
          onClick={onOpenCalendar}
          className="flex justify-center gap-3 mt-4 cursor-pointer group"
        >
          {cycleData.relativeDays.map((d: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center">
              <p className={`text-[10px] mb-2 ${d.isToday ? "text-pink-300 font-bold" : "text-white/50"}`}>{d.label}</p>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${d.isToday ? "bg-pink-500 shadow-lg" : "bg-white/10"}`}>
                {d.moon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
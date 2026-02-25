const KEY = "kamakhya_memory";

/* ---------- internal helpers ---------- */

function getAllMemory() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveAllMemory(memory: any) {
  localStorage.setItem(KEY, JSON.stringify(memory));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- core API ---------- */

export function getTodayMemory() {
  const memory = getAllMemory();
  const today = todayKey();

  if (!memory[today]) {
    memory[today] = {
      mood: null,
      journal: [],
      breathing: [],
      chatHighlights: []
    };
    saveAllMemory(memory);
  }

  return memory[today];
}

export function updateTodayMemory(update: any) {
  const memory = getAllMemory();
  const today = todayKey();

  memory[today] = {
    ...getTodayMemory(),
    ...update
  };

  saveAllMemory(memory);
}

/* ---------- feature helpers ---------- */

export function setMood(mood: string, intensity?: number) {
  updateTodayMemory({
    mood: {
      value: mood,
      intensity: intensity ?? null,
      time: Date.now()
    }
  });
}

export function addJournalEntry(text: string) {
  const today = getTodayMemory();

  updateTodayMemory({
    journal: [
      ...today.journal,
      {
        text,
        time: Date.now()
      }
    ]
  });
}

export function logBreathingSession(type = "grounding") {
  const today = getTodayMemory();

  updateTodayMemory({
    breathing: [
      ...today.breathing,
      {
        type,
        time: Date.now()
      }
    ]
  });
}

export function addChatHighlight(text: string) {
  const today = getTodayMemory();

  updateTodayMemory({
    chatHighlights: [
      ...today.chatHighlights,
      {
        text,
        time: Date.now()
      }
    ]
  });
}
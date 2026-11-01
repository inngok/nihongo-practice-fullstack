// TTS via backend proxy — downloads full MP3 as blob before playback.
// Completely eliminates Chrome buffer-underrun & GC audio cut-off.
import { API_BASE_URL } from '../config';

let activeAudio = null;
let activeUtterance = null;
const blobCache = new Map();
const MAX_CACHE = 300;

// ── helpers ─────────────────────────────────────────────────────────

export const cleanText = (raw) => {
  if (!raw) return '';
  let t = String(raw).trim();
  if (t.includes('/')) t = t.split('/')[0].trim();
  if (t.includes(';')) t = t.split(';')[0].trim();
  t = t.replace(/^\((.+)\)$/, '$1').trim();
  return t;
};

export const stopSpeech = () => {
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch (_) {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  activeUtterance = null;
  if (typeof window !== 'undefined') {
    window.__ttsAudio = null;
    window.__ttsUtterance = null;
  }
};

// ── SpeechSynthesis fallback (offline / backend down) ───────────────

let jaVoice = null;

const loadVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const pick = () => {
    const vs = window.speechSynthesis.getVoices();
    jaVoice = vs.find(v =>
      (v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang?.startsWith('ja'))
      && /Google|Natural|Premium|Nanami|Haruka|Ayumi/i.test(v.name)
    ) || vs.find(v => v.lang === 'ja-JP' || v.lang?.startsWith('ja')) || null;
  };
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
};
loadVoices();

const speakFallback = (text, rate = 0.9) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  // Chrome cancel() is async — wait before speak()
  setTimeout(() => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = rate;
      if (jaVoice) u.voice = jaVoice;
      activeUtterance = u;
      window.__ttsUtterance = u;
      u.onend = u.onerror = () => { activeUtterance = null; window.__ttsUtterance = null; };
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }, 80);
};

// ── Fetch full audio blob via backend (/api/tts) ────────────────────

const fetchAudioBlob = async (text) => {
  if (blobCache.has(text)) return blobCache.get(text);

  const url = `${API_BASE_URL}/tts?text=${encodeURIComponent(text)}&lang=ja`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TTS ${res.status}`);
  const blob = await res.blob();
  if (blob.size < 100) throw new Error('TTS empty');

  const blobUrl = URL.createObjectURL(blob);

  // Evict oldest if cache is full
  if (blobCache.size >= MAX_CACHE) {
    const firstKey = blobCache.keys().next().value;
    const old = blobCache.get(firstKey);
    if (old) URL.revokeObjectURL(old);
    blobCache.delete(firstKey);
  }
  blobCache.set(text, blobUrl);
  return blobUrl;
};

// ── Public API ──────────────────────────────────────────────────────

export const preloadJapaneseWord = (rawText) => {
  const text = cleanText(rawText);
  if (!text || blobCache.has(text)) return;
  // Fire-and-forget; errors are fine — playJapaneseWord will retry or fallback
  fetchAudioBlob(text).catch(() => {});
};

export const playJapaneseWord = async (rawText, rate = 0.9) => {
  const text = cleanText(rawText);
  if (!text) return;

  stopSpeech();

  try {
    const blobUrl = await fetchAudioBlob(text);
    const audio = new Audio(blobUrl);
    audio.playbackRate = rate;

    // Keep strong references so Chrome GC doesn't kill playback
    activeAudio = audio;
    window.__ttsAudio = audio;

    audio.onended = () => { activeAudio = null; window.__ttsAudio = null; };
    audio.onerror = () => {
      activeAudio = null;
      window.__ttsAudio = null;
      speakFallback(text, rate);
    };

    await audio.play();
  } catch (_) {
    // Backend unreachable or fetch failed → instant SpeechSynthesis
    speakFallback(text, rate);
  }
};

// Legacy alias
export { cleanText as cleanJapaneseText };

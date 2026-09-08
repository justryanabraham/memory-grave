import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shovel, Sparkles, HelpCircle, Check, Flame, Skull, Dices, Shield, AlertTriangle } from 'lucide-react';
import { GraveCategory, TombstoneStyle, TombstoneData } from '../types';
import { arcadeAudio } from '../utils/audio';
import { sanitizeInput, checkRateLimit, validateHoneypot } from '../utils/security';
import { generateSanctuaryResponse } from '../utils/responseGenerator';
import { BURIAL_DEPTH_OPTIONS, CAUSE_OF_DEATH_PRESETS, getCoronerCauseOfDeath, getGrimReaperTake } from '../utils/darkHumor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBury: (newGrave: TombstoneData) => void;
  existingCount: number;
}

const CATEGORIES: Array<{ id: GraveCategory; label: string; desc: string; icon: string }> = [
  { id: 'regret', label: 'PAST REGRET', desc: 'Things left unsaid or undone', icon: '🥀' },
  { id: 'failed_idea', label: 'FAILED BAD IDEA', desc: 'Doomed inventions & flopped startups', icon: '💡' },
  { id: 'cringe', label: 'CRINGE MEMORY', desc: '3 AM involuntary cringe replays', icon: '🫣' },
  { id: 'missed_chance', label: 'MISSED CHANCE', desc: 'Timing was off, roads not taken', icon: '🚂' },
  { id: 'financial_loss', label: 'FINANCIAL LOSS', desc: 'Bad crypto, meme stocks, cursed purchases', icon: '💸' },
  { id: 'career_blunder', label: 'CAREER BLUNDER', desc: 'Reply-alls, bad exits, office horror', icon: '💼' },
];

const TOMBSTONE_STYLES: Array<{ id: TombstoneStyle; label: string; border: string; bg: string }> = [
  { id: 'slate', label: 'Slate Gray', border: '#9ca3af', bg: '#374151' },
  { id: 'granite', label: 'Granite Slab', border: '#cbd5e1', bg: '#475569' },
  { id: 'neon', label: 'Cyber Neon', border: '#38bdf8', bg: '#082f49' },
  { id: 'crypt', label: 'Ancient Crypt', border: '#71717a', bg: '#27272a' },
  { id: 'gilded', label: 'Gilded Relic', border: '#fbbf24', bg: '#78350f' },
  { id: 'mossy', label: 'Mossy Ruins', border: '#4ade80', bg: '#14532d' },
];

export const BuryRegretModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBury,
  existingCount,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GraveCategory>('regret');
  const [style, setStyle] = useState<TombstoneStyle>('slate');
  const [epitaph, setEpitaph] = useState('');
  const [story, setStory] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [burialDepth, setBurialDepth] = useState('6ft');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRollCauseOfDeath = () => {
    arcadeAudio.playDiceRoll();
    const relevant = CAUSE_OF_DEATH_PRESETS.filter(p => !p.category || p.category === category);
    const pool = relevant.length > 0 ? relevant : CAUSE_OF_DEATH_PRESETS;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setCauseOfDeath(picked.label);
  };

  const handleRollEpitaph = () => {
    arcadeAudio.playDiceRoll();
    const funnyEpitaphs = [
      "Gone from my mind, but preserved here in 8-bit stone.",
      "A monument to the hubris of my younger self.",
      "May this blunder rest in peace and never wake up at 3 AM.",
      "Survived by 400 unsold dropshipping boxes.",
      "It seemed like a good idea after three cups of coffee.",
      "Killed by 'Let's just refactor everything on a Friday.'",
    ];
    setEpitaph(funnyEpitaphs[Math.floor(Math.random() * funnyEpitaphs.length)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Security: Anti-bot honeypot check
    if (!validateHoneypot(honeypot)) {
      console.warn("Automated bot submission detected via honeypot trap.");
      return;
    }

    // Security: Client-side rate limiting
    const rateCheck = checkRateLimit('bury_regret_action', 4, 60000);
    if (!rateCheck.allowed) {
      setRateLimitError(`Gravediggers are taking a union break! Please wait ${rateCheck.retryAfterSec}s.`);
      setTimeout(() => setRateLimitError(null), 4000);
      return;
    }

    const cleanTitle = sanitizeInput(title, 50);
    const cleanStory = sanitizeInput(story, 1200);
    const cleanEpitaph = sanitizeInput(epitaph, 100);
    const cleanCause = sanitizeInput(causeOfDeath, 120);

    if (!cleanTitle || !cleanStory) return;

    arcadeAudio.playBury();

    // Place near center of graveyard or offset by tiny amount
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 90;
    const worldX = Math.cos(angle) * distance;
    const worldY = Math.sin(angle) * distance;
    const resolvedYear = parseInt(year, 10) || new Date().getFullYear();

    const authorResponse = generateSanctuaryResponse({
      title: cleanTitle,
      category,
      epitaph: cleanEpitaph || 'Buried into the digital earth. Peace at last.',
      story: cleanStory,
      year: resolvedYear,
    });

    const finalCause = cleanCause || getCoronerCauseOfDeath(category, cleanTitle);
    const finalReaperTake = getGrimReaperTake(category, cleanTitle);

    const newGrave: TombstoneData = {
      id: `custom_grave_${Date.now()}`,
      col: Math.round(worldX / 104),
      row: Math.round(worldY / 90),
      worldX,
      worldY,
      title: cleanTitle,
      category,
      tombstoneStyle: style,
      epitaph: cleanEpitaph || 'Buried into the digital earth. Peace at last.',
      story: cleanStory,
      year: resolvedYear,
      causeOfDeath: finalCause,
      grimReaperTake: finalReaperTake,
      burialDepth,
      candles: 1, // first candle automatically lit!
      flowers: 0,
      dirtKicks: 0,
      userCandled: true,
      createdAt: 'Just now',
      authorResponse,
      isUserAuthor: true,
      tributes: [
        {
          id: `first_candle_${Date.now()}`,
          author: "Anonymous Soul",
          message: "A candle was lit upon burial. May you walk lighter now.",
          timestamp: "Just now",
          type: "candle",
        },
      ],
    };

    onBury(newGrave);
    onClose();

    // reset form
    setTitle('');
    setEpitaph('');
    setStory('');
    setCauseOfDeath('');
  };

  return (
    <AnimatePresence>
      <div 
        id="bury-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="bury-modal-dialog"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#0b0f17] border-2 sm:border-4 border-emerald-500 rounded-none shadow-[6px_6px_0px_#059669] text-[#e2e8f0] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#064e3b] border-b-2 sm:border-b-4 border-emerald-500">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-emerald-300 tracking-wider truncate">
                [DIG A PLOT • 1 COIN INSERTED]
              </span>
            </div>
            <button
              id="close-bury-modal-btn"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-emerald-400 hover:text-black transition-colors cursor-pointer touch-manipulation shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
            <div className="bg-[#111c18] border-2 border-emerald-800/80 p-3 text-emerald-300 text-xs font-mono">
              ★ 100% Anonymous Burial. Lay your burden into the soil of the digital memory crypt.
            </div>

            {/* Rate limit warning */}
            {rateLimitError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{rateLimitError}</span>
              </div>
            )}

            {/* Hidden honeypot field for bot deterrence */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="regret_routing_stamp">Do not fill this</label>
              <input
                id="regret_routing_stamp"
                type="text"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400 mb-2">
                NAME OF REGRET / BAD IDEA *
              </label>
              <input
                id="bury-title-input"
                required
                type="text"
                maxLength={45}
                placeholder="e.g. Bought $5,000 in Laserdiscs, Didn't Say I Love You..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#131a24] border-2 border-slate-700 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono min-h-[42px]"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400 mb-2">
                CHOOSE CATEGORY
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      arcadeAudio.playCategorySwitch(cat.id);
                      setCategory(cat.id);
                    }}
                    className={`p-2 sm:p-2.5 text-left border-2 transition-all cursor-pointer min-h-[44px] ${
                      category === cat.id
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-[2px_2px_0px_#10b981]'
                        : 'border-slate-800 bg-[#131a24] hover:border-slate-600'
                    }`}
                  >
                    <div className="text-base">{cat.icon}</div>
                    <div className="font-['Press_Start_2P'] text-[7.5px] sm:text-[8px] text-white mt-1">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Burial Depth & Shame Shield (Dark Humor Feature) */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <label className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400">
                  BURIAL DEPTH & SHAME SHIELD
                </label>
                <span className="text-[8.5px] font-mono text-slate-400">How deep to submerge this blunder?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {BURIAL_DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.depth}
                    type="button"
                    onClick={() => {
                      arcadeAudio.playDepthSelect(opt.depth);
                      setBurialDepth(opt.depth);
                    }}
                    className={`p-2.5 text-left border-2 transition-all cursor-pointer ${
                      burialDepth === opt.depth
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-[2px_2px_0px_#10b981]'
                        : 'border-slate-800 bg-[#131a24] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-['Press_Start_2P'] text-[7.5px] sm:text-[8px] text-amber-300">
                        {opt.name} ({opt.depth})
                      </span>
                      <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 border border-emerald-800">
                        {opt.shieldFactor}
                      </span>
                    </div>
                    <p className="font-mono text-[9.5px] text-slate-300 mt-1 leading-tight">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Coroner Cause of Demise (Dark Humor Feature) */}
            <div className="p-2.5 sm:p-3 bg-[#170e1a] border-2 border-purple-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="font-['Press_Start_2P'] text-[8.5px] sm:text-[9px] text-purple-300 flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-red-400" />
                  CORONER CAUSE OF DEATH
                </label>
                <button
                  type="button"
                  onClick={handleRollCauseOfDeath}
                  className="px-2 py-1 bg-purple-900 hover:bg-purple-800 border border-purple-400 text-purple-200 font-['Press_Start_2P'] text-[7px] sm:text-[7.5px] flex items-center gap-1 cursor-pointer min-h-[30px]"
                >
                  <Dices className="w-3 h-3" />
                  ROLL CAUSE
                </button>
              </div>
              <input
                id="bury-cause-of-death-input"
                type="text"
                maxLength={90}
                placeholder="e.g. Acute hubris, Sudden 3 AM revelation, Untested production deployment..."
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                className="w-full bg-[#0d0714] border border-purple-700 px-3 py-2 text-base sm:text-xs text-purple-100 focus:outline-none focus:border-purple-400 font-mono min-h-[40px]"
              />
            </div>

            {/* Tombstone Style Selector */}
            <div>
              <label className="block font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400 mb-2">
                TOMBSTONE MATERIAL
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {TOMBSTONE_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      arcadeAudio.playMaterialSelect();
                      setStyle(st.id);
                    }}
                    style={{ borderColor: style === st.id ? '#10b981' : st.border }}
                    className={`p-1.5 sm:p-2 flex flex-col items-center justify-center border-2 transition-all cursor-pointer min-h-[50px] ${
                      style === st.id ? 'bg-emerald-900/40 ring-2 ring-emerald-400' : 'bg-[#131a24]'
                    }`}
                  >
                    <div 
                      className="w-4 h-6 sm:w-5 sm:h-7 rounded-t-sm mb-1 border"
                      style={{ backgroundColor: st.bg, borderColor: st.border }}
                    />
                    <span className="font-mono text-[8px] sm:text-[9px] text-slate-300 text-center truncate w-full">
                      {st.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Epitaph with Auto-Roll Button */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <label className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400">
                  HEADSTONE EPITAPH (ONE-LINER)
                </label>
                <button
                  type="button"
                  onClick={handleRollEpitaph}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-['Press_Start_2P'] text-[7px] sm:text-[7.5px] flex items-center gap-1 cursor-pointer min-h-[28px]"
                >
                  <Dices className="w-2.5 h-2.5" />
                  RANDOM EPITAPH
                </button>
              </div>
              <input
                id="bury-epitaph-input"
                type="text"
                maxLength={90}
                placeholder="e.g. A lesson carved in heavy stone."
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                className="w-full bg-[#131a24] border-2 border-slate-700 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono min-h-[42px]"
              />
            </div>

            {/* Year & Confession */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="col-span-1">
                <label className="block font-['Press_Start_2P'] text-[8.5px] sm:text-[9px] text-emerald-400 mb-2">
                  YEAR
                </label>
                <input
                  id="bury-year-input"
                  type="number"
                  min="1950"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#131a24] border-2 border-slate-700 px-2 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono text-center min-h-[42px]"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-['Press_Start_2P'] text-[8.5px] sm:text-[9px] text-emerald-400 mb-2">
                  FIRST CANDLE
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-[#131a24] border-2 border-slate-700 px-2.5 py-2 text-amber-300 font-mono text-xs min-h-[42px]">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Free Memorial Flame Lit</span>
                </div>
              </div>
            </div>

            {/* The Confession / Story */}
            <div>
              <label className="block font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-400 mb-2">
                THE FULL BACKSTORY / CONFESSION *
              </label>
              <textarea
                id="bury-story-input"
                required
                rows={4}
                placeholder="What happened? Why did it hurt, embarrass, or amuse you? Unburden your mind completely..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full bg-[#131a24] border-2 border-slate-700 px-3 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-mono resize-none"
              />
            </div>

            {/* Submit Button & Privacy Assurance */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-[9.5px] font-mono text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/50 p-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero sign-in, completely anonymous. A solace response and words of release will be prepared for all visitors to read.</span>
              </div>

              <button
                id="submit-bury-grave-btn"
                type="submit"
                className="w-full py-3.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-black font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-wider border-2 border-white transition-all shadow-[5px_5px_0px_#047857] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 sm:gap-3 cursor-pointer min-h-[48px]"
              >
                <Shovel className="w-4 h-4 text-black shrink-0" />
                <span>CONSECRATE & BURY MEMORY</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

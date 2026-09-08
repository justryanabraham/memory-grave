import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Flower2, Heart, Volume2, Sparkles, Send, ShieldAlert, Calendar, ShieldCheck, Skull, GlassWater, AlertTriangle } from 'lucide-react';
import { TombstoneData, GraveCategory, TombstoneStyle, AuthorResponse } from '../types';
import { arcadeAudio } from '../utils/audio';
import { sanitizeInput, checkRateLimit } from '../utils/security';
import { generateSanctuaryResponse } from '../utils/responseGenerator';
import { getCoronerCauseOfDeath, getGrimReaperTake } from '../utils/darkHumor';

interface Props {
  grave: TombstoneData | null;
  isAuthor?: boolean;
  onClose: () => void;
  onLightCandle: (graveId: string) => void;
  onLeaveFlower: (graveId: string) => void;
  onAddTribute: (graveId: string, message: string) => void;
}

const CATEGORY_NAMES: Record<GraveCategory, string> = {
  regret: "PAST REGRET",
  failed_idea: "FAILED BAD IDEA",
  cringe: "CRINGE MOMENT",
  missed_chance: "MISSED CHANCE",
  career_blunder: "CAREER BLUNDER",
  financial_loss: "FINANCIAL LOSS",
};

export const TombstoneModal: React.FC<Props> = ({
  grave,
  isAuthor = false,
  onClose,
  onLightCandle,
  onLeaveFlower,
  onAddTribute,
}) => {
  const [tributeText, setTributeText] = useState('');
  const [flowerBurst, setFlowerBurst] = useState(false);
  const [candleBurst, setCandleBurst] = useState(false);
  const [pourBurst, setPourBurst] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  if (!grave) return null;

  const effectiveResponse: AuthorResponse = grave.authorResponse || generateSanctuaryResponse({
    title: grave.title,
    category: grave.category,
    epitaph: grave.epitaph,
    story: grave.story,
    year: grave.year,
  });

  const causeOfDeath = getCoronerCauseOfDeath(grave.category, grave.title, grave.causeOfDeath);
  const grimReaperTake = getGrimReaperTake(grave.category, grave.title, grave.grimReaperTake);

  const handleLightCandle = () => {
    const limit = checkRateLimit('candle_click', 8, 15000);
    if (!limit.allowed) {
      setRateLimitWarning(`Candle shortage! Wait ${limit.retryAfterSec}s before lighting more.`);
      setTimeout(() => setRateLimitWarning(null), 3000);
      return;
    }
    arcadeAudio.playCandle();
    setCandleBurst(true);
    onLightCandle(grave.id);
    setTimeout(() => setCandleBurst(false), 1200);
  };

  const handleLeaveFlower = () => {
    const limit = checkRateLimit('flower_click', 8, 15000);
    if (!limit.allowed) {
      setRateLimitWarning(`The florist is out of petals. Wait ${limit.retryAfterSec}s.`);
      setTimeout(() => setRateLimitWarning(null), 3000);
      return;
    }
    arcadeAudio.playFlower();
    setFlowerBurst(true);
    onLeaveFlower(grave.id);
    setTimeout(() => setFlowerBurst(false), 1200);
  };

  const handlePourOneOut = () => {
    const limit = checkRateLimit('pour_out', 5, 20000);
    if (!limit.allowed) {
      setRateLimitWarning(`Careful, you'll drown the cemetery! Wait ${limit.retryAfterSec}s.`);
      setTimeout(() => setRateLimitWarning(null), 3000);
      return;
    }
    arcadeAudio.playPourOneOut();
    setPourBurst(true);
    const quips = [
      "🫗 Poured one out. May this blunder decompose quietly.",
      "🫗 Poured one out. The ghost of this bad decision salutes you.",
      "🫗 Poured one out for the fallen idea.",
      "🫗 Poured one out. Gone, but definitely not missed.",
    ];
    const msg = quips[Math.floor(Math.random() * quips.length)];
    onAddTribute(grave.id, msg);
    setTimeout(() => setPourBurst(false), 1400);
  };

  const handleTributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = checkRateLimit('tribute_post', 4, 30000);
    if (!limit.allowed) {
      setRateLimitWarning(`Slow down, eulogist! Cooldown active for ${limit.retryAfterSec}s.`);
      setTimeout(() => setRateLimitWarning(null), 3500);
      return;
    }
    const cleanTribute = sanitizeInput(tributeText, 140);
    if (!cleanTribute) return;
    arcadeAudio.playCoin();
    onAddTribute(grave.id, cleanTribute);
    setTributeText('');
  };

  return (
    <AnimatePresence>
      <div 
        id="tombstone-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="tombstone-modal-dialog"
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#0f141c] border-2 sm:border-4 ${
            isAuthor ? 'border-emerald-400 shadow-[6px_6px_0px_#047857]' : 'border-[#38bdf8] shadow-[6px_6px_0px_#0284c7]'
          } rounded-none text-[#e2e8f0] overflow-hidden`}
        >
          {/* Retro Arcade Modal Header */}
          <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 sm:border-b-4 ${
            isAuthor ? 'bg-[#06241a] border-emerald-400' : 'bg-[#1e293b] border-[#38bdf8]'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {isAuthor ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <span className="font-['Press_Start_2P'] text-[10px] sm:text-sm text-emerald-300 tracking-wider truncate">
                    [YOUR BURIED MEMORY]
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2.5 h-2.5 bg-red-500 animate-ping rounded-full shrink-0" />
                  <span className="font-['Press_Start_2P'] text-[10px] sm:text-sm text-[#38bdf8] tracking-wider truncate">
                    [TOMBSTONE #{grave.col}_{grave.row}]
                  </span>
                </>
              )}
            </div>
            <button
              id="close-tombstone-modal-btn"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border-2 border-transparent hover:border-white cursor-pointer touch-manipulation shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
            {/* Visual Pixel Art Tombstone Monument */}
            <div className="flex flex-col items-center justify-center pt-2 pb-4">
              <div className="relative w-full max-w-sm flex flex-col items-center bg-[#18202f] border-4 border-[#64748b] rounded-t-full pt-8 pb-6 px-6 shadow-inner">
                {/* Decorative Stone Arch & Cross */}
                <div className="absolute top-3 text-slate-500 font-['Press_Start_2P'] text-[10px]">
                  † R.I.P. †
                </div>

                {/* Category Banner */}
                <span className="mt-4 px-3 py-1 bg-[#0284c7]/30 border border-[#38bdf8] font-['Press_Start_2P'] text-[9px] text-[#38bdf8] uppercase">
                  {CATEGORY_NAMES[grave.category] || grave.category}
                </span>

                {/* Memory Title */}
                <h2 className="mt-3 font-['Press_Start_2P'] text-sm sm:text-base text-center text-white leading-relaxed">
                  "{grave.title}"
                </h2>

                {/* Epitaph Quote */}
                <p className="mt-3 font-['VT323'] text-lg sm:text-xl text-center text-amber-200/90 italic">
                  "{grave.epitaph}"
                </p>

                {/* Year & Burial Date */}
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Era: {grave.year} • Buried in Crypt</span>
                </div>

                {/* Interactive Candles & Flowers row at base of stone */}
                <div className="mt-6 flex items-center justify-around w-full pt-4 border-t-2 border-dashed border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                      {candleBurst && (
                        <motion.span 
                          initial={{ y: 0, opacity: 1, scale: 0.5 }}
                          animate={{ y: -30, opacity: 0, scale: 1.5 }}
                          className="absolute -top-2 left-0 text-amber-300 font-['Press_Start_2P'] text-[10px]"
                        >
                          +1🕯️
                        </motion.span>
                      )}
                    </div>
                    <span className="font-['Press_Start_2P'] text-xs text-amber-300">
                      {grave.candles} Lit
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Flower2 className="w-5 h-5 text-pink-400" />
                      {flowerBurst && (
                        <motion.span 
                          initial={{ y: 0, opacity: 1, scale: 0.5 }}
                          animate={{ y: -30, opacity: 0, scale: 1.5 }}
                          className="absolute -top-2 left-0 text-pink-300 font-['Press_Start_2P'] text-[10px]"
                        >
                          +1🌸
                        </motion.span>
                      )}
                    </div>
                    <span className="font-['Press_Start_2P'] text-xs text-pink-300">
                      {grave.flowers} Laid
                    </span>
                  </div>
                </div>
              </div>

              {/* Stone Base pedestal */}
              <div className="w-full max-w-[26rem] h-4 bg-[#334155] border-x-4 border-b-4 border-[#64748b]" />
            </div>

            {/* Rate limit warning banner */}
            {rateLimitWarning && (
              <div className="flex items-center gap-2 p-2 bg-amber-950/70 border border-amber-500/80 text-amber-300 text-xs font-mono animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{rateLimitWarning}</span>
              </div>
            )}

            {/* Official Coroner's Verdict / Cause of Demise */}
            {causeOfDeath && (
              <div className="bg-[#1c0d12] border-2 border-red-500/70 p-3 shadow-[4px_4px_0px_#7f1d1d] relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-red-500/30 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span className="font-['Press_Start_2P'] text-[8.5px] text-red-400 tracking-wider">
                      [CORONER'S AUTOPSY & CAUSE OF DEMISE]
                    </span>
                  </div>
                  <span className="text-[7.5px] font-mono text-red-300 bg-red-950 px-1.5 py-0.5 border border-red-500/40">
                    MORTEM VERIFIED
                  </span>
                </div>
                <p className="font-mono text-xs text-red-200 leading-relaxed font-semibold">
                  "{causeOfDeath}"
                </p>
              </div>
            )}

            {/* Confession / Story Breakdown */}
            <div className="bg-[#131a26] border-2 border-[#1e293b] p-4">
              <h3 className="font-['Press_Start_2P'] text-xs text-emerald-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                THE UNBURDENED CONFESSION:
              </h3>
              <p className="font-['VT323'] text-xl leading-relaxed text-slate-200 whitespace-pre-line">
                {grave.story}
              </p>
            </div>

            {/* Grim Reaper / Caretaker's Dark Humour Post-Mortem */}
            {grimReaperTake && (
              <div className="bg-[#130f1f] border-2 border-purple-500/70 p-3.5 shadow-[4px_4px_0px_#581c87]">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-purple-500/30">
                  <span className="font-['Press_Start_2P'] text-[8.5px] text-purple-300 flex items-center gap-1.5">
                    <span>☠️</span>
                    THE CARETAKER'S POST-MORTEM TAKE:
                  </span>
                  <span className="font-mono text-[8px] text-purple-400">UNFILTERED</span>
                </div>
                <p className="font-['VT323'] text-xl text-purple-200 italic leading-relaxed">
                  "{grimReaperTake}"
                </p>
              </div>
            )}

            {/* Sanctuary Response & Healing Reflection - Visible to Everyone */}
            <div 
              id="sanctuary-response-card"
              className="bg-gradient-to-b from-[#0a1e1e] to-[#0d1620] border-2 border-emerald-400 p-4 shadow-[4px_4px_0px_#047857]"
            >
              <div className="flex flex-wrap items-center justify-between pb-2 border-b border-emerald-500/30 mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-emerald-300">
                    RESPONSE TO THIS CONFESSION:
                  </h3>
                </div>
                <span className="font-['Press_Start_2P'] text-[7.5px] sm:text-[8px] text-emerald-300 bg-emerald-950 px-2 py-1 border border-emerald-400/50 shrink-0">
                  SANCTUARY WORDS OF RELEASE
                </span>
              </div>

              <div className="space-y-3 font-mono text-slate-200">
                <p className="font-['VT323'] text-xl sm:text-2xl text-emerald-100 leading-relaxed">
                  "{effectiveResponse.message}"
                </p>

                {effectiveResponse.healingReflection && (
                  <div className="bg-[#051613] border-l-4 border-amber-400 p-3 mt-2">
                    <span className="font-['Press_Start_2P'] text-[8.5px] text-amber-300 block mb-1">
                      ✦ WORDS OF RELEASE:
                    </span>
                    <p className="font-['VT323'] text-lg text-amber-100 italic">
                      {effectiveResponse.healingReflection}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-800 font-mono">
                  <span>Conveyed by {effectiveResponse.responder}</span>
                  <span>Delivered: {effectiveResponse.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Action Tributes Buttons (Light Candle / Leave Flower / Pour One Out) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              <button
                id="light-candle-tribute-btn"
                onClick={handleLightCandle}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-1.5 sm:px-3 bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-['Press_Start_2P'] text-[7.5px] sm:text-[9px] tracking-wide transition-all shadow-[2px_2px_0px_#b45309] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer min-h-[44px]"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-center">CANDLE</span>
              </button>

              <button
                id="leave-flower-tribute-btn"
                onClick={handleLeaveFlower}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-1.5 sm:px-3 bg-pink-500/20 hover:bg-pink-500/30 border-2 border-pink-400 text-pink-300 font-['Press_Start_2P'] text-[7.5px] sm:text-[9px] tracking-wide transition-all shadow-[2px_2px_0px_#be185d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer min-h-[44px]"
              >
                <Flower2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="text-center">FLOWER</span>
              </button>

              <button
                id="pour-one-out-tribute-btn"
                onClick={handlePourOneOut}
                className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-1.5 sm:px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 font-['Press_Start_2P'] text-[7.5px] sm:text-[9px] tracking-wide transition-all shadow-[2px_2px_0px_#0891b2] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer min-h-[44px]"
              >
                <GlassWater className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-center">POUR OUT</span>
                {pourBurst && (
                  <motion.span 
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ y: -25, opacity: 0, scale: 1.4 }}
                    className="absolute -top-3 right-1 text-cyan-300 font-['Press_Start_2P'] text-[8px]"
                  >
                    +1🫗
                  </motion.span>
                )}
              </button>
            </div>

            {/* Anonymous Epitaph & Condolences Board */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className="font-['Press_Start_2P'] text-[8.5px] sm:text-[10px] text-[#38bdf8]">
                  VISITOR TRIBUTES & THOUGHTS ({grave.tributes.length})
                </h4>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400">Anonymous & Free</span>
              </div>

              {/* Form to leave a note */}
              <form onSubmit={handleTributeSubmit} className="flex gap-2">
                <input
                  id="anonymous-tribute-input"
                  type="text"
                  maxLength={140}
                  placeholder="Leave a word of comfort or 'F'..."
                  value={tributeText}
                  onChange={(e) => setTributeText(e.target.value)}
                  className="flex-1 bg-[#0b0f17] border-2 border-slate-700 px-3 py-2 text-base sm:text-sm text-slate-200 focus:outline-none focus:border-[#38bdf8] font-mono min-h-[42px]"
                />
                <button
                  id="submit-tribute-btn"
                  type="submit"
                  disabled={!tributeText.trim()}
                  className="px-3.5 sm:px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-['Press_Start_2P'] text-[9px] sm:text-[10px] border-2 border-[#38bdf8] flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed min-h-[42px] shrink-0"
                >
                  <Send className="w-3 h-3" />
                  POST
                </button>
              </form>

              {/* Tribute List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {grave.tributes.map((trib) => (
                  <div 
                    key={trib.id} 
                    className="p-2.5 bg-[#131a26] border border-slate-800 flex items-start gap-2.5"
                  >
                    <div className="text-sm">
                      {trib.type === 'candle' ? '🕯️' : trib.type === 'flower' ? '🌸' : '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">{trib.author}</span>
                        <span>{trib.timestamp}</span>
                      </div>
                      <p className="font-mono text-xs text-slate-300 mt-1 break-words">
                        {trib.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

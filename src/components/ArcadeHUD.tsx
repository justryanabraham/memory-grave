import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Flame,
  Flower2,
  Skull,
  Shovel,
  Sparkles,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { GraveCategory, CemeteryStats } from '../types';
import { arcadeAudio } from '../utils/audio';
import { CYNICAL_TICKER_QUIPS } from '../utils/darkHumor';

interface Props {
  stats: CemeteryStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeCategory: GraveCategory | null;
  onSelectCategory: (cat: GraveCategory | null) => void;
  onOpenBuryModal: () => void;
  onOpenMyPosts: () => void;
  myPostsCount: number;
  onOpenLegal: (tab?: 'info' | 'privacy' | 'cookies' | 'crisis') => void;
  onOpenWelcome?: () => void;
  onWarpRandom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  cameraZoom: number;
  onZoomChange: (val: number) => void;
}

const CATEGORY_TABS: Array<{ id: GraveCategory | null; label: string; icon: string }> = [
  { id: null, label: 'ALL', icon: '⚰️' },
  { id: 'regret', label: 'REGRETS', icon: '🥀' },
  { id: 'failed_idea', label: 'BAD IDEAS', icon: '💡' },
  { id: 'cringe', label: 'CRINGE', icon: '🫣' },
  { id: 'missed_chance', label: 'MISSED CHANCES', icon: '🚂' },
  { id: 'financial_loss', label: 'MONEY LOST', icon: '💸' },
  { id: 'career_blunder', label: 'CAREER BLUNDERS', icon: '💼' },
];

export const ArcadeHUD: React.FC<Props> = ({
  stats,
  soundEnabled,
  onToggleSound,
  activeCategory,
  onSelectCategory,
  onOpenBuryModal,
  onOpenMyPosts,
  myPostsCount,
  onOpenLegal,
  onOpenWelcome,
  onWarpRandom,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  cameraZoom,
  onZoomChange,
}) => {
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % CYNICAL_TICKER_QUIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-4 md:p-5 select-none z-30 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* TOP BAR: Title, Clear Stats, and Minimal Audio Control */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 pointer-events-auto w-full">
        {/* Top line for mobile: Title and right controls */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          {/* Title Badge */}
          <div className="flex items-center gap-2 bg-[#0a0f18]/95 border border-[#38bdf8]/40 px-3 py-1.5 sm:px-3.5 sm:py-2 backdrop-blur-md shadow-[3px_3px_0px_#0284c7]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <h1 className="font-['Press_Start_2P'] text-[9px] sm:text-xs text-[#38bdf8] tracking-wider uppercase truncate">
              MEMORY GRAVEYARD
            </h1>
          </div>

          {/* Top-Right on Mobile: Guide, Info & Sound Buttons */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {onOpenWelcome && (
              <button
                id="mobile-open-guide-btn"
                onClick={onOpenWelcome}
                title="Sanctuary Guide & Controls"
                className="h-8 px-2 flex items-center justify-center border border-slate-700 bg-[#0a0f18]/90 text-slate-300 active:text-[#38bdf8] font-['Press_Start_2P'] text-[8px] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
            )}

            <button
              id="mobile-open-info-btn"
              onClick={() => onOpenLegal('info')}
              title="Sanctuary Info & Privacy"
              className="h-8 px-2 flex items-center justify-center border border-slate-700 bg-[#0a0f18]/90 text-slate-300 active:text-[#38bdf8] font-['Press_Start_2P'] text-[8px] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              id="mobile-toggle-sound-btn"
              onClick={onToggleSound}
              title={soundEnabled ? "Mute ambient music" : "Play ambient music"}
              className={`h-8 px-2.5 flex items-center justify-center border font-['Press_Start_2P'] text-[8px] cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[1px_1px_0px_#d97706]'
                  : 'bg-[#0a0f18]/90 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Live Graveyard Stats: Clearly labeled Souls, Candles, Flowers */}
        <div 
          id="cemetery-live-stats"
          className="flex items-center justify-center gap-2 sm:gap-4 bg-[#0a0f18]/90 border border-slate-700/60 px-2.5 sm:px-4 py-1.5 sm:py-2 font-['Press_Start_2P'] text-[7px] sm:text-[9px] backdrop-blur-sm shadow-[2px_2px_0px_#1e293b] w-full sm:w-auto overflow-x-auto scrollbar-none"
        >
          <div className="flex items-center gap-1 text-slate-200 shrink-0" title="Total buried regrets and memories">
            <Skull className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            <span>{stats.totalSouls.toLocaleString()} <span className="hidden sm:inline">SOULS</span></span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1 text-amber-300 shrink-0" title="Total virtual candles lit">
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span>{stats.totalCandles.toLocaleString()} <span className="hidden sm:inline">CANDLES</span></span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1 text-pink-300 shrink-0" title="Total memorial flowers laid">
            <Flower2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400 shrink-0" />
            <span>{stats.totalFlowers.toLocaleString()} <span className="hidden sm:inline">FLOWERS</span></span>
          </div>
        </div>

        {/* Desktop/Tablet Top-Right: Guide, Info/Privacy/Cookies & Clean Ambient Music Toggle */}
        <div className="hidden sm:flex items-center gap-2">
          {onOpenWelcome && (
            <button
              id="open-welcome-guide-btn"
              onClick={onOpenWelcome}
              title="Sanctuary Guide, Purpose & Controls"
              className="px-2.5 py-2 flex items-center gap-1.5 border border-slate-700 hover:border-[#38bdf8] bg-[#0a0f18]/90 text-slate-300 hover:text-[#38bdf8] font-['Press_Start_2P'] text-[8px] sm:text-[9px] transition-colors cursor-pointer backdrop-blur-sm shadow-[2px_2px_0px_#0f172a]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>GUIDE</span>
            </button>
          )}

          <button
            id="open-info-legal-btn"
            onClick={() => onOpenLegal('info')}
            title="Sanctuary Info, Privacy Policy & Cookies"
            className="px-2.5 py-2 flex items-center gap-1.5 border border-slate-700 hover:border-[#38bdf8] bg-[#0a0f18]/90 text-slate-300 hover:text-[#38bdf8] font-['Press_Start_2P'] text-[8px] sm:text-[9px] transition-colors cursor-pointer backdrop-blur-sm shadow-[2px_2px_0px_#0f172a]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>INFO & PRIVACY</span>
          </button>

          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute sad ambient music" : "Play sad ambient music"}
            className={`px-3 py-2 flex items-center gap-2 border font-['Press_Start_2P'] text-[8px] sm:text-[9px] transition-colors cursor-pointer backdrop-blur-sm ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[2px_2px_0px_#d97706]'
                : 'bg-[#0a0f18]/90 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>MUSIC: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>MUSIC: OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* BOTTOM SECTION: Uncongested, Minimalist Dock */}
      <footer className="flex flex-col items-center gap-1 sm:gap-2 pointer-events-auto w-full max-w-4xl mx-auto">
        {/* Reaper's Dark Humor Cynical Wisdom Ticker */}
        <div 
          id="reaper-wisdom-ticker"
          className="w-full max-w-xl bg-[#0a0714]/90 border border-purple-500/40 px-2.5 py-1 backdrop-blur-sm shadow-[2px_2px_0px_#581c87] flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="text-xs shrink-0">☠️</span>
          <span className="font-['Press_Start_2P'] text-[6.5px] sm:text-[7.5px] text-purple-300 tracking-wider truncate">
            {CYNICAL_TICKER_QUIPS[tickerIdx]}
          </span>
        </div>

        {/* Minimal Category Chips with touch-friendly horizontal swipe */}
        <div className="w-full overflow-x-auto scrollbar-none py-0.5 px-1">
          <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max mx-auto px-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.label}
                  id={`cat-filter-${tab.id || 'all'}`}
                  onMouseEnter={() => arcadeAudio.playHover()}
                  onClick={() => {
                    arcadeAudio.playCategorySwitch(tab.id);
                    onSelectCategory(tab.id);
                  }}
                  className={`whitespace-nowrap px-2.5 py-1.5 sm:py-1 border font-['Press_Start_2P'] text-[7px] sm:text-[8px] transition-all flex items-center gap-1 cursor-pointer min-h-[34px] sm:min-h-[28px] ${
                    isActive
                      ? 'bg-[#38bdf8] border-white text-black font-bold shadow-[2px_2px_0px_#ffffff]'
                      : 'bg-[#0a0f18]/85 border-slate-700/60 text-slate-300 hover:border-[#38bdf8]'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Minimal Dock Bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-1.5 sm:gap-3 bg-[#0a0f18]/95 border border-[#38bdf8]/40 p-1.5 sm:px-3 sm:py-2 backdrop-blur-md shadow-[4px_4px_0px_#0284c7] rounded-sm w-full sm:w-auto max-w-full">
          {/* Main Action: + BURY A REGRET */}
          <button
            id="open-bury-modal-btn"
            onClick={onOpenBuryModal}
            className="flex-1 sm:flex-initial min-h-[38px] sm:min-h-[34px] px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 text-black font-['Press_Start_2P'] text-[8px] sm:text-[9.5px] tracking-wider border border-white flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#047857] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Shovel className="w-3.5 h-3.5 text-black" />
            <span>+ BURY REGRET</span>
          </button>

          {/* User's Buried Posts & Private Responses */}
          {myPostsCount > 0 && (
            <button
              id="open-my-posts-btn"
              onClick={onOpenMyPosts}
              title="View your buried regrets and the private responses delivered to them"
              className="min-h-[38px] sm:min-h-[34px] px-2.5 py-1.5 bg-[#06241a] hover:bg-[#0c392b] text-emerald-300 font-['Press_Start_2P'] text-[7.5px] sm:text-[8.5px] border border-emerald-400/80 flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#047857] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>MY POSTS ({myPostsCount})</span>
            </button>
          )}

          {/* Random warp teleport */}
          <button
            id="warp-random-grave-btn"
            onClick={onWarpRandom}
            title="Teleport to a random anonymous grave"
            className="min-h-[38px] sm:min-h-[34px] px-2.5 py-1.5 bg-[#142033] hover:bg-[#1e2f4a] text-[#38bdf8] font-['Press_Start_2P'] text-[7.5px] sm:text-[9px] border border-[#38bdf8]/60 flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[#38bdf8]" />
            <span>RANDOM</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 border-l border-slate-700 pl-1.5 sm:pl-2 shrink-0">
            <button
              id="hud-zoom-out-btn"
              onClick={onZoomOut}
              title="Zoom out"
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="font-['Press_Start_2P'] text-[7px] sm:text-[8px] text-slate-300 w-8 sm:w-10 text-center font-mono">
              {Math.round(cameraZoom * 100)}%
            </span>

            <button
              id="hud-zoom-in-btn"
              onClick={onZoomIn}
              title="Zoom in"
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-slate-300 hover:text-white active:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              id="hud-reset-cam-btn"
              onClick={onResetCamera}
              title="Reset view (fully zoomed out)"
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-slate-400 hover:text-amber-400 active:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

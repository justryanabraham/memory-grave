import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Shovel, 
  Flame, 
  Compass, 
  HeartHandshake, 
  MousePointerClick, 
  Touchpad, 
  ArrowRight,
  Ghost
} from 'lucide-react';
import { arcadeAudio } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuryModal: () => void;
}

export const WelcomeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenBuryModal,
}) => {
  if (!isOpen) return null;

  const handleEnter = () => {
    arcadeAudio.playSelect();
    onClose();
  };

  const handleBuryNow = () => {
    arcadeAudio.playModalOpen();
    onClose();
    onOpenBuryModal();
  };

  return (
    <AnimatePresence>
      <div 
        id="welcome-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
        onClick={handleEnter}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#0b1018] border-2 sm:border-4 border-[#38bdf8] shadow-[6px_6px_0px_#0284c7] text-[#e2e8f0] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#11223a] border-b-2 sm:border-b-4 border-[#38bdf8] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <h2 className="font-['Press_Start_2P'] text-[9.5px] sm:text-xs md:text-sm text-[#38bdf8] tracking-wider truncate">
                WELCOME TO MEMORY GRAVEYARD
              </h2>
            </div>
            <button
              id="close-welcome-modal-btn"
              onClick={handleEnter}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#38bdf8] hover:text-black transition-colors border border-transparent hover:border-white cursor-pointer shrink-0"
              title="Close guide and enter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 font-mono text-xs sm:text-sm text-slate-300">
            
            {/* Mission Statement: What this website is for */}
            <div className="bg-[#111c2b] border-2 border-[#38bdf8]/40 p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Ghost className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-emerald-300">
                  WHAT IS THIS PLACE?
                </span>
              </div>
              <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed">
                <strong className="text-[#38bdf8]">Memory Graveyard</strong> is an anonymous digital sanctuary where past regrets, failed startup dreams, cringe memories, ghosted romances, and heavy burdens are laid to rest.
              </p>
              <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                Instead of letting yesterday’s blunders haunt your head, carve them onto a virtual headstone, let go, and share quiet solidarity with fellow humans across the world.
              </p>
            </div>

            {/* What you can do: 4 Core Features */}
            <div>
              <div className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-[#38bdf8] mb-2.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>WHAT YOU CAN DO HERE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {/* 1. Explore */}
                <div className="bg-[#0e1624] border border-slate-700/80 p-2.5 sm:p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sky-300 font-['Press_Start_2P'] text-[8px] sm:text-[8.5px]">
                    <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>EXPLORE MEMORIES</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-slate-300 leading-snug">
                    Pan and zoom across thousands of buried memories in an infinite staggered cemetery grid. Click any tombstone to inspect its confession.
                  </p>
                </div>

                {/* 2. Bury Regrets */}
                <div className="bg-[#0e1624] border border-slate-700/80 p-2.5 sm:p-3 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-['Press_Start_2P'] text-[8px] sm:text-[8.5px]">
                    <Shovel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>BURY YOUR OWN</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-slate-300 leading-snug">
                    Anonymously lay a blunder to rest. Choose tombstone materials, burial depth, and roll an authentic morbid coroner cause of death.
                  </p>
                </div>

                {/* 3. Pay Respects */}
                <div className="bg-[#0e1624] border border-slate-700/80 p-2.5 sm:p-3 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-['Press_Start_2P'] text-[8px] sm:text-[8.5px]">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>PAY RESPECTS</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-slate-300 leading-snug">
                    Light memorial candles, place flowers, kick dirt, or leave anonymous condolences and tributes for other struggling souls.
                  </p>
                </div>

                {/* 4. Solace & Catharsis */}
                <div className="bg-[#0e1624] border border-slate-700/80 p-2.5 sm:p-3 space-y-1">
                  <div className="flex items-center gap-2 text-pink-300 font-['Press_Start_2P'] text-[8px] sm:text-[8.5px]">
                    <HeartHandshake className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>FIND SOLACE</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-slate-300 leading-snug">
                    Receive an immediate anonymous philosophical solace response and Grim Reaper reflection to help bring peace to your mind.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation & Controls Quick Tips */}
            <div className="bg-[#090e17] border border-slate-800 p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10.5px] sm:text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MousePointerClick className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Desktop:</strong> Drag to pan • Scroll to zoom • Click to read</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Touchpad className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Mobile:</strong> Swipe to pan • Pinch to zoom • Tap to read</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <button
                id="welcome-enter-btn"
                onClick={handleEnter}
                className="w-full sm:flex-1 py-3 px-3 bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-black font-['Press_Start_2P'] text-[9.5px] sm:text-xs tracking-wider border-2 border-white transition-all shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>ENTER SANCTUARY</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                id="welcome-bury-now-btn"
                onClick={handleBuryNow}
                className="w-full sm:w-auto py-3 px-4 bg-[#064e3b] hover:bg-emerald-500 text-emerald-200 hover:text-black font-['Press_Start_2P'] text-[9px] sm:text-[10px] tracking-wider border-2 border-emerald-400 transition-all shadow-[4px_4px_0px_#047857] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Shovel className="w-4 h-4 shrink-0" />
                <span>+ BURY A REGRET</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500 font-mono">
              100% Anonymous & Private • No sign-up required • You can revisit this guide anytime under &apos;INFO &amp; PRIVACY&apos;
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

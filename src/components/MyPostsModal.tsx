import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Sparkles, Flame, Flower2, ArrowRight } from 'lucide-react';
import { TombstoneData, GraveCategory } from '../types';
import { arcadeAudio } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  myGraves: TombstoneData[];
  onSelectGrave: (grave: TombstoneData) => void;
  onOpenBuryModal: () => void;
}

const CATEGORY_NAMES: Record<GraveCategory, string> = {
  regret: "REGRET",
  failed_idea: "BAD IDEA",
  cringe: "CRINGE",
  missed_chance: "MISSED CHANCE",
  career_blunder: "BLUNDER",
  financial_loss: "MONEY LOST",
};

export const MyPostsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  myGraves,
  onSelectGrave,
  onOpenBuryModal,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="my-posts-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="my-posts-modal-dialog"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-[#0d1520] border-2 sm:border-4 border-emerald-400 shadow-[6px_6px_0px_#047857] text-[#e2e8f0] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#06241a] border-b-2 sm:border-b-4 border-emerald-400">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <h2 className="font-['Press_Start_2P'] text-[10px] sm:text-xs md:text-sm text-emerald-300 tracking-wider truncate">
                YOUR BURIED MEMORIES ({myGraves.length})
              </h2>
            </div>
            <button
              id="close-my-posts-modal-btn"
              onClick={onClose}
              className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border-2 border-transparent hover:border-white cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Open Sanctuary Notice */}
          <div className="bg-[#081b16] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-emerald-500/30 flex items-center gap-2 text-[11px] sm:text-xs font-mono text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Open Sanctuary: Buried memories and solace responses are viewable by all visitors.</span>
          </div>

          {/* List of User's Buried Graves */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[60vh]">
            {myGraves.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <p className="font-['VT323'] text-2xl text-slate-400">
                  You haven't laid any regrets or bad ideas to rest yet.
                </p>
                <p className="font-mono text-xs text-slate-500 max-w-md mx-auto">
                  When you bury a memory, a solace response is prepared and viewable by everyone in the cemetery.
                </p>
                <button
                  id="my-posts-bury-btn"
                  onClick={() => {
                    onClose();
                    onOpenBuryModal();
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-['Press_Start_2P'] text-[10px] border-2 border-white shadow-[3px_3px_0px_#047857] cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  BURY YOUR FIRST MEMORY
                </button>
              </div>
            ) : (
              myGraves.map((grave) => (
                <div
                  key={grave.id}
                  id={`my-post-card-${grave.id}`}
                  onClick={() => {
                    arcadeAudio.playSelect();
                    onSelectGrave(grave);
                    onClose();
                  }}
                  className="group p-3.5 bg-[#121c2a] hover:bg-[#162335] border-2 border-slate-700 hover:border-emerald-400 transition-all cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 font-['Press_Start_2P'] text-[8px] text-emerald-300 uppercase">
                        {CATEGORY_NAMES[grave.category] || grave.category}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {grave.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1 text-amber-300">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {grave.candles}
                      </span>
                      <span className="flex items-center gap-1 text-pink-300">
                        <Flower2 className="w-3 h-3 text-pink-400" />
                        {grave.flowers}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-['Press_Start_2P'] text-xs text-white group-hover:text-emerald-300 transition-colors">
                    "{grave.title}"
                  </h3>

                  <p className="font-['VT323'] text-lg text-slate-300 line-clamp-2">
                    "{grave.epitaph}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Sanctuary response etched
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-['Press_Start_2P'] text-[8px]">
                      VIEW MEMORIAL <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

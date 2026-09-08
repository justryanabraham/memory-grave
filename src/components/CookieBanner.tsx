import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, ArrowRight } from 'lucide-react';
import { getCookieConsentStatus, setCookieConsentStatus } from '../data/cemetery';
import { arcadeAudio } from '../utils/audio';

interface Props {
  onOpenLegal: (tab: 'cookies' | 'privacy') => void;
}

export const CookieBanner: React.FC<Props> = ({ onOpenLegal }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check initial consent status
    const status = getCookieConsentStatus();
    if (status === 'unanswered') {
      // Small delay so user sees canvas load first
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    arcadeAudio.playSelect();
    setCookieConsentStatus('accepted');
    setVisible(false);
  };

  const handleLearnMore = () => {
    arcadeAudio.playSelect();
    onOpenLegal('cookies');
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="cookie-consent-banner"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] sm:bottom-20 left-2 right-2 sm:left-auto sm:right-4 z-40 max-w-lg bg-[#0d1624]/95 border-2 border-amber-400 p-3 sm:p-3.5 shadow-[4px_4px_0px_#d97706] backdrop-blur-md pointer-events-auto"
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="p-2 bg-amber-950/80 border border-amber-500/60 text-amber-300 shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>

          <div className="space-y-2 flex-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-['Press_Start_2P'] text-[7.5px] sm:text-[8.5px] text-amber-300">
                BROWSER STORAGE NOTICE
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero Trackers
              </span>
            </div>

            <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
              We use client-side local storage to preserve the regrets, ideas, and tributes you lay to rest on this device. We do <strong>not</strong> use advertising or tracking cookies.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="accept-cookies-btn"
                onClick={handleAccept}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-['Press_Start_2P'] text-[7.5px] sm:text-[8px] border border-white shadow-[2px_2px_0px_#92400e] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 min-h-[34px] flex items-center justify-center"
              >
                ACCEPT & CLOSE
              </button>

              <button
                id="view-cookies-policy-btn"
                onClick={handleLearnMore}
                className="px-2.5 py-1.5 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white font-['Press_Start_2P'] text-[7px] sm:text-[7.5px] border border-slate-600 flex items-center gap-1 cursor-pointer transition-colors min-h-[34px]"
              >
                <span>DETAILS & PRIVACY</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

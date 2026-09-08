import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Info, 
  ShieldCheck, 
  Cookie, 
  HeartHandshake, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Database, 
  Sparkles, 
  Volume2, 
  Compass, 
  HelpCircle,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { 
  getStorageUsageSummary, 
  clearAllUserGraveyardData, 
  setCookieConsentStatus 
} from '../data/cemetery';
import { arcadeAudio } from '../utils/audio';

export type LegalTab = 'info' | 'privacy' | 'cookies' | 'crisis';

interface Props {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onDataPurged?: () => void;
  onOpenWelcome?: () => void;
}

export const InfoLegalModal: React.FC<Props> = ({
  isOpen,
  initialTab = 'info',
  onClose,
  onDataPurged,
  onOpenWelcome,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [purgeConfirming, setPurgeConfirming] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [storageStats, setStorageStats] = useState(getStorageUsageSummary());

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStorageStats(getStorageUsageSummary());
      setPurgeConfirming(false);
      setPurgeSuccess(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTabChange = (tab: LegalTab) => {
    arcadeAudio.playTabSwitch();
    setActiveTab(tab);
    setPurgeConfirming(false);
  };

  const handlePurgeData = () => {
    arcadeAudio.playBury();
    clearAllUserGraveyardData();
    setPurgeSuccess(true);
    setPurgeConfirming(false);
    setStorageStats(getStorageUsageSummary());
    if (onDataPurged) {
      onDataPurged();
    }
    setTimeout(() => {
      setPurgeSuccess(false);
    }, 4000);
  };

  return (
    <AnimatePresence>
      <div 
        id="info-legal-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="info-legal-modal-dialog"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0c121c] border-2 sm:border-4 border-[#38bdf8] shadow-[6px_6px_0px_#0284c7] text-[#e2e8f0] overflow-hidden"
        >
          {/* Retro Arcade Modal Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#131f33] border-b-2 sm:border-b-4 border-[#38bdf8] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping shrink-0" />
              <h2 className="font-['Press_Start_2P'] text-[9.5px] sm:text-xs md:text-sm text-[#38bdf8] tracking-wider truncate">
                SANCTUARY ARCHIVE & LEGAL
              </h2>
            </div>
            <button
              id="close-info-legal-modal-btn"
              onClick={onClose}
              className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-white cursor-pointer shrink-0"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-2 sm:px-3 pt-2 bg-[#090e17] border-b-2 border-slate-800 overflow-x-auto scrollbar-none shrink-0 touch-pan-x">
            <button
              id="tab-btn-info"
              onClick={() => handleTabChange('info')}
              className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] flex items-center gap-1.5 transition-all border-t-2 border-x-2 cursor-pointer whitespace-nowrap min-h-[38px] ${
                activeTab === 'info'
                  ? 'bg-[#0c121c] border-[#38bdf8] text-[#38bdf8] -mb-[2px] z-10'
                  : 'bg-[#121a28] border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>ABOUT & INFO</span>
            </button>

            <button
              id="tab-btn-privacy"
              onClick={() => handleTabChange('privacy')}
              className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] flex items-center gap-1.5 transition-all border-t-2 border-x-2 cursor-pointer whitespace-nowrap min-h-[38px] ${
                activeTab === 'privacy'
                  ? 'bg-[#0c121c] border-emerald-400 text-emerald-300 -mb-[2px] z-10'
                  : 'bg-[#121a28] border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>PRIVACY POLICY</span>
            </button>

            <button
              id="tab-btn-cookies"
              onClick={() => handleTabChange('cookies')}
              className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] flex items-center gap-1.5 transition-all border-t-2 border-x-2 cursor-pointer whitespace-nowrap min-h-[38px] ${
                activeTab === 'cookies'
                  ? 'bg-[#0c121c] border-amber-400 text-amber-300 -mb-[2px] z-10'
                  : 'bg-[#121a28] border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cookie className="w-3.5 h-3.5 shrink-0" />
              <span>COOKIES & STORAGE</span>
            </button>

            <button
              id="tab-btn-crisis"
              onClick={() => handleTabChange('crisis')}
              className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] flex items-center gap-1.5 transition-all border-t-2 border-x-2 cursor-pointer whitespace-nowrap min-h-[38px] ${
                activeTab === 'crisis'
                  ? 'bg-[#0c121c] border-pink-400 text-pink-300 -mb-[2px] z-10'
                  : 'bg-[#121a28] border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
              <span>SUPPORT & CRISIS</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm font-mono text-slate-300 max-h-[65vh]">
            {/* TAB 1: ABOUT & INFO */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="border-l-4 border-[#38bdf8] pl-3 py-1 bg-[#101b2b]">
                  <h3 className="font-['Press_Start_2P'] text-xs text-[#38bdf8] mb-1">
                    WHAT IS THE MEMORY GRAVEYARD?
                  </h3>
                  <p className="font-['VT323'] text-xl text-slate-200 leading-snug">
                    A digital resting ground dedicated to the gentle, unburdened burial of past regrets, failed business ventures, cringe memories, unspoken loves, and dead projects.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#101826] border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-[#38bdf8]">
                      <Compass className="w-4 h-4" />
                      <span className="font-['Press_Start_2P'] text-[9px]">THE HONEYCOMB GRID</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Inspired by organic circular clustering, the graveyard organizes tombstones into hexagonal isometric rings. Every plot represents an anonymous confession left by someone seeking closure.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#101826] border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-['Press_Start_2P'] text-[9px]">SOLACE & WORDS OF RELEASE</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Whenever a memory is laid to rest, the sanctuary Guardian drafts a philosophical reflection and ritual words of release. These insights remain etched onto the headstone for every visitor to read.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#101826] border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                      <Volume2 className="w-4 h-4" />
                      <span className="font-['Press_Start_2P'] text-[9px]">8-BIT AMBIENT SOUND ENGINE</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Procedurally synthesized in real-time via the Web Audio API. Gentle chord progressions in D minor and A minor pass through a 620Hz tape-like lowpass filter, crafting a melancholic yet serene atmosphere without external MP3 files.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#101826] border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-pink-400">
                      <HeartHandshake className="w-4 h-4" />
                      <span className="font-['Press_Start_2P'] text-[9px]">COMMUNITY TRIBUTES</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Visitors can light pixel candles, place vibrant marigolds, or leave anonymous tribute notes on any grave to let the author know they are not alone in having stumbled.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#141e2e] border-2 border-slate-700 space-y-2">
                  <h4 className="font-['Press_Start_2P'] text-[10px] text-white">INTERACTIVE CONTROLS</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                    <li><strong className="text-[#38bdf8]">Click & Drag / Swipe:</strong> Pan smoothly across the cemetery grounds.</li>
                    <li><strong className="text-[#38bdf8]">Scroll Wheel / Pinch:</strong> Zoom smoothly between overview and headstone reading distance.</li>
                    <li><strong className="text-[#38bdf8]">Warp Jump:</strong> Teleports the camera to an unexpected anonymous memorial plot.</li>
                    <li><strong className="text-[#38bdf8]">CRT Toggle:</strong> Toggles vintage arcade scanlines and radial vignette shadow.</li>
                  </ul>

                  {onOpenWelcome && (
                    <div className="pt-2 border-t border-slate-700/60 flex justify-end">
                      <button
                        type="button"
                        id="reopen-welcome-guide-btn"
                        onClick={() => {
                          onClose();
                          onOpenWelcome();
                        }}
                        className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#38bdf8] text-white hover:text-black font-['Press_Start_2P'] text-[8px] border border-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>REPLAY INTRODUCTORY POP-UP & GUIDE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="border-l-4 border-emerald-400 pl-3 py-1 bg-[#091f16]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Press_Start_2P'] text-xs text-emerald-300 mb-1">
                      PRIVACY POLICY & DATA SOVEREIGNTY
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">Effective: September 2026</span>
                  </div>
                  <p className="font-['VT323'] text-xl text-emerald-100">
                    Our architectural pledge: Zero identification, zero tracking, and zero surveillance.
                  </p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <section className="p-3.5 bg-[#0f1724] border border-slate-700">
                    <h4 className="font-['Press_Start_2P'] text-[9px] text-white mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      1. INFORMATION WE DO NOT COLLECT
                    </h4>
                    <p className="text-slate-300 mb-2">
                      Memory Graveyard operates entirely without user accounts. Specifically:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                      <li>We do <strong>not</strong> request, collect, or store full names, email addresses, or phone numbers.</li>
                      <li>We do <strong>not</strong> collect account passwords or authentication credentials.</li>
                      <li>We do <strong>not</strong> run cross-site behavioral tracking, ad-retargeting pixels, or surveillance scripts.</li>
                      <li>We do <strong>not</strong> sell, rent, monetize, or broker any user data to data brokers or advertising brokers.</li>
                    </ul>
                  </section>

                  <section className="p-3.5 bg-[#0f1724] border border-slate-700">
                    <h4 className="font-['Press_Start_2P'] text-[9px] text-white mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      2. PUBLIC SANCTUARY DISCLOSURE
                    </h4>
                    <p className="text-slate-300">
                      When you lay a memory to rest, the title, category, year, epitaph, and backstory you provide are displayed publicly on that headstone in the shared cemetery. 
                    </p>
                    <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/50 text-amber-200 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Do not submit PII:</strong> Please refrain from entering real full names, phone numbers, private home addresses, employer credentials, or sensitive secrets in your confessions or notes.
                      </span>
                    </div>
                  </section>

                  <section className="p-3.5 bg-[#0f1724] border border-slate-700">
                    <h4 className="font-['Press_Start_2P'] text-[9px] text-white mb-2 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
                      3. LOCAL-FIRST PROCESSING & SECURITY
                    </h4>
                    <p className="text-slate-300 mb-2">
                      Memories you bury and tributes you interact with are saved to your browser’s local storage. Before any content is rendered or persisted, it passes through an input sanitizer that:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                      <li>Strips all HTML tags and DOM elements to prevent Cross-Site Scripting (XSS).</li>
                      <li>Eliminates pseudo-protocols (<code className="text-slate-200">javascript:</code>, <code className="text-slate-200">data:</code>).</li>
                      <li>Guards against object prototype pollution attacks (<code className="text-slate-200">__proto__</code>, <code className="text-slate-200">constructor</code>).</li>
                    </ul>
                  </section>

                  <section className="p-3.5 bg-[#0f1724] border border-slate-700">
                    <h4 className="font-['Press_Start_2P'] text-[9px] text-white mb-2 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      4. YOUR RIGHT TO ERASURE (GDPR / CCPA)
                    </h4>
                    <p className="text-slate-300">
                      You maintain full control over any data stored on your device. You can purge your local cemetery graves and tribute records at any time using the one-click wipe tool on the <strong>Cookies & Storage</strong> tab.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* TAB 3: COOKIES & STORAGE POLICY */}
            {activeTab === 'cookies' && (
              <div className="space-y-6">
                <div className="border-l-4 border-amber-400 pl-3 py-1 bg-[#241a06]">
                  <h3 className="font-['Press_Start_2P'] text-xs text-amber-300 mb-1">
                    COOKIES & BROWSER STORAGE DISCLOSURE
                  </h3>
                  <p className="font-['VT323'] text-xl text-amber-100">
                    No tracking cookies. Only essential client-side storage to keep your graveyard state intact.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#111927] border border-slate-700 text-slate-300">
                    <p>
                      Under ePrivacy and GDPR standards, modern browser storage technologies (such as HTML5 <code className="text-amber-300">localStorage</code>) are categorized alongside traditional cookies. Memory Graveyard uses <strong>zero third-party advertising or marketing cookies</strong>. All keys listed below are strictly first-party and essential for the application to function.
                    </p>
                  </div>

                  {/* Table of Storage Keys */}
                  <div className="overflow-x-auto border border-slate-700">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#172338] text-slate-200 border-b border-slate-700">
                        <tr>
                          <th className="p-2.5">Storage Key</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Purpose</th>
                          <th className="p-2.5">Lifespan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-[#0d1420] text-slate-300">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-400">memory_graveyard_custom_graves_v1</td>
                          <td className="p-2.5">Functional</td>
                          <td className="p-2.5">Preserves the headstones you create on this browser across sessions.</td>
                          <td className="p-2.5">Persistent</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-amber-400">memory_graveyard_user_tributes_v1</td>
                          <td className="p-2.5">Functional</td>
                          <td className="p-2.5">Tracks which candles you lit and flowers you placed.</td>
                          <td className="p-2.5">Persistent</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-[#38bdf8]">memory_graveyard_user_post_ids_v1</td>
                          <td className="p-2.5">Functional</td>
                          <td className="p-2.5">Powers your "MY POSTS" dashboard so you can quickly find your burials.</td>
                          <td className="p-2.5">Persistent</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-pink-400">memory_graveyard_cookie_consent_v1</td>
                          <td className="p-2.5">Essential</td>
                          <td className="p-2.5">Remembers your acknowledgment of this storage and privacy policy.</td>
                          <td className="p-2.5">Persistent</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Device Storage Management Console */}
                  <div className="p-4 bg-[#101b2a] border-2 border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-['Press_Start_2P'] text-[9px] text-white">YOUR LOCAL STORAGE FOOTPRINT</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Approx: {Math.max(1, Math.round(storageStats.approxBytes / 1024))} KB
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                      <div className="p-2 bg-[#09111c] border border-slate-800">
                        <span className="font-['Press_Start_2P'] text-xs text-emerald-400 block">{storageStats.customGravesCount}</span>
                        <span className="text-[10px] text-slate-400">Custom Graves</span>
                      </div>
                      <div className="p-2 bg-[#09111c] border border-slate-800">
                        <span className="font-['Press_Start_2P'] text-xs text-amber-400 block">{storageStats.tributePlotsCount}</span>
                        <span className="text-[10px] text-slate-400">Tribute Markers</span>
                      </div>
                      <div className="p-2 bg-[#09111c] border border-slate-800">
                        <span className="font-['Press_Start_2P'] text-xs text-[#38bdf8] block">{storageStats.trackedPostsCount}</span>
                        <span className="text-[10px] text-slate-400">My Posts</span>
                      </div>
                    </div>

                    {/* Purge / Clear Actions */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400">
                        Want to reset this device? This will erase all custom headstones and tribute records stored in this browser.
                      </div>

                      {purgeSuccess ? (
                        <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center gap-1.5 shrink-0">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Local storage cleared!</span>
                        </div>
                      ) : purgeConfirming ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            id="confirm-purge-storage-btn"
                            onClick={handlePurgeData}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-['Press_Start_2P'] text-[8px] border border-white cursor-pointer"
                          >
                            YES, ERASE ALL
                          </button>
                          <button
                            id="cancel-purge-storage-btn"
                            onClick={() => setPurgeConfirming(false)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Press_Start_2P'] text-[8px] cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          id="initiate-purge-storage-btn"
                          onClick={() => setPurgeConfirming(true)}
                          className="px-3 py-1.5 bg-[#201318] hover:bg-red-950 text-red-400 hover:text-red-200 border border-red-800/80 font-['Press_Start_2P'] text-[8px] flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>PURGE LOCAL DATA</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUPPORT & CRISIS RESOURCES */}
            {activeTab === 'crisis' && (
              <div className="space-y-6">
                <div className="border-l-4 border-pink-400 pl-3 py-1 bg-[#240c1b]">
                  <h3 className="font-['Press_Start_2P'] text-xs text-pink-300 mb-1">
                    HEALING, SAFETY & CRISIS RESOURCES
                  </h3>
                  <p className="font-['VT323'] text-xl text-pink-100">
                    A symbolic cemetery is for closure and reflection. If you are hurting, you do not have to walk alone.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#1b1020] border-2 border-pink-500/60 space-y-3">
                    <div className="flex items-center gap-2 text-pink-300">
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <h4 className="font-['Press_Start_2P'] text-[10px]">FREE, CONFIDENTIAL 24/7 HELPLINES</h4>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      If your regret, grief, or distress feels unmanageable, please reach out to dedicated counselors trained to listen without judgment:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-[#0d0712] border border-pink-500/40">
                        <span className="font-['Press_Start_2P'] text-[9px] text-white block mb-1">US & CANADA</span>
                        <p className="font-mono text-sm text-pink-400 font-bold">Call or Text: 988</p>
                        <p className="text-[10px] text-slate-400 mt-1">Suicide & Crisis Lifeline (Free, confidential 24/7)</p>
                      </div>

                      <div className="p-3 bg-[#0d0712] border border-pink-500/40">
                        <span className="font-['Press_Start_2P'] text-[9px] text-white block mb-1">CRISIS TEXT LINE</span>
                        <p className="font-mono text-sm text-pink-400 font-bold">Text HOME to 741741</p>
                        <p className="text-[10px] text-slate-400 mt-1">Connect with a Crisis Counselor anywhere in the US/UK/Canada</p>
                      </div>

                      <div className="p-3 bg-[#0d0712] border border-pink-500/40">
                        <span className="font-['Press_Start_2P'] text-[9px] text-white block mb-1">UNITED KINGDOM</span>
                        <p className="font-mono text-sm text-pink-400 font-bold">Call: 111 or 0800 689 5652</p>
                        <p className="text-[10px] text-slate-400 mt-1">National Suicide Prevention Helpline UK</p>
                      </div>

                      <div className="p-3 bg-[#0d0712] border border-pink-500/40">
                        <span className="font-['Press_Start_2P'] text-[9px] text-white block mb-1">INTERNATIONAL DIRECTORY</span>
                        <p className="font-mono text-xs text-pink-300 font-bold">befrienders.org</p>
                        <p className="text-[10px] text-slate-400 mt-1">Support helplines available across 32+ nations</p>
                      </div>
                    </div>
                  </div>

                  {/* Sanctuary Etiquette & Safety */}
                  <div className="p-3.5 bg-[#0f1724] border border-slate-700 space-y-2">
                    <h4 className="font-['Press_Start_2P'] text-[9px] text-white">SANCTUARY CODE OF CONDUCT</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-xs">
                      <li><strong>No Harassment or Doxxing:</strong> Never use headstones or notes to target, shame, or attack specific real-world individuals.</li>
                      <li><strong>Constructive Expression:</strong> Treat fellow mourners and visitors with empathy. Everyone here is carrying an unvoiced weight.</li>
                      <li><strong>Zero Commercial Promotion:</strong> The cemetery is not a classifieds board or promotional billboard.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#090e17] border-t-2 border-slate-800 shrink-0 gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Memory Graveyard Sanctuary • Open Web Initiative</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="close-info-legal-modal-bottom-btn"
                onClick={onClose}
                className="px-4 py-1.5 bg-[#19273f] hover:bg-[#223554] text-white font-['Press_Start_2P'] text-[8.5px] border border-slate-500 cursor-pointer transition-colors"
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

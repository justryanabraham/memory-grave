/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  generateCemeteryGrid, 
  loadUserGraves, 
  saveUserGrave, 
  loadUserTributes, 
  saveUserTributeUpdate,
  isUserAuthorOfGrave,
  hasSeenWelcomeModal,
  setWelcomeModalSeen
} from './data/cemetery';
import { TombstoneData, GraveCategory, CemeteryStats } from './types';
import { GraveyardCanvas } from './components/GraveyardCanvas';
import { ArcadeHUD } from './components/ArcadeHUD';
import { TombstoneModal } from './components/TombstoneModal';
import { BuryRegretModal } from './components/BuryRegretModal';
import { MyPostsModal } from './components/MyPostsModal';
import { InfoLegalModal, LegalTab } from './components/InfoLegalModal';
import { CookieBanner } from './components/CookieBanner';
import { WelcomeModal } from './components/WelcomeModal';
import { arcadeAudio } from './utils/audio';

export default function App() {
  // Master list of all graves (procedural + user created)
  const [graves, setGraves] = useState<TombstoneData[]>(() => {
    const base = generateCemeteryGrid();
    const userGraves = loadUserGraves();
    const tributes = loadUserTributes();

    // Merge base + userGraves, applying persisted user tributes
    const all = [...userGraves, ...base];
    return all.map((g) => {
      const saved = tributes[g.id];
      if (saved) {
        return {
          ...g,
          candles: g.candles + (saved.userCandled ? 1 : 0),
          flowers: g.flowers + (saved.userFlowered ? 1 : 0),
          userCandled: saved.userCandled,
          userFlowered: saved.userFlowered,
          tributes: [...(saved.tributes || []), ...g.tributes],
        };
      }
      return g;
    });
  });

  // Camera coordinates & zoom
  // zoom: 0.18 (ultra wide thousands) to 3.2 (ultra close single grave)
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.18 });

  // Camera animation target for smooth transitions (e.g. warp, center on burial)
  const animTargetRef = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const animFrameRef = useRef<number>(0);

  // Visual & Audio toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [fisheyeEnabled, setFisheyeEnabled] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState<GraveCategory | null>(null);

  // Modals
  const [selectedGrave, setSelectedGrave] = useState<TombstoneData | null>(null);
  const [isBuryModalOpen, setIsBuryModalOpen] = useState(false);
  const [isMyPostsModalOpen, setIsMyPostsModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('info');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // Check if first-time visitor; if so, show short welcome modal
  useEffect(() => {
    if (!hasSeenWelcomeModal()) {
      setIsWelcomeModalOpen(true);
    }
  }, []);

  const handleCloseWelcome = useCallback(() => {
    setWelcomeModalSeen(true);
    setIsWelcomeModalOpen(false);
  }, []);

  const handleOpenWelcome = useCallback(() => {
    arcadeAudio.playModalOpen();
    setIsWelcomeModalOpen(true);
  }, []);

  const handleOpenLegal = useCallback((tab: LegalTab = 'info') => {
    arcadeAudio.playModalOpen();
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  }, []);

  // List of graves posted by this user on this browser
  const myGraves = useMemo(() => {
    return graves.filter((g) => isUserAuthorOfGrave(g.id) || !!g.isUserAuthor);
  }, [graves]);

  // Check if currently selected grave belongs to this user
  const isAuthorOfSelected = useMemo(() => {
    if (!selectedGrave) return false;
    return isUserAuthorOfGrave(selectedGrave.id) || !!selectedGrave.isUserAuthor;
  }, [selectedGrave]);

  // Notification banner / toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Synchronize audio engine mute state & gentle background music
  useEffect(() => {
    arcadeAudio.enabled = soundEnabled;
    if (!soundEnabled) {
      arcadeAudio.stopSadBgm();
    } else {
      arcadeAudio.unlock().then(() => {
        if (arcadeAudio.enabled && !arcadeAudio.bgmPlaying) {
          arcadeAudio.startSadBgm();
        }
      });
    }
  }, [soundEnabled]);

  // Unlock and play sad ambient music proactively on user interactions
  useEffect(() => {
    const handleUserInteraction = () => {
      if (arcadeAudio.enabled) {
        arcadeAudio.unlock().then(() => {
          if (arcadeAudio.enabled && !arcadeAudio.bgmPlaying) {
            arcadeAudio.startSadBgm();
          }
        });
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      arcadeAudio.enabled = next;
      if (next) {
        arcadeAudio.unlock().then(() => {
          arcadeAudio.startSadBgm();
          arcadeAudio.playSelect();
        });
        showNotification("🎵 Melancholic ambient music enabled.");
      } else {
        arcadeAudio.stopSadBgm();
        showNotification("🔇 Ambient music muted.");
      }
      return next;
    });
  }, []);

  // Smooth camera interpolation animation loop
  useEffect(() => {
    const animateCamera = () => {
      if (animTargetRef.current) {
        const target = animTargetRef.current;
        setCamera((prev) => {
          const dx = target.x - prev.x;
          const dy = target.y - prev.y;
          const dz = target.zoom - prev.zoom;

          if (Math.hypot(dx, dy) < 1 && Math.abs(dz) < 0.01) {
            animTargetRef.current = null;
            return { x: target.x, y: target.y, zoom: target.zoom };
          }

          return {
            x: prev.x + dx * 0.12,
            y: prev.y + dy * 0.12,
            zoom: prev.zoom + dz * 0.12,
          };
        });
      }
      animFrameRef.current = requestAnimationFrame(animateCamera);
    };

    animFrameRef.current = requestAnimationFrame(animateCamera);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const smoothFlyTo = useCallback((x: number, y: number, zoom?: number) => {
    animTargetRef.current = {
      x,
      y,
      zoom: zoom !== undefined ? zoom : camera.zoom,
    };
  }, [camera.zoom]);

  // Keyboard controls for WASD / Arrow Keys Pan & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const panStep = 65 / camera.zoom;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setCamera((prev) => ({ ...prev, y: prev.y - panStep }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setCamera((prev) => ({ ...prev, y: prev.y + panStep }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setCamera((prev) => ({ ...prev, x: prev.x - panStep }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setCamera((prev) => ({ ...prev, x: prev.x + panStep }));
          break;
        case '+':
        case '=':
          setCamera((prev) => ({ ...prev, zoom: Math.min(3.2, prev.zoom * 1.2) }));
          break;
        case '-':
        case '_':
          setCamera((prev) => ({ ...prev, zoom: Math.max(0.18, prev.zoom * 0.83) }));
          break;
        case 'Escape':
          setSelectedGrave(null);
          setIsBuryModalOpen(false);
          break;
        case ' ':
          e.preventDefault();
          handleWarpRandom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera.zoom]);

  // Aggregate stats
  const stats: CemeteryStats = useMemo(() => {
    let totalCandles = 0;
    let totalFlowers = 0;
    for (const g of graves) {
      totalCandles += g.candles;
      totalFlowers += g.flowers;
    }
    return {
      totalSouls: graves.length,
      totalCandles,
      totalFlowers,
    };
  }, [graves]);

  // Handlers
  const handleSelectGrave = useCallback((grave: TombstoneData) => {
    arcadeAudio.playSelect();
    setSelectedGrave(grave);
  }, []);

  const handleLightCandle = useCallback((graveId: string) => {
    arcadeAudio.playCandle();
    setGraves((prev) =>
      prev.map((g) => {
        if (g.id === graveId) {
          const updated = {
            ...g,
            candles: g.candles + 1,
            userCandled: true,
          };
          saveUserTributeUpdate(graveId, { userCandled: true });
          return updated;
        }
        return g;
      })
    );

    setSelectedGrave((prev) => {
      if (prev?.id === graveId) {
        return { ...prev, candles: prev.candles + 1, userCandled: true };
      }
      return prev;
    });

    showNotification("🕯️ A virtual candle has been lit in eternal memory.");
  }, []);

  const handleLeaveFlower = useCallback((graveId: string) => {
    arcadeAudio.playFlower();
    setGraves((prev) =>
      prev.map((g) => {
        if (g.id === graveId) {
          const updated = {
            ...g,
            flowers: g.flowers + 1,
            userFlowered: true,
          };
          saveUserTributeUpdate(graveId, { userFlowered: true });
          return updated;
        }
        return g;
      })
    );

    setSelectedGrave((prev) => {
      if (prev?.id === graveId) {
        return { ...prev, flowers: prev.flowers + 1, userFlowered: true };
      }
      return prev;
    });

    showNotification("🌸 Memorial flowers have been laid at the foot of the stone.");
  }, []);

  const handleAddTribute = useCallback((graveId: string, message: string) => {
    arcadeAudio.playCoin();
    const newTrib = {
      id: `trib_${Date.now()}`,
      author: "Kind Stranger",
      message,
      timestamp: "Just now",
      type: 'note' as const,
    };

    setGraves((prev) =>
      prev.map((g) => {
        if (g.id === graveId) {
          const updated = {
            ...g,
            tributes: [newTrib, ...g.tributes],
          };
          saveUserTributeUpdate(graveId, { newTribute: newTrib });
          return updated;
        }
        return g;
      })
    );

    setSelectedGrave((prev) => {
      if (prev?.id === graveId) {
        return { ...prev, tributes: [newTrib, ...prev.tributes] };
      }
      return prev;
    });

    showNotification("💬 Your condolences have been engraved into the memorial wall.");
  }, []);

  const handleBuryGrave = useCallback((newGrave: TombstoneData) => {
    arcadeAudio.playBury();
    setGraves((prev) => [newGrave, ...prev]);
    saveUserGrave(newGrave);
    // Smoothly fly camera to new grave and zoom in
    smoothFlyTo(newGrave.worldX, newGrave.worldY, 1.4);
    setSelectedGrave(newGrave);
    showNotification("⚰️ Memory buried. Your private solace response is ready.");
  }, [smoothFlyTo]);

  const handleWarpRandom = useCallback(() => {
    arcadeAudio.playWarp();
    // Pick a random grave
    const randomIndex = Math.floor(Math.random() * graves.length);
    const target = graves[randomIndex];
    if (target) {
      smoothFlyTo(target.worldX, target.worldY, 1.35);
      showNotification(`🔮 Warped to "${target.title}" [${target.category.toUpperCase()}]`);
    }
  }, [graves, smoothFlyTo]);

  const handleZoomIn = useCallback(() => {
    arcadeAudio.playZoom();
    setCamera((prev) => ({ ...prev, zoom: Math.min(3.2, prev.zoom * 1.3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    arcadeAudio.playZoom();
    setCamera((prev) => ({ ...prev, zoom: Math.max(0.18, prev.zoom * 0.75) }));
  }, []);

  const handleResetCamera = useCallback(() => {
    arcadeAudio.playCameraReset();
    smoothFlyTo(0, 0, 0.18);
    showNotification("🧭 View completely zoomed out across the graveyard.");
  }, [smoothFlyTo]);

  const handleZoomChange = useCallback((val: number) => {
    setCamera((prev) => ({ ...prev, zoom: val }));
  }, []);

  return (
    <main 
      id="memory-graveyard-app"
      className={`relative w-screen h-screen overflow-hidden bg-[#08090d] text-white ${
        crtEnabled ? 'crt-scanlines' : ''
      }`}
    >
      {/* 60FPS Apple Watch Staggered Grid Canvas */}
      <GraveyardCanvas
        graves={graves}
        onSelectGrave={handleSelectGrave}
        selectedGraveId={selectedGrave?.id || null}
        camera={camera}
        setCamera={setCamera}
        fisheyeEnabled={fisheyeEnabled}
        activeCategory={activeCategory}
      />

      {/* Retro Arcade HUD Interface */}
      <ArcadeHUD
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          arcadeAudio.playCategorySwitch(cat);
          setActiveCategory(cat);
        }}
        onOpenBuryModal={() => {
          arcadeAudio.playModalOpen();
          setIsBuryModalOpen(true);
        }}
        onOpenMyPosts={() => {
          arcadeAudio.playModalOpen();
          setIsMyPostsModalOpen(true);
        }}
        myPostsCount={myGraves.length}
        onOpenLegal={handleOpenLegal}
        onOpenWelcome={handleOpenWelcome}
        onWarpRandom={handleWarpRandom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetCamera={handleResetCamera}
        cameraZoom={camera.zoom}
        onZoomChange={handleZoomChange}
      />

      {/* First-Time Visitor Welcome & What You Can Do Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcome}
        onOpenBuryModal={() => {
          handleCloseWelcome();
          arcadeAudio.playModalOpen();
          setIsBuryModalOpen(true);
        }}
      />

      {/* Tombstone Inspection / Memorial Tribute Modal */}
      <TombstoneModal
        grave={selectedGrave}
        isAuthor={isAuthorOfSelected}
        onClose={() => {
          arcadeAudio.playModalClose();
          setSelectedGrave(null);
        }}
        onLightCandle={handleLightCandle}
        onLeaveFlower={handleLeaveFlower}
        onAddTribute={handleAddTribute}
      />

      {/* User's Buried Memories & Private Responses Modal */}
      <MyPostsModal
        isOpen={isMyPostsModalOpen}
        onClose={() => {
          arcadeAudio.playModalClose();
          setIsMyPostsModalOpen(false);
        }}
        myGraves={myGraves}
        onSelectGrave={(grave) => {
          arcadeAudio.playSelect();
          smoothFlyTo(grave.worldX, grave.worldY, 1.4);
          setSelectedGrave(grave);
        }}
        onOpenBuryModal={() => {
          arcadeAudio.playModalOpen();
          setIsBuryModalOpen(true);
        }}
      />

      {/* Dig Grave & Bury Regret Modal */}
      <BuryRegretModal
        isOpen={isBuryModalOpen}
        onClose={() => {
          arcadeAudio.playModalClose();
          setIsBuryModalOpen(false);
        }}
        onBury={handleBuryGrave}
        existingCount={graves.length}
      />

      {/* Info, Privacy Policy & Cookies Modal */}
      <InfoLegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => {
          arcadeAudio.playModalClose();
          setIsLegalModalOpen(false);
        }}
        onOpenWelcome={handleOpenWelcome}
        onDataPurged={() => {
          const base = generateCemeteryGrid();
          setGraves(base);
          setSelectedGrave(null);
          showNotification("Local graveyard storage wiped.");
        }}
      />

      {/* Client-side Storage / Cookie Consent Banner */}
      <CookieBanner
        onOpenLegal={(tab) => handleOpenLegal(tab)}
      />

      {/* Floating Retro Notification Toast */}
      {notification && (
        <div 
          id="graveyard-notification-toast"
          className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#0284c7] border-2 border-white text-white font-['Press_Start_2P'] text-[10px] tracking-wide shadow-[4px_4px_0px_#000000] animate-bounce"
        >
          {notification}
        </div>
      )}
    </main>
  );
}

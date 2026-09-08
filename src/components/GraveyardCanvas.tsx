import React, { useEffect, useRef, useCallback } from 'react';
import { TombstoneData, GraveCategory, TombstoneStyle } from '../types';
import { arcadeAudio } from '../utils/audio';

interface Props {
  graves: TombstoneData[];
  onSelectGrave: (grave: TombstoneData) => void;
  selectedGraveId: string | null;
  camera: { x: number; y: number; zoom: number };
  setCamera: React.Dispatch<React.SetStateAction<{ x: number; y: number; zoom: number }>>;
  fisheyeEnabled: boolean;
  activeCategory: string | null;
}

// Category palette for vintage arcade theme
const CATEGORY_COLORS: Record<GraveCategory, { main: string; bg: string; border: string; glow: string; text: string }> = {
  regret: { main: '#a855f7', bg: '#2e1065', border: '#c084fc', glow: 'rgba(168, 85, 247, 0.4)', text: '#e9d5ff' },
  failed_idea: { main: '#06b6d4', bg: '#083344', border: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)', text: '#cffafe' },
  cringe: { main: '#f59e0b', bg: '#451a03', border: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)', text: '#fef3c7' },
  missed_chance: { main: '#ec4899', bg: '#500724', border: '#f472b6', glow: 'rgba(236, 72, 153, 0.4)', text: '#fce7f3' },
  career_blunder: { main: '#ef4444', bg: '#450a0a', border: '#f87171', glow: 'rgba(239, 68, 68, 0.4)', text: '#fee2e2' },
  financial_loss: { main: '#10b981', bg: '#022c22', border: '#34d399', glow: 'rgba(16, 185, 129, 0.4)', text: '#d1fae5' },
};

// Tombstone stone textures / colors
const STYLE_PALETTES: Record<TombstoneStyle, { stone: string; stoneDark: string; detail: string }> = {
  slate: { stone: '#4b5563', stoneDark: '#1f2937', detail: '#9ca3af' },
  granite: { stone: '#64748b', stoneDark: '#334155', detail: '#cbd5e1' },
  neon: { stone: '#1e1b4b', stoneDark: '#0f172a', detail: '#818cf8' },
  crypt: { stone: '#3f3f46', stoneDark: '#18181b', detail: '#a1a1aa' },
  gilded: { stone: '#78350f', stoneDark: '#451a03', detail: '#fbbf24' },
  mossy: { stone: '#27272a', stoneDark: '#14532d', detail: '#4ade80' },
};

export const GraveyardCanvas: React.FC<Props> = ({
  graves,
  onSelectGrave,
  selectedGraveId,
  camera,
  setCamera,
  fisheyeEnabled,
  activeCategory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drag and pan tracking state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const hoveredGraveRef = useRef<TombstoneData | null>(null);
  const animationFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const pinchDistRef = useRef<number | null>(null);

  // Mobile & tablet touch tracking
  const touchStartPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const touchMovedDistRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const lastProcessedTouchTimeRef = useRef<number>(0);

  // Quick lookup spatial structure or array
  const gravesRef = useRef(graves);
  gravesRef.current = graves;

  // Keep live references for the 60fps render loop to eliminate hook remounting & GC thrashing
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const fisheyeRef = useRef(fisheyeEnabled);
  fisheyeRef.current = fisheyeEnabled;
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;
  const selectedGraveIdRef = useRef(selectedGraveId);
  selectedGraveIdRef.current = selectedGraveId;

  // Common high-performance hit-testing for both mouse hover and phone/tablet touch
  const findGraveAtScreenCoords = useCallback((screenX: number, screenY: number, isTouch = false): TombstoneData | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const currentCam = cameraRef.current;
    const currentFisheye = fisheyeRef.current;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const approxWorldMouseX = currentCam.x + (screenX - width / 2) / currentCam.zoom;
    const approxWorldMouseY = currentCam.y + (screenY - height / 2) / currentCam.zoom;
    const maxReach = (currentFisheye ? 85 : 60) / currentCam.zoom;

    let found: TombstoneData | null = null;
    // On touch devices (phones/tablets), provide a larger, more forgiving hit radius for thumbs
    const baseHitRadius = isTouch ? 60 : 48;
    let minDistance = baseHitRadius * currentCam.zoom;

    const list = gravesRef.current;
    for (let i = 0; i < list.length; i++) {
      const g = list[i];
      if (
        Math.abs(g.worldX - approxWorldMouseX) > maxReach ||
        Math.abs(g.worldY - approxWorldMouseY) > maxReach
      ) {
        continue;
      }

      let sx = (g.worldX - currentCam.x) * currentCam.zoom + width / 2;
      let sy = (g.worldY - currentCam.y) * currentCam.zoom + height / 2;
      let r = (isTouch ? 54 : 44) * currentCam.zoom;

      if (currentFisheye) {
        const cdx = sx - width / 2;
        const cdy = sy - height / 2;
        const distFromCenter = Math.hypot(cdx, cdy);
        const maxDim = Math.hypot(width, height) / 2;
        const factor = Math.max(0, 1 - distFromCenter / maxDim);
        const fisheyeScale = 1 + factor * 0.45;
        r *= fisheyeScale;
        sx = width / 2 + cdx * (1 + factor * 0.08);
        sy = height / 2 + cdy * (1 + factor * 0.08);
      }

      const distToCursor = Math.hypot(screenX - sx, screenY - sy);
      if (distToCursor <= r && distToCursor < minDistance) {
        minDistance = distToCursor;
        found = g;
      }
    }
    return found;
  }, []);

  // Mouse / Touch handlers for fluid panning and zooming
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { vx: 0, vy: 0 };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setCamera(prev => ({
        ...prev,
        x: prev.x - dx / prev.zoom,
        y: prev.y - dy / prev.zoom,
      }));

      velocityRef.current = { vx: -dx / prevZoomRef.current, vy: -dy / prevZoomRef.current };
    } else {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const found = findGraveAtScreenCoords(mouseX, mouseY, false);

      if (found !== hoveredGraveRef.current) {
        hoveredGraveRef.current = found;
        if (found) {
          canvas.style.cursor = 'pointer';
          arcadeAudio.playHover();
        } else {
          canvas.style.cursor = 'grab';
        }
      }
    }
  }, [findGraveAtScreenCoords, setCamera]);

  const prevZoomRef = useRef(camera.zoom);
  prevZoomRef.current = camera.zoom;

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = hoveredGraveRef.current ? 'pointer' : 'grab';
      }
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // If recently handled by touch tap within 450ms, ignore synthetic click
    if (Date.now() - lastProcessedTouchTimeRef.current < 450) return;

    const v = Math.hypot(velocityRef.current.vx, velocityRef.current.vy);
    if (v > 2) return;

    if (hoveredGraveRef.current) {
      arcadeAudio.playSelect();
      onSelectGrave(hoveredGraveRef.current);
    }
  }, [onSelectGrave]);

  // Native non-passive Wheel / Trackpad listener to support smooth trackpad pinch & scroll zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      // Trackpad pinch-to-zoom sets e.ctrlKey = true
      // Standard two-finger trackpad scroll or mouse wheel has continuous deltaY
      let zoomFactor: number;
      if (e.ctrlKey) {
        zoomFactor = Math.exp(-e.deltaY * 0.012);
      } else if (Math.abs(e.deltaY) < 40) {
        zoomFactor = Math.exp(-e.deltaY * 0.0035);
      } else {
        zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      }

      setCamera(prev => {
        const nextZoom = Math.max(0.18, Math.min(3.5, prev.zoom * zoomFactor));
        const worldCursorX = prev.x + (cursorX - width / 2) / prev.zoom;
        const worldCursorY = prev.y + (cursorY - height / 2) / prev.zoom;

        const nextX = worldCursorX - (cursorX - width / 2) / nextZoom;
        const nextY = worldCursorY - (cursorY - height / 2) / nextZoom;

        return {
          x: nextX,
          y: nextY,
          zoom: nextZoom,
        };
      });
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [setCamera]);

  // Touch support for mobile pinch zoom & pan with momentum flicking
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      touchMovedDistRef.current = 0;
      velocityRef.current = { vx: 0, vy: 0 };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchMovedDistRef.current += Math.hypot(dx, dy);

      setCamera(prev => {
        velocityRef.current = { vx: -dx / prev.zoom, vy: -dy / prev.zoom };
        return {
          ...prev,
          x: prev.x - dx / prev.zoom,
          y: prev.y - dy / prev.zoom,
        };
      });
    } else if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / pinchDistRef.current;
      pinchDistRef.current = newDist;

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setCamera(prev => {
        const nextZoom = Math.max(0.16, Math.min(3.5, prev.zoom * ratio));
        const worldMidX = prev.x + (midX - width / 2) / prev.zoom;
        const worldMidY = prev.y + (midY - height / 2) / prev.zoom;

        return {
          x: worldMidX - (midX - width / 2) / nextZoom,
          y: worldMidY - (midY - height / 2) / nextZoom,
          zoom: nextZoom,
        };
      });
    }
  }, [setCamera]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
      pinchDistRef.current = null;

      const now = Date.now();
      const elapsed = now - touchStartPosRef.current.time;
      const dist = touchMovedDistRef.current;

      // Clean tap detection on phone / tablet
      if (dist < 14 && elapsed < 400 && canvas) {
        lastProcessedTouchTimeRef.current = now;
        const rect = canvas.getBoundingClientRect();
        const tapX = touchStartPosRef.current.x - rect.left;
        const tapY = touchStartPosRef.current.y - rect.top;

        // Double-tap zoom on tablet / phone
        const timeSinceLastTap = now - lastTapTimeRef.current;
        if (timeSinceLastTap < 320 && timeSinceLastTap > 40) {
          arcadeAudio.playZoom();
          const width = rect.width;
          const height = rect.height;
          setCamera(prev => {
            const nextZoom = Math.min(3.2, prev.zoom * 1.55);
            const worldTapX = prev.x + (tapX - width / 2) / prev.zoom;
            const worldTapY = prev.y + (tapY - height / 2) / prev.zoom;
            return {
              x: worldTapX - (tapX - width / 2) / nextZoom,
              y: worldTapY - (tapY - height / 2) / nextZoom,
              zoom: nextZoom,
            };
          });
          lastTapTimeRef.current = 0;
          return;
        }

        lastTapTimeRef.current = now;

        const tappedGrave = findGraveAtScreenCoords(tapX, tapY, true);
        if (tappedGrave) {
          arcadeAudio.playSelect();
          onSelectGrave(tappedGrave);
        }
      }
    } else if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pinchDistRef.current = null;
    }
  }, [findGraveAtScreenCoords, onSelectGrave, setCamera]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = (time: number) => {
      if (!isMounted) return;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      // Inertia decay for camera momentum
      if (!isDraggingRef.current && (Math.abs(velocityRef.current.vx) > 0.1 || Math.abs(velocityRef.current.vy) > 0.1)) {
        setCamera(prev => ({
          ...prev,
          x: prev.x + velocityRef.current.vx * dt * 30,
          y: prev.y + velocityRef.current.vy * dt * 30,
        }));
        velocityRef.current.vx *= 0.92;
        velocityRef.current.vy *= 0.92;
      }

      // Handle resize / retina resolution
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.round(rect.width * dpr);
      const displayHeight = Math.round(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      const screenWidth = rect.width;
      const screenHeight = rect.height;

      // Extract current live state from refs for steady 60/120 FPS rendering without hook re-mounting
      const camera = cameraRef.current;
      const fisheyeEnabled = fisheyeRef.current;
      const activeCategory = activeCategoryRef.current;
      const selectedGraveId = selectedGraveIdRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background: Deep retro arcade cathode graveyard dark
      ctx.fillStyle = '#08090d';
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      // Vintage arcade grid lines / stars in background
      const gridSpacing = 80 * camera.zoom;
      if (gridSpacing > 12) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.lineWidth = 1;
        const offsetX = ((-camera.x * camera.zoom + screenWidth / 2) % gridSpacing + gridSpacing) % gridSpacing;
        const offsetY = ((-camera.y * camera.zoom + screenHeight / 2) % gridSpacing + gridSpacing) % gridSpacing;

        ctx.beginPath();
        for (let x = offsetX; x < screenWidth; x += gridSpacing) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, screenHeight);
        }
        for (let y = offsetY; y < screenHeight; y += gridSpacing) {
          ctx.moveTo(0, y);
          ctx.lineTo(screenWidth, y);
        }
        ctx.stroke();
      }

      // Viewport bounds in world space for spatial culling
      const margin = 120 / camera.zoom;
      const minWorldX = camera.x - screenWidth / (2 * camera.zoom) - margin;
      const maxWorldX = camera.x + screenWidth / (2 * camera.zoom) + margin;
      const minWorldY = camera.y - screenHeight / (2 * camera.zoom) - margin;
      const maxWorldY = camera.y + screenHeight / (2 * camera.zoom) + margin;

      const currentHovered = hoveredGraveRef.current;
      const flamePhase = Math.sin(time * 0.009) * 2;

      // Draw all visible icons in continuous staggered field
      const list = gravesRef.current;
      for (let i = 0; i < list.length; i++) {
        const grave = list[i];

        // Spatial culling
        if (
          grave.worldX < minWorldX ||
          grave.worldX > maxWorldX ||
          grave.worldY < minWorldY ||
          grave.worldY > maxWorldY
        ) {
          continue;
        }

        // Filter checks
        const matchesCategory = !activeCategory || grave.category === activeCategory;
        const isDimmed = !matchesCategory && Boolean(activeCategory);
        const isHovered = currentHovered?.id === grave.id;
        const isSelected = selectedGraveId === grave.id;

        // Calculate screen coordinates
        let sx = (grave.worldX - camera.x) * camera.zoom + screenWidth / 2;
        let sy = (grave.worldY - camera.y) * camera.zoom + heightToCenterOffset(screenHeight);
        
        let nodeRadius = 45 * camera.zoom;

        // Apple Watch Fisheye Lens calculation
        if (fisheyeEnabled) {
          const cdx = sx - screenWidth / 2;
          const cdy = sy - screenHeight / 2;
          const distFromCenter = Math.hypot(cdx, cdy);
          const maxDim = Math.hypot(screenWidth, screenHeight) / 2;
          const factor = Math.max(0, 1 - distFromCenter / maxDim);
          const fisheyeScale = 1 + factor * 0.45;
          nodeRadius *= fisheyeScale;
          sx = screenWidth / 2 + cdx * (1 + factor * 0.08);
          sy = screenHeight / 2 + cdy * (1 + factor * 0.08);
        }

        // Render circular app icon container
        ctx.save();
        ctx.translate(sx, sy);

        if (isDimmed) {
          ctx.globalAlpha = 0.22;
        }

        const catTheme = CATEGORY_COLORS[grave.category] || CATEGORY_COLORS.regret;
        const styleTheme = STYLE_PALETTES[grave.tombstoneStyle] || STYLE_PALETTES.slate;

        // Outer glow on hover or selected
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(0, 0, nodeRadius + (isHovered ? 8 : 12), 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(234, 179, 8, 0.4)' : catTheme.glow;
          ctx.fill();
        }

        // Circular Apple Watch icon base
        ctx.beginPath();
        ctx.arc(0, 0, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = catTheme.bg;
        ctx.fill();

        // 8-bit / arcade border
        ctx.lineWidth = Math.max(1.5, 3 * (nodeRadius / 45));
        ctx.strokeStyle = isSelected ? '#facc15' : isHovered ? '#ffffff' : catTheme.border;
        ctx.stroke();

        // Inner circle backdrop for tombstone
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, nodeRadius - 3.5 * (nodeRadius / 45)), 0, Math.PI * 2);
        ctx.fillStyle = '#0f1117';
        ctx.fill();

        // LEVEL OF DETAIL (LOD) RENDERING

        // FAR LOD (Tiny icons, Zoom < 0.38)
        if (camera.zoom < 0.38) {
          // Minimalist pixel tombstone glyph
          const glyphW = nodeRadius * 0.65;
          const glyphH = nodeRadius * 0.85;
          ctx.fillStyle = styleTheme.stone;
          // Tombstone arch
          ctx.beginPath();
          ctx.arc(0, -glyphH * 0.15, glyphW * 0.45, Math.PI, 0);
          ctx.rect(-glyphW * 0.45, -glyphH * 0.15, glyphW * 0.9, glyphH * 0.6);
          ctx.fill();

          // Tiny candle or flower dot indicator
          if (grave.candles > 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-2, glyphH * 0.1, 4, 4);
          }
          if (grave.flowers > 0) {
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(glyphW * 0.15, glyphH * 0.25, 4, 4);
          }
        }
        // MID LOD (0.38 <= Zoom < 0.95)
        else if (camera.zoom < 0.95) {
          drawPixelTombstoneMid(ctx, nodeRadius, styleTheme, catTheme, grave, flamePhase);
        }
        // DETAILED LOD (Zoom >= 0.95)
        else {
          drawPixelTombstoneDetailed(ctx, nodeRadius, styleTheme, catTheme, grave, flamePhase, isHovered);
        }

        ctx.restore();
      }

      // If hovering a grave, draw floating vintage reticle & tooltip
      if (currentHovered && !isDraggingRef.current) {
        drawArcadeTooltip(ctx, currentHovered, camera, screenWidth, screenHeight, fisheyeEnabled);
      }

      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [setCamera]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

function heightToCenterOffset(screenHeight: number) {
  return screenHeight / 2;
}

// Draw mid-level detail tombstone inside circular icon
function drawPixelTombstoneMid(
  ctx: CanvasRenderingContext2D,
  radius: number,
  styleTheme: { stone: string; stoneDark: string; detail: string },
  catTheme: { main: string; text: string },
  grave: TombstoneData,
  flamePhase: number
) {
  const w = radius * 0.9;
  const h = radius * 1.15;
  const yOffset = radius * 0.05;

  // Tombstone base pedestal
  ctx.fillStyle = styleTheme.stoneDark;
  ctx.fillRect(-w * 0.55, yOffset + h * 0.32, w * 1.1, h * 0.16);

  // Tombstone slab
  ctx.fillStyle = styleTheme.stone;
  ctx.beginPath();
  ctx.arc(0, yOffset - h * 0.1, w * 0.42, Math.PI, 0);
  ctx.rect(-w * 0.42, yOffset - h * 0.1, w * 0.84, h * 0.44);
  ctx.fill();

  // Highlight border
  ctx.strokeStyle = styleTheme.detail;
  ctx.lineWidth = Math.max(1, radius * 0.04);
  ctx.stroke();

  // Cross or skull icon
  ctx.fillStyle = styleTheme.stoneDark;
  ctx.fillRect(-2, yOffset - h * 0.25, 4, 12);
  ctx.fillRect(-6, yOffset - h * 0.2, 12, 4);

  // Truncated title
  ctx.font = `${Math.max(8, Math.round(radius * 0.17))}px 'Press Start 2P', monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  const shortTitle = grave.title.length > 9 ? grave.title.substring(0, 8) + '..' : grave.title;
  ctx.fillText(shortTitle, 0, yOffset + h * 0.08);

  // Category colored year
  ctx.font = `${Math.max(7, Math.round(radius * 0.14))}px monospace`;
  ctx.fillStyle = catTheme.text;
  ctx.fillText(`${grave.year}`, 0, yOffset + h * 0.24);

  // Candles & Flowers mini indicators
  if (grave.candles > 0) {
    // Left side candle with flickering flame
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-w * 0.4, yOffset + h * 0.18, 4, 8);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-w * 0.4 + 2, yOffset + h * 0.14 + flamePhase * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (grave.flowers > 0) {
    // Right side flower bouquet
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(w * 0.36, yOffset + h * 0.22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.fillRect(w * 0.36 - 1, yOffset + h * 0.26, 2, 6);
  }
}

// Draw high-level rich pixel art tombstone when zoomed in close
function drawPixelTombstoneDetailed(
  ctx: CanvasRenderingContext2D,
  radius: number,
  styleTheme: { stone: string; stoneDark: string; detail: string },
  catTheme: { main: string; text: string; glow: string },
  grave: TombstoneData,
  flamePhase: number,
  isHovered: boolean
) {
  const w = radius * 1.05;
  const h = radius * 1.35;
  const yOffset = -radius * 0.04;

  // Ground grass / dirt patch
  ctx.fillStyle = '#161b22';
  ctx.beginPath();
  ctx.ellipse(0, yOffset + h * 0.46, w * 0.65, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stepped Pedestal base
  ctx.fillStyle = styleTheme.stoneDark;
  ctx.fillRect(-w * 0.52, yOffset + h * 0.36, w * 1.04, h * 0.12);
  ctx.fillRect(-w * 0.44, yOffset + h * 0.28, w * 0.88, h * 0.09);

  // Main Headstone Arch
  ctx.fillStyle = styleTheme.stone;
  ctx.beginPath();
  ctx.arc(0, yOffset - h * 0.15, w * 0.38, Math.PI, 0);
  ctx.rect(-w * 0.38, yOffset - h * 0.15, w * 0.76, h * 0.44);
  ctx.fill();

  // Stone crack / texture details
  ctx.strokeStyle = styleTheme.detail;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Engraved R.I.P.
  ctx.font = `bold ${Math.round(radius * 0.18)}px 'Press Start 2P', monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText("R.I.P.", 0, yOffset - h * 0.22);

  // Decorative engraved emblem (Skull or Cross)
  ctx.fillStyle = styleTheme.stoneDark;
  ctx.fillRect(-3, yOffset - h * 0.12, 6, 14);
  ctx.fillRect(-8, yOffset - h * 0.07, 16, 5);

  // Title of the buried regret
  ctx.font = `${Math.max(9, Math.round(radius * 0.14))}px 'Press Start 2P', monospace`;
  ctx.fillStyle = '#f8fafc';
  
  // Wrap or truncate title to 2 lines
  const words = grave.title.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of words) {
    if ((line1 + ' ' + word).trim().length <= 11 && !line2) {
      line1 = (line1 + ' ' + word).trim();
    } else {
      line2 = (line2 + ' ' + word).trim();
    }
  }
  if (line2.length > 11) line2 = line2.substring(0, 9) + '..';

  ctx.fillText(line1, 0, yOffset + h * 0.08);
  if (line2) {
    ctx.fillText(line2, 0, yOffset + h * 0.19);
  }

  // Category Pill Badge
  ctx.font = `${Math.max(8, Math.round(radius * 0.12))}px monospace`;
  ctx.fillStyle = catTheme.text;
  ctx.fillText(`${grave.category.replace('_', ' ').toUpperCase()} • ${grave.year}`, 0, yOffset + h * 0.34);

  // Candle shrine with animated pixel flame
  const candleCount = grave.candles;
  if (candleCount > 0) {
    // Left candle
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-w * 0.44, yOffset + h * 0.26, 6, 14);
    // Candle flame (flickering 8-bit pixel flame)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-w * 0.44 + 3, yOffset + h * 0.2 + flamePhase * 0.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-w * 0.44 + 1.5, yOffset + h * 0.19 + flamePhase * 0.5, 3, 3);
  }

  // Flower tributes
  const flowerCount = grave.flowers;
  if (flowerCount > 0) {
    // Right flower bouquet
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(w * 0.38, yOffset + h * 0.32, 5.5, 0, Math.PI * 2);
    ctx.arc(w * 0.44, yOffset + h * 0.38, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.fillRect(w * 0.38 - 1.5, yOffset + h * 0.38, 3, 10);
  }

  // Mini tribute counter tags
  ctx.font = `${Math.max(8, Math.round(radius * 0.1))}px monospace`;
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'left';
  ctx.fillText(`🕯️${grave.candles}`, -w * 0.44, yOffset + h * 0.48);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f472b6';
  ctx.fillText(`🌸${grave.flowers}`, w * 0.44, yOffset + h * 0.48);
}

// Tooltip when hovering over a grave
function drawArcadeTooltip(
  ctx: CanvasRenderingContext2D,
  grave: TombstoneData,
  camera: { x: number; y: number; zoom: number },
  screenWidth: number,
  screenHeight: number,
  fisheyeEnabled: boolean
) {
  let sx = (grave.worldX - camera.x) * camera.zoom + screenWidth / 2;
  let sy = (grave.worldY - camera.y) * camera.zoom + screenHeight / 2;

  if (fisheyeEnabled) {
    const cdx = sx - screenWidth / 2;
    const cdy = sy - screenHeight / 2;
    const distFromCenter = Math.hypot(cdx, cdy);
    const maxDim = Math.hypot(screenWidth, screenHeight) / 2;
    const factor = Math.max(0, 1 - distFromCenter / maxDim);
    sx = screenWidth / 2 + cdx * (1 + factor * 0.08);
    sy = screenHeight / 2 + cdy * (1 + factor * 0.08);
  }

  // Draw arcade targeting reticle around node
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  const boxSize = 58 * camera.zoom;
  const cornerLen = 14;

  // 4 corners of reticle
  // Top-left
  ctx.beginPath();
  ctx.moveTo(sx - boxSize, sy - boxSize + cornerLen);
  ctx.lineTo(sx - boxSize, sy - boxSize);
  ctx.lineTo(sx - boxSize + cornerLen, sy - boxSize);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(sx + boxSize - cornerLen, sy - boxSize);
  ctx.lineTo(sx + boxSize, sy - boxSize);
  ctx.lineTo(sx + boxSize, sy - boxSize + cornerLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(sx - boxSize, sy + boxSize - cornerLen);
  ctx.lineTo(sx - boxSize, sy + boxSize);
  ctx.lineTo(sx - boxSize + cornerLen, sy + boxSize);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(sx + boxSize - cornerLen, sy + boxSize);
  ctx.lineTo(sx + boxSize, sy + boxSize);
  ctx.lineTo(sx + boxSize, sy + boxSize - cornerLen);
  ctx.stroke();

  // Tooltip bubble
  const pad = 12;
  const tipWidth = Math.min(270, screenWidth - 32);
  const hasCoronerNote = Boolean(grave.causeOfDeath);
  const tipHeight = hasCoronerNote ? 88 : 74;
  let tipX = sx - tipWidth / 2;
  let tipY = sy - boxSize - tipHeight - 12;

  // Boundary checks
  if (tipY < 70) tipY = sy + boxSize + 14;
  if (tipX < 16) tipX = 16;
  if (tipX + tipWidth > screenWidth - 16) tipX = screenWidth - tipWidth - 16;

  // Tooltip Box background with arcade pixel shadow
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tipX, tipY, tipWidth, tipHeight);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(tipX, tipY, tipWidth, tipHeight);

  // Category Tag
  const catTheme = CATEGORY_COLORS[grave.category] || CATEGORY_COLORS.regret;
  ctx.fillStyle = catTheme.border;
  ctx.font = "9px 'Press Start 2P', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(`[${grave.category.toUpperCase().replace('_', ' ')}]`, tipX + pad, tipY + 18);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = "bold 11px sans-serif";
  const displayTitle = grave.title.length > 28 ? grave.title.substring(0, 26) + '...' : grave.title;
  ctx.fillText(displayTitle, tipX + pad, tipY + 36);

  // Cause of Death / Mortem Line if present
  if (hasCoronerNote && grave.causeOfDeath) {
    ctx.fillStyle = '#f87171';
    ctx.font = "10px monospace";
    const shortMortem = grave.causeOfDeath.length > 30 ? grave.causeOfDeath.slice(0, 28) + '…' : grave.causeOfDeath;
    ctx.fillText(`☠️ ${shortMortem}`, tipX + pad, tipY + 52);
  }

  // Action hint
  ctx.fillStyle = '#94a3b8';
  ctx.font = "10px monospace";
  const statsY = hasCoronerNote ? tipY + 70 : tipY + 56;
  ctx.fillText(`🕯️ ${grave.candles}  🌸 ${grave.flowers}  • CLICK TO INSPECT`, tipX + pad, statsY);

  ctx.restore();
}

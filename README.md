# 🪦 Memory Graveyard

> **An anonymous, vintage arcade-style digital memorial to lay past regrets, failed ideas, and heavy memories to rest.**

Memory Graveyard is an interactive, cathartic web sanctuary where users can anonymously unburden themselves from life's blunders, cringe memories, failed startup dreams, and awkward decisions. Visitors can navigate an infinite, staggered cemetery canvas, read headstones left by fellow humans across the globe, pay respects with candles and flowers, or dig a plot to bury their own regrets forever.

---

## 🌟 Core Features

### 🗺️ Fluid Zoomable Cemetery Canvas
- **Dynamic Hex/Staggered Grid**: Thousands of unique tombstones laid out in an organic, Apple-Watch-style staggered grid.
- **Fluid Camera System**: Smooth continuous zoom levels (0.4× to 2.5×) with spatial camera centering.
- **Full Touch & Mouse Navigation**:
  - **Desktop**: Click-and-drag panning, scroll wheel zooming, and direct tombstone click inspection.
  - **Mobile & Tablet**: Smooth multi-touch pinch-to-zoom, double-tap quick zoom, momentum inertial swipe panning, and enlarged touch hitboxes.
- **Random Plot Warp**: Jump instantaneously to an unexpected plot across the cemetery.

### ⛏️ Dig a Plot & Bury Regrets
- **100% Anonymous Burial**: No sign-in, accounts, or tracking required.
- **Tombstone Materials**: Choose between Weathered Granite, Polished Marble, Obsidian, Neon Cyan, Mossy Stone, and Gold Trim.
- **Burial Depth & Shame Shields**: Select how deep to submerge the memory (Surface Shallows, Standard 6ft, Deep Crypt, or Mariana Abyss).
- **Coroner's Cause of Demise**: Write a custom cause or roll from a curated collection of humorous, morbid causes of death.
- **Epitaph Generator**: Draft a custom one-liner or roll random epitaphs.
- **Immediate Solace & Rituals**: Receive caretaker words of release and Grim Reaper reflections to bring closure upon burial.

### 🕯️ Interactive Memorial Tributes
- **Light Memorial Flames**: Kindle flickering candles that burn in memory of a shared lesson.
- **Place Flowers**: Lay pixelated bouquets to honor the memory.
- **Kick Dirt**: Express cathartic frustration with an 8-bit dirt-kicking tribute.
- **Visitor Condolences**: Leave and read anonymous heartfelt notes left by visitors on any headstone.

### 🔍 Search, Categories & Stats
- **Instant Keyword Search**: Live query filtering across titles, epitaphs, stories, and causes of death.
- **Category Filter Tabs**:
  - 💔 *Romance & Ghosting*
  - 💼 *Career & Startup Fails*
  - 💸 *Financial Blunders*
  - 🙈 *Cringe Moments*
  - 💾 *Tech & Code Disasters*
  - 📜 *Other Regrets*
- **Live Arcade Ticker**: Real-time stats HUD tracking total plots consecrated, active memorial flames, condolences offered, and recent burials.

### 🕹️ Retro Arcade Experience
- **Web Audio API Sound Engine**: Authentic synthesized 8-bit chip audio (coin insertions, digging sounds, modal chimes, flame whooshes, dirt kicks, category switches).
- **Audio Toggle**: Mute/unmute all retro sounds at any time from the HUD.
- **Vintage CRT Screen FX**: Optional scanline shader and radial vignette toggle for 1980s arcade monitor nostalgia.
- **Introductory Welcome Guide**: Automatic first-time visitor onboarding modal explaining the purpose and controls, re-accessible at any time.

### 🛡️ Privacy, Storage & Crisis Support
- **Zero Trackers**: Uses only browser local storage (`localStorage`) to preserve user-authored plots and tribute interactions.
- **One-Click Purge**: Clear all local data and reset the graveyard at any time in the settings.
- **Support & Crisis Resources**: Dedicated tab in the Sanctuary Archive providing worldwide mental health and crisis hotlines (988 US/Canada, 111 UK, Lifeline Australia, Befrienders Worldwide).

---

## 🎮 Navigation & Controls Reference

| Action | Desktop (Mouse / Keyboard) | Mobile & Tablet (Touch) |
| :--- | :--- | :--- |
| **Pan / Move View** | Click & drag anywhere on the ground | One-finger swipe (with momentum glide) |
| **Zoom In / Out** | Mouse scroll wheel or `+` / `-` HUD buttons | Two-finger pinch-to-zoom or HUD buttons |
| **Quick Zoom** | Click zoom presets in HUD | Double-tap screen to zoom in / reset |
| **Inspect Grave** | Click on any tombstone | Tap directly on any headstone |
| **Bury a Regret** | Click `+ BURY A REGRET` in HUD | Tap `+ BURY` in the bottom action bar |
| **Warp to Random** | Click `WARP` button in HUD | Tap `WARP` in bottom action dock |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Fonts (*Press Start 2P*, *VT323*)
- **Sound Effects**: Native Web Audio API (`AudioContext` custom synthesized waveforms)

---

## 📁 Project Structure

```
├── public/                     # Static assets and favicon
├── src/
│   ├── components/
│   │   ├── ArcadeHUD.tsx       # Retro top header, bottom dock, ticker, search & category filters
│   │   ├── BuryRegretModal.tsx # Form to anonymously dig a plot and bury a regret
│   │   ├── CookieBanner.tsx    # Privacy notice regarding local browser storage
│   │   ├── GraveyardCanvas.tsx # Canvas rendering the infinite zoomable staggered cemetery grid
│   │   ├── InfoLegalModal.tsx  # Sanctuary archive, privacy policy, cookie details & crisis resources
│   │   ├── MyPostsModal.tsx    # Management view for memories consecrated by the current browser
│   │   ├── TombstoneModal.tsx  # Modal to view confessions, light candles, place flowers & leave tributes
│   │   └── WelcomeModal.tsx    # First-time visitor onboarding guide & feature walkthrough
│   ├── data/
│   │   └── cemetery.ts         # Sample graves generator, storage handlers, and local state management
│   ├── utils/
│   │   └── audio.ts            # Web Audio API 8-bit sound effects synthesizer
│   ├── types.ts                # TypeScript interfaces and data models
│   ├── App.tsx                 # Main application state and layout orchestration
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global Tailwind CSS styles and retro scanline shaders
├── index.html                  # HTML entry point with metadata and retro Google Fonts
├── metadata.json               # Application metadata and capability declarations
├── package.json                # Project dependencies and build scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18+** installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/memory-graveyard.git
   cd memory-graveyard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Building for Production

Compile the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Type Checking & Linting

Validate TypeScript types across the codebase:
```bash
npm run lint
```

---

## 🕯️ Philosophy & Disclaimer

> *"To bury a regret is not to erase what happened, but to acknowledge that you are human, forgive your past self, and leave the burden in the soil."*

Memory Graveyard is designed as a humorous yet thoughtful creative space for anonymous personal reflection. It is not a substitute for professional mental health services or psychiatric therapy. If you or someone you know is undergoing severe emotional distress, please consult the resources available under **INFO & PRIVACY > SUPPORT & CRISIS** or contact your local emergency services immediately.

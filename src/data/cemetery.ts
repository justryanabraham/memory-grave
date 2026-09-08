import { TombstoneData, GraveCategory, TombstoneStyle, CemeteryStats } from '../types';
import { sanitizeInput, safeSanitizeObject, safeJsonParse, isStoragePayloadSafe } from '../utils/security';
import { getCoronerCauseOfDeath, getGrimReaperTake } from '../utils/darkHumor';

// Pre-seeded authentic, humorous, bittersweet and creative stories
const TITLES_AND_STORIES: Array<{
  title: string;
  category: GraveCategory;
  epitaph: string;
  story: string;
  year: number | string;
  style: TombstoneStyle;
  causeOfDeath?: string;
  grimReaperTake?: string;
}> = [
  {
    title: "Uber for Pet Rocks",
    category: "failed_idea",
    epitaph: "On-demand mineral companions were ahead of their time.",
    story: "Raised $45,000 from my uncle. Built a real-time GPS tracking app for smooth river pebbles with velvet cushions. Turned out people just pick rocks up off the ground for free.",
    year: 2017,
    style: "neon",
    causeOfDeath: "Zero paying customers; rocks proved uncooperative",
    grimReaperTake: "The Caretaker sighs: 'At least the rocks didn't require equity vesting.'",
  },
  {
    title: "Didn't Ask Out Maya",
    category: "missed_chance",
    epitaph: "The coffee shop rainy afternoon that lived in my head forever.",
    story: "We split an umbrella under the awning for 40 minutes talking about studio Ghibli movies. She said 'I wish this rain would never stop.' I replied 'According to radar it stops in 5 minutes.' I think about this every October.",
    year: 2019,
    style: "crypt",
    causeOfDeath: "Meteorological pedantry at the worst possible romantic juncture",
    grimReaperTake: "The Grim Reaper chuckles: 'Radar was accurate. Your social radar, however, was in a coma.'",
  },
  {
    title: "Sold 12 BTC for a Pizza Oven",
    category: "financial_loss",
    epitaph: "The crust was crispy, but the regret is eternal.",
    story: "Sold 12 Bitcoin back in 2013 to buy an outdoor wood-fired pizza oven kit. Made about four mediocre margherita pizzas before the stone cracked.",
    year: 2013,
    style: "gilded",
    causeOfDeath: "Carb-induced catastrophic wealth evaporation",
    grimReaperTake: "The Reaper shakes his head: 'Those were $800,000 dough balls. Hope you enjoyed the basil.'",
  },
  {
    title: "The Neon Green Trenchcoat",
    category: "cringe",
    epitaph: "I thought I was Neo from The Matrix. I was not.",
    story: "Wore a fluorescent lime Matrix trenchcoat to the first week of 10th grade. Slapped the lockers whenever I turned corners. Nobody told me until junior year.",
    year: 2008,
    style: "slate",
    causeOfDeath: "Acute terminal deluded swagger in high school hallway",
    grimReaperTake: "The Reaper winks: 'Somewhere in the multiverse, you are still slapping those lockers.'",
  },
  {
    title: "Web3 Decentralized Toast",
    category: "failed_idea",
    epitaph: "Every slice verified on the blockchain.",
    story: "Created an IoT toaster that minted an ERC-721 token whenever your bagel was browned. Burning gas fees to burn carbs. Total seed money burned: $180k.",
    year: 2021,
    style: "neon",
    causeOfDeath: "Spent $90 in Ethereum gas fees to burn sourdough",
    grimReaperTake: "The Caretaker shrugs: 'Non-fungible bread. The blockchain will never recover.'",
  },
  {
    title: "Leaving Engineering for dropshipping",
    category: "career_blunder",
    epitaph: "A 3-month guru masterclass destroyed my 401k.",
    story: "Quit a comfortable junior dev job to sell LED shower heads on Shopify after watching a 19-year-old on TikTok with a rented Lamborghini. My garage still has 400 unsold boxes.",
    year: 2022,
    style: "granite",
    causeOfDeath: "Seduced by a rented sportscar and a 10-second TikTok ad",
    grimReaperTake: "The Reaper whispers: 'Those shower heads will outlive us all in that damp garage.'",
  },
  {
    title: "Waved Back at a Stranger",
    category: "cringe",
    epitaph: "He was waving at his mom standing three feet behind me.",
    story: "Full enthusiastic two-handed wave in a silent library lobby. Made aggressive eye contact, walked up, and said 'Hey man!' only for him to hug the woman behind me. Still awake at 3 AM over this.",
    year: 2016,
    style: "mossy",
  },
  {
    title: "Smart Water Bottle with Bluetooth",
    category: "failed_idea",
    epitaph: "It beeped during my grandmother's funeral to tell me I was 12% dehydrated.",
    story: "Spent 18 months designing a thermos that needed firmware updates to unscrew the cap. Brick-walled during an OTA update and stayed locked forever with 500ml of warm kombucha inside.",
    year: 2020,
    style: "slate",
  },
  {
    title: "Skipped My Best Friend's Gig",
    category: "regret",
    epitaph: "Chose to grind World of Warcraft instead.",
    story: "They were playing their first packed headline club show. I said I was sick with the flu, but I was really just raiding Molten Core. They broke up three weeks later.",
    year: 2011,
    style: "crypt",
  },
  {
    title: "10,000 Custom Fidget Spinners",
    category: "financial_loss",
    epitaph: "Arrived in port two weeks after the trend died.",
    story: "Took out a high-interest credit card loan in July 2017 to bulk-import metallic rainbow fidget spinners. Custom branded 'SPIN-TO-WIN'. They arrived in October. I use them as paperweights and drink coasters.",
    year: 2017,
    style: "granite",
  },
  {
    title: "The Accidental Reply-All",
    category: "career_blunder",
    epitaph: "Sent to 850 employees: 'Can you believe Bob's haircut?'",
    story: "Meant to whisper to my desk neighbor on Slack. Pasted into an all-hands company email thread instead. Bob called a special meeting with HR the next morning.",
    year: 2018,
    style: "slate",
  },
  {
    title: "Calling the Teacher 'Mom'",
    category: "cringe",
    epitaph: "The classroom silence was louder than a jet engine.",
    story: "Grade 8 algebra. Raised my hand confidently to ask about quadratic polynomials: 'Mom, is x equal to 4?' You could hear a pin drop across three zip codes.",
    year: 2005,
    style: "mossy",
  },
  {
    title: "Dating App for Dogs (Sniffr)",
    category: "failed_idea",
    epitaph: "Dogs don't have thumbs to swipe right.",
    story: "Thought dogs deserved true romance. Tried making owner profiles where dogs picked mates by barking into the phone microphone. Bark detection accuracy was 4%.",
    year: 2019,
    style: "neon",
  },
  {
    title: "Didn't Learn Spanish in Grandma's Kitchen",
    category: "regret",
    epitaph: "She spoke with her hands, but I wish I had spoken with words.",
    story: "Abuelita spent hours trying to teach me her recipes and language. I just wanted to play Nintendo 64. She passed in 2014, and now I struggle to read her handwritten spice notebooks.",
    year: 2004,
    style: "crypt",
  },
  {
    title: "Shorting Tesla with Student Loans",
    category: "financial_loss",
    epitaph: "The market stayed irrational longer than I stayed solvent.",
    story: "Convinced myself I was Michael Burry after watching a 15-minute YouTube video. Lost $14,000 in three days.",
    year: 2020,
    style: "gilded",
  },
  {
    title: "The Fedora & Silk Flame Shirt Combo",
    category: "cringe",
    epitaph: "Guy Fieri meets 1920s Chicago gangster.",
    story: "Wore this exact outfit to my sister's high school graduation. It is preserved forever in 4K framed family photos in our living room.",
    year: 2009,
    style: "granite",
  },
  {
    title: "Scented QR Codes",
    category: "failed_idea",
    epitaph: "Scratch and sniff marketing for the digital era.",
    story: "A startup pitch to print QR codes with micro-encapsulated bacon smells for restaurant menus. In testing, people just sneezed all over the laminated cards.",
    year: 2015,
    style: "slate",
  },
  {
    title: "Not Taking the Job in Tokyo",
    category: "missed_chance",
    epitaph: "Fear dressed up as practical wisdom.",
    story: "Got offered a one-year design fellowship in Shibuya at 23. Got scared of being lonely and turned it down for a cubicle job in Ohio. I still look at Tokyo train live streams at night.",
    year: 2016,
    style: "crypt",
  },
  {
    title: "Pretending to Like Black Metal",
    category: "cringe",
    epitaph: "Coughing up blood after trying to growl in a hot car.",
    story: "Told a cute barista I was in an atmospheric Norwegian black metal band. She invited her entire friend group to our 'show' this Friday. I had to fake a broken collarbone with a homemade sling.",
    year: 2012,
    style: "neon",
  },
  {
    title: "Subscription Socks with GPS",
    category: "failed_idea",
    epitaph: "Never lose a sock in the dryer again... at $24/month.",
    story: "Integrated coin-cell battery trackers into wool socks. They melted in the dryer and caused three small electrical fires.",
    year: 2018,
    style: "slate",
  },
  {
    title: "Selling the 1968 Mustang for $800",
    category: "financial_loss",
    epitaph: "Thought it just needed an impossible engine rebuild.",
    story: "Sold my dad's old barn-find fastback to a scrap dealer because I needed money for rent and a PlayStation 3. The buyer fixed the fuel pump in 20 minutes and drove away waving.",
    year: 2007,
    style: "granite",
  },
  {
    title: "High-Five to a Closed Fist Bump",
    category: "cringe",
    epitaph: "The eternal awkward turkey trap.",
    story: "Met my girlfriend's strict ex-military father for the first time. He offered a firm fist bump, I wrapped my open palm completely around his knuckle and shook it like a bowling ball.",
    year: 2017,
    style: "mossy",
  },
  {
    title: "Never Apologizing to Marcus",
    category: "regret",
    epitaph: "Pride is a heavy stone to carry alone.",
    story: "Fought over something completely trivial in college dorms—a borrowed bicycle tire pump. We stopped talking for 12 years. By the time I reached out, his number was disconnected.",
    year: 2010,
    style: "crypt",
  },
  {
    title: "Hoverboard Commuter Fleet",
    category: "failed_idea",
    epitaph: "Rode one into a pond in front of the mayor.",
    story: "Pitched municipal hoverboard lanes to the local city council in 2015. Demonstrated live on stage, spun out of control, and knocked over the ceremonial water pitcher.",
    year: 2015,
    style: "neon",
  }
];

// Additional procedural templates to populate 2,500+ graves across the Apple Watch field
const REGRET_SNIPPETS = [
  "Not visiting granddad that last Sunday",
  "Told my sister her art was unrealistic",
  "Threw away my childhood Pokemon cards",
  "Didn't study abroad in Berlin",
  "Ghosted my college roommate after graduation",
  "Sold my guitar to pay for a vacation that got cancelled",
  "Stayed at a dead-end job for 9 years out of comfort",
  "Never learned how to swim because I felt embarrassed",
  "Refused to dance with my dad at his 50th birthday",
  "Deleted the voicemail my mom left on my 21st birthday"
];

const BAD_IDEAS = [
  "Gluten-Free Ice Cubes Inc.",
  "AI-Powered Revolving Doors",
  "Tinder for Vintage Tractors",
  "Edible Smartphone Cases",
  "Subscription Toothpaste by Fax",
  "Autonomous Rollerblades",
  "Silent Disco for Babies",
  "NFTs of Parking Tickets",
  "Crowdsourced Dentistry",
  "Solar Powered Flashlights with cords"
];

const CRINGE_MOMENTS = [
  "Tripped on stage grabbing my diploma",
  "Accidentally sent 'love you' to the landlord",
  "Faked an Australian accent for an entire semester",
  "Burst into tears during a job interview icebreaker",
  "Showed up in black tie to a pool party barbecue",
  "Thought the waiter said 'enjoy the flight' and said 'you too'",
  "Clapped alone at the end of a sad movie",
  "Tucked my tie into my underwear before a presentation"
];

const FINANCIAL_BLUNDERS = [
  "Bought 500 beanie babies as a retirement fund",
  "Lost life savings on Squid Game Token",
  "Bought timeshare in Cleveland during a blizzard",
  "Financed a luxury jet ski with 28% APR",
  "Bought 40 vintage laserdisc players on eBay",
  "Signed a 3-year gym contract and went once",
  "Lent $5,000 to an internet psychic in 2016"
];

const CATEGORIES: GraveCategory[] = [
  'regret',
  'failed_idea',
  'cringe',
  'missed_chance',
  'career_blunder',
  'financial_loss',
];

const STYLES: TombstoneStyle[] = [
  'slate',
  'granite',
  'neon',
  'crypt',
  'gilded',
  'mossy',
];

// Seeded pseudorandom generator for deterministic field layout
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate thousands of circular icons in an Apple Watch staggered honeycomb grid
export function generateCemeteryGrid(): TombstoneData[] {
  const graves: TombstoneData[] = [];
  
  // Apple Watch staggered grid constants
  // Base node radius = 46px, node diameter = 92px
  // Minimal spacing: node spacing X = 104px, row spacing Y = 90px
  const spacingX = 104;
  const spacingY = 90;
  
  // Generate a spiral / concentric rings of staggered columns and rows
  // Ring count ~ 28 produces ~2,400 tightly packed circular graves!
  const maxRadius = 26;
  let counter = 0;

  for (let r = -maxRadius; r <= maxRadius; r++) {
    for (let c = -maxRadius; c <= maxRadius; c++) {
      // Hexagonal / circular distance to create an organic continuous Apple Watch field
      const dist = Math.sqrt(c * c + r * r);
      if (dist > maxRadius) continue;

      // Stagger odd rows
      const isOddRow = Math.abs(r) % 2 === 1;
      const worldX = c * spacingX + (isOddRow ? spacingX * 0.5 : 0);
      const worldY = r * spacingY;

      // Check if we have a curated title for the central/notable graves
      const seed = Math.abs(r * 31337 + c * 7919 + 42);
      let title: string;
      let category: GraveCategory;
      let epitaph: string;
      let story: string;
      let year: number | string;
      let style: TombstoneStyle;
      let predefinedCause: string | undefined;
      let predefinedReaper: string | undefined;

      if (counter < TITLES_AND_STORIES.length) {
        const item = TITLES_AND_STORIES[counter];
        title = item.title;
        category = item.category;
        epitaph = item.epitaph;
        story = item.story;
        year = item.year;
        style = item.style;
        predefinedCause = item.causeOfDeath;
        predefinedReaper = item.grimReaperTake;
      } else {
        // Procedural generator
        const catIndex = Math.floor(seededRandom(seed + 1) * CATEGORIES.length);
        category = CATEGORIES[catIndex];
        style = STYLES[Math.floor(seededRandom(seed + 2) * STYLES.length)];
        year = 1990 + Math.floor(seededRandom(seed + 3) * 35);

        if (category === 'failed_idea') {
          title = BAD_IDEAS[Math.floor(seededRandom(seed + 4) * BAD_IDEAS.length)];
          epitaph = "A brilliant stroke of disastrous genius.";
          story = "We truly believed the market was yearning for this. Three pitches, zero investors, and a very awkward PowerPoint graveyard.";
        } else if (category === 'cringe') {
          title = CRINGE_MOMENTS[Math.floor(seededRandom(seed + 5) * CRINGE_MOMENTS.length)];
          epitaph = "May this memory rest in silent oblivion.";
          story = "The second it happened, my soul left my physical body. It has haunted my midnight ceiling stares ever since.";
        } else if (category === 'financial_loss') {
          title = FINANCIAL_BLUNDERS[Math.floor(seededRandom(seed + 6) * FINANCIAL_BLUNDERS.length)];
          epitaph = "The money is gone. The lesson remains.";
          story = "I convinced myself this was a 100x guaranteed hedge. Turned out to be a 100% loss with extra emotional damage.";
        } else if (category === 'missed_chance') {
          title = "The Train Platform in '14";
          epitaph = "One unspoken sentence changed the timeline.";
          story = "I had the ticket in my coat pocket. I hesitated at the turnstile, watched the doors chime shut, and took the bus home.";
        } else if (category === 'career_blunder') {
          title = "Turned Down Startup Equity for an iPad";
          epitaph = "The iPad stopped taking iOS updates in 2016.";
          story = "Was offered 2% founding equity or a brand new iPad 2 in 2011. I really wanted to play Angry Birds on a big screen.";
        } else {
          title = REGRET_SNIPPETS[Math.floor(seededRandom(seed + 7) * REGRET_SNIPPETS.length)];
          epitaph = "Carried in silence, finally laid beneath the stone.";
          story = "A heavy quiet knot that stayed in my chest for years. May releasing it here grant peace to whoever reads it.";
        }
      }

      // Initial candles and flowers (some popular graves have many, some have few)
      const candles = Math.floor(seededRandom(seed + 8) * 45) + (dist < 5 ? 35 : 2);
      const flowers = Math.floor(seededRandom(seed + 9) * 30) + (dist < 5 ? 20 : 1);

      const cause = getCoronerCauseOfDeath(category, title, predefinedCause);
      const reaperQuote = getGrimReaperTake(category, title, predefinedReaper);

      const grave: TombstoneData = {
        id: `grave_${r}_${c}`,
        col: c,
        row: r,
        worldX,
        worldY,
        title,
        category,
        epitaph,
        story,
        year,
        tombstoneStyle: style,
        candles,
        flowers,
        causeOfDeath: cause,
        grimReaperTake: reaperQuote,
        burialDepth: "6ft",
        dirtKicks: Math.floor(seededRandom(seed + 11) * 8),
        createdAt: new Date(Date.now() - Math.floor(seededRandom(seed + 10) * 10000000000)).toLocaleDateString(),
        tributes: [
          {
            id: `trib_${r}_${c}_1`,
            author: "Anonymous Pilgrim",
            message: "F to pay respects. We have all been there.",
            timestamp: "2 days ago",
            type: "flower",
          },
          {
            id: `trib_${r}_${c}_2`,
            author: "Night Watcher",
            message: "Lighting a candle so this soul finds peace.",
            timestamp: "5 hours ago",
            type: "candle",
          },
        ],
      };

      graves.push(grave);
      counter++;
    }
  }

  cachedBaseGrid = graves;
  return graves;
}

// In-memory cache for ultra-fast re-renders and camera adjustments
let cachedBaseGrid: TombstoneData[] | null = null;

const LOCAL_STORAGE_KEY = 'memory_graveyard_custom_graves_v1';
const TRIBUTES_STORAGE_KEY = 'memory_graveyard_user_tributes_v1';
const USER_POST_IDS_KEY = 'memory_graveyard_user_post_ids_v1';

export function getUserPostIds(): string[] {
  try {
    const raw = localStorage.getItem(USER_POST_IDS_KEY);
    if (!raw) return [];
    const parsed = safeJsonParse<any>(raw, []);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
    }
    // If legacy storage stored an object or dict
    if (parsed && typeof parsed === 'object') {
      const values = Object.values(parsed);
      const stringValues = values.filter((id): id is string => typeof id === 'string' && id.length > 0);
      if (stringValues.length > 0) return stringValues;
      return Object.keys(parsed).filter((k) => k.length > 0);
    }
    return [];
  } catch {
    return [];
  }
}

export function isUserAuthorOfGrave(graveId: string): boolean {
  if (!graveId) return false;
  const ids = getUserPostIds();
  return Array.isArray(ids) ? ids.includes(graveId) : false;
}

export function registerUserPostId(graveId: string) {
  if (!graveId) return;
  try {
    const ids = getUserPostIds();
    const idList = Array.isArray(ids) ? ids : [];
    if (!idList.includes(graveId)) {
      idList.push(graveId);
      if (isStoragePayloadSafe(idList)) {
        localStorage.setItem(USER_POST_IDS_KEY, JSON.stringify(idList));
      }
    }
  } catch {}
}

export function loadUserGraves(): TombstoneData[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeJsonParse<TombstoneData[]>(raw, []);
    if (!Array.isArray(parsed)) return [];
    
    // Auto-register author IDs for all user's buried graves on this browser
    parsed.forEach((g) => {
      if (g.id) registerUserPostId(g.id);
    });
    return parsed;
  } catch (e) {
    console.error("Failed to load user graves safely", e);
    return [];
  }
}

export function saveUserGrave(grave: TombstoneData) {
  try {
    const sanitizedGrave = safeSanitizeObject(grave);
    registerUserPostId(sanitizedGrave.id);
    const existing = loadUserGraves();
    // Cap stored custom graves to prevent local quota abuse
    const updated = [sanitizedGrave, ...existing.filter((g) => g.id !== sanitizedGrave.id)].slice(0, 100);
    if (isStoragePayloadSafe(updated)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save user grave", e);
  }
}

export function loadUserTributes(): Record<string, { userCandled?: boolean; userFlowered?: boolean; dirtKicks?: number; tributes?: any[] }> {
  try {
    const raw = localStorage.getItem(TRIBUTES_STORAGE_KEY);
    const parsed = safeJsonParse<any>(raw, {});
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (e) {
    return {};
  }
}

export function saveUserTributeUpdate(graveId: string, data: { userCandled?: boolean; userFlowered?: boolean; dirtKicks?: number; newTribute?: any }) {
  try {
    const cleanGraveId = sanitizeInput(graveId, 60);
    const all = loadUserTributes();
    const current = all[cleanGraveId] || { tributes: [] };
    if (data.userCandled !== undefined) current.userCandled = Boolean(data.userCandled);
    if (data.userFlowered !== undefined) current.userFlowered = Boolean(data.userFlowered);
    if (data.dirtKicks !== undefined) current.dirtKicks = (current.dirtKicks || 0) + 1;
    if (data.newTribute) {
      const cleanTribute = safeSanitizeObject(data.newTribute);
      // Ensure author is strictly anonymous
      cleanTribute.author = "Anonymous Soul";
      current.tributes = [cleanTribute, ...(current.tributes || [])].slice(0, 50);
    }
    all[cleanGraveId] = current;
    if (isStoragePayloadSafe(all)) {
      localStorage.setItem(TRIBUTES_STORAGE_KEY, JSON.stringify(all));
    }
  } catch (e) {
    console.error("Failed to save tribute", e);
  }
}

export const COOKIE_CONSENT_KEY = 'memory_graveyard_cookie_consent_v1';
export const WELCOME_SEEN_KEY = 'memory_graveyard_welcome_seen_v1';

export function hasSeenWelcomeModal(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setWelcomeModalSeen(seen = true) {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, seen ? 'true' : 'false');
  } catch {}
}

export function getCookieConsentStatus(): 'accepted' | 'declined' | 'unanswered' {
  try {
    const val = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (val === 'accepted') return 'accepted';
    if (val === 'declined') return 'declined';
    return 'unanswered';
  } catch {
    return 'unanswered';
  }
}

export function setCookieConsentStatus(status: 'accepted' | 'declined') {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
  } catch {}
}

export function clearAllUserGraveyardData() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(TRIBUTES_STORAGE_KEY);
    localStorage.removeItem(USER_POST_IDS_KEY);
    localStorage.removeItem(WELCOME_SEEN_KEY);
  } catch (e) {
    console.error("Failed to clear graveyard data", e);
  }
}

export function getStorageUsageSummary() {
  try {
    const customGraves = loadUserGraves();
    const tributes = loadUserTributes();
    const postIds = getUserPostIds();
    
    let totalChars = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('memory_graveyard_')) {
        const val = localStorage.getItem(key) || '';
        totalChars += key.length + val.length;
      }
    }

    return {
      customGravesCount: customGraves.length,
      tributePlotsCount: Object.keys(tributes).length,
      trackedPostsCount: postIds.length,
      approxBytes: totalChars * 2, // 2 bytes per UTF-16 char
    };
  } catch {
    return {
      customGravesCount: 0,
      tributePlotsCount: 0,
      trackedPostsCount: 0,
      approxBytes: 0,
    };
  }
}

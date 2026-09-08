import { GraveCategory } from '../types';

export interface BurialDepthOption {
  depth: string;
  name: string;
  description: string;
  shieldFactor: string;
}

export const BURIAL_DEPTH_OPTIONS: BurialDepthOption[] = [
  {
    depth: "2ft",
    name: "Shallow Ditch",
    description: "Will randomly claw its way back into your 3:14 AM shower thoughts.",
    shieldFactor: "Fragile (20% Shame Shield)",
  },
  {
    depth: "6ft",
    name: "Standard Plot",
    description: "Safely buried beneath six feet of digital topsoil, away from LinkedIn recruiters.",
    shieldFactor: "Stable (75% Shame Shield)",
  },
  {
    depth: "12ft",
    name: "Lead-Lined Vault",
    description: "Impenetrable bunker. Submerged with 1999 Pets.com stock certificates.",
    shieldFactor: "Reinforced (95% Shame Shield)",
  },
  {
    depth: "50ft",
    name: "Mariana Trench of Shame",
    description: "Crushed beneath oceanic atmospheric pressure. Even your therapist won't find it here.",
    shieldFactor: "Absolute Void (100% Shame Shield)",
  },
];

export const CAUSE_OF_DEATH_PRESETS: Array<{ label: string; category?: GraveCategory }> = [
  { label: "Premature microservices architecture & 37 unmerged PRs", category: "failed_idea" },
  { label: "Fatal cringe overdose in the company-wide Slack #general", category: "cringe" },
  { label: "Terminated by 'We can totally build this in a single weekend'", category: "failed_idea" },
  { label: "Suffocated inside a 90-slide pitch deck containing the phrase 'Uber for Cats'", category: "failed_idea" },
  { label: "Sudden cardiac arrest upon checking crypto portfolio in 2022", category: "financial_loss" },
  { label: "Accidental Reply-All with resume and salary expectations attached", category: "career_blunder" },
  { label: "Died of acute exposure to second-hand embarrassment", category: "cringe" },
  { label: "Starved to death waiting for 'npm install' to finish", category: "failed_idea" },
  { label: "Believed a 19-year-old dropshipping guru in a rented Ferrari", category: "financial_loss" },
  { label: "Hesitated at the subway turnstile for 4 seconds too long", category: "missed_chance" },
  { label: "Committed to git main on Friday at 4:59 PM with zero unit tests", category: "career_blunder" },
  { label: "Spontaneous combustion from wearing a fedora with a flame bowling shirt", category: "cringe" },
  { label: "Bought high, panic sold at the absolute Mariana Trench bottom", category: "financial_loss" },
  { label: "Chose grinding Molten Core over attending real-life graduation", category: "regret" },
  { label: "Killed by 'Let's just rewrite the entire codebase in Rust'", category: "failed_idea" },
  { label: "Strangled by 84 open Chrome tabs researching an abandoned hobby", category: "regret" },
];

export const CYNICAL_TICKER_QUIPS: string[] = [
  "REMEMBER: Nobody cares about your blunder because they're paralyzed by their own.",
  "THE REAPER'S TIP: The only difference between a visionary and a lunatic is product-market fit.",
  "COMFORTING THOUGHT: In 5 billion years the sun will expand and incinerate your 2017 text history.",
  "PRO TIP: You can't disappoint your ancestors if you remember they also made terrible life decisions.",
  "STATISTIC: 87% of all startup ideas perish the moment the founder realizes actual work is required.",
  "FUN FACT: The 10,000 unsold fidget spinners in your garage make great beverage coasters.",
  "CARETAKER'S NOTE: Every genius idea you abandon is one fewer disaster for human civilization.",
  "WISDOM: If you didn't cringe at your past self, it means you're still that awkward.",
  "CLOSURE: Your ex has already moved on; you are holding a vigil for a ghost who is currently at IKEA.",
  "CORONER'S LOG: No startups were harmed in the making of this cemetery. Well, maybe 400 of them.",
];

export function getCoronerCauseOfDeath(category: GraveCategory, title: string, existing?: string): string {
  if (existing) return existing;
  const lower = (title || '').toLowerCase();

  if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('stock') || lower.includes('nft')) {
    return "Liquidated at the bottom; funded someone else's yacht";
  }
  if (lower.includes('startup') || lower.includes('app') || lower.includes('uber') || lower.includes('idea')) {
    return "Burned through seed funding on artisanal beanbags and branded stickers";
  }
  if (lower.includes('crush') || lower.includes('text') || lower.includes('ask') || lower.includes('umbrella')) {
    return "Suffocated by terminal overthinking and cowardice";
  }
  if (lower.includes('wave') || lower.includes('shirt') || lower.includes('teacher') || lower.includes('mom')) {
    return "Fatal loss of social dignity in broad daylight";
  }
  if (lower.includes('job') || lower.includes('boss') || lower.includes('reply') || lower.includes('quit')) {
    return "Voluntary career seppuku via keyboard malfunction";
  }

  // Fallback by category
  switch (category) {
    case 'failed_idea':
      return "Died of premature optimization & zero paying customers";
    case 'cringe':
      return "Involuntary midnight shudder; social mortification";
    case 'financial_loss':
      return "Severe blunt-force wallet trauma";
    case 'missed_chance':
      return "Frozen in amber by paralyzing analysis-paralysis";
    case 'career_blunder':
      return "Self-inflicted resume incineration";
    case 'regret':
    default:
      return "Carried in silent torment until decomposing into topsoil";
  }
}

export function getGrimReaperTake(category: GraveCategory, title: string, existing?: string): string {
  if (existing) return existing;
  const lower = (title || '').toLowerCase();

  if (lower.includes('bitcoin') || lower.includes('crypto')) {
    return "The Reaper chuckles: 'At least the blockchain is immutable, so your loss is mathematically immortal.'";
  }
  if (lower.includes('app') || lower.includes('startup')) {
    return "The Caretaker shrugs: 'Silicon Valley buries 5,000 of these before breakfast. Welcome to the mass grave.'";
  }
  if (lower.includes('crush') || lower.includes('love')) {
    return "The Grim Reaper sighs: 'They probably chew with their mouth open anyway. You dodged a bullet.'";
  }
  if (lower.includes('cringe') || lower.includes('wave')) {
    return "The Reaper winks: 'Don't worry, everyone who saw you do that will eventually die too.'";
  }

  switch (category) {
    case 'failed_idea':
      return "Caretaker's Verdict: 'A noble demise. Some ideas exist solely to teach us what not to build.'";
    case 'cringe':
      return "Grim Reaper's Note: 'May your 3 AM brain finally let you sleep in peace. Case closed.'";
    case 'financial_loss':
      return "The Reaper sighs: 'Money comes and goes, but the sting of buying at all-time-high is eternal.'";
    case 'missed_chance':
      return "The Reaper nods: 'Alternate universes are overrated. You would have complained there too.'";
    case 'career_blunder':
      return "Caretaker's Verdict: 'HR has long forgotten this, and so should you. Rest in peace, LinkedIn profile.'";
    case 'regret':
    default:
      return "The Reaper whispers: 'What is dead may never die. But it can definitely stop bothering you now.'";
  }
}

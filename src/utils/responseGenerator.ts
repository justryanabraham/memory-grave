import { GraveCategory, AuthorResponse } from '../types';

interface PostDetails {
  title: string;
  category: GraveCategory;
  epitaph: string;
  story: string;
  year?: string | number;
}

export function generateSanctuaryResponse(details: PostDetails): AuthorResponse {
  const storyLower = (details.story + ' ' + details.title).toLowerCase();

  let message = "";
  let healingReflection = "";

  // Topic-sensitive insight synthesis
  if (details.category === 'failed_idea') {
    if (storyLower.includes('startup') || storyLower.includes('business') || storyLower.includes('product') || storyLower.includes('app')) {
      message = `To build something from thin air requires courage that most people will never muster. What feels today like a failed venture was actually an intense laboratory of resilience. You did not fail—the experiment simply concluded. Laying it to rest here releases the weight of what 'could have been,' leaving your mind clear for the true venture ahead.`;
      healingReflection = `Honor the daring version of yourself that took the leap. Then close the ledger.`;
    } else {
      message = `Every profound creation is preceded by ideas that had to die so better ones could breathe. Burying "${details.title}" is not a confession of weakness; it is an act of creative hygiene. You poured real energy and hope into this thought, and that energy was never wasted—it shaped who you are now.`;
      healingReflection = `The graveyard is fertile ground. What you bury here feeds whatever you create next.`;
    }
  } else if (details.category === 'missed_chance') {
    if (storyLower.includes('love') || storyLower.includes('crush') || storyLower.includes('tell') || storyLower.includes('person')) {
      message = `Unspoken words can feel like phantom anchors, pulling you backward into alternate timelines that never were. But remember: you operated with the courage, fear, and knowledge you had at that exact moment. Forgive your younger self for staying silent. You are now free from holding a vigil for what never began.`;
      healingReflection = `The past is complete. Your voice belongs to the people standing in front of you today.`;
    } else {
      message = `It is human nature to turn missed doors into gilded palaces in our memory. Yet roads not taken are always imagined as easier than the road we actually walked. By committing this missed opportunity to the earth, you stop replaying the crossroads and step fully back into the present moment.`;
      healingReflection = `Close the door gently. There is nothing left for you on the other side.`;
    }
  } else if (details.category === 'cringe') {
    message = `Cringing at your past is the quietest, most certain proof that you have grown beyond the person you were. If you did not feel embarrassment, it would mean you were still stuck there. Let this awkward ghost dissolve into the digital soil—everyone who witnessed it has long since turned their attention to their own lives.`;
    healingReflection = `Exhale. You are allowed to be imperfect, and you are allowed to move on.`;
  } else if (details.category === 'financial_loss') {
    message = `Money lost can feel like a theft of time and security, but currency is renewable; your peace of mind is sacred. The ledger of "${details.title}" ends here today. Do not pay interest on this loss for another year in regret. You paid an expensive tuition for a lesson that will protect you for the rest of your life.`;
    healingReflection = `Wealth is not only what remains in an account, but the hard-won wisdom that survives loss.`;
  } else if (details.category === 'career_blunder') {
    message = `A single wrong turn, misjudged interview, or burning bridge does not define a vocation. We often punish ourselves as though our careers were supposed to be pristine, linear staircases. In truth, every seasoned veteran carries a graveyard of blunders behind them. Today, yours is safely interred.`;
    healingReflection = `You are not your title or your mistakes. Tomorrow morning starts with a clean slate.`;
  } else {
    // Default 'regret'
    if (storyLower.includes('sorry') || storyLower.includes('guilt') || storyLower.includes('hurt') || storyLower.includes('forgive')) {
      message = `Carrying guilt is like drinking poison and waiting for the past to change. What happened cannot be undone, but holding yourself hostage to it will never heal the past. You have carried this memory long enough. By laying "${details.title}" into this silent sanctuary, you give yourself permission to be human and to begin forgiving yourself.`;
      healingReflection = `Put the burden down. You do not need to carry it into tomorrow.`;
    } else {
      message = `Regret is love or hope with nowhere left to go. You brought "${details.title}" here because holding it inside was growing too heavy. In this quiet corner of the digital cemetery, your confession is safe, anonymous, and final. You have spoken its name for the last time. May you walk lighter from this moment forward.`;
      healingReflection = `Take one long, deliberate breath. This memory is now resting in peace.`;
    }
  }

  return {
    id: `response_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    responder: "Sanctuary Guardian",
    title: `Solace for "${details.title}"`,
    message,
    healingReflection,
    createdAt: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  };
}

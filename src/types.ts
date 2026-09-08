export type GraveCategory = 
  | 'regret' 
  | 'failed_idea' 
  | 'cringe' 
  | 'missed_chance' 
  | 'career_blunder' 
  | 'financial_loss';

export type TombstoneStyle = 
  | 'slate' 
  | 'granite' 
  | 'neon' 
  | 'crypt' 
  | 'gilded' 
  | 'mossy';

export interface Tribute {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  type: 'flower' | 'candle' | 'note';
}

export interface AuthorResponse {
  id: string;
  responder: string;
  title: string;
  message: string;
  healingReflection: string;
  createdAt: string;
}

export interface TombstoneData {
  id: string;
  col: number;
  row: number;
  worldX: number;
  worldY: number;
  title: string;
  category: GraveCategory;
  epitaph: string;
  story: string;
  year: number | string;
  tombstoneStyle: TombstoneStyle;
  candles: number;
  flowers: number;
  userCandled?: boolean;
  userFlowered?: boolean;
  createdAt: string;
  tributes: Tribute[];
  authorResponse?: AuthorResponse;
  isUserAuthor?: boolean;
  // Dark Humour additions:
  causeOfDeath?: string;
  grimReaperTake?: string;
  burialDepth?: string;
  dirtKicks?: number;
}

export interface CemeteryStats {
  totalSouls: number;
  totalCandles: number;
  totalFlowers: number;
}

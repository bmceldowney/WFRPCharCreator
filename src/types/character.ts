export interface Character {
  name: string;
  race?: string;
  profession?: string;
  battleLevel?: number;
  movement?: number;
  weaponSkill?: number;
  ballisticsSkill?: number;
  strength?: number;
  toughness?: number;
  initiative?: number;
  willpower?: number;
  attacks?: number;
  pinning?: number;
  luck?: number;
  startingWounds?: number;
  currentWounds?: number;
  gold?: number;
  goldToNextLevel?: number;
  items?: string[];
  skills?: string[];
}

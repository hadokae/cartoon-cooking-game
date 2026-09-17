export type GameMode = 'SOLO' | 'COOP' | 'ONLINE';
export type Difficulty = 'NORMAL' | 'DIFICIL' | 'EXTREMO' | 'CAOTICO';

export interface Position {
  x: number;
  y: number;
}

export interface Chef {
  id: 1 | 2;
  name: string;
  x: number; // grid coords or pixel coords. We'll use sub-grid coordinates for smooth movement
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  hatColor: string;
  heldItem: HeldItem | null;
  animFrame: number;
  isChopping: boolean;
  isWashing: boolean;
  isStunned: boolean;
  stunTimer: number;
  takeAnimTimer: number;
  takeAnimFrame: number;
  ovenGrabType?: 'place' | 'take';
}

export type ItemType =
  // Pure ingredients
  | 'pan_hamburguesa'
  | 'carne_cruda'
  | 'carne_cocinada'
  | 'carne_quemada'
  | 'tomate'
  | 'tomate_picado'
  | 'lechuga'
  | 'lechuga_picada'
  | 'queso'
  | 'queso_picado'
  // Pasta ingredients
  | 'pasta_seca'
  | 'pasta_cocida'
  | 'pasta_quemada'
  | 'salsa_tomate'
  // Pizza ingredients
  | 'masa'
  | 'masa_estirada'
  | 'pizza_con_queso' // masa_estirada + queso
  | 'pizza_con_salsa' // masa_estirada + salsa_tomate
  | 'pizza_cruda' // combination of masa_estirada + salsa + queso
  | 'pizza_horneada'
  | 'pizza_quemada'
  // Special structural items
  | 'plato_limpio'
  | 'plato_sucio';

export interface HeldItem {
  id: string;
  type: ItemType;
  // If the item is a plate, it can contain other items!
  contents?: ItemType[];
}

export type StationType =
  | 'floor'
  | 'counter' // generic counter to hold items
  | 'trash' // trash can
  | 'plate_rack' // spawns clean plates
  | 'sink' // wash dirty plates
  | 'delivery' // submit orders here
  | 'chopping_board' // chop ingredients
  | 'grill' // cook meat
  | 'stove_pot' // cook pasta
  | 'oven' // bake pizza
  | 'dispenser'; // dispenses of raw items e.g. dispenser:tomate

export interface KitchenStation {
  gridX: number;
  gridY: number;
  type: StationType;
  dispensedIngredient?: ItemType;
  // If an item is resting on this station
  heldItem: HeldItem | null;
  // Station specific process
  progress: number; // 0 to 100 for chopping, cooking, washing, baking
  isWarning?: boolean;
  lastSyncedProgress?: number;
  lastUpdated?: number;
}

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  requiredItems: ItemType[]; // ingredients list that must be combined on a plate
  reward: number; // coin reward
  color: string;
}

export interface ActiveOrder {
  id: string;
  recipeId: string;
  name: string;
  icon: string;
  requiredItems: ItemType[];
  timeLeft: number; // seconds remaining
  maxTime: number;
  reward: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  mapLayout: string[]; // Grid tiles
  targetScoreStars: [number, number, number]; // Score needed for 1, 2, 3 stars
  availableRecipes: string[]; // Recipe IDs
  timeLimit: number; // Level time in seconds
  introMessage: string;
}

export interface HighScore {
  levelId: number;
  score: number;
  stars: number;
}

export interface CharacterConfig {
  id: string;
  nameEs: string;
  nameEn: string;
  color: string;
  colorDark: string;
  hatColor: string;
  apronColor: string;
  apronColorDark: string;
  pielColor: string;
  extraColor: string;
  emoji: string;
  descriptionEs: string;
  descriptionEn: string;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'abuela',
    nameEs: 'Abuela Sazón',
    nameEn: 'Abuela Sazón',
    color: '#D83A43',
    colorDark: '#B82834',
    hatColor: '#F6F3EF',
    apronColor: '#F2B233',
    apronColorDark: '#D7921A',
    pielColor: '#EFAE76',
    extraColor: '#6A4328',
    emoji: '👵',
    descriptionEs: 'La reina indiscutible del sabor tradicional y las recetas secretas.',
    descriptionEn: 'The undisputed queen of traditional flavor and secret recipes.'
  },
  {
    id: 'kenji',
    nameEs: 'Kenji',
    nameEn: 'Kenji',
    color: '#236EB8',
    colorDark: '#154F87',
    hatColor: '#262626',
    apronColor: '#F6F5F2',
    apronColorDark: '#DADADA',
    pielColor: '#DDA06E',
    extraColor: '#5B3825',
    emoji: '🧑‍🍳',
    descriptionEs: 'Un chef ágil que combina técnicas milenarias con precisión moderna.',
    descriptionEn: 'An agile chef combining ancient techniques with modern precision.'
  },
  {
    id: 'nova',
    nameEs: 'Nova',
    nameEn: 'Nova',
    color: '#D62D6A',
    colorDark: '#A91F51',
    hatColor: '#7B3FB5',
    apronColor: '#D52C2C',
    apronColorDark: '#A91F51',
    pielColor: '#E49A68',
    extraColor: '#F4A623',
    emoji: '👩‍🎤',
    descriptionEs: 'Una cocinera futurista que experimenta con sabores galácticos y neón.',
    descriptionEn: 'A futuristic cook experimenting with galactic and neon flavors.'
  },
  {
    id: 'bruno',
    nameEs: 'Bruno',
    nameEn: 'Bruno',
    color: '#E86A1D',
    colorDark: '#BF4E12',
    hatColor: '#C62B2B',
    apronColor: '#5A3826',
    apronColorDark: '#392319',
    pielColor: '#C98254',
    extraColor: '#1D1D1D',
    emoji: '🧔',
    descriptionEs: 'Un chef rústico y robusto que domina el fuego de la parrilla como nadie.',
    descriptionEn: 'A rustic, robust chef who masterfully dominates the grill fire.'
  }
];

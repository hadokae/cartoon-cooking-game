import { Level, Recipe, ItemType } from './types';

export const RECIPES: Record<string, Recipe> = {
  // Burger recipes
  'burger_classic': {
    id: 'burger_classic',
    name: 'Hamburguesa Clásica',
    icon: '🍔',
    requiredItems: ['pan_hamburguesa', 'carne_cocinada'],
    reward: 40,
    color: '#F49830', // Burger Orange
  },
  'burger_cheese': {
    id: 'burger_cheese',
    name: 'Burguer con Queso',
    icon: '🧀🍔',
    requiredItems: ['pan_hamburguesa', 'carne_cocinada', 'queso_picado'],
    reward: 55,
    color: '#F9C623',
  },
  'burger_deluxe': {
    id: 'burger_deluxe',
    name: 'Hamburguesa Deluxe',
    icon: '👑🍔',
    requiredItems: ['pan_hamburguesa', 'carne_cocinada', 'tomate_picado', 'lechuga_picada'],
    reward: 75,
    color: '#ED3E44',
  },

  // Salad/No-cook recipes
  'salad_fresh': {
    id: 'salad_fresh',
    name: 'Ensalada Fresca',
    icon: '🥗',
    requiredItems: ['tomate_picado', 'lechuga_picada', 'queso_picado'],
    reward: 45,
    color: '#55AD38', // Salad Green
  },

  // Pasta recipes
  'pasta_marinara': {
    id: 'pasta_marinara',
    name: 'Pasta Marinara',
    icon: '🍝',
    requiredItems: ['pasta_cocida', 'salsa_tomate'],
    reward: 50,
    color: '#D1322A', // Tomato Red
  },
  'pasta_cheese': {
    id: 'pasta_cheese',
    name: 'Especial Pasta Queso',
    icon: '🧀🍝',
    requiredItems: ['pasta_cocida', 'salsa_tomate', 'queso_picado'],
    reward: 65,
    color: '#E06214',
  },

  // Pizza recipes
  'pizza_margherita': {
    id: 'pizza_margherita',
    name: 'Pizza Margarita',
    icon: '🍕',
    requiredItems: ['pizza_horneada'], // Made of dough, sauce, cheese, baked
    reward: 80,
    color: '#7338AC', // Purple
  }
};

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Taller de Hamburguesas',
    description: 'Aprende los conceptos básicos: corta verduras, cocina la carne y monta hamburguesas clásicas o con queso',
    gridWidth: 12,
    gridHeight: 6,
    timeLimit: 120, // 2 minutes
    targetScoreStars: [100, 200, 350],
    availableRecipes: ['burger_classic', 'burger_cheese', 'salad_fresh'],
    introMessage: '¡Bienvenido! Usa W-A-S-D (Chef 1) y FLECHAS (Chef 2). Toma carne/queso de los dispensadores (m, q), cocina la carne en la parrilla (G), corta de todo en la tabla (X). ¡Emplata y entrega (D)!',
    mapLayout: [
      '############', // Row 0: spacer row for clear HUD separation (consists of solid counters)
      '#mbtlq######', // Row 1: dispensers contiguous: m=meat, b=bun, t=tomato, l=lettuce, q=cheese, counters
      'G.........X#', // Row 2: Grill at Col 0, Chop Board at Col 10.
      'G.....R...X#', // Row 3: Second Grill at Col 0, Plate Rack in middle, Chop Board at Col 10
      '#.....S...S#', // Row 4: Sink
      '#D#T########'  // Row 5: Slid Delivery and Trash up here
    ]
  },
  {
    id: 2,
    name: 'Pizzería y Pasta en la Pradera',
    description: '¡Cocina pizzas y pastas con total libertad de movimiento! Organízate dividiendo las tareas con tu compañero.',
    gridWidth: 13,
    gridHeight: 6,
    timeLimit: 150, // 2.5 minutes
    targetScoreStars: [150, 300, 480],
    availableRecipes: ['pasta_marinara', 'pasta_cheese', 'burger_classic', 'burger_cheese'],
    introMessage: '¡Las estufas (P) están listas! Muévete libremente por toda la cocina. En el modo cooperativo, organícense decidiendo la repartición equilibrada de ingredientes antes de iniciar.',
    mapLayout: [
      '#############', // Row 0: spacer row for clear HUD separation
      '#mps#qb######', // Row 1: Disp: m(meat), p(pasta), s(sauce), q(cheese), b(bun) contiguous and aligned around dividers
      'G..........##', // Row 2: Grill G at Col 0, opened Col 4 and Col 8 for free movement
      'G...P......X#', // Row 3: P (Stove Pot) at island Col 4 for cook, opened col 8 to right room
      '#....R..P..S#', // Row 4: R (Plate rack) at Col 5, P (Stove Pot) at Col 8, S (Sink) on the right
      '#D.........T#'  // Row 5: Slid Delivery and Trash up here
    ]
  },
  {
    id: 3,
    name: 'El Gran Banquete Caótico',
    description: '¡Nivel Experto! Pizza, pastas y hamburguesas. El horno de pizza (O) y las estufas están rodeados por pasillos angostos.',
    gridWidth: 13,
    gridHeight: 6,
    timeLimit: 180, // 3 minutes
    targetScoreStars: [200, 450, 700],
    availableRecipes: ['pizza_margherita', 'pasta_cheese', 'burger_deluxe', 'salad_fresh'],
    introMessage: '¡El banquete caótico! El horno (O) y las estufas (P) están en el centro. Amasa la masa (d) en la tabla (X), agrégale salsa (s)/queso (q) en un plato, y llévala al horno de piedra (O).',
    mapLayout: [
      '#############', // Row 0: spacer row for clear HUD separation
      '#mbtlpqs#####', // Row 1: Row 1 dispensers: m=meat, b=bun, t=tomato, l=lettuce, p=pasta, q=cheese, s=sauce all contiguous and accessible
      'G...........#', // Row 2: Grill at Col 0 (Col 1-11 floor, so all Row 1 dispensers are 100% accessible!)
      'G...#O#R.#.d#', // Row 3: Grill at Col 0, Oven O at Col 5, Plate rack at Col 7, Dough d at Col 11
      '#X..P#PX.#..#', // Row 4: Chop board X at Col 1, Stove Pots P at Col 4 & Col 6, Chop board X at Col 7
      '#D.T.S...#..#'  // Row 5: Slid Delivery (D) and Trash (T) up here, preserved Sink (S)
    ]
  }
];

// Helper to determine what is on a static tile character
export function getStationTypeFromChar(char: string): { type: string; dispensed?: ItemType } {
  switch (char) {
    case '#': return { type: 'counter' };
    case 'T': return { type: 'trash' };
    case 'R': return { type: 'plate_rack' };
    case 'S': return { type: 'sink' };
    case 'D': return { type: 'delivery' };
    case 'X': return { type: 'chopping_board' };
    case 'G': return { type: 'grill' };
    case 'O': return { type: 'oven' };
    case 'P': return { type: 'stove_pot' };

    // Dispensers
    case 'm': return { type: 'dispenser', dispensed: 'carne_cruda' };
    case 'b': return { type: 'dispenser', dispensed: 'pan_hamburguesa' };
    case 't': return { type: 'dispenser', dispensed: 'tomate' };
    case 'l': return { type: 'dispenser', dispensed: 'lechuga' };
    case 'q': return { type: 'dispenser', dispensed: 'queso' };
    case 'p': return { type: 'dispenser', dispensed: 'pasta_seca' };
    case 's': return { type: 'dispenser', dispensed: 'salsa_tomate' };
    case 'd': return { type: 'dispenser', dispensed: 'masa' };
    default: return { type: 'floor' };
  }
}

// Map Item types to user-friendly Spanish names with cool emoji
export function getItemDetails(itemType: ItemType): { name: string; emoji: string } {
  switch (itemType) {
    case 'pan_hamburguesa': return { name: 'Pan', emoji: '🍞' };
    case 'carne_cruda': return { name: 'Carne Cruda', emoji: '🥩' };
    case 'carne_cocinada': return { name: 'Carne Cocida', emoji: '🍔' };
    case 'carne_quemada': return { name: 'Carne Quemada!', emoji: '💀' };
    case 'tomate': return { name: 'Tomate entero', emoji: '🍅' };
    case 'tomate_picado': return { name: 'Tomate Picado', emoji: '🍅' };
    case 'lechuga': return { name: 'Lechuga entera', emoji: '🥬' };
    case 'lechuga_picada': return { name: 'Lechuga Picada', emoji: '🍃' };
    case 'queso': return { name: 'Bloque de Queso', emoji: '🧀' };
    case 'queso_picado': return { name: 'Queso Rallado', emoji: '🧀' };
    case 'pasta_seca': return { name: 'Pasta Seca', emoji: '🍝' };
    case 'pasta_cocida': return { name: 'Pasta Cocida', emoji: '🍜' };
    case 'pasta_quemada': return { name: 'Pasta Quemada!', emoji: '🔥' };
    case 'salsa_tomate': return { name: 'Salsa', emoji: '🥫' };
    case 'masa': return { name: 'Masa de Pizza', emoji: '🥯' };
    case 'masa_estirada': return { name: 'Masa Estirada', emoji: '🥞' };
    case 'pizza_con_queso': return { name: 'Pizza con Queso', emoji: '🍕' };
    case 'pizza_con_salsa': return { name: 'Pizza con Salsa', emoji: '🍕' };
    case 'pizza_cruda': return { name: 'Pizza Cruda', emoji: '🍕' };
    case 'pizza_horneada': return { name: 'Pizza Horneada', emoji: '🍕' };
    case 'pizza_quemada': return { name: 'Pizza Quemada!', emoji: '🔥' };
    case 'plato_limpio': return { name: 'Plato Limpio', emoji: '🍽️' };
    case 'plato_sucio': return { name: 'Plato Sucio', emoji: '🍽️' };
    default: return { name: 'Objeto', emoji: '❓' };
  }
}

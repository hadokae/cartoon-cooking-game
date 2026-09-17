import React, { useState } from 'react';
import { Clock, Star, Landmark, RotateCcw, Home, Trophy, BookOpen } from 'lucide-react';
import { ActiveOrder, Level, Recipe, ItemType, Difficulty } from '../types';
import { RECIPES, getItemDetails } from '../levels';
import { sounds } from '../sounds';
import { useTranslation } from '../translations';

const COOKING_GUIDELINES: Record<string, { name: string; emoji: string; process: string; stationName: string }> = {
  pan_hamburguesa: {
    name: "Pan",
    emoji: "🍞",
    process: "No necesita cocción. Colócalo de base en un Plato Limpio para armar hamburguesas.",
    stationName: "Dispensador de Pan"
  },
  carne_cruda: {
    name: "Carne Cruda",
    emoji: "🥩",
    process: "Se debe cocinar en la PARRILLA 🍳 hasta que se torne dorada. ¡Retírala rápido antes de que se queme!",
    stationName: "Parrilla"
  },
  carne_cocinada: {
    name: "Carne Cocida",
    emoji: "🍗",
    process: "¡Perfectamente cocida! Monta la carne directamente sobre un Plato Limpio con Pan para hacer la hamburguesa.",
    stationName: "Emplatado"
  },
  carne_quemada: {
    name: "Carne Quemada",
    emoji: "💀",
    process: "Se quemó en la parrilla por dejarla demasiado tiempo. ¡Lánzala directo a la BASURA 🗑️!",
    stationName: "Basura"
  },
  tomate: {
    name: "Tomate",
    emoji: "🍅",
    process: "Llévalo a la TABLA DE PICAR 🔪 y presiona la tecla de acción repetidamente para cortarlo en rebanadas.",
    stationName: "Tabla de Picar"
  },
  tomate_picado: {
    name: "Tomate Picado",
    emoji: "🥗",
    process: "Picado y fresco. Listo para servir directamente en ensaladas, pizzas o hamburguesas gourmet.",
    stationName: "Listo para Plato"
  },
  lechuga: {
    name: "Lechuga",
    emoji: "🥬",
    process: "Llévela a la TABLA DE PICAR 🔪 para cortarla antes de añadirla a cualquier preparación.",
    stationName: "Tabla de Picar"
  },
  lechuga_picada: {
    name: "Lechuga Picada",
    emoji: "🍃",
    process: "Hojas listas y crujientes. Ideales para ensaladas o hamburguesas.",
    stationName: "Listo para Plato"
  },
  queso: {
    name: "Queso",
    emoji: "🧀",
    process: "Córtalo en la TABLA DE PICAR 🔪 para obtener queso picado/rallado listo para fundirse.",
    stationName: "Tabla de Picar"
  },
  queso_picado: {
    name: "Queso Rallado",
    emoji: "🧀",
    process: "Queso picado. Agrégalo sobre la masa estirada para pizza, fideos, o hamburguesas.",
    stationName: "Listo para Plato"
  },
  pasta_seca: {
    name: "Pasta Seca",
    emoji: "🌾",
    process: "Colócala en la olla sobre la ESTUFA (Stove Pot) 🍜 para hervirla con agua durante unos segundos.",
    stationName: "Estufa / Olla"
  },
  pasta_cocida: {
    name: "Pasta Cocida",
    emoji: "🍜",
    process: "Al dente y lista. Sírvela en un Plato Limpio y combínala con Salsa de Tomate para la Pasta Marinara.",
    stationName: "Listo para Plato"
  },
  pasta_quemada: {
    name: "Pasta Quemada",
    emoji: "🔥",
    process: "Se consumió el agua y se pegó en la caldera. Tírala completa a la BASURA 🗑️.",
    stationName: "Basura"
  },
  salsa_tomate: {
    name: "Salsa de Tomate",
    emoji: "🥫",
    process: "Agrégala directamente sobre la pasta cocida en un plato, o extiéndela sobre de la masa estirada de pizza.",
    stationName: "Dispensador de Salsa"
  },
  masa: {
    name: "Masa de Pizza",
    emoji: "🥯",
    process: "Estírala o amásala sobre la TABLA DE PICAR 🔪 con el uslero para crear la base de la pizza.",
    stationName: "Tabla de Picar"
  },
  masa_estirada: {
    name: "Masa Estirada",
    emoji: "🥞",
    process: "Base lista. Ponla en un Plato Limpio, agrégale Salsa de Tomate y Queso Rallado antes de hornear.",
    stationName: "Preparación"
  },
  pizza_cruda: {
    name: "Pizza Cruda",
    emoji: "🍕",
    process: "Con masa, salsa y queso. Llévala al HORNO DE PIZZA 🍕 para hornearla hasta que el queso burbujee.",
    stationName: "Horno de Pizza"
  },
  pizza_horneada: {
    name: "Pizza Horneada",
    emoji: "🍕",
    process: "Margarita crocante y deliciosa. ¡Sírvela directamente en un plato limpio para su entrega!",
    stationName: "Listo para Plato"
  },
  pizza_quemada: {
    name: "Pizza Quemada",
    emoji: "🔥",
    process: "Se cocinó en exceso y se carbonizó. Debe ser desechada en la BASURA 🗑️ para limpiar el plato.",
    stationName: "Basura"
  },
  plato_limpio: {
    name: "Plato Limpio",
    emoji: "🍽️",
    process: "Tómalo del estante de platos. Sirve para combinar y montar los ingredientes del pedido.",
    stationName: "Estante de Platos"
  },
  plato_sucio: {
    name: "Plato Sucio",
    emoji: "🍽️",
    process: "Llévalo al FREGADERO 🧼 y mantén pulsada la tecla de acción para lavarlo rápido y dejarlo limpio.",
    stationName: "Fregadero"
  }
};

const GUIDELINE_PROCESS_EN: Record<string, { process: string; stationKey: string }> = {
  pan_hamburguesa: {
    process: "No cooking needed. Place it as the base in a Clean Plate to assemble burgers.",
    stationKey: "dispenser"
  },
  carne_cruda: {
    process: "Must be cooked on the GRILL 🍳 until it turns golden. Remove it quickly before it burns!",
    stationKey: "grill"
  },
  carne_cocinada: {
    process: "Perfectly cooked! Assemble the meat directly onto a Clean Plate with a bun to build the burger.",
    stationKey: "counter"
  },
  carne_quemada: {
    process: "Burnt on the grill from being left too long. Throw it directly into the TRASH 🗑️!",
    stationKey: "trash"
  },
  tomate: {
    process: "Take it to the CHOPPING BOARD 🔪 and press the action key repeatedly to chop it into slices.",
    stationKey: "chopping_board"
  },
  tomate_picado: {
    process: "Chopped and fresh. Ready to serve directly in salads, pizzas, or gourmet burgers.",
    stationKey: "counter"
  },
  lechuga: {
    process: "Take it to the CHOPPING BOARD 🔪 to chop it before adding it to any preparation.",
    stationKey: "chopping_board"
  },
  lechuga_picada: {
    process: "Ready and crispy leaves. Ideal for salads or burgers.",
    stationKey: "counter"
  },
  queso: {
    process: "Chop it on the CHOPPING BOARD 🔪 to obtain chopped/shredded cheese ready to melt.",
    stationKey: "chopping_board"
  },
  queso_picado: {
    process: "Chopped cheese. Add it over rolled pizza dough, pasta, or burgers.",
    stationKey: "counter"
  },
  pasta_seca: {
    process: "Place it in the pot on the STOVE (Stove Pot) 🍜 to boil it with water for a few seconds.",
    stationKey: "stove_pot"
  },
  pasta_cocida: {
    process: "Al dente and ready. Serve on a Clean Plate and combine with Tomato Sauce for Pasta Marinara.",
    stationKey: "counter"
  },
  pasta_quemada: {
    process: "Water dried up and stuck to the pot. Discard it completely in the TRASH 🗑️.",
    stationKey: "trash"
  },
  salsa_tomate: {
    process: "Add it directly onto boiled pasta in a plate, or spread it over the rolled pizza dough.",
    stationKey: "dispenser"
  },
  masa: {
    process: "Roll or knead it on the CHOPPING BOARD 🔪 with the rolling pin to create the pizza base.",
    stationKey: "chopping_board"
  },
  masa_estirada: {
    process: "Base ready. Place on a Clean Plate, add Tomato Sauce and Shredded Cheese before baking.",
    stationKey: "counter"
  },
  pizza_cruda: {
    process: "With dough, sauce, and cheese. Take it to the STONE OVEN 🍕 to bake until the cheese bubbles.",
    stationKey: "oven"
  },
  pizza_horneada: {
    process: "Crispy and delicious Margherita. Serve directly on a clean plate for delivery!",
    stationKey: "counter"
  },
  pizza_quemada: {
    process: "Overcooked and charred. Must be discarded in the TRASH 🗑️ to clean the plate.",
    stationKey: "trash"
  },
  plato_limpio: {
    process: "Take it from the plate rack. Used to combine and assemble the ingredients of the order.",
    stationKey: "plate_rack"
  },
  plato_sucio: {
    process: "Take it to the SINK 🧼 and hold down the action key to wash it quickly and leave it clean.",
    stationKey: "sink"
  }
};

const GUIDELINE_PROCESS_ES: Record<string, { process: string; stationKey: string }> = {
  pan_hamburguesa: {
    process: "No necesita cocción. Colócalo de base en un Plato Limpio para armar hamburguesas.",
    stationKey: "dispenser"
  },
  carne_cruda: {
    process: "Se debe cocinar en la PARRILLA 🍳 hasta que se torne dorada. ¡Retírala rápido antes de que se queme!",
    stationKey: "grill"
  },
  carne_cocinada: {
    process: "¡Perfectamente cocida! Monta la carne directamente sobre un Plato Limpio con Pan para hacer la hamburguesa.",
    stationKey: "counter"
  },
  carne_quemada: {
    process: "Se quemó en la parrilla por dejarla demasiado tiempo. ¡Lánzala directo a la BASURA 🗑️!",
    stationKey: "trash"
  },
  tomate: {
    process: "Llévalo a la TABLA DE PICAR 🔪 y presiona la tecla de acción repetidamente para cortarlo en rebanadas.",
    stationKey: "chopping_board"
  },
  tomate_picado: {
    process: "Picado y fresco. Listo para servir directamente en ensaladas, pizzas o hamburguesas gourmet.",
    stationKey: "counter"
  },
  lechuga: {
    process: "Llévela a la TABLA DE PICAR 🔪 para cortarla antes de añadirla a cualquier preparación.",
    stationKey: "chopping_board"
  },
  lechuga_picada: {
    process: "Hojas listas y crujientes. Ideales para ensaladas o hamburguesas.",
    stationKey: "counter"
  },
  queso: {
    process: "Córtalo en la TABLA DE PICAR 🔪 para obtener queso picado/rallado listo para fundirse.",
    stationKey: "chopping_board"
  },
  queso_picado: {
    process: "Queso picado. Agrégalo sobre la masa estirada para pizza, fideos, o hamburguesas.",
    stationKey: "counter"
  },
  pasta_seca: {
    process: "Colócala en la olla sobre la ESTUFA (Stove Pot) 🍜 para hervirla con agua durante unos segundos.",
    stationKey: "stove_pot"
  },
  pasta_cocida: {
    process: "Al dente y lista. Sírvela en un Plato Limpio y combínala con Salsa de Tomate para la Pasta Marinara.",
    stationKey: "counter"
  },
  pasta_quemada: {
    process: "Se consumió el agua y se pegó en la caldera. Tírala completa a la BASURA 🗑️.",
    stationKey: "trash"
  },
  salsa_tomate: {
    process: "Agrégala directamente sobre la pasta cocida en un plato, o extiéndela sobre de la masa estirada de pizza.",
    stationKey: "dispenser"
  },
  masa: {
    process: "Estírala o amásala sobre la TABLA DE PICAR 🔪 con el uslero para crear la base de la pizza.",
    stationKey: "chopping_board"
  },
  masa_estirada: {
    process: "Base lista. Ponla en un Plato Limpio, agrégale Salsa de Tomate y Queso Rallado antes de hornear.",
    stationKey: "counter"
  },
  pizza_cruda: {
    process: "Con masa, salsa y queso. Llévala al HORNO DE PIZZA 🍕 para hornearla hasta que el queso burbujee.",
    stationKey: "oven"
  },
  pizza_horneada: {
    process: "Margarita crocante y deliciosa. ¡Sírvela directamente en un plato limpio para su entrega!",
    stationKey: "counter"
  },
  pizza_quemada: {
    process: "Se cocinó en exceso y se carbonizó. Debe ser desechada en la BASURA 🗑️ para limpiar el plato.",
    stationKey: "trash"
  },
  plato_limpio: {
    process: "Tómalo del estante de platos. Sirve para combinar y montar los ingredientes del pedido.",
    stationKey: "plate_rack"
  },
  plato_sucio: {
    process: "Llévalo al FREGADERO 🧼 y mantén pulsada la tecla de acción para lavarlo rápido y dejarlo limpio.",
    stationKey: "sink"
  }
};

interface HUDProps {
  score: number;
  timeRemaining: number;
  level: Level;
  activeOrders: ActiveOrder[];
  onReplay: () => void;
  onExit: () => void;
  gameMode: 'SOLO' | 'COOP' | 'ONLINE';
  activeChefId: 1 | 2;
  isPaused: boolean;
  onTogglePause: () => void;
  isGameOver: boolean;
  difficulty?: Difficulty;
}

export default function HUD({
  score,
  timeRemaining,
  level,
  activeOrders,
  onReplay,
  onExit,
  gameMode,
  activeChefId,
  isPaused,
  onTogglePause,
  isGameOver,
  difficulty = 'NORMAL'
}: HUDProps) {
  const [heldOrderId, setHeldOrderId] = useState<string | null>(null);
  const [cookingKnowledgeItem, setCookingKnowledgeItem] = useState<ItemType | null>(null);

  const { lang, t } = useTranslation();

  const getLocalizedGuideline = (item: ItemType) => {
    const isEs = lang === 'es';
    const dict = isEs ? GUIDELINE_PROCESS_ES : GUIDELINE_PROCESS_EN;
    const info = dict[item];
    const fallback = COOKING_GUIDELINES[item];
    
    return {
      name: t('ing_' + item) || fallback?.name || item,
      emoji: fallback?.emoji || '🥕',
      process: info?.process || fallback?.process || 'No instructions.',
      stationName: t('station_' + (info?.stationKey || 'counter')) || fallback?.stationName || 'Kitchen'
    };
  };

  // Translate time format: e.g. 120 -> "2:00"
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const scoreMult = difficulty === 'DIFICIL' ? 1.15 : difficulty === 'EXTREMO' ? 1.30 : difficulty === 'CAOTICO' ? 1.50 : 1.0;
  const scaledTargets: [number, number, number] = [
    Math.round(level.targetScoreStars[0] * scoreMult),
    Math.round(level.targetScoreStars[1] * scoreMult),
    Math.round(level.targetScoreStars[2] * scoreMult),
  ];

  // Determine current stars achieved
  const getStarsAchieved = (currentScore: number, targets: [number, number, number]) => {
    if (currentScore >= targets[2]) return 3;
    if (currentScore >= targets[1]) return 2;
    if (currentScore >= targets[0]) return 1;
    return 0;
  };

  const starsAchieved = getStarsAchieved(score, scaledTargets);
  const nextStarTarget =
    starsAchieved === 3
      ? scaledTargets[2]
      : scaledTargets[starsAchieved];

  const progressPct = Math.min(100, (score / scaledTargets[2]) * 100);

  const handleOrderClick = (orderId: string) => {
    setHeldOrderId((prev) => (prev === orderId ? null : orderId));
    sounds.playSelect();
  };

  // Translate items for display (Large size list with clickable text)
  const renderIngredientsList = (items: string[], isReduced = false) => {
    return (
      <div className={`flex gap-1 ${isReduced ? 'mt-1' : 'mt-1.5'} flex-wrap`}>
        {items.map((item, idx) => {
          const detail = getItemDetails(item as any);
          const localizedName = t('ing_' + item) || detail.name;
          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCookingKnowledgeItem(item as ItemType);
              }}
              className={`bg-[#1A1A2E] hover:bg-[#1A1A2E]/70 border border-[#0C0C14] hover:border-[#4A90E2] ${isReduced ? 'px-1 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-xs'} rounded-md font-black text-[#D2D7DF] flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95`}
              title={lang === 'es' ? `Clic para recordar cocción: ${localizedName}` : `Click to view preparation guide: ${localizedName}`}
            >
              <span>{detail.emoji}</span>
              <span className={`hidden sm:inline ${isReduced ? 'text-[9px]' : 'text-[11px] sm:text-xs'} truncate max-w-[45px] sm:max-w-[65px] font-black text-[#D2D7DF] border-b border-dotted border-[#0C0C14]`}>
                {localizedName}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Small size list
  const renderSmallIngredientsList = (items: string[], isReduced = false) => {
    return (
      <div className={`flex gap-0.5 ${isReduced ? 'mt-0.5' : 'mt-1'} justify-center flex-wrap`}>
        {items.map((item, idx) => {
          const detail = getItemDetails(item as any);
          const localizedName = t('ing_' + item) || detail.name;
          return (
            <span
              key={idx}
              className={`bg-[#1A1A2E] border border-[#0C0C14]/40 ${isReduced ? 'px-0.5 py-0.1 text-[6px]' : 'px-0.5 py-0.2 text-[8px]'} rounded-md text-[#D2D7DF]`}
              title={localizedName}
            >
              <span>{detail.emoji}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pt-0.5 px-4 pb-4 font-mono select-none z-20">
      
      {/* Top Section: Active orders and Time Remaining & Pause */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-start w-full gap-4">
          
          {/* Active Orders Horizontal Row - Positioned higher with min-h reduction and items-start */}
          <div className="flex-1 flex gap-2 overflow-x-auto pb-1.5 pointer-events-auto scrollbar-thin scrollbar-thumb-orange-200 min-h-[105px] items-start pt-1.5">
            {activeOrders.map((order, idx) => {
              const rec = RECIPES[order.recipeId];
              const isUrgent = order.timeLeft / order.maxTime < 0.3;
              const timerPct = (order.timeLeft / order.maxTime) * 100;
              const isFirst = idx === 0;
              const isHeld = heldOrderId === order.id;
              const isLarge = isHeld; // Only large when explicitly held by mouse/touch click
              const isReduced = idx >= 1; // 25% reduction starting from the second active order
              
              if (isLarge) {
                return (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className={`relative ${
                      isReduced
                        ? 'w-[128px] sm:w-[150px] min-w-[128px] sm:min-w-[150px] p-2 border-2 border-white shadow-[4px_4px_0px_var(--theme-color-primary)] scale-100 rotate-[-1deg]'
                        : 'w-[170px] sm:w-[200px] min-w-[170px] sm:min-w-[200px] p-3 border-2 shadow-[4px_4px_0px_var(--theme-color-primary),-2px_-2px_0px_var(--theme-color-accent)] scale-105 border-white rotate-[-1.5deg]'
                    } rounded-md bg-[#0C0C14]/95 text-[#D2D7DF] flex flex-col justify-between shrink-0 transition-all duration-150 pointer-events-auto z-35 cursor-pointer ${
                      isUrgent ? 'animate-pulse bg-red-950/90 border-red-500 text-red-200' : ''
                    }`}
                  >
                    {isFirst && (
                      <span className="absolute -top-3.5 left-3 bg-[var(--theme-color-primary)] text-white font-mono font-black text-[10px] sm:text-xs tracking-wider px-2.5 py-0.5 rounded-md uppercase border border-white shadow-[2px_2px_0px_#0C0C14] transform rotate-[-4deg] skew-x-[-10deg]">
                        {t('hud_next_label')}
                      </span>
                    )}
                    {!isFirst && (
                      <span className={`absolute ${isReduced ? '-top-2.5 left-2 text-[8px] sm:text-[9px] px-1.5 py-0.2' : '-top-3.5 left-3 text-[10px] sm:text-xs px-2.5 py-0.5'} bg-white text-[#0C0C14] font-mono font-black tracking-wider rounded-md uppercase border border-black shadow-[2px_2px_0px_var(--theme-color-primary)] transform rotate-[3deg] skew-x-[8deg]`}>
                        {t('hud_expanded_label')}
                      </span>
                    )}
 
                    <div>
                      <div className={`flex justify-between items-center bg-[#1A1A2E] ${isReduced ? 'px-1.5 py-0.5 rounded-md mb-0.5' : 'px-2 py-1 rounded-md mb-1'} border border-[#0C0C14] transform rotate-[1deg]`}>
                        <span className={`${isReduced ? 'text-[10px]' : 'text-xs'} font-mono font-black text-[var(--theme-color-accent)] truncate max-w-[110px]`}>
                          {t('recipe_' + order.recipeId) || rec?.name || order.name}
                        </span>
                        <span className={isReduced ? 'text-xs' : 'text-base'}>{rec?.icon || '🍔'}</span>
                      </div>
                      {renderIngredientsList(order.requiredItems, isReduced)}
                    </div>
 
                    {/* Order timer bar */}
                    <div className={isReduced ? 'mt-1.5' : 'mt-2.5'}>
                      <div className={`w-full bg-[#1A1A2E] ${isReduced ? 'h-1.5' : 'h-2'} rounded-full overflow-hidden border border-[#0C0C14]`}>
                        <div
                           className={`h-full rounded-full transition-all duration-300 ${
                             isUrgent ? 'bg-[var(--theme-color-primary)] animate-pulse' : timerPct < 60 ? 'bg-[var(--theme-color-accent)]' : 'bg-[#4A90E2]'
                           }`}
                          style={{ width: `${timerPct}%` }}
                        />
                      </div>
                      <div className={`flex justify-between ${isReduced ? 'text-[8px] sm:text-[9px]' : 'text-xs'} font-black text-[#D2D7DF] mt-0.5`}>
                        <span>{order.timeLeft.toFixed(0)}s</span>
                        <span className="text-[var(--theme-color-accent)] font-mono font-black">+{order.reward} pts</span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className={`relative ${
                      isReduced
                        ? 'w-[48px] min-w-[48px] p-1 opacity-60 hover:opacity-100 hover:scale-[1.05] border-2 border-[#1A1A2E]/50 shadow-[2px_2px_0px_#0C0C14] rotate-[-1deg]'
                        : 'w-[95px] min-w-[95px] p-1.5 scale-90 opacity-85 hover:opacity-100 hover:scale-[0.93] border-2 shadow-[3px_3px_0px_var(--theme-color-primary)] border-white hover:border-[var(--theme-color-accent)] rotate-[1.5deg]'
                    } rounded-md bg-[#0C0C14]/95 text-[#D2D7DF] flex flex-col justify-between shrink-0 transition-all duration-150 pointer-events-auto cursor-pointer`}
                    title={isReduced ? (lang === 'es' ? `Pedido: ${t('recipe_' + order.recipeId) || rec?.name}. ¡Haz clic para expandir detalles!` : `Order: ${t('recipe_' + order.recipeId) || rec?.name}. Click to expand details!`) : (lang === 'es' ? "Haz clic para ver detalles en grande" : "Click to view large details")}
                  >
                    {isFirst && (
                       <span className="absolute -top-2 left-1 bg-[var(--theme-color-primary)] text-white font-mono font-black text-[6px] px-1.5 rounded-md uppercase leading-none py-[1.5px] tracking-wider border border-white shadow-[1.5px_1.5px_0px_#0C0C14]">
                         {t('hud_next_label').toUpperCase()}
                       </span>
                    )}
                    
                    {isReduced ? (
                      /* Ultra compact micro order */
                      <div className="flex flex-col items-center justify-center my-0.5">
                        <span className="text-xl leading-none">{rec?.icon || '🍔'}</span>
                      </div>
                    ) : (
                      /* Normal compact order */
                      <div className="flex flex-col items-center text-center mt-1">
                        <span className="text-sm leading-none">{rec?.icon || '🍔'}</span>
                        <span className="text-[10px] sm:text-xs font-mono font-black text-[#D2D7DF] truncate w-full mt-0.5 leading-none">
                          {t('recipe_' + order.recipeId) || rec?.name || order.name}
                        </span>
                        {renderSmallIngredientsList(order.requiredItems, isReduced)}
                      </div>
                    )}
 
                    {/* Order timer bar */}
                    <div className={isReduced ? 'mt-1' : 'mt-1'}>
                      <div className={`w-full bg-[#1A1A2E] ${isReduced ? 'h-[3px]' : 'h-1'} rounded-full overflow-hidden`}>
                        <div
                           className={`h-full rounded-full transition-all duration-300 ${
                             isUrgent ? 'bg-[var(--theme-color-primary)] animate-pulse' : timerPct < 60 ? 'bg-[var(--theme-color-accent)]' : 'bg-[#4A90E2]'
                           }`}
                          style={{ width: `${timerPct}%` }}
                        />
                      </div>
                      {!isReduced && (
                        <div className="flex justify-between text-[8px] sm:text-[9.5px] font-mono font-black text-[#D2D7DF] mt-0.5 leading-none">
                          <span>{order.timeLeft.toFixed(0)}s</span>
                          <span className="text-[var(--theme-color-accent)]">+{order.reward}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}

            {activeOrders.length === 0 && (
              <div className="text-xs font-mono font-black bg-[#0C0C14]/90 border border-[#2A2A3A] text-[#555] px-4 py-3 rounded-md flex items-center gap-2 shadow-[2px_2px_0px_var(--theme-color-accent)]">
                {t('hud_waiting_orders')}
              </div>
            )}
          </div>

          {/* Time Remaining, Kitchen Score & Game Controls - Aligned in a single neat row */}
          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto pt-1.5 font-mono">
            
            {/* Compact 3/4 Decreased Kitchen Score Panel */}
            <div className="p-2.5 rounded-md border border-[#2A2A3A] bg-[#0C0C14]/95 shadow-[0_0_20px_var(--theme-color-accent),4px_4px_0px_var(--theme-color-primary),-2px_-2px_0px_var(--theme-color-accent)] flex flex-col justify-between w-[130px] h-[56px] select-none text-white transform rotate-[-1deg]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono font-black tracking-wider text-[var(--theme-color-accent)] leading-none">{t('hud_puntos_label')}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-2.5 h-2.5 ${
                        starIdx <= starsAchieved ? 'fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]' : 'text-[#1A1A2E] fill-none'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-0.5 mt-1 leading-none">
                <span className="text-base font-mono font-black text-[var(--theme-color-accent)] leading-none tracking-wide">{score}</span>
                <span className="text-[10px] sm:text-xs text-[#555] font-black">/{scaledTargets[2]}</span>
              </div>

              {/* Progress bar with star milestones */}
              <div className="relative mt-1 h-1 bg-[#1A1A2E] rounded-full border border-[#0C0C14] overflow-visible">
                {/* Fill progress */}
                <div
                  className="absolute left-0 top-0 h-full bg-[var(--theme-color-accent)] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
                {/* Tiny Stars markers */}
                {scaledTargets.map((target, idx) => {
                  const markerPct = (target / scaledTargets[2]) * 100;
                  const reached = score >= target;
                  return (
                    <div
                      key={idx}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${markerPct}%` }}
                    >
                      <div className={`w-1 h-1 rounded-full border border-[#0C0C14] ${
                        reached ? 'bg-[var(--theme-color-accent)]' : 'bg-[#1A1A2E]'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Countdown Clock Panel with Persona slants */}
            <div className={`p-2.5 rounded-md border transition-all h-[56px] flex items-center gap-2 shadow-[4px_4px_0px_var(--theme-color-accent)] transform rotate-[1.5deg] ${
              timeRemaining < 15 ? 'border-[var(--theme-color-primary)] bg-[var(--theme-color-primary)] text-white animate-pulse' : 'border-[#2A2A3A] bg-[#0C0C14]/95 text-[#D2D7DF]'
            }`}>
              <Clock className={`w-4 h-5 ${timeRemaining < 15 ? 'animate-spin' : 'text-[var(--theme-color-accent)]'}`} />
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs uppercase font-mono font-black tracking-wider text-[var(--theme-color-accent)] leading-none">{t('hud_tiempo_label')}</span>
                <span className="text-base font-mono font-black leading-none mt-1 tracking-wide">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            {/* Unified Settings & Menu Button (Gear icon only, text removed) with Persona angles */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playSelect();
                onTogglePause();
              }}
              className="w-[50px] h-[56px] bg-[var(--theme-color-accent)] text-[#0C0C14] rounded-md flex items-center justify-center transition-all hover:brightness-110 active:translate-y-0.5 shadow-[0_0_20px_var(--theme-color-accent),4px_4px_0px_var(--theme-color-primary)] border-2 border-[#2A2A3A] font-mono cursor-pointer transform rotate-[-2deg]"
              id="hud_quick_settings_btn"
              title={t('hud_settings_btn_title')}
            >
              <span className="text-xl leading-none transform rotate-[2deg]">⚙️</span>
            </button>
 
          </div>
        </div>
      </div>
 
      {/* Bottom Section: Keys Helper */}
      <div className="w-full flex justify-end pointer-events-auto mt-auto short-hidden">
        
        {/* Localized keys floating helper to trigger player memory with Persona style */}
        <div className="hidden lg:flex bg-[#0C0C14]/95 border border-[#2A2A3A] p-3.5 rounded-md flex-col gap-1.5 max-w-[245px] shrink-0 shadow-[0_0_20px_var(--theme-color-accent),4px_4px_0px_var(--theme-color-primary),-2px_-2px_0px_var(--theme-color-accent)] backdrop-blur-md text-white font-mono transform rotate-[1.5deg] relative">
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none z-[1] rounded-md" style={{background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'}} />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
          
          <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-[var(--theme-color-accent)] border-b border-[#2A2A3A] pb-1 relative z-[2]">{t('hud_quick_control_label')}</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-[#D2D7DF] font-black leading-tight mt-1 relative z-[2]">
            <span><strong>{t('hud_chef_p1_label')}:</strong> WASD</span>
            <span>{lang === 'es' ? 'Agarrar:' : 'Grab:'} <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">Space</kbd></span>
            <span>{lang === 'es' ? 'Acción:' : 'Action:'} <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">E</kbd></span>
            <span>Dash: <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">Q</kbd></span>
 
            <span className="border-t border-[#2A2A3A] pt-1 mt-1"><strong>{t('hud_chef_p2_label')}:</strong> Flechas</span>
            <span className="border-t border-[#2A2A3A] pt-1 mt-1">{lang === 'es' ? 'Agarrar:' : 'Grab:'} <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">.</kbd></span>
            <span>{lang === 'es' ? 'Acción:' : 'Action:'} <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">,</kbd></span>
            <span>Dash: <kbd className="bg-[#1A1A2E] border border-[#2A2A3A] rounded-md px-1 font-bold text-[var(--theme-color-accent)]">/</kbd></span>
          </div>
          {gameMode === 'SOLO' && (
            <span className="text-[11px] sm:text-xs text-[#D2D7DF] text-center font-mono font-black bg-[#1A1A2E] py-1.5 px-2 rounded-md mt-1.5 border border-[#2A2A3A] leading-tight relative z-[2]">
              {t('hud_swap_chef_tip')}
            </span>
          )}
        </div>
 
      </div>
 
      {/* SPEECH BUBBLE POPUP DIALOG */}
      {cookingKnowledgeItem && (() => {
        const guideline = getLocalizedGuideline(cookingKnowledgeItem);
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 pointer-events-auto animate-fadeIn">
            <div className="bg-[#0C0C14] border-2 border-[#2A2A3A] rounded-md p-6 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),-6px_-6px_0px_var(--theme-color-accent)] max-w-sm w-full relative animate-scaleIn text-center flex flex-col gap-4 font-mono transform rotate-[-1deg]">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-[1] rounded-md" style={{background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'}} />
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              
              <div className="flex flex-col items-center gap-1 relative z-[2]">
                <span className="text-5xl">
                  {guideline.emoji}
                </span>
                <span className="text-xs sm:text-sm uppercase font-mono font-black tracking-wider text-[var(--theme-color-accent)] mt-2">
                  {t('hud_guide')}
                </span>
                <h2 className="text-xl font-mono font-black text-white leading-tight mt-1">
                  {guideline.name}
                </h2>
              </div>
   
              <div className="bg-[#1A1A2E] border border-[#2A2A3A] p-4 rounded-md text-xs text-[#D2D7DF] leading-relaxed font-black relative z-[2]">
                <div className="text-[var(--theme-color-accent)] font-mono font-black mb-1.5 text-xs sm:text-sm uppercase tracking-wider">
                  {t('hud_guide_station')} <span className="bg-[var(--theme-color-primary)] text-white px-2 py-0.5 rounded-md text-xs font-black border border-[#2A2A3A]">{guideline.stationName}</span>
                </div>
                <p className="mt-2 text-[#D2D7DF] text-xs font-bold leading-relaxed">
                  {guideline.process}
                </p>
              </div>
   
              <button
                onClick={() => setCookingKnowledgeItem(null)}
                className="py-2.5 px-6 bg-[var(--theme-color-primary)] hover:bg-[var(--theme-color-primary)]/90 text-white font-mono font-black rounded-md text-xs tracking-wider shadow-[0_0_20px_var(--theme-color-primary),4px_4px_0px_var(--theme-color-accent)] border-2 border-[#2A2A3A] active:translate-y-0.5 transition-all cursor-pointer uppercase transform skew-x-[-6deg] relative z-[2]"
              >
                {t('hud_guide_understood')}
              </button>
            </div>
          </div>
        );
      })()}
 
      {/* GAME OVER MODAL (Matching pause/settings style) */}
      {isGameOver && (
        <div className="absolute inset-0 bg-[#0C0C14]/90 z-30 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md pointer-events-auto select-none overflow-hidden">
          <div className="bg-[#0C0C14] rounded-xl border-2 border-[#2A2A3A] p-4 sm:p-5 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),-5px_-5px_0px_var(--theme-color-accent)] max-w-sm w-[92%] sm:w-full flex flex-col gap-3 sm:gap-3.5 animate-scaleIn text-white font-mono z-50 transform rotate-[-0.5deg] overflow-hidden max-h-[96vh] relative">
            
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1]" style={{background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'}} />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--theme-color-accent)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--theme-color-accent)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--theme-color-accent)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--theme-color-accent)]" />
            
            {/* Header */}
            <div className="text-center relative z-[2]">
              <span className="inline-block bg-[var(--theme-color-primary)] text-white px-4 py-1.5 rounded-md font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-[#2A2A3A] shadow-[0_0_20px_var(--theme-color-primary),2px_2px_0px_var(--theme-color-accent)] transform rotate-[-3deg] skew-x-[-8deg]">
                {t('hud_level_finished')}
              </span>
            </div>

            {/* Combined Results Box */}
            <div className="flex flex-col gap-3 bg-[#1A1A2E] border border-[#2A2A3A] rounded-md p-4 shadow-[4px_4px_0px_var(--theme-color-primary)] transform rotate-[-0.5deg] overflow-hidden relative z-[2]">
              
              {/* Stars */}
              <div className="flex gap-3 my-1 justify-center items-center">
                {[1, 2, 3].map((starIdx) => {
                  const active = starIdx <= starsAchieved;
                  return (
                    <div
                      key={starIdx}
                      className={`transition-all duration-700 delay-[${starIdx * 200}ms] ${
                        active ? 'scale-110 drop-shadow-[0_4px_12px_rgba(255,174,88,0.5)]' : 'opacity-30 scale-90'
                      }`}
                    >
                      <Star
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${
                          active ? 'fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]' : 'text-neutral-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Score */}
              <div className="font-mono font-black text-3xl sm:text-4xl text-[var(--theme-color-accent)] tracking-wide text-center">
                {score} <span className="text-sm sm:text-lg text-[#555]">{t('hud_points')}</span>
              </div>

              {/* Feedback message */}
              <p className="text-xs sm:text-sm text-[#D2D7DF] font-bold text-center leading-relaxed">
                {starsAchieved === 3
                  ? t('vic_stars_3')
                  : starsAchieved === 2
                  ? t('vic_stars_2')
                  : starsAchieved === 1
                  ? t('vic_stars_1')
                  : t('vic_stars_0')}
              </p>

              {/* Level info */}
              <div className="flex justify-between items-center text-xs sm:text-sm px-1 border-t border-[#2A2A3A] pt-2">
                <span className="text-[#D2D7DF] truncate max-w-[160px]">
                  {lang === 'es' ? 'Nivel' : 'Level'}: <span className="text-white">{t('level_' + level.id + '_name') || level.name}</span>
                </span>
                <span className="bg-[var(--theme-color-primary)] px-2 py-0.5 rounded border-2 border-white text-[10px] sm:text-xs text-white shadow-[2px_2px_0px_var(--theme-color-accent)] transform rotate-[-1deg] skew-x-[-6deg]">
                  {scaledTargets[0]} pts
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 relative z-[2]">
              <button
                onClick={onReplay}
                className="py-2.5 px-4 bg-[var(--theme-color-primary)] text-white font-mono font-black rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-[#2A2A3A] hover:brightness-110 active:translate-y-0.5 transition-all shadow-[0_0_20px_var(--theme-color-primary),3px_3px_0px_var(--theme-color-accent)] transform rotate-[-0.5deg]"
                id="replay_game_modal_btn"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                <span>{t('hud_replay')}</span>
              </button>

              <button
                onClick={onExit}
                className="py-2.5 px-4 bg-[#1A1A2E] hover:bg-[#1A1A2E]/80 text-white font-mono font-black rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#2A2A3A] hover:border-[var(--theme-color-accent)] cursor-pointer transition-all active:translate-y-0.5 shadow-[3px_3px_0px_var(--theme-color-primary)]"
                id="exit_game_modal_btn"
              >
                <Home className="w-4 h-4 text-[var(--theme-color-accent)]" />
                <span>{t('hud_main_menu')}</span>
              </button>
            </div>

          </div>
        </div>
      )}
 
    </div>
  );
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  isMeta: boolean;
  icon: string;
  category: 'Gameplay' | 'Meta xD';
  howToUnlock: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    name: "Chef Supersónico",
    description: "Realiza tu primer DASH de velocidad para evitar que la comida se queme en la cocina.",
    isMeta: false,
    icon: "💨",
    category: "Gameplay",
    howToUnlock: "Usa la habilidad de acelerar (DASH)."
  },
  {
    id: 2,
    name: "A un Segundo de la Tragedia",
    description: "Saca un ingrediente de la parrilla exactamente un segundo antes de que explote en llamas.",
    isMeta: false,
    icon: "⏳",
    category: "Gameplay",
    howToUnlock: "Retira algo de la estufa en el último segundo de alerta roja."
  },
  {
    id: 3,
    name: "¡Llamen a los Bomberos!",
    description: "Quema tu primer ingrediente en la cocina. El carbón no es un condimento válido.",
    isMeta: false,
    icon: "🔥",
    category: "Gameplay",
    howToUnlock: "Deja que un ingrediente se cocine de más hasta quemarse."
  },
  {
    id: 4,
    name: "Basurero Gourmet",
    description: "Tira un ingrediente cocinado o plato armado directamente a la basura por descuido.",
    isMeta: false,
    icon: "🗑️",
    category: "Gameplay",
    howToUnlock: "Tira algo al bote de basura."
  },
  {
    id: 5,
    name: "Pinche de Cocina Novato",
    description: "Tu primer día de trabajo en la cocina más loca del vecindario. ¡Ponte el delantal!",
    isMeta: false,
    icon: "👨‍🍳",
    category: "Gameplay",
    howToUnlock: "Comienza tu viaje culinario (Se desbloquea al iniciar el juego)."
  },
  {
    id: 6,
    name: "Lava-Platos Profesional",
    description: "Lava 5 platos sucios en una sola partida. Tus manos están arrugadas pero relucientes.",
    isMeta: false,
    icon: "🧼",
    category: "Gameplay",
    howToUnlock: "Lava al menos 5 platos sucios en un solo nivel."
  },
  {
    id: 7,
    name: "La Regla de los 5 Segundos",
    description: "Recogiste comida o dejaste un plato limpio en el suelo. El piso está limpio, ¿verdad?",
    isMeta: false,
    icon: "🧹",
    category: "Gameplay",
    howToUnlock: "Completa tu primer nivel o deja caer comida al suelo."
  },
  {
    id: 8,
    name: "El Señor del Queso",
    description: "Corta y prepara 4 bloques de queso en una sola ronda.",
    isMeta: false,
    icon: "🧀",
    category: "Gameplay",
    howToUnlock: "Prepara queso picado en la tabla de cortar 4 veces."
  },
  {
    id: 9,
    name: "Hamburguesa Real",
    description: "Entrega una Hamburguesa Deluxe completa de 4 ingredientes a los hambrientos comensales.",
    isMeta: false,
    icon: "👑",
    category: "Gameplay",
    howToUnlock: "Entrega la receta 'burger_deluxe' con éxito."
  },
  {
    id: 10,
    name: "El Tiempo es Oro",
    description: "La comanda expiró justo cuando estabas a un centímetro del mostrador de entrega.",
    isMeta: false,
    icon: "⏱️",
    category: "Gameplay",
    howToUnlock: "Pierde una comanda por falta de tiempo."
  },
  {
    id: 11,
    name: "Chef de Microondas de 3 Estrellas",
    description: "Terminaste tu primer día de servicio con éxito en el Taller de Hamburguesas.",
    isMeta: false,
    icon: "⚡",
    category: "Gameplay",
    howToUnlock: "Termina el Nivel 1 con cualquier puntuación positiva."
  },
  {
    id: 12,
    name: "Banquete de Pasta",
    description: "Prepara y entrega tres platos de pasta caliente en una misma partida.",
    isMeta: false,
    icon: "🍝",
    category: "Gameplay",
    howToUnlock: "Entrega 3 recetas de pasta en un solo nivel."
  },
  {
    id: 13,
    name: "Pizza Master",
    description: "Hornea una pizza margarita crujiente sin prender fuego al horno de piedra.",
    isMeta: false,
    icon: "🍕",
    category: "Gameplay",
    howToUnlock: "Entrega una Pizza Margarita caliente con éxito."
  },
  {
    id: 14,
    name: "La Cebolla Llorona",
    description: "Corta y prepara 4 cebollas en un solo nivel. ¡Intenta no derramar lágrimas!",
    isMeta: false,
    icon: "🧅",
    category: "Gameplay",
    howToUnlock: "Prepara cebolla picada en la tabla de cortar 4 veces."
  },
  {
    id: 15,
    name: "Atracción de Carne",
    description: "Cocina a la perfección 4 piezas de carne de hamburguesa en una sola ronda.",
    isMeta: false,
    icon: "🥩",
    category: "Gameplay",
    howToUnlock: "Cocina carne a la perfección 4 veces en la estufa en un solo nivel."
  },
  {
    id: 16,
    name: "Estrella Solitaria",
    description: "Consigue tus primeras 3 estrellas doradas en el Taller de Hamburguesas básico.",
    isMeta: false,
    icon: "⭐",
    category: "Gameplay",
    howToUnlock: "Consigue 3 estrellas en el Nivel 1."
  },
  {
    id: 17,
    name: "Cortador Exclusivo",
    description: "Pica 10 ingredientes en la tabla de cortar en una misma ronda. ¡Cuidado con los dedos!",
    isMeta: false,
    icon: "🔪",
    category: "Gameplay",
    howToUnlock: "Usa la tabla de cortar 10 veces en una ronda."
  },
  {
    id: 18,
    name: "Cocina Relámpago",
    description: "Entrega un pedido en los primeros 15 segundos de comenzar la ronda.",
    isMeta: false,
    icon: "⚡",
    category: "Gameplay",
    howToUnlock: "Entrega cualquier receta súper rápido al inicio."
  },
  {
    id: 19,
    name: "Turno Nocturno",
    description: "Prepara comida bajo presión mientras el reloj corre en tu contra.",
    isMeta: false,
    icon: "🌙",
    category: "Gameplay",
    howToUnlock: "Completa cualquier nivel con menos del 10% de tiempo restante."
  },
  {
    id: 20,
    name: "Menú Variado",
    description: "Lograste entregar al menos una hamburguesa, una pasta y una pizza en el mismo nivel.",
    isMeta: false,
    icon: "🍱",
    category: "Gameplay",
    howToUnlock: "Entrega tres tipos diferentes de recetas en un solo nivel."
  },
  {
    id: 21,
    name: "El Toque de Sal",
    description: "Sazona tus platos con la precisión de un artista de alta cocina.",
    isMeta: false,
    icon: "🧂",
    category: "Gameplay",
    howToUnlock: "Entrega 5 platos perfectamente cocinados en un nivel."
  },
  {
    id: 22,
    name: "Limpieza Extrema",
    description: "No dejes ningún plato sucio en la cocina al finalizar la ronda de juego.",
    isMeta: false,
    icon: "✨",
    category: "Gameplay",
    howToUnlock: "Termina una partida con 0 platos sucios acumulados."
  },
  {
    id: 23,
    name: "¡No Se Tira Nada!",
    description: "Completa un nivel entero sin usar el bote de basura ni una sola vez.",
    isMeta: false,
    icon: "♻️",
    category: "Gameplay",
    howToUnlock: "Termina una ronda exitosa sin desechar ningún ingrediente."
  },
  {
    id: 24,
    name: "Fuego Bajo Control",
    description: "Utiliza la estufa durante toda una partida sin quemar absolutamente nada.",
    isMeta: false,
    icon: "🛡️",
    category: "Gameplay",
    howToUnlock: "Termina un nivel con al menos 5 cocciones perfectas y 0 quemados."
  },
  {
    id: 25,
    name: "La Receta del Día",
    description: "Completa la comanda especial del día recomendada por el chef de la casa.",
    isMeta: false,
    icon: "📋",
    category: "Gameplay",
    howToUnlock: "Entrega con éxito un pedido complejo de 3 o más ingredientes."
  },
  {
    id: 26,
    name: "Tomate Ninja",
    description: "Corta un tomate maduro en la tabla en menos de un segundo gracias a tus toques veloces.",
    isMeta: false,
    icon: "🍅",
    category: "Gameplay",
    howToUnlock: "Corta un ingrediente en la tabla de picar de forma instantánea."
  },
  {
    id: 27,
    name: "Mente Fría",
    description: "Ten 4 comandas activas al mismo tiempo en pantalla y entrégalas todas sin entrar en pánico.",
    isMeta: false,
    icon: "❄️",
    category: "Gameplay",
    howToUnlock: "Entrega un plato teniendo la pantalla llena de pedidos activos."
  },
  {
    id: 28,
    name: "Plato Volador",
    description: "Deja un plato limpio tirado en el suelo en lugar de ponerlo en el mostrador para ganar espacio.",
    isMeta: false,
    icon: "🛸",
    category: "Gameplay",
    howToUnlock: "Suelta un plato en una baldosa vacía del suelo."
  },
  {
    id: 29,
    name: "Torre de Platos",
    description: "Acumula 3 platos sucios en la cocina a la espera de ser lavados.",
    isMeta: false,
    icon: "🍽️",
    category: "Gameplay",
    howToUnlock: "Ten al menos 3 platos sucios tirados por la cocina al mismo tiempo."
  },
  {
    id: 30,
    name: "Ollas Calientes",
    description: "Mantén 2 ollas o sartenes cocinando en la estufa al mismo tiempo.",
    isMeta: false,
    icon: "🍳",
    category: "Gameplay",
    howToUnlock: "Ten 2 estufas cocinando ingredientes simultáneamente."
  },
  {
    id: 31,
    name: "Hamburguesa Fit",
    description: "Intenta entregar un plato que contenga solo lechuga picada y tomate picado. Un plato muy ligero.",
    isMeta: false,
    icon: "🥗",
    category: "Gameplay",
    howToUnlock: "Entrega una receta que solo lleve vegetales frescos."
  },
  {
    id: 32,
    name: "El Alquimista",
    description: "Intenta colocar un ingrediente incompatible en el horno o estufa para ver qué ocurre.",
    isMeta: false,
    icon: "🧙",
    category: "Gameplay",
    howToUnlock: "Intenta colocar un ingrediente incompatible en un horno o cocina."
  },
  {
    id: 33,
    name: "Caos Superado",
    description: "Termina el nivel de Pradera Caótica (Nivel 3) con una puntuación positiva.",
    isMeta: false,
    icon: "🏆",
    category: "Gameplay",
    howToUnlock: "Termina el Nivel 3 con un puntaje mayor a 0."
  },
  {
    id: 34,
    name: "Poder Vegetariano",
    description: "Completa y entrega 3 hamburguesas o pastas vegetarianas en una misma partida.",
    isMeta: false,
    icon: "🥦",
    category: "Gameplay",
    howToUnlock: "Entrega 3 platos que contengan únicamente ingredientes de origen vegetal."
  },
  {
    id: 35,
    name: "Olor a Carbón",
    description: "Deja la carne dorándose en la parrilla durante toda la partida de 2 minutos.",
    isMeta: false,
    icon: "💀",
    category: "Gameplay",
    howToUnlock: "Termina una partida con una carne totalmente quemada en la estufa."
  },
  {
    id: 36,
    name: "Orden en la Sala",
    description: "Ten todos tus mostradores libres de platos o ingredientes al final de un nivel.",
    isMeta: false,
    icon: "🧹",
    category: "Gameplay",
    howToUnlock: "Termina un nivel con los mostradores de preparación completamente vacíos."
  },
  {
    id: 37,
    name: "Masa Olvidada",
    description: "Estira la masa de pizza en la tabla de picar y déjala olvidada allí durante un largo rato.",
    isMeta: false,
    icon: "🥯",
    category: "Gameplay",
    howToUnlock: "Deja una masa estirada en la tabla de picar por más de 30 segundos."
  },
  {
    id: 38,
    name: "Plato de la Casa",
    description: "Entrega un plato completamente vacío en el mostrador. Un minimalismo culinario incomprendido.",
    isMeta: false,
    icon: "🍽️",
    category: "Gameplay",
    howToUnlock: "Intenta entregar un plato vacío o sucio en el delivery."
  },
  {
    id: 39,
    name: "Chef Modelo",
    description: "Quédate quieto durante 10 segundos luciendo tu elegante gorro en mitad del caos de la cocina.",
    isMeta: false,
    icon: "🕴️",
    category: "Gameplay",
    howToUnlock: "No realices ninguna acción durante 10 segundos seguidos dentro de una partida."
  },
  {
    id: 40,
    name: "Receta del Futuro",
    description: "Agrega salsa de tomate caliente encima de una hamburguesa clásica de carne.",
    isMeta: false,
    icon: "🥫",
    category: "Gameplay",
    howToUnlock: "Pon salsa de tomate o pasta seca en un plato con hamburguesa."
  },
  {
    id: 41,
    name: "Superviviente de Cocina",
    description: "Completa un pedido entregándolo a exactamente un segundo antes de que expire el tiempo límite.",
    isMeta: false,
    icon: "🩹",
    category: "Gameplay",
    howToUnlock: "Entrega un pedido exitoso cuando el tiempo del nivel sea menor a 5 segundos."
  },
  {
    id: 42,
    name: "Sabor Rústico",
    description: "Prepara una pizza perfecta usando ingredientes frescos y el calor del horno de leña.",
    isMeta: false,
    icon: "🪵",
    category: "Gameplay",
    howToUnlock: "Hornea una pizza rústica en el Nivel 3."
  },
  {
    id: 43,
    name: "Salsa Tapalotodo",
    description: "Solucionaste un error en un plato añadiendo una montaña de queso parmesano por encima.",
    isMeta: false,
    icon: "🧀",
    category: "Gameplay",
    howToUnlock: "Termina el Nivel 2 con al menos 1 entrega perfecta de pasta."
  },
  {
    id: 44,
    name: "Servicio Express",
    description: "Entrega un pedido perfecto en menos de 20 segundos después de haber sido solicitado.",
    isMeta: false,
    icon: "🏎️",
    category: "Gameplay",
    howToUnlock: "Entrega una comanda dentro del primer tercio de su barra de tiempo."
  },
  {
    id: 45,
    name: "Estrellas en Sintonía",
    description: "Consigue al menos 2 estrellas en todos los niveles disponibles del juego.",
    isMeta: false,
    icon: "⭐⭐",
    category: "Gameplay",
    howToUnlock: "Consigue 2 o más estrellas en los niveles 1, 2 y 3."
  },
  {
    id: 46,
    name: "El Gran Banquete",
    description: "Entrega un total de 10 comandas correctas a lo largo de tu carrera de chef.",
    isMeta: false,
    icon: "🥞",
    category: "Gameplay",
    howToUnlock: "Logra 10 entregas exitosas acumuladas entre todas tus partidas."
  },
  {
    id: 47,
    name: "Crítico Sobornado con Postre",
    description: "Un crítico gastronómico muy exigente ha calificado tu comida con notas excelentes en el Almacén.",
    isMeta: false,
    icon: "🍮",
    category: "Gameplay",
    howToUnlock: "Consigue al menos 2 estrellas en el Nivel 2."
  },
  {
    id: 48,
    name: "Organización Perfecta",
    description: "Completa un nivel entero sin que expire ninguna comanda por falta de tiempo.",
    isMeta: false,
    icon: "📅",
    category: "Gameplay",
    howToUnlock: "Termina cualquier nivel con 0 entregas fallidas."
  },
  {
    id: 49,
    name: "Fiebre del Delivery",
    description: "Entrega 5 pedidos correctos seguidos en un solo nivel sin cometer ningún error de receta.",
    isMeta: false,
    icon: "🚲",
    category: "Gameplay",
    howToUnlock: "Logra una racha de 5 entregas exitosas consecutivas."
  },
  {
    id: 50,
    name: "Gran Sabor Final 🏆",
    description: "Desbloqueaste todos los hitos culinarios. ¡Te coronamos oficialmente como el soberano absoluto de la cocina!",
    isMeta: false,
    icon: "👑",
    category: "Gameplay",
    howToUnlock: "Desbloquea el 100% de los logros de la cocina."
  }
];

export const EN_ACHIEVEMENTS: Record<number, { name: string; description: string; howToUnlock: string }> = {
  1: {
    name: "Supersonic Chef",
    description: "Perform your first speed DASH to prevent food from burning in the kitchen.",
    howToUnlock: "Use the speed boost ability (DASH)."
  },
  2: {
    name: "One Second from Tragedy",
    description: "Remove an ingredient from the grill exactly one second before it bursts into flames.",
    howToUnlock: "Remove something from the stove in the final second of red alert."
  },
  3: {
    name: "Call the Firefighters!",
    description: "Burn your first ingredient in the kitchen. Charcoal is not a valid seasoning.",
    howToUnlock: "Let an ingredient cook for too long until it burns."
  },
  4: {
    name: "Gourmet Trash Can",
    description: "Throw a cooked ingredient or assembled plate directly into the trash by mistake.",
    howToUnlock: "Throw something into the trash bin."
  },
  5: {
    name: "Novice Prep Cook",
    description: "Your first day on the job in the craziest kitchen in the neighborhood. Put on your apron!",
    howToUnlock: "Begin your culinary journey (Unlocked when starting the game)."
  },
  6: {
    name: "Professional Dishwasher",
    description: "Wash 5 dirty plates in a single game. Your hands are wrinkled but sparkling clean.",
    howToUnlock: "Wash at least 5 dirty plates in a single level."
  },
  7: {
    name: "The 5-Second Rule",
    description: "Picked up food or dropped a clean plate on the floor. The floor is clean, right?",
    howToUnlock: "Complete your first level or drop food on the floor."
  },
  8: {
    name: "The Cheese Lord",
    description: "Chop and prepare 4 blocks of cheese in a single round.",
    howToUnlock: "Prepare chopped cheese on the cutting board 4 times."
  },
  9: {
    name: "Royal Burger",
    description: "Deliver a complete 4-ingredient Deluxe Burger to the hungry guests.",
    howToUnlock: "Successfully deliver the 'burger_deluxe' recipe."
  },
  10: {
    name: "Time is Gold",
    description: "The ticket expired right when you were an inch away from the delivery counter.",
    howToUnlock: "Lose a ticket due to running out of time."
  },
  11: {
    name: "3-Star Microwave Chef",
    description: "Successfully finished your first service day in the Burger Workshop.",
    howToUnlock: "Finish Level 1 with any positive score."
  },
  12: {
    name: "Pasta Banquet",
    description: "Prepare and deliver three hot pasta plates in the same game.",
    howToUnlock: "Deliver 3 pasta recipes in a single level."
  },
  13: {
    name: "Pizza Master",
    description: "Bake a crispy Margherita pizza without setting the stone oven on fire.",
    howToUnlock: "Successfully deliver a hot Margherita Pizza."
  },
  14: {
    name: "The Crying Onion",
    description: "Chop and prepare 4 onions in a single level. Try not to shed tears!",
    howToUnlock: "Prepare chopped onion on the cutting board 4 times."
  },
  15: {
    name: "Meat Magnet",
    description: "Cook 4 hamburger patties to perfection in a single round.",
    howToUnlock: "Cook meat to perfection on the stove 4 times in a single level."
  },
  16: {
    name: "Lonesome Star",
    description: "Get your first 3 golden stars in the basic Burger Workshop.",
    howToUnlock: "Get 3 stars in Level 1."
  },
  17: {
    name: "Pasta Artisan",
    description: "Finish the Meadow Pasta level with at least 2 stars.",
    howToUnlock: "Get 2 or more stars in Level 2."
  },
  18: {
    name: "Grand Master of Chaos",
    description: "Survive the Great Chaotic Feast and get at least 1 star.",
    howToUnlock: "Get 1 or more stars in Level 3."
  },
  19: {
    name: "Gourmet Alchemist",
    description: "Cook and deliver 8 perfect recipes in a single round.",
    howToUnlock: "Achieve 8 successful deliveries in one game."
  },
  20: {
    name: "Perfect Cleanliness",
    description: "Washed and sanitized 10 dirty plates in a single round.",
    howToUnlock: "Wash 10 or more plates in a single level."
  },
  21: {
    name: "Unstoppable Dash",
    description: "Use your speed DASH 15 times in a single round.",
    howToUnlock: "Use DASH 15 or more times in a single level."
  },
  22: {
    name: "Culinary Legend",
    description: "Accumulate 1000 total points across your entire career as a cartoon chef.",
    howToUnlock: "Reach a cumulative total of 1000 points across all games."
  },
  23: {
    name: "Tireless Worker",
    description: "Play 5 complete rounds of Cartoon Kitchen. Practice makes perfect!",
    howToUnlock: "Play 5 matches."
  },
  24: {
    name: "Speedy Delivery",
    description: "Deliver a correct recipe within the first 15 seconds of a round.",
    howToUnlock: "Deliver a recipe in the first 15 seconds of the game."
  },
  25: {
    name: "Absolute Perfection",
    description: "Get a perfect score of 3 stars in all available levels of the game.",
    howToUnlock: "Get 3 stars in levels 1, 2, and 3."
  },
  26: {
    name: "Gourmet Couple",
    description: "Complete a cooperative level with a friend in Classic Coop mode.",
    howToUnlock: "Play in Coop mode once."
  },
  27: {
    name: "Flawless Kitchen",
    description: "Complete any level without burning a single ingredient or letting it smoke.",
    howToUnlock: "Finish a game with 0 burnt ingredients."
  },
  28: {
    name: "The Supreme Cheeseburger",
    description: "Deliver 5 cheeseburgers in a single game of the Burger Workshop.",
    howToUnlock: "Deliver 5 cheeseburgers in one game."
  },
  29: {
    name: "Fire Extinguisher Hero",
    description: "Extinguish your first kitchen fire using the fire extinguisher in a chaotic level.",
    howToUnlock: "Put out a fire using the fire extinguisher."
  },
  30: {
    name: "Assembled in a Blink",
    description: "Prepare a complete Deluxe Burger in less than 12 seconds.",
    howToUnlock: "Assembled and served a Deluxe Burger very quickly."
  },
  31: {
    name: "The Tomato King",
    description: "Chop and prepare 6 tomatoes in a single level.",
    howToUnlock: "Prepare chopped tomato on the cutting board 6 times."
  },
  32: {
    name: "Speedy Lettuce",
    description: "Chop and prepare 6 lettuce heads in a single level.",
    howToUnlock: "Prepare chopped lettuce on the cutting board 6 times."
  },
  33: {
    name: "Sauce Enthusiast",
    description: "Deliver 4 pasta plates with extra tomato sauce in a single round.",
    howToUnlock: "Deliver 4 pasta plates with sauce in one round."
  },
  34: {
    name: "Crispy Dough",
    description: "Successfully stretch 5 pizza doughs on the chopping board in a single game.",
    howToUnlock: "Prepare 5 pizza doughs in one level."
  },
  35: {
    name: "Stone Oven Expert",
    description: "Bake 4 pizzas to perfection without burning any of them.",
    howToUnlock: "Bake 4 pizzas in the oven without any of them burning."
  },
  36: {
    name: "Kitchen Symphony",
    description: "Achieve a score of 400 points or more in a single game.",
    howToUnlock: "Get 400 points or more in any level."
  },
  37: {
    name: "Master Coordinator",
    description: "Complete a cooperative level with at least 2 stars.",
    howToUnlock: "Play in Coop mode and get 2 or more stars."
  },
  38: {
    name: "Solo Chef Champion",
    description: "Get 3 stars in all levels playing exclusively in Solo Mode.",
    howToUnlock: "Get 3 stars in levels 1, 2, and 3 in Solo mode."
  },
  39: {
    name: "Infinite Patience",
    description: "Wash 15 dirty plates accumulated across all your matches.",
    howToUnlock: "Wash 15 total plates across all games."
  },
  40: {
    name: "Never Burned",
    description: "Play 3 complete matches without ever burning an ingredient.",
    howToUnlock: "Play 3 matches with 0 burnt ingredients."
  },
  41: {
    name: "Gourmet Expansion",
    description: "Successfully deliver at least one of each recipe in the cookbook.",
    howToUnlock: "Deliver every recipe in the cookbook at least once."
  },
  42: {
    name: "Supreme Chaos",
    description: "Get a score of 500 points or more in Chaotic difficulty.",
    howToUnlock: "Get 500 or more points in Chaotic difficulty."
  },
  43: {
    name: "Cooperative Legend",
    description: "Accumulate 1500 points playing with a friend in Coop mode.",
    howToUnlock: "Reach 1500 total cumulative points in Coop mode."
  },
  44: {
    name: "Express Service",
    description: "Deliver a perfect order in less than 20 seconds after it was requested.",
    howToUnlock: "Deliver a ticket within the first third of its time bar."
  },
  45: {
    name: "Tuned Stars",
    description: "Get at least 2 stars in all available levels of the game.",
    howToUnlock: "Get 2 or more stars in levels 1, 2, and 3."
  },
  46: {
    name: "The Great Feast",
    description: "Deliver a total of 10 correct orders over your entire career as a chef.",
    howToUnlock: "Achieve 10 total successful deliveries across all matches."
  },
  47: {
    name: "Dessert-Bribed Critic",
    description: "A highly demanding food critic rated your food with excellent marks in the Warehouse.",
    howToUnlock: "Get at least 2 stars in Level 2."
  },
  48: {
    name: "Perfect Organization",
    description: "Complete an entire level without any order expiring due to time limit.",
    howToUnlock: "Finish any level with 0 failed deliveries."
  },
  49: {
    name: "Delivery Fever",
    description: "Deliver 5 correct orders in a row in a single level without any recipe errors.",
    howToUnlock: "Achieve a streak of 5 consecutive successful deliveries."
  },
  50: {
    name: "Grand Final Taste 🏆",
    description: "You unlocked all culinary milestones. We officially crown you as the absolute kitchen sovereign!",
    howToUnlock: "Unlock 100% of kitchen achievements."
  }
};

export function getLocalizedAchievement(a: Achievement, lang: string): { name: string; description: string; howToUnlock: string } {
  if (lang === 'es') {
    return { name: a.name, description: a.description, howToUnlock: a.howToUnlock };
  }
  const en = EN_ACHIEVEMENTS[a.id];
  if (en) {
    return { name: en.name, description: en.description, howToUnlock: en.howToUnlock };
  }
  return { name: a.name, description: a.description, howToUnlock: a.howToUnlock };
}

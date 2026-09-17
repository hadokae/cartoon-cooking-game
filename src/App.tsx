import React, { useState, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import GameCanvas from './components/GameCanvas';
import OnlineLobby from './components/OnlineLobby';
import { GameMode, HighScore, Difficulty, CHARACTERS } from './types';
import { LEVELS } from './levels';
import { sounds } from './sounds';
import { ChefHat, Star } from 'lucide-react';
import { ACHIEVEMENTS, getLocalizedAchievement } from './achievements';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from './translations';
import { multiplayerClient } from './services/multiplayerClient';

// Calculate level dimensions matching GameCanvas exactly to avoid visual scale jumps
function getLevelDimensions(level: any) {
  const TILE_SIZE = 90;
  
  // Helper to check if a tile is accessible (matching GameCanvas exactly)
  const isTileAccessible = (col: number, row: number) => {
    const char = level.mapLayout[row]?.[col];
    if (!char) return false;
    if (char === '.') return true;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < level.gridHeight && nc >= 0 && nc < level.gridWidth) {
          const adjChar = level.mapLayout[nr]?.[nc];
          if (adjChar === '.') {
            return true;
          }
        }
      }
    }
    return false;
  };

  let minC = level.gridWidth;
  let maxC = 0;
  let minR = level.gridHeight;
  let maxR = 0;
  for (let r = 0; r < level.gridHeight; r++) {
    for (let c = 0; c < level.gridWidth; c++) {
      if (isTileAccessible(c, r)) {
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
    }
  }
  if (minC > maxC) {
    minC = 0;
    maxC = level.gridWidth - 1;
    minR = 0;
    maxR = level.gridHeight - 1;
  }

  const activeCols = maxC - minC + 1;
  const activeRows = maxR - minR + 1;
  const width = activeCols * TILE_SIZE;
  const height = activeRows * TILE_SIZE + 58; // Includes 58px HUD height
  return { width, height };
}

export default function App() {
  const { lang, t } = useTranslation();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('SOLO');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);

  // Character custom selections
  const [chef1CharId, setChef1CharId] = useState<string>(() => localStorage.getItem('cartoon_kitchen_chef1') || 'abuela');
  const [chef2CharId, setChef2CharId] = useState<string>(() => localStorage.getItem('cartoon_kitchen_chef2') || 'kenji');

  const handleSetChef1CharId = (id: string) => {
    setChef1CharId(id);
    localStorage.setItem('cartoon_kitchen_chef1', id);
  };

  const handleSetChef2CharId = (id: string) => {
    setChef2CharId(id);
    localStorage.setItem('cartoon_kitchen_chef2', id);
  };

  // Synchronize CSS custom properties with selected Chef 1's palette
  useEffect(() => {
    const selectedChef = CHARACTERS.find(c => c.id === chef1CharId) || CHARACTERS[0];
    const root = document.documentElement;
    root.style.setProperty('--theme-color-primary', selectedChef.color);
    root.style.setProperty('--theme-color-dark', selectedChef.colorDark);
    root.style.setProperty('--theme-color-accent', selectedChef.apronColor);
    root.style.setProperty('--theme-color-accent-dark', selectedChef.apronColorDark);
    root.style.setProperty('--theme-color-hat', selectedChef.hatColor);
    root.style.setProperty('--theme-color-piel', selectedChef.pielColor);
    root.style.setProperty('--theme-color-extra', selectedChef.extraColor);
  }, [chef1CharId]);

  // Achievements State
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [activeToasts, setActiveToasts] = useState<{
    id: string;
    achievementId: number;
    name: string;
    description: string;
    icon: string;
  }[]>([]);

  // Loading states for premium 10-second loader
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingLevelId, setLoadingLevelId] = useState<number | null>(null);
  const [loadingMode, setLoadingMode] = useState<GameMode | null>(null);
  const [loadingLobbyId, setLoadingLobbyId] = useState<string | null>(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Load high scores and achievements from localStorage on mount
  useEffect(() => {
    try {
      const storedScores = localStorage.getItem('cartoon_kitchen_highscores');
      if (storedScores) {
        setHighScores(JSON.parse(storedScores));
      } else {
        // Build initial empty highscore entries
        const initialScores: HighScore[] = LEVELS.map((l) => ({
          levelId: l.id,
          score: 0,
          stars: 0
        }));
        setHighScores(initialScores);
        localStorage.setItem('cartoon_kitchen_highscores', JSON.stringify(initialScores));
      }

      const storedAchievements = localStorage.getItem('cartoon_kitchen_achievements');
      if (storedAchievements) {
        setUnlockedIds(JSON.parse(storedAchievements));
      } else {
        const initial = [5]; // Auto unlock "Pinche de Cocina Novato" as a warm welcome
        setUnlockedIds(initial);
        localStorage.setItem('cartoon_kitchen_achievements', JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to load high scores or achievements', e);
    }
  }, []);

  // Helper to unlock a single achievement in real-time
  const unlockAchievement = (id: number) => {
    setUnlockedIds((prev) => {
      if (prev.includes(id)) return prev;

      const next = [...prev, id];
      localStorage.setItem('cartoon_kitchen_achievements', JSON.stringify(next));

      // Find the unlocked achievement info
      const found = ACHIEVEMENTS.find((a) => a.id === id);
      if (found) {
        // Play win fanfare sound!
        try {
          sounds.playWinFanfare();
        } catch (err) {}

        // Trigger real-time in-game toast!
        const toastId = Math.random().toString(36).substring(2);
        setActiveToasts((t) => [
          ...t,
          {
            id: toastId,
            achievementId: id,
            name: found.name,
            description: found.description,
            icon: found.icon
          }
        ]);

        // Auto remove toast after 4 seconds
        setTimeout(() => {
          setActiveToasts((t) => t.filter((item) => item.id !== toastId));
        }, 4000);
      }

      // Check if all normal achievements are unlocked to unlock 50 (Gran Sabor Final)
      const normalCount = next.filter(i => i >= 1 && i <= 49).length;
      if (normalCount >= 49 && !next.includes(50)) {
        setTimeout(() => {
          unlockAchievement(50);
        }, 400);
      }

      return next;
    });
  };

  // Reset achievements trigger
  const resetAchievements = () => {
    sounds.playSelect();
    const initial = [5];
    setUnlockedIds(initial);
    localStorage.setItem('cartoon_kitchen_achievements', JSON.stringify(initial));
    setActiveToasts([]);
  };

  // Unlock all achievements trigger
  const unlockAllAchievements = () => {
    sounds.playWinFanfare();
    const allIds = ACHIEVEMENTS.map(a => a.id);
    setUnlockedIds(allIds);
    localStorage.setItem('cartoon_kitchen_achievements', JSON.stringify(allIds));

    // Add a single epic notification toast
    const toastId = Math.random().toString(36).substring(2);
    setActiveToasts([
      {
        id: toastId,
        achievementId: 50,
        name: "¡RECETARIO COMPLETO!",
        description: "Has abierto todas las alacenas y desbloqueado todos los logros con la llave secreta. 👑🍔🍕",
        icon: "🏆"
      }
    ]);
    setTimeout(() => {
      setActiveToasts((t) => t.filter((item) => item.id !== toastId));
    }, 5000);
  };

  // Dynamic automatic achievement unlocks synced with high score progression
  useEffect(() => {
    if (highScores && highScores.length > 0) {
      // Check level 1 progress
      const h1 = highScores.find(h => h.levelId === 1);
      if (h1 && h1.score > 0) {
        if (!unlockedIds.includes(11)) unlockAchievement(11); // Chef de Microondas de 3 Estrellas
        if (!unlockedIds.includes(7)) unlockAchievement(7);   // La Regla de los 5 Segundos
      }
      if (h1 && h1.stars >= 3) {
        if (!unlockedIds.includes(16)) unlockAchievement(16); // Estrella solitaria
      }

      // Check level 2 progress
      const h2 = highScores.find(h => h.levelId === 2);
      if (h2 && h2.score > 0) {
        if (!unlockedIds.includes(43)) unlockAchievement(43); // Salsa Tapalotodo
      }

      // Check level 3 progress
      const h3 = highScores.find(h => h.levelId === 3);
      if (h3 && h3.score > 0) {
        if (!unlockedIds.includes(33)) unlockAchievement(33); // Caos Superado
      }

      // Check general stars count
      const has2Stars = highScores.some(h => h.stars >= 2);
      if (has2Stars) {
        if (!unlockedIds.includes(47)) unlockAchievement(47); // Crítico Sobornado con Postre
      }

      // Check if they got 2+ stars in ALL levels
      const hasAll2Stars = highScores.filter(h => h.stars >= 2).length >= 3;
      if (hasAll2Stars && !unlockedIds.includes(45)) {
        unlockAchievement(45); // Estrellas en Sintonía
      }
    }
  }, [highScores, unlockedIds]);

  // Premium rapid 1.2-second loader loop to start the level instantly
  useEffect(() => {
    if (!isLoading || loadingLevelId === null) return;

    setLoadingProgress(0);
    const intervalTime = 12; // Tick every 12ms (100 * 12ms = 1200ms total)
    
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 99) {
          clearInterval(timer);
          setActiveLevelId(loadingLevelId);
          if (loadingMode) {
            setGameMode(loadingMode);
          }
          setLobbyId(loadingLobbyId);
          setPlayerId(loadingPlayerId);
          setIsLoading(false);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isLoading, loadingLevelId, loadingMode, loadingLobbyId, loadingPlayerId]);

  const handleStartLevel = (levelId: number, mode: GameMode, lobbyId?: string, playerId?: string) => {
    if (mode === 'ONLINE') {
      setActiveLevelId(levelId);
      setGameMode(mode);
      setLobbyId(lobbyId || null);
      setPlayerId(playerId || null);
      setIsLoading(false);
    } else {
      setLoadingLevelId(levelId);
      setLoadingMode(mode);
      setLoadingProgress(0);
      setLobbyId(lobbyId || null);
      setLoadingPlayerId(playerId || null);
      setIsLoading(true);
    }
  };

  const handleLevelComplete = (finalScore: number, finalStars: number) => {
    if (activeLevelId === null) return;

    // Check if score is higher than current entry
    setHighScores((prev) => {
      const existing = prev.find((h) => h.levelId === activeLevelId);
      let updated = [...prev];

      if (existing) {
        if (finalScore > existing.score) {
          existing.score = finalScore;
          existing.stars = Math.max(existing.stars, finalStars);
        }
      } else {
        updated.push({
          levelId: activeLevelId,
          score: finalScore,
          stars: finalStars
        });
      }

      localStorage.setItem('cartoon_kitchen_highscores', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExitToMenu = () => {
    sounds.playSelect();
    // If leaving an online game, explicitly leave the lobby
    if (gameMode === 'ONLINE' && lobbyId) {
      multiplayerClient.leaveLobby();
    }
    setActiveLevelId(null);
    setLobbyId(null);
    if (gameMode === 'ONLINE') {
      setShowOnlineLobby(true);
    }
  };

  const selectedLevel = LEVELS.find((l) => l.id === activeLevelId);
  const loadingLevel = LEVELS.find((l) => l.id === loadingLevelId);

  const dims = loadingLevel ? getLevelDimensions(loadingLevel) : { width: 1080, height: 598 };

  return (
    <div className="w-full h-full overflow-hidden bg-[#0A1118] grind-grid-bg flex flex-col justify-center items-center p-0">
      {isLoading && loadingLevel ? (
        <div className="w-full flex-1 flex flex-col justify-center items-center relative h-full bg-[#0A1118] font-sans p-0 select-none">
          {/* Dynamic Arcade/Console Frame - EXACT match in scale, border, and aspect ratio to GameCanvas */}
          <div 
            className="w-full max-w-[1920px] [--enclosure-max-h:78vh] sm:[--enclosure-max-h:82vh] lg:[--enclosure-max-h:86vh] max-h-[78vh] sm:max-h-[82vh] lg:max-h-[86vh] bg-[#0A1118] rounded-3xl border-8 sm:border-12 border-[#2E3A46] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col transition-all duration-300"
            style={{ 
              aspectRatio: loadingMode === 'ONLINE' ? '16 / 9' : `${dims.width} / ${dims.height}`,
              maxWidth: loadingMode === 'ONLINE' ? 'calc(var(--enclosure-max-h) * 16 / 9)' : `calc(var(--enclosure-max-h) * ${dims.width} / ${dims.height})`
            }}
          >
            {/* Inner Playfield-like Screen Container */}
            <div className="relative w-full h-full bg-[#141D26] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 md:p-5 select-none font-mono">
              
              {/* Background Ambient Stripe Graphics & Glows */}
              <div className="absolute inset-0 persona-stripes-bg opacity-15 pointer-events-none" />
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--theme-color-primary)]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[var(--theme-color-accent)]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
              
              {/* Main Widescreen Layout */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full items-stretch z-10">
                
                {/* Left Column: Level Header + Culinary Tip */}
                <div className="flex flex-col justify-between gap-2.5 sm:gap-3 min-h-0 text-left">
                  {/* Header / Loading Icon */}
                  <div className="flex flex-col items-start bg-[var(--theme-color-primary)] px-3.5 py-3 rounded-xl border-2 border-white shadow-[4px_4px_0px_var(--theme-color-accent)] w-full transform rotate-[-0.5deg]">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--theme-color-accent)] rounded-lg flex items-center justify-center p-0.5 border-2 border-white transform rotate-[3deg] shadow-[2px_2px_0px_#0A1118] shrink-0">
                        <ChefHat className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0A1118] animate-bounce" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8.5px] sm:text-[9px] font-black tracking-widest text-[var(--theme-color-accent)] uppercase block leading-none truncate">
                          {t('loader_loading_level')}
                        </span>
                        <p className="text-[8px] sm:text-[8.5px] text-white opacity-95 font-bold uppercase tracking-wider leading-none mt-0.5 truncate">
                          {loadingMode === 'SOLO' ? t('loader_solo') : t('loader_coop')}
                        </p>
                      </div>
                    </div>
                    
                    <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white uppercase max-w-full truncate leading-tight font-mono">
                      {t('level_' + loadingLevel.id + '_name') || loadingLevel.name}
                    </h1>
                  </div>

                  {/* Culinary Tip Box */}
                  <div className="flex-1 bg-[#0A1118] border-2 border-white rounded-xl p-2.5 sm:p-3 shadow-[3px_3px_0px_var(--theme-color-primary)] flex flex-col justify-center gap-1 transform rotate-[0.5deg] min-h-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-1 shrink-0">
                      <span className="text-xs sm:text-sm">💡</span>
                      <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-wider text-[var(--theme-color-accent)] uppercase font-mono">
                        {t('loader_tip')}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10.5px] font-bold leading-relaxed text-white/90 font-mono uppercase line-clamp-3">
                      {t('level_' + loadingLevel.id + '_intro') || loadingLevel.introMessage}
                    </p>
                  </div>
                </div>

                {/* Right Column: Mission Parameters + Progress Bar */}
                <div className="flex flex-col justify-between gap-2.5 sm:gap-3 min-h-0 text-left">
                  {/* Mission Objectives Checklist */}
                  <div className="flex-1 bg-[#0A1118] border-2 border-white rounded-xl p-2.5 sm:p-3 shadow-[3px_3px_0px_var(--theme-color-accent)] flex flex-col justify-center gap-2 transform rotate-[-0.5deg] min-h-0">
                    <div className="border-b border-white/10 pb-1 shrink-0">
                      <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#FFAE58] uppercase tracking-widest block font-mono">
                        🎯 PARÁMETROS DE LA MISIÓN
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-0.5 bg-[#141D26] p-1.5 sm:p-2 rounded-lg border border-white/10">
                        <span className="text-[7.5px] sm:text-[8px] font-black text-[#788896] uppercase tracking-wider font-mono">
                          ⏱️ {t('loader_time')}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[var(--theme-color-accent)] font-mono leading-none">
                          {loadingLevel.timeLimit}s
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5 bg-[#141D26] p-1.5 sm:p-2 rounded-lg border border-white/10">
                        <span className="text-[7.5px] sm:text-[8px] font-black text-[#788896] uppercase tracking-wider font-mono">
                          ⭐ {t('loader_stars')}
                        </span>
                        <div className="flex items-center gap-1 text-[9.5px] sm:text-xs font-black text-[var(--theme-color-accent)] font-mono mt-0.5">
                          <span className="flex items-center gap-0.5 text-[var(--theme-color-accent)] bg-[#0A1118] px-1 rounded border border-white/10"><Star className="w-2 h-2 fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]" />{loadingLevel.targetScoreStars[0]}</span>
                          <span className="flex items-center gap-0.5 text-[var(--theme-color-accent)] bg-[#0A1118] px-1 rounded border border-white/10"><Star className="w-2 h-2 fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]" />{loadingLevel.targetScoreStars[1]}</span>
                          <span className="flex items-center gap-0.5 text-[var(--theme-color-accent)] bg-[#0A1118] px-1 rounded border border-white/10"><Star className="w-2 h-2 fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]" />{loadingLevel.targetScoreStars[2]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="bg-[#141D26] border-2 border-white rounded-xl p-2.5 sm:p-3 shadow-[3px_3px_0px_var(--theme-color-primary)] flex flex-col justify-center gap-1.5 transform rotate-[0.5deg] shrink-0">
                    {/* Animated status phrase */}
                    <div className="h-4 flex items-center justify-center">
                      <span className="text-[8.5px] sm:text-[9.5px] text-[var(--theme-color-accent)] font-black tracking-wide uppercase font-mono animate-pulse truncate text-center">
                        {loadingProgress < 25 && t('loader_p1')}
                        {loadingProgress >= 25 && loadingProgress < 50 && t('loader_p2')}
                        {loadingProgress >= 50 && loadingProgress < 75 && t('loader_p3')}
                        {loadingProgress >= 75 && t('loader_p4')}
                      </span>
                    </div>

                    {/* Progress Tube */}
                    <div className="w-full bg-[#0A1118] border-2 border-white h-3.5 sm:h-4 rounded-full overflow-hidden p-0.5 shadow-[2px_2px_0px_var(--theme-color-primary)]">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--theme-color-primary)] to-[var(--theme-color-accent)] rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>

                    {/* Loading details */}
                    <div className="flex justify-between items-center text-[8.5px] sm:text-[9px] text-[#D2D7DF] font-bold tracking-wider px-0.5">
                      <span className="flex items-center gap-1 font-mono font-black tracking-widest text-[var(--theme-color-accent)] uppercase">
                        <span className="w-1.5 h-1.5 bg-[var(--theme-color-primary)] rounded-full animate-ping" />
                        {t('loader_text')}
                      </span>
                      <span className="text-[var(--theme-color-accent)] font-black font-mono text-[10px] sm:text-[11px] bg-[var(--theme-color-primary)] text-white px-1.5 py-0.2 rounded border border-white shadow-[1px_1px_0px_#0A1118]">{Math.round(loadingProgress)}%</span>
                    </div>
                  </div>

                </div>
                
              </div>

            </div>
          </div>
        </div>
      ) : showOnlineLobby ? (
        <div className="w-full flex-1 flex flex-col justify-center items-center relative h-full bg-[#0A1118] font-sans p-0 select-none">
          {/* Dynamic Widescreen Arcade/Console Frame styled with industrial fluorescent steel and kitchen deep blue */}
          <div 
            className="w-full max-w-[1920px] [--enclosure-max-h:78vh] sm:[--enclosure-max-h:82vh] lg:[--enclosure-max-h:86vh] max-h-[78vh] sm:max-h-[82vh] lg:max-h-[86vh] bg-[#0A1118] rounded-3xl border-8 sm:border-12 border-[#2E3A46] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col transition-all duration-300"
            style={{ 
              aspectRatio: '16 / 9',
              maxWidth: `calc(var(--enclosure-max-h) * 16 / 9)`
            }}
          >
            {/* Playfield/Lobby Area inside 1920x1080 viewport */}
            <div className="relative w-full h-full bg-[#141D26] overflow-hidden p-3 sm:p-4 md:p-4.5 flex flex-col justify-between">
              <OnlineLobby
                onBack={() => setShowOnlineLobby(false)}
                chef1CharId={chef1CharId}
                onStartOnlineGame={(roomId, playerId, lvlId, diff) => {
                  setShowOnlineLobby(false);
                  handleStartLevel(lvlId, 'ONLINE', roomId, playerId);
                }}
                lang={lang}
                t={t}
                lobbyId={lobbyId}
                onLeaveRoom={() => setLobbyId(null)}
              />
            </div>
          </div>
        </div>
      ) : activeLevelId !== null && selectedLevel ? (
        <GameCanvas
          level={selectedLevel}
          gameMode={gameMode}
          difficulty={difficulty}
          onExit={handleExitToMenu}
          onLevelComplete={handleLevelComplete}
          onUnlockAchievement={unlockAchievement}
          chef1CharId={chef1CharId}
          chef2CharId={chef2CharId}
          lobbyId={lobbyId}
          playerId={playerId}
        />
      ) : (
        <TitleScreen
          onStartLevel={handleStartLevel}
          highScores={highScores}
          unlockedIds={unlockedIds}
          onUnlockAchievement={unlockAchievement}
          onResetAchievements={resetAchievements}
          onUnlockAllAchievements={unlockAllAchievements}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          chef1CharId={chef1CharId}
          setChef1CharId={handleSetChef1CharId}
          chef2CharId={chef2CharId}
          setChef2CharId={handleSetChef2CharId}
          onOpenOnlineLobby={() => setShowOnlineLobby(true)}
        />
      )}

      {/* Real-time In-game Achievement Toast Notifications */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full sm:w-96 px-4 sm:px-0">
        <AnimatePresence>
          {activeToasts.map((toast) => {
            const achObj = ACHIEVEMENTS.find(a => a.id === toast.achievementId);
            const localized = achObj ? getLocalizedAchievement(achObj, lang) : { name: toast.name, description: toast.description };
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-full bg-[#0A1118]/95 border-2 border-white rounded-2xl p-3.5 shadow-[4px_4px_0px_var(--theme-color-primary),-2px_-2px_0px_var(--theme-color-accent)] flex items-center gap-3 backdrop-blur-md relative overflow-hidden pointer-events-auto transform rotate-[-1.5deg]"
              >
                {/* Animated Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                
                {/* Icon Container with skewed background */}
                <div className="w-11 h-11 rounded-xl bg-[var(--theme-color-primary)] flex items-center justify-center shrink-0 shadow-lg text-2xl select-none animate-[bounce_1s_infinite_alternate] border-2 border-white transform skew-x-[-4deg]">
                  {toast.icon}
                </div>
 
                {/* Text details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black tracking-widest text-[var(--theme-color-accent)] uppercase leading-none block mb-0.5 font-mono">
                    🏆 {lang === 'es' ? '¡LOGRO DESBLOQUEADO!' : 'ACHIEVEMENT UNLOCKED!'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate font-mono">
                    {localized.name}
                  </h4>
                  <p className="text-[10px] text-[#D2D7DF] leading-normal font-bold line-clamp-2 mt-0.5 font-mono">
                    {localized.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

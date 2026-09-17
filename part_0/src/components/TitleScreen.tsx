import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Users, User, Star, ChefHat, BookOpen, Command, Trophy, ArrowLeft, Settings, Globe } from 'lucide-react';
import { LEVELS, RECIPES } from '../levels';
import { GameMode, HighScore, Difficulty, CHARACTERS, CharacterConfig } from '../types';
import { sounds } from '../sounds';
import { ACHIEVEMENTS, Achievement, getLocalizedAchievement } from '../achievements';
import { useTranslation } from '../translations';

import abuelaCh1 from '../../assets/abuela/ch1.png?url';
import kenjiCh1 from '../../assets/kenji/ch1.png?url';
import novaCh1 from '../../assets/nova/ch1.png?url';
import brunoCh1 from '../../assets/bruno/ch1.png?url';
import abuelaCh2 from '../../assets/abuela/ch2.png?url';
import kenjiCh2 from '../../assets/kenji/ch2.png?url';
import novaCh2 from '../../assets/nova/ch2.png?url';
import brunoCh2 from '../../assets/bruno/ch2.png?url';
import logoFrame1 from '../../logo/1.png?url';
import logoFrame2 from '../../logo/2.png?url';
import logoFrame3 from '../../logo/3.png?url';
import logoFrame4 from '../../logo/4.png?url';
import logoFrame5 from '../../logo/5.png?url';
import logoFrame6 from '../../logo/6.png?url';
import logoFrame7 from '../../logo/7.png?url';
import logoFrame8 from '../../logo/8.png?url';
import logoFrame9 from '../../logo/9.png?url';

const CHAR_CH1: Record<string, string> = {
  abuela: abuelaCh1,
  kenji: kenjiCh1,
  nova: novaCh1,
  bruno: brunoCh1,
};
const CHAR_CH2: Record<string, string> = {
  abuela: abuelaCh2,
  kenji: kenjiCh2,
  nova: novaCh2,
  bruno: brunoCh2,
};

interface TitleScreenProps {
  onStartLevel: (levelId: number, mode: GameMode, lobbyId?: string, playerId?: string) => void;
  highScores: HighScore[];
  unlockedIds: number[];
  onUnlockAchievement: (id: number) => void;
  onResetAchievements: () => void;
  onUnlockAllAchievements: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  chef1CharId: string;
  setChef1CharId: (id: string) => void;
  chef2CharId: string;
  setChef2CharId: (id: string) => void;
  onOpenOnlineLobby?: () => void;
}

export default function TitleScreen({
  onStartLevel,
  highScores,
  unlockedIds,
  onUnlockAchievement,
  onResetAchievements,
  onUnlockAllAchievements,
  difficulty,
  onDifficultyChange,
  chef1CharId,
  setChef1CharId,
  chef2CharId,
  setChef2CharId,
  onOpenOnlineLobby
}: TitleScreenProps) {
  const { lang, t, setLanguage, languages } = useTranslation();
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<GameMode>('SOLO');
  const [muted, setMuted] = useState<boolean>(sounds.getMute());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [curtainOpen, setCurtainOpen] = useState<boolean>(false);
  const [logoFrame, setLogoFrame] = useState<number>(0);
  const [logoLanded, setLogoLanded] = useState<boolean>(false);
  const [logoPreloaded, setLogoPreloaded] = useState<boolean>(false);
  const [logoLoadProgress, setLogoLoadProgress] = useState<number>(0);
  const logoFrames = [logoFrame1, logoFrame2, logoFrame3, logoFrame4, logoFrame5, logoFrame6, logoFrame7, logoFrame8, logoFrame9];

  useEffect(() => {
    if (!showSplash) return;
    let loaded = 0;
    const total = logoFrames.length;
    const check = () => {
      loaded++;
      setLogoLoadProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) setLogoPreloaded(true);
    };
    logoFrames.forEach((src) => {
      const img = new Image();
      img.onload = check;
      img.onerror = check;
      if (img.complete) {
        check();
      } else {
        img.src = src;
      }
    });
  }, []);
  const [volume, setVolumeState] = useState<number>(sounds.getVolume());
  const [touchEnabled, setTouchEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('touch_controls_enabled');
      if (saved !== null) return saved === 'true';
    } catch {}
    const ua = (navigator.userAgent || '').toLowerCase();
    return ua.includes('android') || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  });
  // Main header tabs
  const [activeTab, setActiveTab] = useState<'play' | 'controls' | 'recipes' | 'achievements'>('play');
  const [showCharacterSelect, setShowCharacterSelect] = useState<boolean>(false);
  const [playStep, setPlayStep] = useState<'levels' | 'config'>('levels');
  // Sub-recipe focus (tabbed)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('burger_classic');
  // Selected controller style ('keyboard' | 'xbox' | 'playstation' | 'generic' | 'android')
  const [controllerStyle, setControllerStyle] = useState<'keyboard' | 'xbox' | 'playstation' | 'generic' | 'android'>(() => {
    if (typeof window !== 'undefined') {
      const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
      if (ua.includes('android') || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) || ('ontouchstart' in window && window.matchMedia?.('(pointer: coarse)').matches)) {
        return 'android';
      }
    }
    return 'keyboard';
  });
  const [detectedGamepad, setDetectedGamepad] = useState<string | null>(null);
  
  // Gamepad Virtual Mouse Cursor States & Refs
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const cursorPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cursorVisibleRef = useRef(false);
  const prevButtonsRef = useRef<Record<number, boolean>>({});
  const hoveredElementRef = useRef<Element | null>(null);

  const createClickRipple = (x: number, y: number) => {
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => {
      setRipples(r => r.filter(item => item.id !== id));
    }, 600);
  };
  
  // Recipe sub-tabs
  const [selectedRecipeSubtab, setSelectedRecipeSubtab] = useState<'ingredients' | 'steps'>('ingredients');

  // Achievements States
  const [achievementsFilter, setAchievementsFilter] = useState<'all' | 'unlocked'>('all');

  useEffect(() => {
    setMuted(sounds.getMute());
  }, []);

  // Poll for connected gamepads and drive virtual mouse cursor joystick
  useEffect(() => {
    let animFrameId: number;
    let lastConnectedId: string | null = null;

    const checkGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let foundActive = false;
      let activeGp: Gamepad | null = null;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          foundActive = true;
          activeGp = gp;
          if (gp.id !== lastConnectedId) {
            lastConnectedId = gp.id;
            setDetectedGamepad(gp.id);
            
            // Automatically set controller style based on gamepad ID
            const idLower = gp.id.toLowerCase();
            if (idLower.includes('xbox') || idLower.includes('x-input') || idLower.includes('xinput') || idLower.includes('microsoft') || idLower.includes('360')) {
              setControllerStyle('xbox');
            } else if (idLower.includes('playstation') || idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('ps3') || idLower.includes('ps4') || idLower.includes('ps5') || idLower.includes('sony')) {
              setControllerStyle('playstation');
            } else {
              setControllerStyle('generic');
            }
          }
          break;
        }
      }

      if (!foundActive && lastConnectedId !== null) {
        lastConnectedId = null;
        setDetectedGamepad(null);
        setControllerStyle('keyboard');
        setCursorVisible(false);
        cursorVisibleRef.current = false;
      }

      // Handle Virtual Mouse Pointer Navigation with Joystick if active gamepad exists
      if (foundActive && activeGp) {
        // 1. Move pointer with analog sticks and D-pad
        const ax = activeGp.axes[0];
        const ay = activeGp.axes[1];
        const deadzone = 0.15;
        const cursorSpeed = 10; // speed in pixels per frame

        let dx = 0;
        let dy = 0;
        let moved = false;

        // Joystick axes input
        if (Math.abs(ax) > deadzone) {
          dx = ax * cursorSpeed;
          moved = true;
        }
        if (Math.abs(ay) > deadzone) {
          dy = ay * cursorSpeed;
          moved = true;
        }

        // D-pad button input
        const dpadUp = activeGp.buttons[12]?.pressed || false;
        const dpadDown = activeGp.buttons[13]?.pressed || false;
        const dpadLeft = activeGp.buttons[14]?.pressed || false;
        const dpadRight = activeGp.buttons[15]?.pressed || false;

        if (dpadUp) { dy = -cursorSpeed; moved = true; }
        if (dpadDown) { dy = cursorSpeed; moved = true; }
        if (dpadLeft) { dx = -cursorSpeed; moved = true; }
        if (dpadRight) { dx = cursorSpeed; moved = true; }

        if (moved) {
          // Activate virtual cursor display
          if (!cursorVisibleRef.current) {
            cursorVisibleRef.current = true;
            setCursorVisible(true);
          }

          let newX = cursorPosRef.current.x + dx;
          let newY = cursorPosRef.current.y + dy;

          // Stay within viewport limits
          newX = Math.max(10, Math.min(window.innerWidth - 10, newX));
          newY = Math.max(10, Math.min(window.innerHeight - 10, newY));

          cursorPosRef.current = { x: newX, y: newY };
          setCursorPos({ x: newX, y: newY });

          // Emulate element hovering/focusing
          const el = document.elementFromPoint(newX, newY);
          if (el && el !== hoveredElementRef.current) {
            if (hoveredElementRef.current) {
              hoveredElementRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
              hoveredElementRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
              if (typeof (hoveredElementRef.current as any).blur === 'function') {
                (hoveredElementRef.current as any).blur();
              }
            }

            // Find clickable container
            let clickable: any = el;
            while (clickable && clickable !== document.body) {
              if (
                clickable.tagName === 'BUTTON' ||
                clickable.getAttribute('role') === 'button' ||
                clickable.classList.contains('cursor-pointer') ||
                clickable.onclick
              ) {
                break;
              }
              clickable = clickable.parentElement;
            }

            const hoverTarget = clickable || el;
            hoverTarget.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            hoverTarget.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            if (typeof hoverTarget.focus === 'function') {
              hoverTarget.focus();
            }
            hoveredElementRef.current = hoverTarget;
          }
        }

        // 2. Click with Button 0 (A/Cross)
        const btn0 = activeGp.buttons[0]?.pressed || false;
        if (btn0 && !prevButtonsRef.current[0]) {
          sounds.playSelect();
          if (!cursorVisibleRef.current) {
            cursorVisibleRef.current = true;
            setCursorVisible(true);
          }
          const el = document.elementFromPoint(cursorPosRef.current.x, cursorPosRef.current.y);
          if (el) {
            let clickable: any = el;
            while (clickable && clickable !== document.body) {
              if (
                clickable.tagName === 'BUTTON' ||
                clickable.getAttribute('role') === 'button' ||
                clickable.classList.contains('cursor-pointer') ||
                clickable.onclick
              ) {
                break;
              }
              clickable = clickable.parentElement;
            }
            const clickTarget = clickable || el;
            clickTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            clickTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            createClickRipple(cursorPosRef.current.x, cursorPosRef.current.y);
          }
        }
        prevButtonsRef.current[0] = btn0;

        // 3. Go back / cancel with Button 1 (B/Circle)
        const btn1 = activeGp.buttons[1]?.pressed || false;
        if (btn1 && !prevButtonsRef.current[1]) {
          // Check if we are on step config (and can go back to levels step)
          setPlayStep(prevStep => {
            if (prevStep === 'config') {
              sounds.playSelect();
              return 'levels';
            }
            return prevStep;
          });
        }
        prevButtonsRef.current[1] = btn1;

        // 4. Tab switching with bumpers (LB / RB)
        // Button 4 (L1 / LB), Button 5 (R1 / RB)
        const btn4 = activeGp.buttons[4]?.pressed || false;
        const btn5 = activeGp.buttons[5]?.pressed || false;
        const tabList: ('play' | 'controls' | 'recipes' | 'achievements')[] = ['play', 'controls', 'recipes', 'achievements'];

        if (btn4 && !prevButtonsRef.current[4]) {
          // Go to previous tab
          setActiveTab(curr => {
            const idx = tabList.indexOf(curr);
            const nextIdx = (idx - 1 + tabList.length) % tabList.length;
            sounds.playSelect();
            if (tabList[nextIdx] === 'play') setPlayStep('levels');
            return tabList[nextIdx];
          });
        }
        prevButtonsRef.current[4] = btn4;

        if (btn5 && !prevButtonsRef.current[5]) {
          // Go to next tab
          setActiveTab(curr => {
            const idx = tabList.indexOf(curr);
            const nextIdx = (idx + 1) % tabList.length;
            sounds.playSelect();
            if (tabList[nextIdx] === 'play') setPlayStep('levels');
            return tabList[nextIdx];
          });
        }
        prevButtonsRef.current[5] = btn5;
      }

      animFrameId = requestAnimationFrame(checkGamepads);
    };

    animFrameId = requestAnimationFrame(checkGamepads);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Hide gamepad virtual cursor when physical mouse moves
  useEffect(() => {
    const handlePhysicalMouseMove = () => {
      setCursorVisible(false);
      cursorVisibleRef.current = false;
    };
    window.addEventListener('mousemove', handlePhysicalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handlePhysicalMouseMove);
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMute = sounds.toggleMute();
    setMuted(newMute);
    sounds.playSelect();
  };

  const currentLevel = LEVELS.find(l => l.id === selectedLevelId) || LEVELS[0];
  const levelHighScoreInfo = highScores.find(h => h.levelId === selectedLevelId);

  const scoreMult = difficulty === 'DIFICIL' ? 1.15 : difficulty === 'EXTREMO' ? 1.30 : difficulty === 'CAOTICO' ? 1.50 : 1.0;

  const getStarsIcon = (stars: number, sizeClass = 'w-4 h-4') => {
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`${sizeClass} ${
              s <= stars ? 'fill-[#E6A15C] text-[#E6A15C]' : 'text-[#2E3A46] fill-none'
            } filter drop-shadow-sm`}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => setLogoFrame(1), 700);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash || curtainOpen || !logoLanded) return;
    let frame = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const playFrame = () => {
      frame++;
      if (frame >= 9) return;
      setLogoFrame(frame);
      const delay = frame >= 2 ? 80 : 45;
      timeoutId = setTimeout(playFrame, delay);
    };
    playFrame();
    return () => clearTimeout(timeoutId);
  }, [showSplash, curtainOpen, logoLanded]);

  return (
    <div className="w-full h-screen bg-[#0A1118] text-[#D2D7DF] flex flex-col justify-center items-center p-2 sm:p-4 relative overflow-hidden select-none font-sans leading-tight persona-stripes-bg">
      
      {/* Decorative vector background icons with crazy Persona rotations */}
      <span className="absolute top-2 left-6 text-4xl opacity-30 animate-bounce duration-[4000ms] pointer-events-none filter drop-shadow rotate-[-12deg]">🍅</span>
      <span className="absolute top-3 right-6 text-4xl opacity-30 animate-bounce duration-[3000ms] pointer-events-none filter drop-shadow rotate-[15deg]">🍔</span>
      <span className="absolute bottom-4 left-6 text-4xl opacity-30 animate-bounce duration-[3500ms] pointer-events-none filter drop-shadow rotate-[8deg]">🍝</span>
      <span className="absolute bottom-5 right-6 text-4xl opacity-30 animate-bounce duration-[4500ms] pointer-events-none filter drop-shadow rotate-[-20deg]">🍕</span>
      <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-[var(--theme-color-primary)]/10 rounded-full blur-[60px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-[#FFAE58]/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
 
      {/* Main Console Box: Sharp Persona Style Layout */}
      <div className="w-full max-w-5xl h-[95vh] max-h-[700px] flex flex-col justify-between bg-[#141D26] rounded-xl sm:rounded-2xl border-2 border-[#2A2A3A] p-2 sm:p-3.5 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),14px_14px_0px_#0A1118] relative z-10 overflow-hidden grind-grid-bg">
        
        {/* Splash Screen - Store Shutter */}
        {showSplash && (
          <div 
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out rounded-xl sm:rounded-2xl"
            style={{ 
              transform: curtainOpen ? 'translateY(-100%)' : 'translateY(0)',
              background: 'linear-gradient(180deg, #0C0C14 0%, #141D26 50%, #0C0C14 100%)',
            }}
          >
            {/* Shutter slats effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 10px)' }} />
            
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
            
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[var(--theme-color-primary)]" />
            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[var(--theme-color-primary)]" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[var(--theme-color-primary)]" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[var(--theme-color-primary)]" />
            
          {logoPreloaded ? (
            <>
              {/* Logo - Falls with frame 1, switches to frame 2 mid-fall, then plays 2-9 progressively slower */}
              <div 
                className="mb-1 sm:mb-2" 
                style={{ animation: 'logoFall 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                onAnimationEnd={() => setLogoLanded(true)}
              >
                <img 
                  src={logoFrames[logoFrame]} 
                  alt="Cooking Alley" 
                  className="w-72 sm:w-96 md:w-[30rem] object-contain drop-shadow-[0_0_30px_var(--theme-color-primary)]"
                />
              </div>
              
              {/* Start Button */}
              <button
                onClick={() => {
                  sounds.playWinFanfare();
                  setCurtainOpen(true);
                  setTimeout(() => setShowSplash(false), 1000);
                }}
                className="group relative px-10 sm:px-14 py-3 sm:py-4 bg-[var(--theme-color-primary)] text-white font-mono text-lg sm:text-xl tracking-[0.3em] uppercase border-2 border-white cursor-pointer transition-all duration-300 hover:bg-white hover:text-[var(--theme-color-primary)] active:scale-95 shadow-[0_0_30px_var(--theme-color-primary)60]"
                style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
              >
                <span className="relative z-10 font-black">
                  ▶ {lang === 'es' ? 'INICIAR' : 'START'}
                </span>
                {/* Glow pulse */}
                <div className="absolute inset-0 bg-[var(--theme-color-primary)] opacity-20 animate-pulse pointer-events-none" 
                  style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }} />
              </button>
              
              {/* Bottom hint */}
              <div className="mt-2 text-center">
                <span className="text-[9px] sm:text-[10px] font-mono text-[#555] tracking-widest uppercase">
                  {lang === 'es' ? 'Presiona para jugar' : 'Press to play'}
                </span>
              </div>
            </>
          ) : (
            /* Loading Bar */
            <div className="flex flex-col items-center gap-6">
              <div className="mb-8 sm:mb-12">
                <img 
                  src={logoFrame1} 
                  alt="Cooking Alley" 
                  className="w-72 sm:w-96 md:w-[30rem] object-contain drop-shadow-[0_0_30px_var(--theme-color-primary)] animate-pulse"
                />
              </div>
              <div className="w-48 sm:w-64 flex flex-col items-center gap-3">
                <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden border border-[#2A2A3A]">
                  <div 
                    className="h-full rounded-full transition-all duration-200 ease-out"
                    style={{ 
                      width: `${logoLoadProgress}%`,
                      background: 'linear-gradient(90deg, var(--theme-color-primary), #FFAE58)',
                      boxShadow: '0 0 12px var(--theme-color-primary)',
                    }} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-black text-[#555] tracking-[0.3em] uppercase">
                  {lang === 'es' ? 'CARGANDO...' : 'LOADING...'} {logoLoadProgress}%
                </span>
              </div>
            </div>
          )}
          </div>
        )}
        {/* Header Ribbon */}
        <header className="flex flex-nowrap justify-between items-center gap-1.5 sm:gap-2 border-b border-[#2A2A3A] pb-1.5 sm:pb-2 shrink-0">
 
          {/* Primary Viewport Tabs – Fighting-Game Style (flat, accent bar, mono bold) */}
          <div className="flex bg-[#0C0C14] p-0.5 sm:p-1 rounded-md border border-[#2A2A3A] shrink min-w-0">
            <button
              onClick={() => { sounds.playSelect(); setActiveTab('play'); setPlayStep('levels'); }}
              className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'play'
                  ? 'bg-[#1A1A2E] text-white border-l-[var(--theme-color-primary)] border-t-transparent border-r-transparent border-b-transparent shadow-[0_0_12px_var(--theme-color-primary)_25]'
                  : 'border-transparent text-[#555] hover:text-[#888] hover:bg-[#1A1A2E]/40'
              }`}
              id="tab_play"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>{t('tab_play')}</span>
            </button>
            <button
              onClick={() => { sounds.playSelect(); setActiveTab('controls'); }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'controls'
                  ? 'bg-[#1A1A2E] text-white border-l-[var(--theme-color-primary)] border-t-transparent border-r-transparent border-b-transparent shadow-[0_0_12px_var(--theme-color-primary)_25]'
                  : 'border-transparent text-[#555] hover:text-[#888] hover:bg-[#1A1A2E]/40'
              }`}
              id="tab_controls"
            >
              <Command className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t('tab_controls')}</span>
            </button>
            <button
              onClick={() => { sounds.playSelect(); setActiveTab('recipes'); }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'recipes'
                  ? 'bg-[#1A1A2E] text-white border-l-[var(--theme-color-accent)] border-t-transparent border-r-transparent border-b-transparent shadow-[0_0_12px_var(--theme-color-accent)_25]'
                  : 'border-transparent text-[#555] hover:text-[#888] hover:bg-[#1A1A2E]/40'
              }`}
              id="tab_recipes"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t('tab_recipes')}</span>
            </button>
            <button
              onClick={() => { sounds.playSelect(); setActiveTab('achievements'); }}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'achievements'
                  ? 'bg-[#1A1A2E] text-white border-l-[#E67E22] border-t-transparent border-r-transparent border-b-transparent shadow-[0_0_12px_rgba(230,126,34,0.25)]'
                  : 'border-transparent text-[#555] hover:text-[#888] hover:bg-[#1A1A2E]/40'
              }`}
              id="tab_achievements"
            >
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t('tab_achievements')}</span>
              <span className="bg-[#0C0C14] text-[9.5px] sm:text-[11px] px-1.5 py-0.5 rounded text-[#E6A15C] font-mono font-black border border-[#2A2A3A]">{unlockedIds.length}</span>
            </button>
          </div>

          {/* Fast In-Header Play & Mute Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                sounds.playSelect();
                setShowCharacterSelect(true);
              }}
              className="py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-md bg-[#1A1A2E] hover:bg-[#2A2A3A] text-[#D2D7DF] font-mono text-[11px] sm:text-xs tracking-wider uppercase border border-[#2A2A3A] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-black"
              id="header_choose_characters_btn"
              title={lang === 'es' ? 'Elige tus personajes cocineros' : 'Choose your chef characters'}
            >
              <span className="flex items-center gap-1.5">
                <img src={CHAR_CH1[chef1CharId] || CHAR_CH1.abuela} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                <span className="tracking-wide text-[10px] sm:text-xs font-bold">
                  {lang === 'es' ? 'PERSONAJES' : 'CHARACTERS'}
                </span>
              </span>
            </button>

            <button
              onClick={() => { sounds.playSelect(); setShowSettings(true); }}
              className="py-1 sm:py-1.5 px-2 sm:px-2.5 bg-[#1A1A2E] hover:bg-[#2A2A3A] text-[#D2D7DF] active:translate-y-0.5 transition-all rounded-md border border-[#2A2A3A] cursor-pointer flex items-center justify-center gap-1 font-black text-[11px] sm:text-xs uppercase font-mono shrink-0"
              id="settings_btn"
              title="Ajustes de Juego / Settings"
            >
              <span className="flex items-center gap-1">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6A15C]" />
                <span className="text-[10px] sm:text-xs tracking-wide text-[#D2D7DF]">{t('tab_settings')}</span>
              </span>
            </button>
          </div>
        </header>
 
        {/* Nested Content Hub: Direct child rendering, taking 100% height minus header & footer */}
        <div className={`flex-1 min-h-0 py-1 sm:py-1.5 ${activeTab === 'play' ? 'overflow-hidden flex flex-col justify-between' : 'overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-orange-200'}`}>
          
          {/* PLAY SCREEN: Nested level tabs + details */}
          {activeTab === 'play' && (
            <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2 animate-fadeIn min-h-0 overflow-hidden">
              {playStep === 'levels' ? (
                /* STEP 1: SELECT LEVEL GRID */
                <div className="w-full flex-1 flex flex-col justify-between gap-2 my-auto min-h-0">
                    <div className="flex flex-col gap-1 items-center flex-1 justify-center min-h-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-5 bg-[var(--theme-color-primary)] rounded-full" />
                      <span className="text-[10px] sm:text-xs font-black text-[#555] font-mono tracking-widest uppercase">
                        {t('play_select_level')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full flex-1 min-h-0 items-stretch">
                      {LEVELS.map((level) => {
                        const score = highScores.find(h => h.levelId === level.id);
                        const stars = score ? score.stars : 0;
                        const isSelected = selectedLevelId === level.id;
                        return (
                          <button
                            key={level.id}
                            onMouseEnter={() => setSelectedLevelId(level.id)}
                            onClick={() => {
                               sounds.playSelect();
                               setSelectedLevelId(level.id);
                               setPlayStep('config');
                            }}
                            className={`relative group rounded-lg overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between text-left min-h-0 ${
                              isSelected
                                ? 'scale-[1.02] z-10'
                                : 'grayscale opacity-50 hover:grayscale-[50%] hover:opacity-75'
                            }`}
                            style={{
                              background: isSelected
                                ? 'linear-gradient(180deg, var(--theme-color-primary)22 0%, #0C0C14 60%)'
                                : 'linear-gradient(180deg, #1A1A2E 0%, #0C0C14 100%)',
                              border: isSelected ? '2px solid var(--theme-color-primary)' : '2px solid #1E1E30',
                              boxShadow: isSelected ? '0 0 20px var(--theme-color-primary)40, inset 0 -40px 30px -20px var(--theme-color-primary)15' : 'none',
                            }}
                            id={`level_tab_${level.id}`}
                          >
                            {/* Selected top indicator bar */}
                            {isSelected && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-primary), transparent)' }} />
                            )}

                            <div className="relative px-2.5 sm:px-3 py-2 flex flex-col gap-0.5 w-full min-h-0 z-[1]">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-7 h-7 rounded-md font-mono text-sm flex items-center justify-center shrink-0 border transition-all ${
                                  isSelected
                                    ? 'bg-[var(--theme-color-accent)] text-[#0A1118] border-white font-black'
                                    : 'bg-[#2E3A46] text-[#555] border-[#0A1118] font-bold'
                                   }`}>
                                  {level.id}
                                </div>
                                <div className={`font-mono font-black text-sm sm:text-base truncate max-w-[170px] leading-tight transition-colors ${
                                  isSelected ? 'text-[var(--theme-color-accent)]' : 'text-[#555]'
                                }`}>
                                  {t(`level_${level.id}_name`)}
                                </div>
                              </div>
                              <p className={`text-xs sm:text-[13px] leading-snug mt-1 transition-colors line-clamp-2 font-medium ${
                                  isSelected ? 'text-white/90' : 'text-[#555]'
                              }`}>
                                {t(`level_${level.id}_desc`)}
                              </p>
                            </div>

                            {/* Stars badge bottom */}
                            <div className={`relative z-[1] mt-1.5 w-full flex items-center justify-between px-2.5 py-1 rounded-md border transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-black/35 border-white/20'
                                : 'bg-[#0C0C14] border border-[#1E1E30]'
                            }`}>
                              <div className="flex gap-1">
                                {[1, 2, 3].map((s_idx) => (
                                  <Star
                                    key={s_idx}
                                    className={`w-3.5 h-3.5 ${
                                      s_idx <= stars
                                        ? 'fill-[var(--theme-color-accent)] text-[var(--theme-color-accent)]'
                                        : isSelected ? 'text-white/20 fill-none' : 'text-[#1E1E30] fill-none'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`font-mono font-black text-xs sm:text-[13px] ${isSelected ? 'text-[var(--theme-color-accent)]' : 'text-[#555]'}`}>
                                {score && score.score > 0 ? `${score.score} pts` : t('play_no_score')}
                              </span>
                            </div>

                            {/* Scanline overlay on hover/selected */}
                            {isSelected && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none z-[2]"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}

                            {/* Corner accent borders on selected */}
                            {isSelected && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--theme-color-primary)] z-[3]" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--theme-color-primary)] z-[3]" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--theme-color-primary)] z-[3]" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--theme-color-primary)] z-[3]" />
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
 
                  {/* Combined Instruction & Record Row */}
                  <div className="bg-[#1A1A2E] rounded-md border border-[#2A2A3A] p-1.5 flex flex-col gap-1 shadow-[2px_2px_0px_#0A1118] shrink-0">
                    <div className="bg-[#0C0C14] px-2.5 py-1.5 rounded-md border border-[#2A2A3A] flex justify-between items-center gap-2 text-xs font-bold text-[#D2D7DF]">
                      <span className="text-[#555] text-left leading-tight font-medium text-xs sm:text-[13px] truncate">
                        💡 <span className="text-[#D2D7DF] font-bold">{t('play_instruction_title')}:</span> {t('play_instruction_desc')}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[11px] text-[#555] uppercase font-black">{t('play_max_local')}:</span>
                        <div className="flex items-center gap-1 text-[#E6A15C]">
                          {getStarsIcon(levelHighScoreInfo ? levelHighScoreInfo.stars : 0)}
                          <span className="bg-[#1A1A2E] border border-[#2A2A3A] px-2 py-0.5 rounded text-xs font-mono tracking-wide text-[#D2D7DF] font-bold">
                            {levelHighScoreInfo ? `${levelHighScoreInfo.score} pts` : '0 pts'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-xs leading-none text-center font-bold font-sans">
                      <div className="flex flex-col justify-center items-center gap-1 py-1 bg-[#0C0C14] rounded border border-[#2A2A3A]">
                        <div className="flex gap-0.5 justify-center items-center h-4">
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                        </div>
                        <span className="text-[#D2D7DF] font-mono text-xs sm:text-[13px] font-bold tracking-wide mt-0.5">{Math.round(currentLevel.targetScoreStars[0] * scoreMult)} pts</span>
                      </div>
                      <div className="flex flex-col justify-center items-center gap-1 py-1 bg-[#0C0C14] rounded border border-[#2A2A3A]">
                        <div className="flex gap-0.5 justify-center items-center h-4">
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                        </div>
                        <span className="text-[#D2D7DF] font-mono text-xs sm:text-[13px] font-bold tracking-wide mt-0.5">{Math.round(currentLevel.targetScoreStars[1] * scoreMult)} pts</span>
                      </div>
                      <div className="flex flex-col justify-center items-center gap-1 py-1 bg-[#0C0C14] rounded border border-[#2A2A3A]">
                        <div className="flex gap-0.5 justify-center items-center h-4">
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                          <Star className="w-3.5 h-3.5 fill-[#E6A15C] text-[#E6A15C]" />
                        </div>
                        <span className="text-[#D2D7DF] font-mono text-xs sm:text-[13px] font-bold tracking-wide mt-0.5">{Math.round(currentLevel.targetScoreStars[2] * scoreMult)} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: CONFIGURE GAME MODE & DIFFICULTY (Zero-scroll pre-game configuration menu) */
                <div className="flex-1 flex flex-col justify-between gap-1 sm:gap-2 min-h-0 overflow-hidden">
                  {/* Step sub-header with back arrow button */}
                  <div className="flex items-center justify-between border-b border-[#2E3A46] pb-1 sm:pb-1.5 shrink-0">
                    <button
                      onClick={() => {
                        sounds.playSelect();
                        setPlayStep('levels');
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-[#2E3A46] bg-[#0A1118]/80 text-[#D2D7DF] hover:bg-[#2E3A46]/30 hover:border-[#4A90E2] transition-all cursor-pointer text-xs sm:text-sm font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_#0A1118]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6A15C]" />
                      <span>{t('play_back')}</span>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <span className="text-xs sm:text-[13px] font-mono font-black text-[#E6A15C] uppercase tracking-wider bg-[#0A1118] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-[#2E3A46]">
                        {t('play_kitchen')} {currentLevel.id}
                      </span>
                      <span className="text-xs sm:text-base font-mono tracking-wider text-[#D2D7DF] font-black truncate max-w-[180px] sm:max-w-[280px]">
                        {t(`level_${currentLevel.id}_name`)}
                      </span>
                    </div>
                  </div>

                  {/* Unified Game Mode & Difficulty Configuration Card */}
                  <div className="bg-[#0C0C14] rounded-lg border-2 border-[#2A2A3A] p-2 sm:p-2.5 flex-1 flex flex-col justify-between shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8)] gap-1.5 sm:gap-2 animate-fadeIn relative min-h-0 overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3.5 w-full flex-1 min-h-0 items-stretch">
                      {/* Left Column: Game Mode selection */}
                      <div className="flex flex-col justify-between gap-1 sm:gap-1.5 min-h-0">
                        <span className="text-xs sm:text-sm font-mono font-black tracking-wide text-[var(--theme-color-accent)] block border-b border-[#2A2A3A] pb-0.5 sm:pb-1 uppercase shrink-0">
                           ⚙️ {t('play_mode')}
                        </span>
                        
                        {/* Mode Button Tabs - SOLO and COOP ONLINE */}
                        <div className="flex flex-col gap-2 flex-1 justify-center min-h-0">
                          <button
                            onClick={() => { sounds.playSelect(); setSelectedMode('SOLO'); }}
                            className={`relative group py-2 px-2.5 sm:px-3 rounded-lg border flex items-center gap-2.5 text-left transition-all cursor-pointer overflow-hidden flex-1 min-h-0 ${
                              selectedMode === 'SOLO'
                                ? 'border-white bg-[#1A1A2E] text-white font-black shadow-[0_0_15px_var(--theme-color-primary)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] hover:bg-[#1A1A2E]/40 text-[#555] hover:text-[#888]'
                            }`}
                            id="game_mode_solo_tab"
                          >
                            {/* Top indicator bar */}
                            {selectedMode === 'SOLO' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-primary), transparent)' }} />
                            )}
                            <User className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 z-[1] ${selectedMode === 'SOLO' ? 'text-white' : 'text-[#555]'}`} />
                            <div className="min-w-0 flex-1 z-[1]">
                              <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight ${selectedMode === 'SOLO' ? 'text-[var(--theme-color-accent)]' : 'text-[#888]'}`}>{t('play_solo')}</p>
                              <span className={`text-[10px] sm:text-xs leading-tight block mt-0.5 font-bold truncate ${selectedMode === 'SOLO' ? 'text-white/95' : 'text-[#555]'}`}>
                                {t('play_solo_desc')}
                              </span>
                            </div>
                            {/* Scanline on selected */}
                            {selectedMode === 'SOLO' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {/* Corner accents on selected */}
                            {selectedMode === 'SOLO' && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--theme-color-primary)]" />
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => { sounds.playSelect(); setSelectedMode('ONLINE'); }}
                            className={`relative group py-2 px-2.5 sm:px-3 rounded-lg border flex items-center gap-2.5 text-left transition-all cursor-pointer overflow-hidden flex-1 min-h-0 ${
                              selectedMode === 'ONLINE'
                                ? 'border-white bg-[#1A1A2E] text-white font-black shadow-[0_0_15px_var(--theme-color-primary)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] hover:bg-[#1A1A2E]/40 text-[#555] hover:text-[#888]'
                            }`}
                            id="game_mode_online_tab"
                          >
                            {/* Top indicator bar */}
                            {selectedMode === 'ONLINE' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-primary), transparent)' }} />
                            )}
                            <Globe className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 z-[1] ${selectedMode === 'ONLINE' ? 'text-white' : 'text-[#555]'}`} />
                            <div className="min-w-0 flex-1 z-[1]">
                              <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight ${selectedMode === 'ONLINE' ? 'text-[var(--theme-color-accent)]' : 'text-[#888]'}`}>COOP ONLINE</p>
                              <span className={`text-[10px] sm:text-xs leading-tight block mt-0.5 font-bold truncate ${selectedMode === 'ONLINE' ? 'text-white/95' : 'text-[#555]'}`}>
                                {lang === 'es' ? 'Salas y códigos Firebase (2-4 chefs)' : 'Firebase rooms & codes (2-4 chefs)'}
                              </span>
                            </div>
                            {/* Scanline on selected */}
                            {selectedMode === 'ONLINE' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {/* Corner accents on selected */}
                            {selectedMode === 'ONLINE' && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--theme-color-primary)]" />
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="bg-[#0C0C14] border border-[#2A2A3A] p-1.5 sm:p-2 rounded-md text-[11px] sm:text-xs text-[#555] leading-tight font-bold shrink-0">
                          {selectedMode === 'SOLO' ? (
                            <span className="truncate block">🎮 <span className="text-white font-black">{t('play_solo')}:</span> {t('play_solo_desc').replace('Solo:', '').replace('Solo :', '').trim()}</span>
                          ) : (
                            <span className="truncate block">🌐 <span className="text-white font-black">COOP ONLINE:</span> {lang === 'es' ? 'Multijugador en tiempo real con salas y códigos Firebase.' : 'Firebase multiplayer lobby for 2 to 4 chefs.'}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right Column: Select Difficulty */}
                      <div className="flex flex-col justify-between gap-1 sm:gap-1.5 min-h-0">
                        <span className="text-xs sm:text-sm font-mono font-black tracking-wide text-[var(--theme-color-accent)] block border-b border-[#2A2A3A] pb-0.5 sm:pb-1 uppercase shrink-0">
                           🔥 {t('play_select_difficulty')}
                        </span>
                        
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 flex-1 items-stretch min-h-0">
                          <button
                            onClick={() => { sounds.playSelect(); onDifficultyChange('NORMAL'); }}
                            className={`relative group py-1 sm:py-1.5 px-2 sm:px-2.5 text-left transition-all rounded-md border cursor-pointer flex flex-col justify-center min-h-0 overflow-hidden ${
                              difficulty === 'NORMAL'
                                ? 'border-white bg-[#1A1A2E] font-black shadow-[0_0_15px_var(--theme-color-accent)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] text-[#555] hover:bg-[#1A1A2E]/40'
                            }`}
                            id="difficulty_normal_btn"
                          >
                            {difficulty === 'NORMAL' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-accent), transparent)' }} />
                            )}
                            <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight truncate z-[1] ${difficulty === 'NORMAL' ? 'text-[var(--theme-color-accent)]' : 'text-[#888]'}`}>{t('diff_normal')}</p>
                            <span className={`text-[9.5px] sm:text-[11px] leading-tight block mt-0.5 font-bold truncate z-[1] ${difficulty === 'NORMAL' ? 'text-white/90' : 'text-[#555]'}`}>100% t | standard</span>
                            {difficulty === 'NORMAL' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {difficulty === 'NORMAL' && (
                              <>
                                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-[var(--theme-color-accent)]" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-[var(--theme-color-accent)]" />
                                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-[var(--theme-color-accent)]" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-[var(--theme-color-accent)]" />
                              </>
                            )}
                          </button>
  
                          <button
                            onClick={() => { sounds.playSelect(); onDifficultyChange('DIFICIL'); }}
                            className={`relative group py-1 sm:py-1.5 px-2 sm:px-2.5 text-left transition-all rounded-md border cursor-pointer flex flex-col justify-center min-h-0 overflow-hidden ${
                              difficulty === 'DIFICIL'
                                ? 'border-white bg-[#1A1A2E] font-black shadow-[0_0_15px_rgba(230,126,34,0.25)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] text-[#555] hover:bg-[#1A1A2E]/40'
                            }`}
                            id="difficulty_dificil_btn"
                          >
                            {difficulty === 'DIFICIL' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, #E67E22, transparent)' }} />
                            )}
                            <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight truncate z-[1] ${difficulty === 'DIFICIL' ? 'text-[#E6A15C]' : 'text-[#888]'}`}>{t('diff_dificil')}</p>
                            <span className={`text-[9.5px] sm:text-[11px] leading-tight block mt-0.5 font-bold truncate z-[1] ${difficulty === 'DIFICIL' ? 'text-white/90' : 'text-[#555]'}`}>85% t | picado -10%</span>
                            {difficulty === 'DIFICIL' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {difficulty === 'DIFICIL' && (
                              <>
                                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-[#E67E22]" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-[#E67E22]" />
                                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-[#E67E22]" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-[#E67E22]" />
                              </>
                            )}
                          </button>
  
                          <button
                            onClick={() => { sounds.playSelect(); onDifficultyChange('EXTREMO'); }}
                            className={`relative group py-1 sm:py-1.5 px-2 sm:px-2.5 text-left transition-all rounded-md border cursor-pointer flex flex-col justify-center min-h-0 overflow-hidden ${
                              difficulty === 'EXTREMO'
                                ? 'border-white bg-[#1A1A2E] font-black shadow-[0_0_15px_rgba(230,126,34,0.25)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] text-[#555] hover:bg-[#1A1A2E]/40'
                            }`}
                            id="difficulty_extremo_btn"
                          >
                            {difficulty === 'EXTREMO' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, #E67E22, transparent)' }} />
                            )}
                            <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight truncate z-[1] ${difficulty === 'EXTREMO' ? 'text-[#E6A15C]' : 'text-[#888]'}`}>{t('diff_extremo')}</p>
                            <span className={`text-[9.5px] sm:text-[11px] leading-tight block mt-0.5 font-bold truncate z-[1] ${difficulty === 'EXTREMO' ? 'text-white/90' : 'text-[#555]'}`}>70% t | picado -25%</span>
                            {difficulty === 'EXTREMO' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {difficulty === 'EXTREMO' && (
                              <>
                                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-[#E67E22]" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-[#E67E22]" />
                                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-[#E67E22]" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-[#E67E22]" />
                              </>
                            )}
                          </button>
  
                          <button
                            onClick={() => { sounds.playSelect(); onDifficultyChange('CAOTICO'); }}
                            className={`relative group py-1 sm:py-1.5 px-2 sm:px-2.5 text-left transition-all rounded-md border cursor-pointer flex flex-col justify-center min-h-0 overflow-hidden ${
                              difficulty === 'CAOTICO'
                                ? 'border-white bg-[#1A1A2E] font-black shadow-[0_0_15px_var(--theme-color-primary)]'
                                : 'border-[#1E1E30] bg-[#0C0C14] text-[#555] hover:bg-[#1A1A2E]/40'
                            }`}
                            id="difficulty_caotico_btn"
                          >
                            {difficulty === 'CAOTICO' && (
                              <div className="absolute top-0 left-0 right-0 h-1 z-10"
                                style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-primary), transparent)' }} />
                            )}
                            <p className={`text-xs sm:text-sm font-mono font-black tracking-wide leading-tight truncate z-[1] ${difficulty === 'CAOTICO' ? 'text-white' : 'text-[#888]'}`}>⚠️ {t('diff_caotico')}</p>
                            <span className={`text-[9.5px] sm:text-[11px] leading-tight block mt-0.5 font-bold truncate z-[1] ${difficulty === 'CAOTICO' ? 'text-[var(--theme-color-accent)]' : 'text-[#555]'}`}>55% t | ¡locura!</span>
                            {difficulty === 'CAOTICO' && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                            )}
                            {difficulty === 'CAOTICO' && (
                              <>
                                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-[var(--theme-color-primary)]" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-[var(--theme-color-primary)]" />
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-[11px] sm:text-xs text-[#555] font-black uppercase tracking-wide flex justify-between items-center bg-[#0C0C14] border border-[#2A2A3A] px-2.5 py-1 rounded shrink-0">
                          <span>🔥 {t('play_difficulty')}</span>
                          <span className={`font-mono font-black text-xs sm:text-sm tracking-wide ${
                            difficulty === 'NORMAL' ? 'text-[#4A90E2]' :
                            difficulty === 'DIFICIL' ? 'text-[#E6A15C]' :
                            difficulty === 'EXTREMO' ? 'text-[#E6A15C]' : 'text-red-400'
                          }`}>{t(`diff_${difficulty.toLowerCase()}` as any) || difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Explicit Start Cooking Button - prominent & always visible without scrolling */}
                    <button
                      onClick={() => {
                        if (selectedMode === 'ONLINE') {
                          sounds.playSelect();
                          if (onOpenOnlineLobby) {
                            onOpenOnlineLobby();
                          }
                        } else {
                          sounds.playWinFanfare();
                          onStartLevel(selectedLevelId, selectedMode);
                        }
                      }}
                      className="w-full py-2.5 sm:py-3 rounded-lg font-mono text-sm sm:text-base tracking-widest uppercase border-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 font-black shrink-0"
                      style={{
                        backgroundColor: 'var(--theme-color-primary)',
                        borderColor: 'var(--theme-color-primary)',
                        color: '#fff',
                        boxShadow: '0 0 20px var(--theme-color-primary), 0 0 40px var(--theme-color-primary)40',
                      }}
                      id="play_start_cooking_btn"
                    >
                      {selectedMode === 'ONLINE' ? (
                        <>
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{lang === 'es' ? 'ABRIR SALA ONLINE' : 'OPEN ONLINE LOBBY'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          <span>{t('play_start_cooking')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* CONTROLES SCREEN: Nested panels of keys mappings */}
          {activeTab === 'controls' && (
            <div className="flex flex-col justify-center min-h-full animate-fadeIn gap-2.5 my-auto">
              
              {/* Dynamic Gamepad Detector Status Alert */}
              <div className={`p-1.5 rounded-md border text-center transition-all ${
                detectedGamepad 
                  ? 'bg-[#1A1A2E] border-[#4A90E2] text-[#4A90E2] animate-pulse font-bold shadow-[0_0_12px_rgba(74,144,226,0.25)]' 
                  : 'bg-[#0C0C14] border-[#2A2A3A] text-[#555]'
              }`}>
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold">
                  <span>{detectedGamepad ? '🟢' : '⚪'}</span>
                  <span>
                    {detectedGamepad 
                      ? t('controls_gamepad_detected', { name: detectedGamepad }) 
                      : t('controls_no_gamepad')}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs for Input Styles */}
              <div className="grid grid-cols-5 gap-1 bg-[#0C0C14] p-1 rounded-md border border-[#2A2A3A]">
                <button
                  onClick={() => { sounds.playSelect(); setControllerStyle('keyboard'); }}
                  className={`py-1 rounded-md text-[9px] sm:text-xs font-mono font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    controllerStyle === 'keyboard'
                      ? 'bg-[#FFAE58] text-[#0C0C14] border border-[#FFAE58] shadow-[0_0_12px_rgba(255,174,88,0.3)]'
                      : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                  }`}
                >
                  <span>⌨️</span>
                  <span className="hidden xs:inline">{t('controls_keyboard')}</span>
                </button>
                <button
                  onClick={() => { sounds.playSelect(); setControllerStyle('xbox'); }}
                  className={`py-1 rounded-md text-[9px] sm:text-xs font-mono font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    controllerStyle === 'xbox'
                      ? 'bg-[#4A90E2] text-[#0C0C14] border border-[#4A90E2] shadow-[0_0_12px_rgba(74,144,226,0.3)]'
                      : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                  }`}
                >
                  <span>💚</span>
                  <span className="hidden xs:inline">{t('controls_xbox')}</span>
                </button>
                <button
                  onClick={() => { sounds.playSelect(); setControllerStyle('playstation'); }}
                  className={`py-1 rounded-md text-[9px] sm:text-xs font-mono font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    controllerStyle === 'playstation'
                      ? 'bg-[#4A90E2] text-[#0C0C14] border border-[#4A90E2] shadow-[0_0_12px_rgba(74,144,226,0.3)]'
                      : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                  }`}
                >
                  <span>💙</span>
                  <span className="hidden xs:inline">{t('controls_playstation')}</span>
                </button>
                <button
                  onClick={() => { sounds.playSelect(); setControllerStyle('generic'); }}
                  className={`py-1 rounded-md text-[9px] sm:text-xs font-mono font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    controllerStyle === 'generic'
                      ? 'bg-[#4A90E2] text-[#0C0C14] border border-[#4A90E2] shadow-[0_0_12px_rgba(74,144,226,0.3)]'
                      : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                  }`}
                >
                  <span>🎮</span>
                  <span className="hidden xs:inline">{t('controls_generic')}</span>
                </button>
                <button
                  onClick={() => { sounds.playSelect(); setControllerStyle('android'); }}
                  className={`py-1 rounded-md text-[9px] sm:text-xs font-mono font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    controllerStyle === 'android'
                      ? 'bg-[#FFAE58] text-[#0C0C14] border border-[#FFAE58] shadow-[0_0_12px_rgba(255,174,88,0.3)]'
                      : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                  }`}
                >
                  <span>📱</span>
                  <span className="hidden xs:inline">{t('controls_android') || 'Android 📱'}</span>
                </button>
              </div>

              {/* Controls display for Chef */}
              <div className="bg-[#1A1A2E] p-2.5 rounded-md border-2 border-[#2A2A3A] animate-fadeIn h-full flex flex-col justify-between shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),4px_4px_0px_#0C0C14] min-h-[160px] relative overflow-hidden">
                {/* Scanline overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--theme-color-primary)] z-[2]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--theme-color-primary)] z-[2]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--theme-color-primary)] z-[2]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--theme-color-primary)] z-[2]" />

                <div className="flex items-center justify-between border-b border-[#2A2A3A] pb-1.5 mb-1.5 relative z-[3]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🧑‍🍳🧡</span>
                    <div>
                      <h4 className="font-mono text-[11px] sm:text-xs text-[#E6A15C] uppercase tracking-wide leading-none font-bold">{t('controls_chef_title')}</h4>
                      <p className="text-[9.5px] sm:text-[10px] text-[#555] font-mono leading-none mt-0.5">
                        {controllerStyle === 'keyboard' && t('controls_kb_scheme')}
                        {controllerStyle === 'xbox' && t('controls_xbox_scheme')}
                        {controllerStyle === 'playstation' && t('controls_ps_scheme')}
                        {controllerStyle === 'generic' && t('controls_generic_scheme')}
                        {controllerStyle === 'android' && (t('controls_android_scheme') || 'Esquema de Controles Táctiles en Pantalla')}
                      </p>
                    </div>
                  </div>
                  {detectedGamepad && (
                    <span className="text-[9px] font-mono font-bold text-[#0C0C14] bg-[#4A90E2] px-1.5 py-0.5 rounded-md border border-[#2A2A3A] shadow-[0_0_8px_rgba(74,144,226,0.3)]">
                      {t('controls_active_adaptation')}
                    </span>
                  )}
                </div>

                <ul className="space-y-1 text-[11px] sm:text-xs font-semibold text-[#D2D7DF] relative z-[3]">
                  <li className="flex justify-between border-b border-dashed border-[#2A2A3A] pb-1 items-center">
                    <span>{t('controls_move_chef')}</span>
                    {controllerStyle === 'keyboard' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">W / A / S / D  (o Flechas)</strong>
                    ) : controllerStyle === 'xbox' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Stick Izquierdo / D-Pad</strong>
                    ) : controllerStyle === 'playstation' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Stick Izquierdo / Cruceta</strong>
                    ) : controllerStyle === 'generic' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Joystick Izquierdo / D-Pad</strong>
                    ) : (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">{lang === 'es' ? 'Joystick Táctil en Pantalla 🕹️' : 'On-Screen Touch Joystick 🕹️'}</strong>
                    )}
                  </li>
                  <li className="flex justify-between border-b border-dashed border-[#2A2A3A] pb-1 items-center">
                    <span>{t('controls_grab_drop')}</span>
                    {controllerStyle === 'keyboard' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Espacio (Spacebar)</strong>
                    ) : controllerStyle === 'xbox' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón A (Verde)</strong>
                    ) : controllerStyle === 'playstation' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón ✕ (Cruz)</strong>
                    ) : controllerStyle === 'generic' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón 1 (Sur)</strong>
                    ) : (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">{lang === 'es' ? 'Botón "AGARRAR" 🟢' : '"GRAB" Button 🟢'}</strong>
                    )}
                  </li>
                  <li className="flex justify-between border-b border-dashed border-[#2A2A3A] pb-1 items-center">
                    <span>{t('controls_action')}</span>
                    {controllerStyle === 'keyboard' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">E (Mantener pulsado)</strong>
                    ) : controllerStyle === 'xbox' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón X (Azul)</strong>
                    ) : controllerStyle === 'playstation' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón ⬜ (Cuadrado)</strong>
                    ) : controllerStyle === 'generic' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón 3 (Oeste)</strong>
                    ) : (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">{lang === 'es' ? 'Botón "ACCIÓN" 🔴' : '"ACTION" Button 🔴'}</strong>
                    )}
                  </li>
                  <li className="flex justify-between border-b border-dashed border-[#2A2A3A] pb-1 items-center">
                    <span>{t('controls_dash_label')}</span>
                    {controllerStyle === 'keyboard' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Q (Rápido) o Shift</strong>
                    ) : controllerStyle === 'xbox' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón B (Rojo) / RB</strong>
                    ) : controllerStyle === 'playstation' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón ◯ (Círculo) / R1</strong>
                    ) : controllerStyle === 'generic' ? (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">Botón 2 / Gatillo R</strong>
                    ) : (
                      <strong className="bg-[#0C0C14] border border-[#2A2A3A] text-[#E6A15C] px-1.5 py-0.5 rounded-md font-mono text-[10px] shadow-[2px_2px_0px_#0C0C14]">{lang === 'es' ? 'Botón "DASH" ⚡' : '"DASH" Button ⚡'}</strong>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* RECIPES BOOK SCREEN: 100% nested circular switcher tabs, no scroll list */}
          {activeTab === 'recipes' && (
            <div className="flex flex-col min-h-full animate-fadeIn justify-center gap-3 my-auto">
              
              {/* Horizontal grid list as tab switcher */}
              <div className="w-full flex flex-col items-center">
                <span className="text-xs sm:text-sm font-mono font-black text-[#FFAE58] uppercase tracking-wider block mb-1.5 text-center">
                  {t('recipes_select_dish')}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {Object.entries(RECIPES).map(([id, rec]) => {
                    const isSelected = selectedRecipeId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => { sounds.playSelect(); setSelectedRecipeId(id); }}
                        className={`relative p-1.5 rounded-md border flex flex-col justify-center items-center text-center cursor-pointer transition-all overflow-hidden ${
                          isSelected
                            ? 'border-[#4A90E2] bg-[#1A1A2E] text-white font-black shadow-[0_0_12px_rgba(74,144,226,0.25)]'
                            : 'border-[#2A2A3A] bg-[#0C0C14] text-[#555] hover:border-[#4A90E2] hover:bg-[#1A1A2E]/30'
                        }`}
                        id={`recipe_bar_tab_${id}`}
                      >
                        {/* Scanline overlay on selected */}
                        {isSelected && (
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                        )}
                        {/* Corner accents on selected */}
                        {isSelected && (
                          <>
                            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#4A90E2] z-[2]" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#4A90E2] z-[2]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#4A90E2] z-[2]" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#4A90E2] z-[2]" />
                          </>
                        )}
                        <span className="text-lg relative z-[1]">{rec.icon}</span>
                        <span className="text-[10px] sm:text-xs truncate max-w-[85px] font-mono font-black uppercase mt-1 leading-none tracking-wide relative z-[1]">
                          {t(`recipe_${id}` as any).split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Showcased Details card with inner subtabs to fully fit all screen sizes with zero-scroll */}
              {(() => {
                const specRec = RECIPES[selectedRecipeId];
                if (!specRec) return <div className="text-center text-xs text-slate-400">{t('recipes_select_fallback')}</div>;
                
                // Ingredients display translator
                const getIngredientData = (item: string) => {
                  const emojis: Record<string, string> = {
                    'pan_hamburguesa': '🍔',
                    'carne_cocinada': '🥩',
                    'queso_picado': '🧀',
                    'tomate_picado': '🍅',
                    'lechuga_picada': '🥬',
                    'pasta_cocida': '🍝',
                    'salsa_tomate': '🥫',
                    'masa_pizzería': '🥞',
                    'masa_estirada': '🥞',
                    'pizza_horneada': '🍕',
                    'plato_limpio': '🍽️',
                    'plato_sucio': '🍽️'
                  };
                  const translationKeys: Record<string, string> = {
                    'pan_hamburguesa': 'ing_pan_hamburguesa',
                    'carne_cocinada': 'ing_carne_cocinada',
                    'queso_picado': 'ing_queso_picado',
                    'tomate_picado': 'ing_tomate_picado',
                    'lechuga_picada': 'ing_lechuga_picada',
                    'pasta_cocida': 'ing_pasta_cocida',
                    'salsa_tomate': 'ing_salsa_tomate',
                    'masa_pizzería': 'ing_masa_estirada',
                    'masa_estirada': 'ing_masa_estirada',
                    'pizza_horneada': 'ing_pizza_horneada',
                    'plato_limpio': 'ing_plato_limpio',
                    'plato_sucio': 'ing_plato_sucio'
                  };
                  const key = translationKeys[item];
                  const label = key ? t(key) : item.replace(/_/g, ' ');
                  return { emoji: emojis[item] || '🥘', label };
                };
  
  return (
                  <div className="flex-1 bg-[#1A1A2E] border-2 border-[#2A2A3A] p-3 rounded-md flex flex-col justify-between shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),4px_4px_0px_#0C0C14] min-h-[125px] relative overflow-hidden">
                    
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
                      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--theme-color-primary)] z-[2]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--theme-color-primary)] z-[2]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--theme-color-primary)] z-[2]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--theme-color-primary)] z-[2]" />

                    {/* Header bar of details block with nested subtabs */}
                    <div className="flex items-center justify-between border-b border-[#2A2A3A] pb-1.5 mb-1.5 relative z-[3]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl">{specRec.icon}</span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-mono font-black text-[#FFAE58] leading-none">{t(`recipe_${selectedRecipeId}` as any) || specRec.name}</h3>
                          <span className="text-[8px] sm:text-[9.5px] text-[#555] font-mono font-black uppercase mt-0.5 block">{t('tab_recipes')}</span>
                        </div>
                      </div>
 
                      {/* Sub-tabs selector for layout density */}
                      <div className="flex bg-[#0C0C14] p-1 rounded-md border border-[#2A2A3A]">
                        <button
                          onClick={() => { sounds.playSelect(); setSelectedRecipeSubtab('ingredients'); }}
                          className={`px-2.5 py-1 text-[10px] sm:text-xs font-mono font-black tracking-wide rounded-md transition-all cursor-pointer flex items-center gap-1 border ${
                            selectedRecipeSubtab === 'ingredients'
                              ? 'bg-[#1A1A2E] text-white border-[#4A90E2] shadow-[0_0_8px_rgba(74,144,226,0.25)]'
                              : 'border-transparent text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                          }`}
                        >
                          <span>{t('recipes_ingredients_tab')}</span>
                        </button>
                        <button
                          onClick={() => { sounds.playSelect(); setSelectedRecipeSubtab('steps'); }}
                          className={`px-2.5 py-1 text-[10px] sm:text-xs font-mono font-black tracking-wide rounded-md transition-all cursor-pointer flex items-center gap-1 border ${
                            selectedRecipeSubtab === 'steps'
                              ? 'bg-[#1A1A2E] text-white border-[#4A90E2] shadow-[0_0_8px_rgba(74,144,226,0.25)]'
                              : 'border-transparent text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                          }`}
                        >
                          <span>{t('recipes_prep_tab')}</span>
                        </button>
                      </div>
 
                      <div className="bg-[#0C0C14] text-[#FFAE58] font-mono text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md border border-[#2A2A3A] shadow-[2px_2px_0px_#0C0C14]">
                        +{specRec.reward} {t('recipes_reward')}
                      </div>
                    </div>
 
                    {/* Sub-tab viewport */}
                    <div className="flex-1 flex flex-col justify-center min-h-[70px] relative z-[3]">
                      
                      {selectedRecipeSubtab === 'ingredients' && (
                        <div className="space-y-1.5 animate-fadeIn py-1">
                          <span className="text-xs sm:text-sm font-mono font-black tracking-wider text-[#FFAE58] uppercase block">
                            {t('recipes_ingredients')} ({specRec.requiredItems.length})
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                            {specRec.requiredItems.map((ing, idx) => {
                              const { emoji, label } = getIngredientData(ing);

  return (
                                <div 
                                  key={idx} 
                                  className="relative flex items-center gap-3 bg-[#0C0C14] px-3.5 py-2.5 rounded-xl border-2 border-[#2A2A3A] hover:border-[#4A90E2] transition-all shadow-[2px_2px_0px_#0C0C14] group overflow-hidden"
                                >
                                  {/* Scanline on hover */}
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity"
                                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                                  {/* 200% larger ingredient icon */}
                                  <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none shrink-0 transform group-hover:scale-110 transition-transform relative z-[1]">
                                    {emoji}
                                  </span>
                                  <div className="min-w-0 flex-1 relative z-[1]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[#4A90E2] text-xs font-black">✔️</span>
                                      <span className="text-xs sm:text-sm font-black text-white font-mono truncate block leading-tight">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#555] font-bold block uppercase mt-0.5 tracking-wider">
                                      {lang === 'es' ? 'Ingrediente' : 'Ingredient'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
 
                      {selectedRecipeSubtab === 'steps' && (
                        <div className="bg-[#0C0C14] border border-dashed border-[#2A2A3A] rounded-md p-2.5 animate-fadeIn relative overflow-hidden">
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                          <span className="text-xs sm:text-sm font-mono font-black text-[#FFAE58] uppercase block mb-1 leading-none relative z-[1]">
                            {t('recipes_procedure')}
                          </span>
                          <p className="text-xs sm:text-sm leading-relaxed text-[#D2D7DF] font-semibold relative z-[1]">
                            {t(`step_${selectedRecipeId}` as any) || t('recipes_procedure_step', { reward: specRec.reward })}
                          </p>
                        </div>
                      )}
 
                    </div>
 
                  </div>
                );
              })()}
 
            </div>
          )}

          {/* ACHIEVEMENTS SCREEN: 100% nested container with dynamic filter tabs & custom scrollable list */}
          {activeTab === 'achievements' && (
            <div className="flex flex-col min-h-full animate-fadeIn justify-center gap-2.5 my-auto">
              
              {/* Header section with Stats progress bar */}
              <div className="bg-[#1A1A2E] p-2.5 rounded-md border-2 border-[#2A2A3A] flex flex-col gap-1.5 shrink-0 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),2px_2px_0px_#0C0C14] relative overflow-hidden">
                {/* Scanline overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                <div className="w-full relative z-[1]">
                  <div className="flex justify-between items-center text-xs font-mono text-[#D2D7DF] mb-1 leading-none tracking-wide">
                    <span className="flex items-center gap-1 font-bold text-[#E6A15C]">🏆 {t('ach_progress_title')}</span>
                    <span className="text-[#FFAE58] font-mono text-xs bg-[#0C0C14] border border-[#2A2A3A] px-2 py-0.5 rounded-md font-extrabold shadow-[2px_2px_0px_#0C0C14]">
                      {unlockedIds.length} / {ACHIEVEMENTS.length} ({Math.round((unlockedIds.length / ACHIEVEMENTS.length) * 100)}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-[#0C0C14] rounded-full border border-[#2A2A3A] overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E67E22] to-[#FFAE58] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(2, (unlockedIds.length / ACHIEVEMENTS.length) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Filtering bar */}
              <div className="flex justify-between items-center bg-[#0C0C14] border border-[#2A2A3A] p-1 rounded-md shrink-0 overflow-x-auto">
                <span className="text-[10px] sm:text-xs font-mono text-[#555] pl-1 uppercase shrink-0 font-black">{t('achievements_filter')}</span>
                <div className="flex gap-1 text-[10px] sm:text-xs">
                  <button
                    onClick={() => { sounds.playSelect(); setAchievementsFilter('all'); }}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 font-mono font-black ${
                      achievementsFilter === 'all'
                        ? 'bg-[#4A90E2] text-[#0C0C14] border border-[#4A90E2] shadow-[0_0_8px_rgba(74,144,226,0.25)] tracking-wide'
                        : 'text-[#555] hover:text-[#D2D7DF] hover:bg-[#1A1A2E]/30'
                    }`}
                  >
                    {t('achievements_all')} ({ACHIEVEMENTS.length})
                  </button>
                  <button
                    onClick={() => { sounds.playSelect(); setAchievementsFilter('unlocked'); }}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-0.5 shrink-0 font-mono font-black ${
                      achievementsFilter === 'unlocked'
                        ? 'bg-[#FFAE58] text-[#0C0C14] border border-[#FFAE58] shadow-[0_0_8px_rgba(255,174,88,0.25)] tracking-wide'
                        : 'text-[#555] hover:text-[#E6A15C] hover:bg-[#1A1A2E]/30'
                    }`}
                  >
                    <span>{t('ach_unlocked_btn', { count: unlockedIds.length })}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable list of achievements */}
              <div className="flex-1 overflow-y-auto pr-1 max-h-[300px] scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pb-1">
                  {ACHIEVEMENTS.filter(a => {
                    if (achievementsFilter === 'unlocked') return unlockedIds.includes(a.id);
                    return true;
                  }).map(a => {
                    const isUnlocked = unlockedIds.includes(a.id);
                    const loc = getLocalizedAchievement(a, lang);
                    const localizedCategory = a.category === 'Gameplay' ? (lang === 'es' ? 'Jugabilidad' : 'Gameplay') : 'Meta xD';
                    const lockedLabel = lang === 'es' ? `Bloqueado. Pista: ${loc.howToUnlock}` : `Locked. Hint: ${loc.howToUnlock}`;
                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          sounds.playSelect();
                        }}
                        className={`relative p-1.5 rounded-md border transition-all cursor-pointer select-none flex gap-1.5 items-start text-left overflow-hidden ${
                          isUnlocked
                            ? 'bg-[#0C0C14] border-[#2A2A3A] shadow-[2px_2px_0px_#0C0C14] hover:border-[#4A90E2] hover:shadow-[0_0_12px_rgba(74,144,226,0.2)]'
                            : 'bg-[#0C0C14]/40 border-[#2A2A3A] opacity-40'
                        }`}
                      >
                        {/* Scanline on unlocked cards */}
                        {isUnlocked && (
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                        )}
                        {/* Corner accents on unlocked cards */}
                        {isUnlocked && (
                          <>
                            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#E67E22] z-[2]" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#E67E22] z-[2]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#E67E22] z-[2]" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#E67E22] z-[2]" />
                          </>
                        )}
                        <span className={`text-xl shrink-0 flex items-center justify-center w-7 h-7 rounded-md relative z-[1] ${
                          isUnlocked ? 'bg-[#1A1A2E] border border-[#4A90E2]' : 'bg-[#0C0C14] border border-[#2A2A3A]'
                        }`}>
                           {isUnlocked ? a.icon : "🔒"}
                        </span>
                        <div className="flex-1 min-w-0 relative z-[1]">
                          <div className="flex items-center justify-between gap-1 leading-none">
                            <h4 className={`text-sm font-mono font-black truncate ${
                              isUnlocked ? 'text-[#E6A15C] font-extrabold' : 'text-[#555] font-bold'
                            }`}>
                              #{a.id} {loc.name}
                            </h4>
                            <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-mono font-black uppercase shrink-0 ${
                              isUnlocked 
                                ? 'bg-[#1A1A2E] text-[#E6A15C] border border-[#2A2A3A]'
                                : 'bg-[#0C0C14] text-[#555] border border-[#2A2A3A]'
                            }`}>
                              {localizedCategory}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm font-mono mt-1.5 leading-tight ${
                            isUnlocked ? 'text-[#D2D7DF]' : 'text-[#555] italic font-medium'
                          }`}>
                            {isUnlocked ? loc.description : lockedLabel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Info: Zero-scroll flat bottom container spacer */}
        <footer className="border-t border-[#2E3A46] pt-2 flex justify-between items-center text-xs text-[#788896] font-mono font-bold shrink-0">
          <span>Crazy Kitchen &copy; 2026</span>
          <span className="text-[#D2D7DF] bg-[#0A1118] border border-[#2E3A46] rounded-md px-2 py-0.5 text-[11px] uppercase tracking-widest leading-none font-mono font-black">
            V 1.2 Fixed Tabs
          </span>
        </footer>

        {/* Settings Modal (100% visible on screen without scrollbar) */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn overflow-hidden">
            <div className="bg-[#0C0C14] border-2 border-[#2A2A3A] rounded-lg p-0 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120pxrgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),14px_14px_0px_#0A1118] max-w-xl w-full text-center flex flex-col animate-scaleIn overflow-hidden max-h-[96vh] relative grind-grid-bg">
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[var(--theme-color-primary)] z-10" />
              <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-[var(--theme-color-primary)] z-10" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-[var(--theme-color-primary)] z-10" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[var(--theme-color-primary)] z-10" />

              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-5 z-[1]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />

              {/* Header */}
              <div className="border-b border-[#2A2A3A] px-4 sm:px-5 pt-3 sm:pt-4 pb-2 flex justify-between items-center relative z-[2]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[var(--theme-color-primary)] rounded-full" />
                  <h2 className="text-base sm:text-lg font-mono font-black text-white tracking-wider uppercase flex items-center gap-2">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--theme-color-primary)]" />
                    <span>{t('settings_title')}</span>
                  </h2>
                </div>
                <button 
                  onClick={() => { sounds.playSelect(); setShowSettings(false); }}
                  className="text-[#555] hover:text-white text-lg font-black font-mono cursor-pointer px-2 py-1 rounded hover:bg-[#2A2A3A]/40 transition-colors"
                  id="settings_close_x_btn"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="px-3 sm:px-5 py-3 flex flex-col gap-2.5 sm:gap-3 relative z-[2]">

              {/* Sound & Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {/* Volume Control & Mute */}
                <div className="flex flex-col gap-2 bg-[#141D26] p-2.5 sm:p-3 rounded-lg border border-[#2A2A3A] relative">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-black text-[#D2D7DF] font-mono">
                    <span className="flex items-center gap-2">
                      {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      <span>{t('settings_volume')}</span>
                    </span>
                    <span className="text-[var(--theme-color-accent)] font-bold text-xs sm:text-sm font-mono">{muted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={muted ? 0 : Math.round(volume * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) / 100;
                        setVolumeState(val);
                        sounds.setVolume(val);
                        if (muted && val > 0) {
                          setMuted(false);
                          sounds.toggleMute();
                        }
                      }}
                      className="flex-1 accent-[var(--theme-color-primary)] bg-[#2A2A3A] h-2 rounded-full cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        const m = sounds.toggleMute();
                        setMuted(m);
                        sounds.playSelect();
                      }}
                      className={`px-2.5 py-1 rounded border text-xs font-mono font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                        muted 
                          ? 'border-red-500 bg-red-950/50 text-red-400 hover:bg-red-900/60' 
                          : 'border-emerald-500 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60'
                      }`}
                      id="settings_modal_mute_btn"
                    >
                      {muted ? (lang === 'es' ? 'Silencio' : 'Muted') : (lang === 'es' ? 'Activo' : 'Active')}
                    </button>
                  </div>
                </div>

                {/* Touch Controls Toggle */}
                <div className="flex items-center justify-between bg-[#141D26] p-2.5 sm:p-3 rounded-lg border border-[#2A2A3A] relative">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-black text-[#D2D7DF] flex items-center gap-1.5 font-mono">
                      <span className="text-sm">🎮</span>
                      <span>{lang === 'es' ? 'Controles Táctiles' : 'Touch Controls'}</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#555] font-mono mt-0.5">
                      {touchEnabled ? (lang === 'es' ? 'Joystick y botones activos' : 'Joystick & buttons on') : (lang === 'es' ? 'Solo teclado o mando' : 'Keyboard/gamepad only')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTouchEnabled(prev => {
                        const next = !prev;
                        try {
                          localStorage.setItem('touch_controls_enabled', String(next));
                        } catch {}
                        return next;
                      });
                      sounds.playSelect();
                    }}
                    className={`px-3 py-1.5 rounded border text-xs font-mono font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                      touchEnabled 
                        ? 'border-[var(--theme-color-accent)] bg-[var(--theme-color-primary)]/20 text-[var(--theme-color-accent)] hover:bg-[var(--theme-color-primary)]/30 shadow-[0_0_10px_var(--theme-color-primary)_30]' 
                        : 'border-[#2A2A3A] bg-[#0C0C14] text-[#555] hover:text-[#D2D7DF]'
                    }`}
                    id="settings_modal_touch_toggle_btn"
                  >
                    {touchEnabled ? (lang === 'es' ? 'ACTIVADO' : 'ENABLED') : (lang === 'es' ? 'DESACTIVADO' : 'DISABLED')}
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex flex-col gap-2 text-left bg-[#141D26] p-2.5 sm:p-3 rounded-lg border border-[#2A2A3A] relative">
                <div className="flex justify-between items-center border-b border-[#2A2A3A] pb-1.5">
                  <span className="text-xs sm:text-sm font-black text-[#D2D7DF] flex items-center gap-1.5 font-mono">
                    🌐 <span>{t('settings_language')}</span>
                  </span>
                  <span className="text-xs sm:text-sm text-[var(--theme-color-accent)] font-mono font-bold">
                    {languages.find((l) => l.id === lang)?.name} ({languages.find((l) => l.id === lang)?.flag})
                  </span>
                </div>
                
                {/* 5 columns x 2 rows: 10 buttons fully shown on screen */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLanguage(l.id);
                        sounds.playSelect();
                      }}
                      className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs sm:text-sm font-black font-mono tracking-wide transition-all cursor-pointer justify-center sm:justify-start overflow-hidden ${
                        lang === l.id
                          ? 'border-[var(--theme-color-accent)] bg-[var(--theme-color-primary)] text-white shadow-[0_0_12px_var(--theme-color-primary)_30]'
                          : 'border-[#2A2A3A] bg-[#0C0C14] text-[#555] hover:text-[#D2D7DF] hover:bg-[#2A2A3A]/30'
                      }`}
                    >
                      {lang === l.id && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
                          style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color-accent), transparent)' }} />
                      )}
                      <span className="text-base shrink-0">{l.flag}</span>
                      <span className="truncate">{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save & Close Button */}
              <button
                onClick={() => { sounds.playSelect(); setShowSettings(false); }}
                className="relative group py-2.5 px-6 bg-[var(--theme-color-primary)] text-white font-mono font-black rounded text-sm sm:text-base tracking-[0.2em] uppercase border-2 border-white cursor-pointer transition-all duration-300 hover:bg-white hover:text-[var(--theme-color-primary)] active:scale-95 shadow-[0_0_20px_var(--theme-color-primary)_40] overflow-hidden"
                style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
                id="settings_close_btn"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>{t('settings_close')}</span>
                </span>
                <div className="absolute inset-0 bg-[var(--theme-color-primary)] opacity-20 animate-pulse pointer-events-none"
                  style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }} />
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Character Selection Modal (Moved inside console box so it is contained within 1920x1080 bounds) */}
        {showCharacterSelect && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
            <div className="bg-[#0C0C14] border-2 border-[#2A2A3A] rounded-lg w-[98%] max-w-5xl flex flex-col gap-3 animate-scaleIn overflow-hidden max-h-[96vh]"
              style={{ boxShadow: '0 0 60px rgba(220,38,38,0.15), 0 0 120px rgba(0,0,0,0.8)' }}>
              
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-4 pb-2 border-b border-[#2A2A3A]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[var(--theme-color-primary)] rounded-full" />
                  <span className="text-[10px] sm:text-xs font-black text-[#555] font-mono tracking-widest uppercase">
                    {lang === 'es' ? 'COMBATE' : 'COMBAT'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-white tracking-wider uppercase">
                  {lang === 'es' ? 'ELIGE TU CHEF' : 'CHOOSE YOUR CHEF'}
                </h2>
                <button 
                  onClick={() => { sounds.playSelect(); setShowCharacterSelect(false); }}
                  className="text-[#555] hover:text-white text-lg font-black font-mono cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Character Cards */}
              <div className="px-3 sm:px-5 pb-3">
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {CHARACTERS.map((ch, idx) => {
                    const isSelected = chef1CharId === ch.id;
                    return (
                      <button
                        key={`chef1_${ch.id}`}
                        onClick={() => {
                          sounds.playSelect();
                          setChef1CharId(ch.id);
                        }}
                        className={`relative group rounded-lg overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                          isSelected ? 'scale-[1.02]' : 'grayscale opacity-50 hover:grayscale-[50%] hover:opacity-75'
                        }`}
                        style={{
                          background: isSelected
                            ? `linear-gradient(180deg, ${ch.color}22 0%, #0C0C14 60%)`
                            : 'linear-gradient(180deg, #1A1A2E 0%, #0C0C14 100%)',
                          border: isSelected ? `2px solid ${ch.color}` : '2px solid #1E1E30',
                          boxShadow: isSelected ? `0 0 20px ${ch.color}40, inset 0 -40px 30px -20px ${ch.color}15` : 'none',
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 right-0 h-1 z-10"
                            style={{ background: `linear-gradient(90deg, transparent, ${ch.color}, transparent)` }} />
                        )}
                        <div className="relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden"
                          style={{ background: isSelected ? `linear-gradient(180deg, ${ch.color}10 0%, transparent 50%)` : 'transparent' }}>
                          <img 
                            src={isSelected ? CHAR_CH2[ch.id] : CHAR_CH1[ch.id]} 
                            alt={ch.nameEs} 
                            className={`w-[127%] h-[127%] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg ${isSelected ? 'translate-y-[0%]' : 'translate-y-[20%]'}`}
                          />
                          <div className="absolute inset-0 opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
                        </div>
                        <div className="relative px-2 py-2 sm:py-3 text-center border-t"
                          style={{ 
                            borderColor: isSelected ? `${ch.color}60` : '#1E1E30',
                            background: isSelected ? `linear-gradient(180deg, ${ch.color}15, transparent)` : 'transparent',
                          }}>
                          <div className="font-mono font-black text-xs sm:text-sm md:text-base tracking-wider uppercase leading-none"
                            style={{ color: isSelected ? ch.color : '#666' }}>
                            {lang === 'es' ? ch.nameEs : ch.nameEn}
                          </div>
                          <div className="text-[8px] sm:text-[10px] font-mono tracking-widest uppercase mt-1"
                            style={{ color: isSelected ? '#888' : '#444' }}>
                            {lang === 'es' ? ch.descriptionEs.split(' ').slice(0, 3).join(' ') : ch.descriptionEn.split(' ').slice(0, 3).join(' ')}
                          </div>
                        </div>
                        {isSelected && (
                          <>
                            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: ch.color }} />
                            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: ch.color }} />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: ch.color }} />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: ch.color }} />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#2A2A3A] bg-[#08080E]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: CHARACTERS.find(c => c.id === chef1CharId)?.color || '#fff' }} />
                  <span className="text-[10px] sm:text-xs font-mono font-black text-[#666] uppercase tracking-wider">
                    {lang === 'es' ? 'SELECCIONADO' : 'SELECTED'}
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider"
                    style={{ color: CHARACTERS.find(c => c.id === chef1CharId)?.color || '#fff' }}>
                    {CHARACTERS.find(c => c.id === chef1CharId)?.nameEs || ''}
                  </span>
                </div>
                <button
                  onClick={() => { sounds.playWinFanfare(); setShowCharacterSelect(false); }}
                  className="py-2 px-5 sm:px-8 font-mono font-black rounded text-xs sm:text-sm tracking-widest uppercase transition-all cursor-pointer border-2 active:translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--theme-color-primary)',
                    borderColor: 'var(--theme-color-primary)',
                    color: '#fff',
                    boxShadow: '0 0 15px var(--theme-color-primary)',
                  }}
                >
                  {lang === 'es' ? '¡LISTO!' : 'READY!'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Gamepad Click Ripples */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-[9998] w-8 h-8 border border-[#4A90E2]/80 rounded-full animate-ping"
          style={{
            left: r.x - 16,
            top: r.y - 16,
          }}
        />
      ))}

      {/* Gamepad Virtual Mouse Cursor Joystick Pointer */}
      {cursorVisible && (
        <div
          className="fixed pointer-events-none z-[9999] transition-all duration-75 select-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Animated cute chef-themed virtual cursor */}
          <div className="relative flex flex-col items-center">
            {/* Pulsing ring underneath */}
            <div className="absolute w-10 h-10 -top-1 border border-[#4A90E2]/60 rounded-full animate-pulse pointer-events-none" />
            
            {/* Chef Hat Bubble pointer */}
            <div className="bg-[#2E3A46] text-white p-2 rounded-md border border-white shadow-[4px_4px_0px_#0A1118] flex items-center justify-center scale-105 active:scale-95 transition-transform">
              <ChefHat className="w-5 h-5 fill-white text-white" />
            </div>
            
            {/* Downward pointer tail */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white -mt-0.5" />

            {/* Glowing active indicator dot */}
            <div className="w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full absolute -top-1 -right-1 shadow animate-pulse" />

            {/* Quick Helper Tag */}
            <div className="bg-[#0A1118]/95 border border-[#2E3A46] text-[9.5px] font-mono font-black text-[#4A90E2] px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap mt-1.5 uppercase tracking-wide">
              🕹️ MANDO
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

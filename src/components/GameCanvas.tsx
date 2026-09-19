import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Home, Star, Trophy, Volume2, VolumeX, Pause, HelpCircle } from 'lucide-react';
import { Chef, GameMode, KitchenStation, Level, ActiveOrder, ItemType, HeldItem, Position, Recipe, Difficulty, CHARACTERS } from '../types';
import { LEVELS, RECIPES, getStationTypeFromChar, getItemDetails } from '../levels';
import { sounds } from '../sounds';
import HUD from './HUD';
import { useTranslation } from '../translations';
import { multiplayerClient } from '../services/multiplayerClient';
import abuelaG1 from '../../assets/abuela/g1.png?url';
import abuelaG2 from '../../assets/abuela/g2.png?url';
import abuelaG3 from '../../assets/abuela/g3.png?url';
import abuelaG4 from '../../assets/abuela/g4.png?url';
import abuelaG4Take from '../../assets/abuela/g4_take.png?url';
import abuelaG5Take from '../../assets/abuela/g5_take.png?url';

import kenjiK1 from '../../assets/kenji/k1.png?url';
import kenjiK2 from '../../assets/kenji/k2.png?url';
import kenjiK3 from '../../assets/kenji/k3.png?url';
import kenjiK4 from '../../assets/kenji/k4.png?url';
import kenjiK5 from '../../assets/kenji/k5.png?url';

import novaN1 from '../../assets/nova/n1.png?url';
import novaN2 from '../../assets/nova/n2.png?url';
import novaN3 from '../../assets/nova/n3.png?url';
import novaN4 from '../../assets/nova/n4.png?url';
import novaN5 from '../../assets/nova/n5.png?url';

import brunoB1 from '../../assets/bruno/b1.png?url';
import brunoB2 from '../../assets/bruno/b2.png?url';
import brunoB3 from '../../assets/bruno/b3.png?url';
import brunoB4 from '../../assets/bruno/b4.png?url';
import brunoB5 from '../../assets/bruno/b5.png?url';

import abuelaC1 from '../../assets/abuela/c1.png?url';
import abuelaC2 from '../../assets/abuela/c2.png?url';
import kenjiKC1 from '../../assets/kenji/kc1.png?url';
import kenjiKC2 from '../../assets/kenji/kc2.png?url';
import novaNC1 from '../../assets/nova/nc1.png?url';
import novaNC2 from '../../assets/nova/nc2.png?url';
import brunoBC1 from '../../assets/bruno/bc1.png?url';
import brunoBC2 from '../../assets/bruno/bc2.png?url';

import abuelaSG1 from '../../assets/abuela/sg1.png?url';
import abuelaSG2 from '../../assets/abuela/sg2.png?url';
import kenjiSK1 from '../../assets/kenji/sk1.png?url';
import kenjiSK2 from '../../assets/kenji/sk2.png?url';
import novaNS1 from '../../assets/nova/ns1.png?url';
import novaNS2 from '../../assets/nova/ns2.png?url';
import brunoBS1 from '../../assets/bruno/bs1.png?url';
import brunoBS2 from '../../assets/bruno/bs2.png?url';

import abuelaGW1 from '../../assets/abuela/gw1.png?url';
import abuelaGW2 from '../../assets/abuela/gw2.png?url';
import kenjiKW1 from '../../assets/kenji/kw1.png?url';
import kenjiKW2 from '../../assets/kenji/kw2.png?url';
import novaNW1 from '../../assets/nova/nw1.png?url';
import novaNW2 from '../../assets/nova/nw2.png?url';
import brunoBW1 from '../../assets/bruno/bw1.png?url';
import brunoBW2 from '../../assets/bruno/bw2.png?url';

import abuelaGK1 from '../../assets/abuela/gk1.png?url';
import abuelaGK2 from '../../assets/abuela/gk2.png?url';
import abuelaGK3 from '../../assets/abuela/gk3.png?url';
import kenjiKK1 from '../../assets/kenji/kk1.png?url';
import kenjiKK2 from '../../assets/kenji/kk2.png?url';
import kenjiKK3 from '../../assets/kenji/kk3.png?url';
import novaNK1 from '../../assets/nova/nk1.png?url';
import novaNK2 from '../../assets/nova/nk2.png?url';
import novaNK3 from '../../assets/nova/nk3.png?url';
import brunoBK1 from '../../assets/bruno/bk1.png?url';
import brunoBK2 from '../../assets/bruno/bk2.png?url';
import brunoBK3 from '../../assets/bruno/bk3.png?url';
import abuelaCh1 from '../../assets/abuela/ch1.png?url';
import kenjiCh1 from '../../assets/kenji/ch1.png?url';
import novaCh1 from '../../assets/nova/ch1.png?url';
import brunoCh1 from '../../assets/bruno/ch1.png?url';
import abuelaScene1 from '../../assets/abuela/scene1.png?url';
import abuelaScene2 from '../../assets/abuela/scene2.png?url';
import abuelaScene3 from '../../assets/abuela/scene3.png?url';
import brunoScene1 from '../../assets/bruno/scene1.png?url';
import brunoScene2 from '../../assets/bruno/scene2.png?url';
import brunoScene3 from '../../assets/bruno/scene3.png?url';
import kenjiScene1 from '../../assets/kenji/scene1.png?url';
import kenjiScene2 from '../../assets/kenji/scene2.png?url';
import kenjiScene3 from '../../assets/kenji/scene3.png?url';
import novaScene1 from '../../assets/nova/scene1.png?url';
import novaScene2 from '../../assets/nova/scene2.png?url';
import novaScene3 from '../../assets/nova/scene3.png?url';

interface GameCanvasProps {
  level: Level;
  gameMode: GameMode;
  difficulty: Difficulty;
  onExit: () => void;
  onLevelComplete: (score: number, stars: number) => void;
  onUnlockAchievement?: (id: number) => void;
  chef1CharId?: string;
  chef2CharId?: string;
  lobbyId?: string | null;
  playerId?: string | null;
}


interface GameParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  emoji?: string;
  type: 'smoke' | 'bubble' | 'spark' | 'fire' | 'confetti' | 'dash';
}

// Map to track pending cleanups for Strict Mode double-mount resilience
const pendingCleanups = new Map<string, NodeJS.Timeout>();

// Fixed dimensions
const TILE_SIZE = 90;
const INTERACT_DIST = TILE_SIZE * 0.58;

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  return ua.includes('android');
};

export const isTouchOrMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  const isAndroid = ua.includes('android');
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  return isAndroid || isMobile || hasTouch || isCoarse;
};

export default function GameCanvas({
  level,
  gameMode,
  difficulty,
  onExit,
  onLevelComplete,
  onUnlockAchievement,
  chef1CharId = 'abuela',
  chef2CharId = 'kenji',
  lobbyId = null,
  playerId = null
}: GameCanvasProps) {
  const { t, lang } = useTranslation();
  const getLevelTimeLimit = () => {
    switch (difficulty) {
      case 'DIFICIL': return Math.round(level.timeLimit * 0.85);
      case 'EXTREMO': return Math.round(level.timeLimit * 0.70);
      case 'CAOTICO': return Math.round(level.timeLimit * 0.55);
      default: return level.timeLimit;
    }
  };
  const effectiveTimeLimit = getLevelTimeLimit();

  const getDiffModifiers = () => {
    switch (difficulty) {
      case 'DIFICIL':
        return {
          scoreMult: 1.15,
          chopWashSpeed: 0.90,
          burnSpeed: 1.20,
          orderLifetime: 0.85,
          orderSpawnTime: 12,
        };
      case 'EXTREMO':
        return {
          scoreMult: 1.30,
          chopWashSpeed: 0.75,
          burnSpeed: 1.40,
          orderLifetime: 0.70,
          orderSpawnTime: 9,
        };
      case 'CAOTICO':
        return {
          scoreMult: 1.50,
          chopWashSpeed: 0.60,
          burnSpeed: 1.70,
          orderLifetime: 0.55,
          orderSpawnTime: 6,
        };
      default:
        return {
          scoreMult: 1.0,
          chopWashSpeed: 1.0,
          burnSpeed: 1.0,
          orderLifetime: 1.0,
          orderSpawnTime: 15,
        };
    }
  };
  const diffMods = getDiffModifiers();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to check if a tile in the layout is accessible/adjacent to playable floor
  const isTileAccessible = (col: number, row: number) => {
    const char = level.mapLayout[row]?.[col];
    if (!char) return false;
    const type = getStationTypeFromChar(char).type;
    if (type === 'floor') return true;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < level.gridHeight && nc >= 0 && nc < level.gridWidth) {
          const adjChar = level.mapLayout[nr][nc];
          if (getStationTypeFromChar(adjChar).type === 'floor') {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Calculate active bounding box dynamically to strip empty outer black columns and rows
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
  const consoleWidth = activeCols * TILE_SIZE;
  const consoleHeight = activeRows * TILE_SIZE + 58; // 58px for HUD
  
  // Game state
  const [score, setScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(effectiveTimeLimit);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(4); // Ready, Set, Cook countdown
  const [settingsTab, setSettingsTab] = useState<'main' | 'sound'>('main');
  const [localMuted, setLocalMuted] = useState<boolean>(sounds.getMute());
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (isAndroidDevice()) return true; // Android ALWAYS defaults to active
    try {
      const saved = localStorage.getItem('touch_controls_enabled');
      if (saved !== null) return saved === 'true';
    } catch {}
    return isTouchOrMobileDevice();
  });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const isDraggingJoystickRef = useRef<boolean>(false);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickRef = useRef<HTMLDivElement>(null);

  // Auto-detect Android or mobile touch devices and immediately enable touch controls
  useEffect(() => {
    if (isAndroidDevice() || isTouchOrMobileDevice()) {
      setShowTouchControls(true);
      try {
        localStorage.setItem('touch_controls_enabled', 'true');
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isPaused) {
      setSettingsTab('main');
    }
  }, [isPaused]);

  // Co-op mode ingredient assignment states & ref
  const [showTaskAssignment, setShowTaskAssignment] = useState<boolean>(gameMode === 'COOP');
  const [assignedIngredients, setAssignedIngredients] = useState<Record<ItemType, 1 | 2>>({} as any);
  const countdownIntervalRef = useRef<any>(null);

  // Refs for loop references to avoid re-renders resetting physics vectors
  const scoreRef = useRef<number>(0);

  // Real-time achievements tracking refs
  const washedDishesCountRef = useRef<number>(0);
  const choppedCheeseCountRef = useRef<number>(0);
  const choppedTomatoCountRef = useRef<number>(0);
  const cookedMeatCountRef = useRef<number>(0);
  const chopCountRef = useRef<number>(0);
  const deliveryStreakRef = useRef<number>(0);
  const deliveryCountRef = useRef<number>(0);
  const pastaDeliveredCountRef = useRef<number>(0);
  const wasTrashUsedRef = useRef<boolean>(false);
  const didBurnAnythingRef = useRef<boolean>(false);
  const didFailAnyOrderRef = useRef<boolean>(false);
  const lastActionTimeRef = useRef<number>(Date.now());
  const hasInitializedLocalPosRef = useRef<boolean>(false);

  const getStartingPositionForRole = (roleNum: number) => {
    switch (roleNum) {
      case 1:
        return { x: TILE_SIZE * 2.5, y: TILE_SIZE * 3.5 };
      case 2:
        return { x: TILE_SIZE * 8.5, y: TILE_SIZE * 3.5 };
      case 3:
        return { x: TILE_SIZE * 5.5, y: TILE_SIZE * 2.5 };
      case 4:
        return { x: TILE_SIZE * 6.5, y: TILE_SIZE * 2.5 };
      default:
        return { x: TILE_SIZE * 2.5, y: TILE_SIZE * 3.5 };
    }
  };

  const initChar1 = CHARACTERS.find(c => c.id === chef1CharId) || CHARACTERS[0];
  const initChar2 = CHARACTERS.find(c => c.id === chef2CharId) || CHARACTERS[1];

  const p1Ref = useRef<Chef>({
    id: 1,
    name: lang === 'es' ? initChar1.nameEs : initChar1.nameEn,
    x: TILE_SIZE * 2.5,
    y: TILE_SIZE * 3.5,
    vx: 0,
    vy: 0,
    angle: 0,
    color: initChar1.color,
    hatColor: initChar1.hatColor,
    heldItem: null,
    animFrame: 0,
    isChopping: false,
    isWashing: false,
    isStunned: false,
    stunTimer: 0,
    takeAnimTimer: 0,
    takeAnimFrame: 0,
    ovenGrabType: undefined
  });

  const p2Ref = useRef<Chef>({
    id: 2,
    name: lang === 'es' ? initChar2.nameEs : initChar2.nameEn,
    x: TILE_SIZE * 8.5,
    y: TILE_SIZE * 3.5,
    vx: 0,
    vy: 0,
    angle: Math.PI,
    color: initChar2.color,
    hatColor: initChar2.hatColor,
    heldItem: null,
    animFrame: 0,
    isChopping: false,
    isWashing: false,
    isStunned: false,
    stunTimer: 0,
    takeAnimTimer: 0,
    takeAnimFrame: 0,
    ovenGrabType: undefined
  });

  // Online Co-op extra Chefs and states
  const p3Ref = useRef<Chef>({
    id: 1,
    name: 'Chef 3',
    x: TILE_SIZE * 5.5,
    y: TILE_SIZE * 2.5,
    vx: 0,
    vy: 0,
    angle: 0,
    color: '#D62D6A',
    hatColor: '#7B3FB5',
    heldItem: null,
    animFrame: 0,
    isChopping: false,
    isWashing: false,
    isStunned: false,
    stunTimer: 0,
    takeAnimTimer: 0,
    takeAnimFrame: 0,
    ovenGrabType: undefined
  });

  const p4Ref = useRef<Chef>({
    id: 2,
    name: 'Chef 4',
    x: TILE_SIZE * 6.5,
    y: TILE_SIZE * 2.5,
    vx: 0,
    vy: 0,
    angle: Math.PI,
    color: '#E86A1D',
    hatColor: '#C62B2B',
    heldItem: null,
    animFrame: 0,
    isChopping: false,
    isWashing: false,
    isStunned: false,
    stunTimer: 0,
    takeAnimTimer: 0,
    takeAnimFrame: 0,
    ovenGrabType: undefined
  });

  // Abuela walking sprite frames
  const abuelaSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const urls = [abuelaG1, abuelaG2, abuelaG3, abuelaG4];
    const images = urls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    abuelaSpritesRef.current = images;
  }, []);

  // Abuela take sprite frames (g4_take, g5_take)
  const abuelaTakeSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const urls = [abuelaG4Take, abuelaG5Take];
    const images = urls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    abuelaTakeSpritesRef.current = images;
  }, []);

  // Kenji walking sprite frames (k1-k4) and take frames (k5, k4)
  const kenjiSpritesRef = useRef<HTMLImageElement[]>([]);
  const kenjiTakeSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const walkUrls = [kenjiK1, kenjiK2, kenjiK3, kenjiK4];
    const walkImages = walkUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    kenjiSpritesRef.current = walkImages;

    const takeUrls = [kenjiK5, kenjiK4];
    const takeImages = takeUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    kenjiTakeSpritesRef.current = takeImages;
  }, []);

  // Nova walking sprite frames (n1-n4) and take frames (n5, n4)
  const novaSpritesRef = useRef<HTMLImageElement[]>([]);
  const novaTakeSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const walkUrls = [novaN1, novaN2, novaN3, novaN4];
    const walkImages = walkUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    novaSpritesRef.current = walkImages;

    const takeUrls = [novaN5, novaN4];
    const takeImages = takeUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    novaTakeSpritesRef.current = takeImages;
  }, []);

  // Bruno walking sprite frames (b1-b4) and take frames (b5, b4)
  const brunoSpritesRef = useRef<HTMLImageElement[]>([]);
  const brunoTakeSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const walkUrls = [brunoB1, brunoB2, brunoB3, brunoB4];
    const walkImages = walkUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    brunoSpritesRef.current = walkImages;

    const takeUrls = [brunoB5, brunoB4];
    const takeImages = takeUrls.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    brunoTakeSpritesRef.current = takeImages;
  }, []);

  // Cutting/chopping sprite frames for all characters
  const abuelaCutSpritesRef = useRef<HTMLImageElement[]>([]);
  const kenjiCutSpritesRef = useRef<HTMLImageElement[]>([]);
  const novaCutSpritesRef = useRef<HTMLImageElement[]>([]);
  const brunoCutSpritesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const makeImages = (urls: string[]) => urls.map(src => { const img = new Image(); img.src = src; return img; });
    abuelaCutSpritesRef.current = makeImages([abuelaC1, abuelaC2]);
    kenjiCutSpritesRef.current = makeImages([kenjiKC1, kenjiKC2]);
    novaCutSpritesRef.current = makeImages([novaNC1, novaNC2]);
    brunoCutSpritesRef.current = makeImages([brunoBC1, brunoBC2]);
  }, []);

  // Grill/cooking sprite frames for all characters
  const abuelaGrillSpritesRef = useRef<HTMLImageElement[]>([]);
  const kenjiGrillSpritesRef = useRef<HTMLImageElement[]>([]);
  const novaGrillSpritesRef = useRef<HTMLImageElement[]>([]);
  const brunoGrillSpritesRef = useRef<HTMLImageElement[]>([]);
  const abuelaWashSpritesRef = useRef<HTMLImageElement[]>([]);
  const kenjiWashSpritesRef = useRef<HTMLImageElement[]>([]);
  const novaWashSpritesRef = useRef<HTMLImageElement[]>([]);
  const brunoWashSpritesRef = useRef<HTMLImageElement[]>([]);
  const abuelaOvenSpritesRef = useRef<HTMLImageElement[]>([]);
  const kenjiOvenSpritesRef = useRef<HTMLImageElement[]>([]);
  const novaOvenSpritesRef = useRef<HTMLImageElement[]>([]);
  const brunoOvenSpritesRef = useRef<HTMLImageElement[]>([]);
  const scene1Ref = useRef<HTMLImageElement | null>(null);
  const scene2Ref = useRef<HTMLImageElement | null>(null);
  const scene3Ref = useRef<HTMLImageElement | null>(null);
  const brunoScene1Ref = useRef<HTMLImageElement | null>(null);
  const brunoScene2Ref = useRef<HTMLImageElement | null>(null);
  const brunoScene3Ref = useRef<HTMLImageElement | null>(null);
  const kenjiScene1Ref = useRef<HTMLImageElement | null>(null);
  const kenjiScene2Ref = useRef<HTMLImageElement | null>(null);
  const kenjiScene3Ref = useRef<HTMLImageElement | null>(null);
  const novaScene1Ref = useRef<HTMLImageElement | null>(null);
  const novaScene2Ref = useRef<HTMLImageElement | null>(null);
  const novaScene3Ref = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const makeImages = (urls: string[]) => urls.map(src => { const img = new Image(); img.src = src; return img; });
    abuelaGrillSpritesRef.current = makeImages([abuelaSG1, abuelaSG2]);
    kenjiGrillSpritesRef.current = makeImages([kenjiSK1, kenjiSK2]);
    novaGrillSpritesRef.current = makeImages([novaNS1, novaNS2]);
    brunoGrillSpritesRef.current = makeImages([brunoBS1, brunoBS2]);
    abuelaWashSpritesRef.current = makeImages([abuelaGW1, abuelaGW2]);
    kenjiWashSpritesRef.current = makeImages([kenjiKW1, kenjiKW2]);
    novaWashSpritesRef.current = makeImages([novaNW1, novaNW2]);
    brunoWashSpritesRef.current = makeImages([brunoBW1, brunoBW2]);
    abuelaOvenSpritesRef.current = makeImages([abuelaGK1, abuelaGK2, abuelaGK3]);
    kenjiOvenSpritesRef.current = makeImages([kenjiKK1, kenjiKK2, kenjiKK3]);
    novaOvenSpritesRef.current = makeImages([novaNK1, novaNK2, novaNK3]);
    brunoOvenSpritesRef.current = makeImages([brunoBK1, brunoBK2, brunoBK3]);
    // Load scene backgrounds
    const scene1Img = new Image();
    scene1Img.src = abuelaScene1;
    scene1Ref.current = scene1Img;
    const scene2Img = new Image();
    scene2Img.src = abuelaScene2;
    scene2Ref.current = scene2Img;
    const scene3Img = new Image();
    scene3Img.src = abuelaScene3;
    scene3Ref.current = scene3Img;
    const brunoScene1Img = new Image();
    brunoScene1Img.src = brunoScene1;
    brunoScene1Ref.current = brunoScene1Img;
    const brunoScene2Img = new Image();
    brunoScene2Img.src = brunoScene2;
    brunoScene2Ref.current = brunoScene2Img;
    const brunoScene3Img = new Image();
    brunoScene3Img.src = brunoScene3;
    brunoScene3Ref.current = brunoScene3Img;
    const kenjiScene1Img = new Image();
    kenjiScene1Img.src = kenjiScene1;
    kenjiScene1Ref.current = kenjiScene1Img;
    const kenjiScene2Img = new Image();
    kenjiScene2Img.src = kenjiScene2;
    kenjiScene2Ref.current = kenjiScene2Img;
    const kenjiScene3Img = new Image();
    kenjiScene3Img.src = kenjiScene3;
    kenjiScene3Ref.current = kenjiScene3Img;
    const novaScene1Img = new Image();
    novaScene1Img.src = novaScene1;
    novaScene1Ref.current = novaScene1Img;
    const novaScene2Img = new Image();
    novaScene2Img.src = novaScene2;
    novaScene2Ref.current = novaScene2Img;
    const novaScene3Img = new Image();
    novaScene3Img.src = novaScene3;
    novaScene3Ref.current = novaScene3Img;
  }, []);

  const effectivePlayerId = playerId || (typeof window !== 'undefined' ? (sessionStorage.getItem('online_player_id') || localStorage.getItem('online_player_id') || '') : '') || '';

  // Cancel any pending cleanups if mounting/remounting (handles React 18 Strict Mode double-mount)
  useEffect(() => {
    if (gameMode === 'ONLINE' && lobbyId && effectivePlayerId) {
      const key = `${lobbyId}_${effectivePlayerId}`;
      if (pendingCleanups.has(key)) {
        console.log("[GameCanvas] Canceling pending cleanup on mount/remount for:", key);
        clearTimeout(pendingCleanups.get(key));
        pendingCleanups.delete(key);
      }
    }
  }, [gameMode, lobbyId, effectivePlayerId]);

  const [onlinePlayers, setOnlinePlayers] = useState<any[]>(() => {
    if (gameMode !== 'ONLINE') return [];
    const room = multiplayerClient.lastRoomData;
    return room?.players ? Object.values(room.players) : [];
  });
  const onlinePlayersRef = useRef<any[]>(onlinePlayers);
  useEffect(() => {
    onlinePlayersRef.current = onlinePlayers;
  }, [onlinePlayers]);

  const [myRoleNum, setMyRoleNum] = useState<number>(() => {
    if (gameMode !== 'ONLINE') return 1;
    const room = multiplayerClient.lastRoomData;
    if (!room || !room.players) return 1;
    const me = Object.values(room.players).find((p: any) => p.id === effectivePlayerId) as any;
    return me?.roleNum || 1;
  });
  const myRoleNumRef = useRef<number>(myRoleNum);
  useEffect(() => {
    myRoleNumRef.current = myRoleNum;
  }, [myRoleNum]);

  const [roomData, setRoomData] = useState<any>(() => {
    if (gameMode !== 'ONLINE') return null;
    return multiplayerClient.lastRoomData;
  });
  const roomDataRef = useRef<any>(roomData);
  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);
  const isHost = roomData?.hostId === effectivePlayerId;
  const lastHostSyncRef = useRef<number>(0);
  const lastSentStateStrRef = useRef<string>("");
  const lastSentTimeRef = useRef<number>(0);
  const lastHeartbeatTimeRef = useRef<number>(0);

  // Netcode Host authoritative simulation refs
  const p2InputsRef = useRef<any>(null);
  const p3InputsRef = useRef<any>(null);
  const p4InputsRef = useRef<any>(null);

  const p2RemoteRef = useRef<any>(null);
  const p3RemoteRef = useRef<any>(null);
  const p4RemoteRef = useRef<any>(null);

  const myInputsRef = useRef<any>({ up: false, down: false, left: false, right: false });

  const playerTimestampsRef = useRef<{ [pId: string]: number }>({});
  const stationTimestampsRef = useRef<{ [key: string]: number }>({});
  const stationVersionsRef = useRef<{ [key: string]: number }>({});
  const lastGrabTimeRef = useRef<number>(0);
  const lastDashTimeRef = useRef<number>(0);

  const pushStationUpdate = async (station: KitchenStation) => {
    if (gameMode !== 'ONLINE' || !lobbyId) return;
    try {
      const key = `${station.gridX}_${station.gridY}`;
      const now = Date.now();
      station.lastUpdated = now;
      stationTimestampsRef.current[key] = now;
      const clientVersion = stationVersionsRef.current[key] || 0;
      multiplayerClient.updateStationState(key, { ...station, clientVersion });
    } catch (e) {
      console.error("Error updating station state:", e);
    }
  };

  const applyPlayersState = (playersState: Record<string, any>) => {
    if (!playersState) return;
    const keys = Object.keys(playersState);
    if (keys.length > 0) {
      console.log('[APPLY] playersState keys:', keys, 'myId:', effectivePlayerId, 'myRole:', myRoleNumRef.current);
    }
    Object.keys(playersState).forEach((pId) => {
      if (pId === effectivePlayerId) return;
      const data = playersState[pId];
      if (!data) return;

      const roleNum = Number(data.roleNum);
      if (!roleNum || roleNum === Number(myRoleNumRef.current)) return; // Prevent overwriting local player's state under any circumstance

      // Timestamp filtering to prevent out-of-order stale packets
      const lastTime = playerTimestampsRef.current[pId] || 0;
      if (data.lastUpdated && data.lastUpdated < lastTime) {
        return; // Ignore older state
      }
      playerTimestampsRef.current[pId] = data.lastUpdated || Date.now();

      console.log('[APPLY] Setting target for role', roleNum, 'x:', data.x?.toFixed(0), 'y:', data.y?.toFixed(0));

      const chefRef = roleNum === 1 ? p1Ref :
                      roleNum === 2 ? p2Ref :
                      roleNum === 3 ? p3Ref :
                      roleNum === 4 ? p4Ref : null;

      if (chefRef && chefRef.current) {
        if (data.x !== undefined) (chefRef.current as any).targetX = data.x;
        if (data.y !== undefined) (chefRef.current as any).targetY = data.y;
        if (data.angle !== undefined) (chefRef.current as any).targetAngle = data.angle;
        chefRef.current.vx = data.vx || 0;
        chefRef.current.vy = data.vy || 0;
        chefRef.current.isChopping = !!data.isChopping;
        chefRef.current.isWashing = !!data.isWashing;
        chefRef.current.heldItem = data.heldItem || null;

        if (data.name) chefRef.current.name = data.name;
        if (data.color) chefRef.current.color = data.color;
        if (data.hatColor) chefRef.current.hatColor = data.hatColor;
        if (data.chefId) (chefRef.current as any).chefId = data.chefId;

        // First-time load snap
        if ((chefRef.current as any).hasReceivedFirstPos === undefined && data.x !== undefined && data.y !== undefined) {
          chefRef.current.x = data.x;
          chefRef.current.y = data.y;
          chefRef.current.angle = data.angle || 0;
          (chefRef.current as any).targetAngle = data.angle || 0;
          (chefRef.current as any).hasReceivedFirstPos = true;
          console.log("[GameCanvas] Snapped remote Player", roleNum, "to first received pos/angle:", data.x, data.y, data.angle);
        }
      }
    });
  };

  const getActiveRoles = () => {
    const roles = new Set<number>();
    if (myRoleNumRef.current) roles.add(Number(myRoleNumRef.current));

    const pSource = onlinePlayersRef.current.length > 0
      ? onlinePlayersRef.current
      : Object.values(roomDataRef.current?.players || multiplayerClient.lastRoomData?.players || {});
    
    pSource.forEach((p: any) => {
      if (p && p.roleNum) roles.add(Number(p.roleNum));
    });

    [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current].forEach((c, idx) => {
      if ((c as any).targetX !== undefined || (c as any).hasReceivedFirstPos) {
        roles.add(idx + 1);
      }
    });

    if (roles.size <= 1) {
      const maxP = roomDataRef.current?.maxPlayers || multiplayerClient.lastRoomData?.maxPlayers || 4;
      for (let r = 1; r <= maxP; r++) roles.add(r);
    }

    return Array.from(roles);
  };

  const syncMyPlayerState = (force = false) => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) {
      console.warn('[SYNC-SKIP] guard1 mode:', gameMode, 'lobby:', lobbyId, 'pid:', effectivePlayerId);
      return;
    }

    const meInLobby = onlinePlayersRef.current.find(p => p.id === effectivePlayerId) || roomDataRef.current?.players?.[effectivePlayerId];
    const activeRoleNum = meInLobby?.roleNum || myRoleNumRef.current;
    if (!activeRoleNum) {
      console.warn('[SYNC-SKIP] guard2 no roleNum. meInLobby:', !!meInLobby, 'myRoleNumRef:', myRoleNumRef.current, 'onlinePlayers:', onlinePlayersRef.current.length);
      return;
    }

    const myChef = activeRoleNum === 1 ? p1Ref.current :
                   activeRoleNum === 2 ? p2Ref.current :
                   activeRoleNum === 3 ? p3Ref.current :
                   p4Ref.current;
                   
    const chefId = meInLobby?.chefId || (myChef as any).chefId || '';
    const charConfig = CHARACTERS.find(c => c.id === chefId);

    const currentStateStr = JSON.stringify({
      isChopping: myChef.isChopping,
      isWashing: myChef.isWashing,
      heldItem: myChef.heldItem ? { id: myChef.heldItem.id, type: myChef.heldItem.type, contents: myChef.heldItem.contents } : null
    });

    const now = Date.now();
    const hasStateChanged = currentStateStr !== lastSentStateStrRef.current;
    
    const currentPosStr = `${myChef.x.toFixed(1)}_${myChef.y.toFixed(1)}_${myChef.angle.toFixed(1)}`;
    const hasPositionChanged = currentPosStr !== (myChef as any).lastSentPosStr;

    const isStandingStill = !hasStateChanged && !hasPositionChanged;
    const isHeartbeatNeeded = !lastHeartbeatTimeRef.current || (now - lastHeartbeatTimeRef.current >= 1500);

    // Smart throttling to reduce WebSocket congestion while maintaining real-time responsiveness
    if (!force) {
      if (isStandingStill && !isHeartbeatNeeded) {
        console.warn('[SYNC-SKIP] guard3 throttle: standing still, no heartbeat needed');
        return; // standing still and no heartbeat required: completely suppress packet send
      }
      if (!isStandingStill && !hasStateChanged && lastSentTimeRef.current && (now - lastSentTimeRef.current < 16)) {
        console.warn('[SYNC-SKIP] guard4 throttle: 60Hz limit, msSince:', now - lastSentTimeRef.current);
        return; // ultra smooth real-time 60Hz movement sync
      }
    }

    lastSentStateStrRef.current = currentStateStr;
    (myChef as any).lastSentPosStr = currentPosStr;
    lastSentTimeRef.current = now;
    if (isStandingStill) {
      lastHeartbeatTimeRef.current = now;
    }

    try {
      console.log('[SYNC-SEND] Sending state role:', activeRoleNum, 'pos:', myChef.x.toFixed(0), myChef.y.toFixed(0), 'connected:', multiplayerClient.isConnected);
      multiplayerClient.updatePlayerState({
        roleNum: activeRoleNum,
        chefId: chefId,
        name: meInLobby?.name || myChef.name || 'Chef',
        color: charConfig?.color || myChef.color || '#4A90E2',
        hatColor: charConfig?.hatColor || myChef.hatColor || '#FFFFFF',
        x: myChef.x,
        y: myChef.y,
        vx: myChef.vx,
        vy: myChef.vy,
        angle: myChef.angle,
        inputs: myInputsRef.current || { up: false, down: false, left: false, right: false },
        isChopping: myChef.isChopping,
        isWashing: myChef.isWashing,
        heldItem: myChef.heldItem || null,
        lastUpdated: now
      });

      if (isHost) {
        pushAuthoritativeGameState(force);
      }
    } catch (e) {
      console.error("[GameCanvas] Error writing player state:", e);
    }
  };

  const pushAuthoritativeGameState = async (force = false) => {
    if (gameMode !== 'ONLINE' || !lobbyId || !isHost) return;
    const now = Date.now();
    // Ultra smooth 35ms sync interval for real-time timer, score, and order tracking
    const syncInterval = 35;
    if (!force && lastHostSyncRef.current && now - lastHostSyncRef.current < syncInterval) {
      return;
    }
    lastHostSyncRef.current = now;
    try {
      const activeRoles = getActiveRoles();
      const playersPayload: Record<string, any> = {};
      activeRoles.forEach((r) => {
        const chefRef = r === 1 ? p1Ref : r === 2 ? p2Ref : r === 3 ? p3Ref : p4Ref;
        if (chefRef.current) {
          playersPayload[`Player_${r}`] = {
            x: chefRef.current.x,
            y: chefRef.current.y,
            angle: chefRef.current.angle,
            vx: chefRef.current.vx,
            vy: chefRef.current.vy,
            isChopping: chefRef.current.isChopping,
            isWashing: chefRef.current.isWashing,
            heldItem: chefRef.current.heldItem
          };
        }
      });

      multiplayerClient.syncGameState({
        score: scoreRef.current,
        timeRemaining: gameTimeRef.current,
        activeOrders: ordersRef.current,
        isGameOver: isGameOver,
        isPaused: isPaused,
        players: playersPayload,
        writerId: effectivePlayerId || '',
        lastUpdated: now
      });
    } catch (e) {
      console.error("Error writing authoritative game state:", e);
    }
  };

  const stationsRef = useRef<KitchenStation[]>([]);
  const ordersRef = useRef<ActiveOrder[]>([]);
  const particlesRef = useRef<GameParticle[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const prevGamepadButtonsRef = useRef<Record<number, Record<number, boolean>>>({});
  const gp0ActionHeldRef = useRef<boolean>(false);
  const gp1ActionHeldRef = useRef<boolean>(false);
  const gameTimeRef = useRef<number>(effectiveTimeLimit);
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const orderSpawnCounter = useRef<number>(0);

  // Gamepad Virtual Mouse Cursor States & Refs for Pause Overlay
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

  // Touch Controller Helper Handlers
  const handleTouchKey = (key: string, isPressed: boolean) => {
    keysPressed.current[key] = isPressed;
  };

  const getTouchKeyHandlers = (key: string) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, true);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, false);
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, false);
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, true);
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, false);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleTouchKey(key, false);
      }
    };
  };

  const getLocalChef = () => {
    if (gameMode !== 'ONLINE') return p1Ref.current;
    return myRoleNumRef.current === 1 ? p1Ref.current :
           myRoleNumRef.current === 2 ? p2Ref.current :
           myRoleNumRef.current === 3 ? p3Ref.current :
           p4Ref.current;
  };

  const handleTouchDash = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (countdown === 0 && !isPaused && !isGameOver) {
      handleChefAction(getLocalChef(), 'DASH');
    }
  };

  const handleTouchGrab = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (countdown === 0 && !isPaused && !isGameOver) {
      handleChefAction(getLocalChef(), 'GRAB');
    }
  };

  // Virtual Joystick Event Handlers with Global Windows listeners and Touch ID Tracking
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    isDraggingJoystickRef.current = true;
    setJoystickActive(true);

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      updateJoystick(touch.clientX - centerX, touch.clientY - centerY);
    }
  };

  const handleJoystickMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    joystickTouchIdRef.current = null; // null represents mouse mode
    isDraggingJoystickRef.current = true;
    setJoystickActive(true);

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      updateJoystick(e.clientX - centerX, e.clientY - centerY);
    }
  };

  const stopJoystick = () => {
    isDraggingJoystickRef.current = false;
    joystickTouchIdRef.current = null;
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    keysPressed.current['w'] = false;
    keysPressed.current['s'] = false;
    keysPressed.current['a'] = false;
    keysPressed.current['d'] = false;
  };

  const updateJoystick = (rawX: number, rawY: number) => {
    const maxRadius = 45; // Max radius the knob can move (px)
    const distance = Math.hypot(rawX, rawY);
    let finalX = rawX;
    let finalY = rawY;

    if (distance > maxRadius) {
      finalX = (rawX / distance) * maxRadius;
      finalY = (rawY / distance) * maxRadius;
    }

    setJoystickPos({ x: finalX, y: finalY });

    if (distance > 8) { // Deadzone (8px)
      const angle = Math.atan2(finalY, finalX);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const threshold = 0.38;
      keysPressed.current['w'] = sin < -threshold;
      keysPressed.current['s'] = sin > threshold;
      keysPressed.current['a'] = cos < -threshold;
      keysPressed.current['d'] = cos > threshold;
    } else {
      keysPressed.current['w'] = false;
      keysPressed.current['s'] = false;
      keysPressed.current['a'] = false;
      keysPressed.current['d'] = false;
    }
  };

  // Detect movements and touch endings globally on window to support sliding outside the joystick boundaries seamlessly across the screen
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingJoystickRef.current || !joystickRef.current) return;
      if (joystickTouchIdRef.current === null) return;

      // Find the specific touch corresponding to the joystick
      let activeTouch: Touch | undefined;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystickTouchIdRef.current) {
          activeTouch = e.touches[i];
          break;
        }
      }

      if (!activeTouch) return;

      // Prevent native Android gestures (scrolling, pull-to-refresh, page swipe)
      if (e.cancelable) {
        e.preventDefault();
      }

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      updateJoystick(activeTouch.clientX - centerX, activeTouch.clientY - centerY);
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (!isDraggingJoystickRef.current) return;
      if (joystickTouchIdRef.current === null) return;

      // Only stop if our specific joystick finger lifted or was cancelled
      let ourFingerEnded = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
          ourFingerEnded = true;
          break;
        }
      }

      if (ourFingerEnded) {
        stopJoystick();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingJoystickRef.current || !joystickRef.current) return;
      if (joystickTouchIdRef.current !== null) return; // Touch is active, ignore mouse

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      updateJoystick(e.clientX - centerX, e.clientY - centerY);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!isDraggingJoystickRef.current) return;
      if (joystickTouchIdRef.current !== null) return;
      stopJoystick();
    };

    const handleBlur = () => {
      if (isDraggingJoystickRef.current) {
        stopJoystick();
      }
    };

    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: true });
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // --- ONLINE LOBBY ROOM LISTENER ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) {
      console.warn("[GameCanvas] Listener skipped. lobbyId:", lobbyId, "effectivePlayerId:", effectivePlayerId);
      return;
    }
    console.log("[GameCanvas] Listening to room:", lobbyId, "for player:", effectivePlayerId);

    const unsubscribe = multiplayerClient.onRoomUpdate((data) => {
      setRoomData(data);
      roomDataRef.current = data; // Update ref immediately!

      if (data.status === 'waiting') {
        console.log("[GameCanvas] Server reset room status to waiting. Exiting game canvas back to lobby.");
        onExit();
        return;
      }
      
      if (data.playersState) {
        applyPlayersState(data.playersState);
      }
      
      if (data.players) {
        const playersList = Object.values(data.players) as any[];
        setOnlinePlayers(playersList);
        onlinePlayersRef.current = playersList; // Update ref immediately!
        
        console.log("[GameCanvas] Players list updated:", playersList.map(p => `ID:${p.id}, Role:${p.roleNum}, Name:${p.name}`));
        
        const me = playersList.find(p => p.id === effectivePlayerId);
        if (me) {
          console.log("[GameCanvas] Resolved local player:", me.name, "as Role #", me.roleNum);
          setMyRoleNum(me.roleNum);
          myRoleNumRef.current = me.roleNum;
          if (!hasInitializedLocalPosRef.current) {
            hasInitializedLocalPosRef.current = true;
            const startPos = getStartingPositionForRole(me.roleNum);
            const myChefRef = me.roleNum === 1 ? p1Ref :
                              me.roleNum === 2 ? p2Ref :
                              me.roleNum === 3 ? p3Ref : p4Ref;
            if (myChefRef.current) {
              myChefRef.current.x = startPos.x;
              myChefRef.current.y = startPos.y;
              console.log("[GameCanvas] Set initial position for local chef:", startPos);
            }
          }
        } else {
          console.warn("[GameCanvas] Local player not found in room list yet (might be joining/synced shortly):", effectivePlayerId);
        }
        
        playersList.forEach((player) => {
          const char = CHARACTERS.find(c => c.id === player.chefId) || CHARACTERS[0];
          const chefRef = player.roleNum === 1 ? p1Ref :
                          player.roleNum === 2 ? p2Ref :
                          player.roleNum === 3 ? p3Ref :
                          player.roleNum === 4 ? p4Ref : null;
          if (chefRef && chefRef.current) {
            chefRef.current.name = player.name || (lang === 'es' ? char.nameEs : char.nameEn);
            chefRef.current.color = char.color;
            chefRef.current.hatColor = char.hatColor;
            (chefRef.current as any).chefId = player.chefId;
          }
        });
      }
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId, effectivePlayerId, lang]);

  // --- INITIALIZE ROOM STATE FROM CACHE ON MOUNT ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) return;
    const data = multiplayerClient.lastRoomData;
    if (data) {
      if (data.playersState) {
        applyPlayersState(data.playersState);
      }
      if (data.players) {
        const playersList = Object.values(data.players) as any[];
        console.log("[GameCanvas] Mount-time initialization with cached players:", playersList.map(p => `ID:${p.id}, Role:${p.roleNum}, Name:${p.name}`));
        
        const me = playersList.find(p => p.id === effectivePlayerId);
        if (me) {
          setMyRoleNum(me.roleNum);
          myRoleNumRef.current = me.roleNum;
          if (!hasInitializedLocalPosRef.current) {
            hasInitializedLocalPosRef.current = true;
            const startPos = getStartingPositionForRole(me.roleNum);
            const myChefRef = me.roleNum === 1 ? p1Ref :
                              me.roleNum === 2 ? p2Ref :
                              me.roleNum === 3 ? p3Ref : p4Ref;
            if (myChefRef.current) {
              myChefRef.current.x = startPos.x;
              myChefRef.current.y = startPos.y;
              console.log("[GameCanvas] Cached initial position applied for local chef:", startPos);
            }
          }
        }

        playersList.forEach((player) => {
          const char = CHARACTERS.find(c => c.id === player.chefId) || CHARACTERS[0];
          const chefRef = player.roleNum === 1 ? p1Ref :
                          player.roleNum === 2 ? p2Ref :
                          player.roleNum === 3 ? p3Ref :
                          player.roleNum === 4 ? p4Ref : null;
          if (chefRef && chefRef.current) {
            chefRef.current.name = player.name || (lang === 'es' ? char.nameEs : char.nameEn);
            chefRef.current.color = char.color;
            chefRef.current.hatColor = char.hatColor;
            (chefRef.current as any).chefId = player.chefId;
          }
        });
      }
    }
  }, [gameMode, lobbyId, effectivePlayerId, lang]);

  // --- INCOMING PLAYERS STATE LISTENER ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) return;

    const unsubscribe = multiplayerClient.onPlayersSync((playersState) => {
      // Save remote inputs on Host for simulation if needed
      if (isHost) {
        Object.keys(playersState).forEach((pId) => {
          if (pId === effectivePlayerId) return;
          const data = playersState[pId];
          if (data && data.roleNum && data.roleNum !== myRoleNumRef.current) {
            if (data.roleNum === 2) {
              p2InputsRef.current = data.inputs || null;
              p2RemoteRef.current = { x: data.x, y: data.y, angle: data.angle, isChopping: data.isChopping, isWashing: data.isWashing, heldItem: data.heldItem };
            } else if (data.roleNum === 3) {
              p3InputsRef.current = data.inputs || null;
              p3RemoteRef.current = { x: data.x, y: data.y, angle: data.angle, isChopping: data.isChopping, isWashing: data.isWashing, heldItem: data.heldItem };
            } else if (data.roleNum === 4) {
              p4InputsRef.current = data.inputs || null;
              p4RemoteRef.current = { x: data.x, y: data.y, angle: data.angle, isChopping: data.isChopping, isWashing: data.isWashing, heldItem: data.heldItem };
            }
          }
        });
      }

      applyPlayersState(playersState);
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId, effectivePlayerId, isHost]);

  // --- INCOMING KITCHEN STATIONS LISTENER ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId) return;

    const unsubscribe = multiplayerClient.onStationSync((data) => {
      const key = data.key;
      const station = stationsRef.current.find(s => s.gridX === data.stationState.gridX && s.gridY === data.stationState.gridY);
      if (station) {
        // Timestamp filtering to prevent out-of-order stale packets
        const lastTime = stationTimestampsRef.current[key] || 0;
        const incomingTime = data.stationState.lastUpdated || 0;
        if (incomingTime && incomingTime < lastTime) {
          return; // Ignore older station state
        }
        stationTimestampsRef.current[key] = incomingTime || Date.now();

        // Store server version for optimistic concurrency
        if (data.stationState.serverVersion !== undefined) {
          stationVersionsRef.current[key] = data.stationState.serverVersion;
        }

        const prevItemType = station.heldItem?.type;
        const nextItemType = data.stationState.heldItem?.type;

        station.heldItem = data.stationState.heldItem || null;
        station.progress = data.stationState.progress;
        station.isWarning = data.stationState.isWarning || false;

        // Play feedback sounds for Guest clients matching Host authoritative state
        if (!isHost) {
          if (prevItemType && nextItemType && prevItemType !== nextItemType) {
            const isCookingStation = station.type === 'grill' || station.type === 'stove_pot' || station.type === 'oven';
            if (isCookingStation) {
              if (nextItemType.includes('cocinado') || nextItemType.includes('cocida') || nextItemType.includes('horneada')) {
                sounds.playDing();
              } else if (nextItemType.includes('quemada') || nextItemType.includes('quemado')) {
                sounds.playBurn();
              }
            }
          }
          if (station.isWarning && Math.random() < 0.05) {
            sounds.playWarning();
          }
        }

        // If Host receives a delivery station update with a plate, process it authoritatively
        if (isHost && station.type === 'delivery' && station.heldItem) {
          console.log("[Netcode Host] Authoritatively processing remote delivery of:", station.heldItem);
          handleDelivery(station.heldItem);
          
          // Clear the delivery station after processing so it's ready for more
          station.heldItem = null;
          pushStationUpdate(station);
        }
      }
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId, isHost]);

  // --- STATION CONFLICT HANDLER (revert duplicate grabs) ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId) return;

    const unsubscribe = multiplayerClient.onStationConflict((data) => {
      const { key, correctState, serverVersion } = data;
      console.log('[CONFLICT] Station conflict received for key:', key, 'reverting to server state');

      // Revert the station to the correct server state
      const station = stationsRef.current.find(s => s.gridX === correctState.gridX && s.gridY === correctState.gridY);
      if (station) {
        station.heldItem = correctState.heldItem || null;
        station.progress = correctState.progress;
        station.isWarning = correctState.isWarning || false;
        stationTimestampsRef.current[key] = Date.now();
        // Update to server's version so our next push reflects the correct baseline
        if (serverVersion !== undefined) {
          stationVersionsRef.current[key] = serverVersion;
        } else {
          stationVersionsRef.current[key] = (stationVersionsRef.current[key] || 0) + 1;
        }
      }

      // Clear the local chef's held item (they grabbed an item someone else already took)
      const localChef = myRoleNumRef.current === 1 ? p1Ref.current :
                        myRoleNumRef.current === 2 ? p2Ref.current :
                        myRoleNumRef.current === 3 ? p3Ref.current :
                        p4Ref.current;
      if (localChef && localChef.heldItem) {
        localChef.heldItem = null;
        syncMyPlayerState(true);
        console.log('[CONFLICT] Cleared local chef held item due to duplicate grab');
      }
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId]);
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) return;

    const unsubscribe = multiplayerClient.onGameSync((data) => {
      if (data.writerId === effectivePlayerId) return;
      
      setScore(data.score);
      scoreRef.current = data.score;
      if (!isHost) {
        setTimeRemaining(data.timeRemaining);
        gameTimeRef.current = data.timeRemaining;
      }
      setActiveOrders(data.activeOrders || []);
      ordersRef.current = data.activeOrders || [];
      if (data.isGameOver && !isGameOver) {
        setIsGameOver(true);
        sounds.playWinFanfare();
        onLevelComplete(data.score, 3);
      }
      if (data.isPaused !== isPaused) {
        setIsPaused(data.isPaused);
      }
    });

    return () => unsubscribe();
  }, [gameMode, lobbyId, isHost, isGameOver, isPaused, effectivePlayerId]);

    // --- OUTGOING POSITION SYNC TICK ---
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) return;
    console.log('[SYNC] Starting sync interval for player:', effectivePlayerId, 'lobby:', lobbyId);
    const interval = setInterval(() => {
      syncMyPlayerState(false);
    }, 20);
    return () => clearInterval(interval);
  }, [gameMode, lobbyId, effectivePlayerId, isHost]);

  // --- MULTIPLAYER AUTO-CONNECT & REJOIN FLOW ---
  // Only reconnect if socket drops during gameplay. Do NOT send JOIN_LOBBY on mount
  // because the room is already active with status='playing' and the server would create a new empty room.
  useEffect(() => {
    if (gameMode !== 'ONLINE' || !lobbyId || !effectivePlayerId) return;

    const handleConnect = () => {
      // This only fires on socket reconnect (not initial mount), so rejoin the room
      console.log(`[GameCanvas Connection] Socket reconnected. Rejoining room: ${lobbyId}`);
      multiplayerClient.joinLobby(
        effectivePlayerId,
        roomDataRef.current?.players?.[effectivePlayerId]?.name || localStorage.getItem('online_player_name') || 'Cocinero',
        'code',
        roomDataRef.current?.maxPlayers || 4,
        lobbyId
      );
    };

    const handleDisconnect = () => {
      console.warn('[GameCanvas Connection] Socket disconnected. Will attempt automatic room recovery on reconnect...');
    };

    multiplayerClient.connect(handleConnect, handleDisconnect);

    return () => {
      // Clear GameCanvas callbacks so they don't fire after unmount
      multiplayerClient.connect(() => {}, () => {});
    };
  }, [gameMode, lobbyId, effectivePlayerId]);

  // NOTE: LEAVE_LOBBY is NOT sent on unmount here to avoid race conditions.
  // The server handles disconnection cleanup with a 30s grace period.
  // Leaving the lobby is handled explicitly by onExit() -> handleExitToMenu in App.tsx

  // Parse level map layout on mount
  useEffect(() => {
    const stations: KitchenStation[] = [];
    
    // Grid coordinate loops
    level.mapLayout.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        const { type, dispensed } = getStationTypeFromChar(char);
        
        if (type !== 'floor') {
          stations.push({
            gridX: c,
            gridY: r,
            type: type as any,
            dispensedIngredient: dispensed,
            heldItem: null,
            progress: 0
          });
        }
      }
    });

    stationsRef.current = stations;

    // Place initial dirty plates on sinks
    let dirtyPlatesToPlace = 2;
    for (const station of stationsRef.current) {
      if (dirtyPlatesToPlace <= 0) break;
      if (station.type === 'sink') {
        station.heldItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'plato_sucio'
        };
        dirtyPlatesToPlace--;
      }
    }

    // In ONLINE mode, restore any pre-existing stationsState from the lobby room data
    if (gameMode === 'ONLINE') {
      const room = multiplayerClient.lastRoomData;
      if (room && room.stationsState) {
        stations.forEach((station) => {
          const key = `${station.gridX}_${station.gridY}`;
          const saved = room.stationsState[key];
          if (saved) {
            station.heldItem = saved.heldItem || null;
            station.progress = saved.progress || 0;
            station.isWarning = saved.isWarning || false;
            station.lastSyncedProgress = saved.progress || 0;
          }
        });
      }
      // Restore station versions from room data
      if (room && (room as any).stationVersions) {
        Object.entries((room as any).stationVersions).forEach(([key, ver]) => {
          stationVersionsRef.current[key] = ver as number;
        });
      }
    }

    scoreRef.current = 0;
    setScore(0);
    gameTimeRef.current = effectiveTimeLimit;
    setTimeRemaining(effectiveTimeLimit);
    setIsGameOver(false);
    ordersRef.current = [];
    setActiveOrders([]);
    particlesRef.current = [];
    setCountdown(4);

    if (gameMode !== 'ONLINE') {
      const char1 = CHARACTERS.find(c => c.id === chef1CharId) || CHARACTERS[0];
      const char2 = CHARACTERS.find(c => c.id === chef2CharId) || CHARACTERS[1];

      p1Ref.current.name = lang === 'es' ? char1.nameEs : char1.nameEn;
      p1Ref.current.color = char1.color;
      p1Ref.current.hatColor = char1.hatColor;

      p2Ref.current.name = lang === 'es' ? char2.nameEs : char2.nameEn;
      p2Ref.current.color = char2.color;
      p2Ref.current.hatColor = char2.hatColor;
    }

    hasInitializedLocalPosRef.current = false;

    // Initial position based on level walkthrough paths
    p1Ref.current.x = TILE_SIZE * 2.5;
    p1Ref.current.y = TILE_SIZE * 3.5;
    p1Ref.current.heldItem = null;
    p1Ref.current.isChopping = false;
    p1Ref.current.isWashing = false;
    p1Ref.current.takeAnimTimer = 0;
    p1Ref.current.takeAnimFrame = 0;

    p2Ref.current.x = TILE_SIZE * 8.5;
    p2Ref.current.y = TILE_SIZE * 3.5;
    p2Ref.current.heldItem = null;
    p2Ref.current.isChopping = false;
    p2Ref.current.isWashing = false;
    p2Ref.current.takeAnimTimer = 0;
    p2Ref.current.takeAnimFrame = 0;

    p3Ref.current.x = TILE_SIZE * 5.5;
    p3Ref.current.y = TILE_SIZE * 2.5;
    p3Ref.current.heldItem = null;
    p3Ref.current.isChopping = false;
    p3Ref.current.isWashing = false;
    p3Ref.current.takeAnimTimer = 0;
    p3Ref.current.takeAnimFrame = 0;

    p4Ref.current.x = TILE_SIZE * 6.5;
    p4Ref.current.y = TILE_SIZE * 2.5;
    p4Ref.current.heldItem = null;
    p4Ref.current.isChopping = false;
    p4Ref.current.isWashing = false;
    p4Ref.current.takeAnimTimer = 0;
    p4Ref.current.takeAnimFrame = 0;

    // Spawn 1 initial order matching recipes
    spawnNewOrder();
    spawnNewOrder();

    // Start countdown if we don't show task assignment, otherwise suspend
    if (gameMode !== 'COOP') {
      startCountdownSequence();
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, [level]);

  // Find all unique raw ingredients in current level and divide them equally
  useEffect(() => {
    if (gameMode === 'COOP') {
      const uniqueIngs: ItemType[] = [];
      level.mapLayout.forEach((row) => {
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          const stat = getStationTypeFromChar(char);
          if (stat.type === 'dispenser' && stat.dispensed) {
            if (!uniqueIngs.includes(stat.dispensed)) {
              uniqueIngs.push(stat.dispensed);
            }
          }
        }
      });

      const initial: Record<ItemType, 1 | 2> = {} as any;
      uniqueIngs.forEach((ing, index) => {
        // Equal split: P1 gets first half, P2 gets second half
        initial[ing] = (index < Math.ceil(uniqueIngs.length / 2)) ? 1 : 2;
      });
      setAssignedIngredients(initial);
      setShowTaskAssignment(true);
    } else {
      setShowTaskAssignment(false);
    }
  }, [level, gameMode]);

  // Start the actual game countdown
  const startCountdownSequence = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(4);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          return 0;
        }
        sounds.playSelect();
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartCoopGame = () => {
    sounds.playSelect();
    setShowTaskAssignment(false);
    startCountdownSequence();
  };

  const handleToggleIngredient = (item: ItemType) => {
    const currentOwner = assignedIngredients[item];
    const newOwner = currentOwner === 1 ? 2 : 1;
    
    // To keep it 100% equal-parts, swap with another ingredient owned by newOwner
    const otherIngredients = Object.keys(assignedIngredients) as ItemType[];
    const candidates = otherIngredients.filter(k => k !== item && assignedIngredients[k as ItemType] === newOwner);
    
    if (candidates.length > 0) {
      const targetToSwap = candidates[0];
      setAssignedIngredients(prev => ({
        ...prev,
        [item]: newOwner,
        [targetToSwap]: currentOwner
      }));
    } else {
      setAssignedIngredients(prev => ({
        ...prev,
        [item]: newOwner
      }));
    }
    sounds.playSelect();
  };

  const getBaseIngredient = (itemType: ItemType): ItemType => {
    switch (itemType) {
      case 'tomate_picado':
        return 'tomate';
      case 'carne_cocinada':
      case 'carne_quemada':
        return 'carne_cruda';
      case 'lechuga_picada':
        return 'lechuga';
      case 'queso_picado':
        return 'queso';
      case 'pasta_cocida':
      case 'pasta_quemada':
        return 'pasta_seca';
      case 'masa_estirada':
      case 'pizza_cruda':
      case 'pizza_horneada':
      case 'pizza_quemada':
        return 'masa';
      default:
        return itemType;
    }
  };

  const canChefHandleItem = (chefId: 1 | 2, itemType: ItemType): boolean => {
    if (gameMode !== 'COOP') return true;
    if (itemType === 'plato_limpio' || itemType === 'plato_sucio') return true;
    
    const base = getBaseIngredient(itemType);
    const owner = assignedIngredients[base];
    if (owner !== undefined && owner !== chefId) {
      return false;
    }
    return true;
  };

  const showRestrictedFeedback = (chef: Chef, itemType: ItemType) => {
    const otherName = chef.id === 1 ? 'Chef Verde' : 'Chef Fuego';
    createScoreText(`🔒 Solo ${otherName}`, chef.x, chef.y - 10, '#EF4444');
    
    for (let i = 0; i < 4; i++) {
      spawnParticle(
        chef.x,
        chef.y,
        (Math.random() - 0.5) * 2,
        (-Math.random() - 0.5) * 2,
        '#FF0000',
        4,
        'smoke'
      );
    }
  };

  // Keys listening subscription
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      
      if (e.key === 'p' && countdown === 0 && !isGameOver) {
        setIsPaused(prev => !prev);
        sounds.playSelect();
      }

      // Action triggers for players to avoid multiple inputs on hold
      if (countdown === 0 && !isPaused && !isGameOver) {
        if (gameMode === 'ONLINE') {
          const localChef = getLocalChef();
          // Space or Period: Grab
          if (e.key === ' ' || e.key === '.') {
            e.preventDefault();
            handleChefAction(localChef, 'GRAB');
          }
          // Q, M or Slash: Dash
          if (key === 'q' || key === 'm' || e.key === '/' || e.key === '-') {
            e.preventDefault();
            handleChefAction(localChef, 'DASH');
          }
        } else if (gameMode === 'COOP') {
          // Player 1: Grab (Space)
          if (e.key === ' ') {
            e.preventDefault();
            handleChefAction(p1Ref.current, 'GRAB');
          }
          // Player 1: Dash (Q)
          if (key === 'q') {
            handleChefAction(p1Ref.current, 'DASH');
          }

          // Player 2: Grab (Period .)
          if (e.key === '.') {
            e.preventDefault();
            handleChefAction(p2Ref.current, 'GRAB');
          }
          // Player 2: Dash (Slash / or M)
          if (e.key === '/' || key === 'm') {
            e.preventDefault();
            handleChefAction(p2Ref.current, 'DASH');
          }
        } else {
          // Solo Mode: inputs go to p1 always!
          // Space: Grab
          if (e.key === ' ') {
            e.preventDefault();
            handleChefAction(p1Ref.current, 'GRAB');
          }
          // Q: Dash
          if (key === 'q') {
            handleChefAction(p1Ref.current, 'DASH');
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, countdown, isPaused, isGameOver]);

  // Spawn dynamic orders helper
  const spawnNewOrder = () => {
    if (ordersRef.current.length >= 4) return; // limit list size
    
    // Select random recipe from level list
    const available = level.availableRecipes;
    const randomRecipeId = available[Math.floor(Math.random() * available.length)];
    const recipe = RECIPES[randomRecipeId];
    if (!recipe) return;

    // Create active order representation
    const newOrder: ActiveOrder = {
      id: Math.random().toString(36).substr(2, 9),
      recipeId: recipe.id,
      name: recipe.name,
      icon: recipe.icon,
      requiredItems: [...recipe.requiredItems],
      timeLeft: (45 + Math.random() * 25) * diffMods.orderLifetime, // seconds countdown (roughly 1 minute max)
      maxTime: 70 * diffMods.orderLifetime,
      reward: recipe.reward
    };

    ordersRef.current = [...ordersRef.current, newOrder];
    setActiveOrders(ordersRef.current);
    sounds.playSelect();
  };

  // Trigger Chef Interactions
  const handleChefAction = (chef: Chef, actionType: 'GRAB' | 'DASH') => {
    if (chef.isStunned) return;

    // 250ms action cooldown guard (critically prevents dual touch/mouse event double-triggering on mobile)
    const now = Date.now();
    if (actionType === 'GRAB') {
      const cooldown = gameMode === 'ONLINE' ? 380 : 250;
      if (now - lastGrabTimeRef.current < cooldown) {
        return;
      }
      lastGrabTimeRef.current = now;
    } else if (actionType === 'DASH') {
      if (now - lastDashTimeRef.current < 250) {
        return;
      }
      lastDashTimeRef.current = now;
    }

    // Record action time to check "Chef Modelo"
    lastActionTimeRef.current = now;

    // Determine target station in front of chef
    const dx = Math.cos(chef.angle);
    const dy = Math.sin(chef.angle);
    const targetGridX = Math.floor((chef.x + dx * INTERACT_DIST) / TILE_SIZE);
    const targetGridY = Math.floor((chef.y + dy * INTERACT_DIST) / TILE_SIZE);

    const station = stationsRef.current.find(
      (s) => s.gridX === targetGridX && s.gridY === targetGridY
    );

    if (actionType === 'DASH') {
      // High speed boost vector trigger
      chef.vx += dx * 10;
      chef.vy += dy * 10;
      sounds.playDash();
      
      // Trigger "Chef Supersónico" (id 1)
      onUnlockAchievement?.(1);

      // Spawn dash particles
      for (let i = 0; i < 6; i++) {
        spawnParticle(chef.x, chef.y, -dx * 2 + (Math.random() - 0.5), -dy * 2 + (Math.random() - 0.5), '#E5E7EB', 4, 'dash');
      }
      return;
    }

    if (actionType === 'GRAB') {
      if (!station) {
        // Drop on floor? No, on empty countertops. To prevent dumping on floor, let them drop if counter.
        // If they drop an item and represent none, they just stand
        return;
      }

      // Trigger take animation (5, 4)
      chef.takeAnimTimer = 1.0;

      // Track oven grab type for animation (place vs take)
      if (station.type === 'oven') {
        const held = chef.heldItem;
        const ovenEmpty = !station.heldItem;
        chef.ovenGrabType = (held && ovenEmpty) ? 'place' : (!held && station.heldItem) ? 'take' : undefined;
      } else {
        chef.ovenGrabType = undefined;
      }

      const held = chef.heldItem;

      // Rule sets based on Station Type
      if (station.type === 'dispenser') {
        if (!held && station.dispensedIngredient) {
          if (!canChefHandleItem(chef.id, station.dispensedIngredient)) {
            sounds.playFail();
            showRestrictedFeedback(chef, station.dispensedIngredient);
            return;
          }
          chef.heldItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: station.dispensedIngredient
          };
          sounds.playSelect();
        }
      } else if (station.type === 'trash') {
        if (held) {
          wasTrashUsedRef.current = true;
          if (held.type === 'plato_limpio' && held.contents && held.contents.length > 0) {
            // Trash plate content and make plate dirty
            held.contents = [];
            held.type = 'plato_sucio';
            sounds.playFail();
            spawnParticle(station.gridX * TILE_SIZE + 30, station.gridY * TILE_SIZE + 20, 0, -1, '#374151', 12, 'smoke');
            
            // Trigger "Basurero Gourmet" (id 4)
            onUnlockAchievement?.(4);
          } else if (held.type !== 'plato_limpio' && held.type !== 'plato_sucio') {
            // Trigger id 4 if the held item is a prepared ingredient
            const isPrepared = held.type.includes('cocido') || held.type.includes('cocinada') || held.type.includes('picado') || held.type.includes('picada') || held.type.includes('horneada');
            if (isPrepared) {
              onUnlockAchievement?.(4);
            }

            chef.heldItem = null;
            sounds.playFail();
            // smoke puff
            for (let i = 0; i < 5; i++) {
              spawnParticle(
                station.gridX * TILE_SIZE + 30,
                station.gridY * TILE_SIZE + 20,
                (Math.random() - 0.5) * 2,
                -Math.random() * 2,
                '#4B5563',
                6,
                'smoke'
              );
            }
          }
        }
      } else if (station.type === 'plate_rack') {
        if (!held && !station.heldItem) {
          chef.heldItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'plato_limpio',
            contents: []
          };
          sounds.playSelect();
        } else if (held && canCombineOnPlate({ id: '', type: 'plato_limpio', contents: [] }, held.type)) {
          // Automatic plating! Create a plate with the held cooked/chopped ingredient directly
          chef.heldItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'plato_limpio',
            contents: [held.type]
          };
          sounds.playSelect();
        }
      } else if (station.type === 'counter') {
        // Intercom switch: swap held item with station item
        const temp = station.heldItem;
        
        // Assemble combination trigger!
        if (held && temp) {
          // If station has plate and player is holding food item
          if (temp.type === 'plato_limpio' && canCombineOnPlate(temp, held.type)) {
            // Check "Receta del Futuro" (id 40)
            const tempContents = temp.contents || [];
            const isBurgerPlate = tempContents.includes('pan_hamburguesa') || tempContents.includes('carne_cocinada');
            const isFutureRecipe = held.type === 'salsa_tomate' || held.type === 'pasta_seca' || held.type === 'pasta_cocida';
            if (isBurgerPlate && isFutureRecipe) {
              onUnlockAchievement?.(40);
            }

            temp.contents = temp.contents || [];
            temp.contents.push(held.type);
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          
          // Pizza assembly on counter: masa_estirada + queso_picado + salsa_tomate → pizza_cruda
          // Step 1: masa_estirada + queso_picado → pizza_con_queso (or reverse)
          if (temp.type === 'masa_estirada' && held.type === 'queso_picado') {
            temp.type = 'pizza_con_queso';
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          if (held.type === 'masa_estirada' && temp.type === 'queso_picado') {
            station.heldItem = { ...temp, type: 'pizza_con_queso' };
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          // Step 1 alt: masa_estirada + salsa_tomate → pizza_con_salsa (or reverse)
          if (temp.type === 'masa_estirada' && held.type === 'salsa_tomate') {
            temp.type = 'pizza_con_salsa';
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          if (held.type === 'masa_estirada' && temp.type === 'salsa_tomate') {
            station.heldItem = { ...temp, type: 'pizza_con_salsa' };
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          // Step 2: pizza_con_queso + salsa_tomate → pizza_cruda (or reverse)
          if (temp.type === 'pizza_con_queso' && held.type === 'salsa_tomate') {
            temp.type = 'pizza_cruda';
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          if (held.type === 'pizza_con_queso' && temp.type === 'salsa_tomate') {
            station.heldItem = { ...temp, type: 'pizza_cruda' };
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          // Step 2 alt: pizza_con_salsa + queso_picado → pizza_cruda (or reverse)
          if (temp.type === 'pizza_con_salsa' && held.type === 'queso_picado') {
            temp.type = 'pizza_cruda';
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
          if (held.type === 'pizza_con_salsa' && temp.type === 'queso_picado') {
            station.heldItem = { ...temp, type: 'pizza_cruda' };
            chef.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }

          // If chef holds standard clean plate and countertop has food prepared
          if (held.type === 'plato_limpio' && canCombineOnPlate(held, temp.type)) {
            if (!canChefHandleItem(chef.id, temp.type)) {
              sounds.playFail();
              showRestrictedFeedback(chef, temp.type);
              return;
            }

            // Check "Receta del Futuro" (id 40)
            const heldContents = held.contents || [];
            const isBurgerPlate = heldContents.includes('pan_hamburguesa') || heldContents.includes('carne_cocinada');
            const isFutureRecipe = temp.type === 'salsa_tomate' || temp.type === 'pasta_seca' || temp.type === 'pasta_cocida';
            if (isBurgerPlate && isFutureRecipe) {
              onUnlockAchievement?.(40);
            }

            held.contents = held.contents || [];
            held.contents.push(temp.type);
            station.heldItem = null;
            sounds.playSelect();
            pushStationUpdate(station);
            return;
          }
        }

        // Just regular setting down or swapping
        if (temp) {
          if (!canChefHandleItem(chef.id, temp.type)) {
            sounds.playFail();
            showRestrictedFeedback(chef, temp.type);
            return;
          }
        }

        // Trigger "Plato Volador" (id 28) - dropped a plate on empty countertop
        if (held && held.type === 'plato_limpio' && !temp) {
          onUnlockAchievement?.(28);
        }

        // Trigger "La Regla de los 5 Segundos" (id 7) - picked up a clean plate or prepared food from a countertop
        if (!held && temp && (temp.type === 'plato_limpio' || temp.type !== 'plato_sucio')) {
          onUnlockAchievement?.(7);
        }

        station.heldItem = held;
        chef.heldItem = temp;
        sounds.playSelect();
      } else if (station.type === 'chopping_board') {
        // Can deposit to chop
        const temp = station.heldItem;
        if (held && !temp) {
          // Only raw veggies can go on chop board
          if (held.type === 'tomate' || held.type === 'lechuga' || held.type === 'queso') {
            station.heldItem = held;
            chef.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          }
        } else if (!held && temp) {
          // Carry chopped or unchopped item
          if (!canChefHandleItem(chef.id, temp.type)) {
            sounds.playFail();
            showRestrictedFeedback(chef, temp.type);
            return;
          }
          chef.heldItem = temp;
          station.heldItem = null;
          station.progress = 0;
          sounds.playSelect();
        } else if (held && held.type === 'plato_limpio' && temp) {
          // Scoop off cutting board directly with a plate!
          if (canCombineOnPlate(held, temp.type)) {
            if (!canChefHandleItem(chef.id, temp.type)) {
              sounds.playFail();
              showRestrictedFeedback(chef, temp.type);
              return;
            }
            held.contents = held.contents || [];
            held.contents.push(temp.type);
            station.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          }
        }
      } else if (station.type === 'grill' || station.type === 'stove_pot') {
        const temp = station.heldItem;
        if (held && !temp) {
          // Check fit
          if (station.type === 'grill' && held.type === 'carne_cruda') {
            station.heldItem = held;
            chef.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          } else if (station.type === 'stove_pot' && held.type === 'pasta_seca') {
            station.heldItem = held;
            chef.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          } else {
            // Trigger "El Alquimista" (id 32) - incompatible item on stove/grill
            onUnlockAchievement?.(32);
            sounds.playFail();
          }
        } else if (!held && temp) {
          if (!canChefHandleItem(chef.id, temp.type)) {
            sounds.playFail();
            showRestrictedFeedback(chef, temp.type);
            return;
          }
          chef.heldItem = temp;
          station.heldItem = null;
          station.progress = 0;
          sounds.playSelect();
        } else if (held && held.type === 'plato_limpio' && temp) {
          // Plate scoop straight off a hot cooker table! Super useful
          if (temp.type === 'carne_cocinada' || temp.type === 'pasta_cocida') {
            if (!canChefHandleItem(chef.id, temp.type)) {
              sounds.playFail();
              showRestrictedFeedback(chef, temp.type);
              return;
            }
            held.contents = held.contents || [];
            held.contents.push(temp.type);
            station.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          }
        }
      } else if (station.type === 'oven') {
        const temp = station.heldItem;
        if (held && !temp) {
          // Only pizza_cruda can go in oven (must assemble masa_estirada + queso first)
          if (held.type === 'pizza_cruda') {
            station.heldItem = held;
            chef.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          } else {
            // Trigger "El Alquimista" (id 32) - incompatible item in Oven
            onUnlockAchievement?.(32);
            sounds.playFail();
          }
        } else if (!held && temp) {
          if (!canChefHandleItem(chef.id, temp.type)) {
            sounds.playFail();
            showRestrictedFeedback(chef, temp.type);
            return;
          }
          chef.heldItem = temp;
          station.heldItem = null;
          station.progress = 0;
          sounds.playSelect();
        } else if (held && held.type === 'plato_limpio' && temp) {
          if (temp.type === 'pizza_horneada') {
            if (!canChefHandleItem(chef.id, temp.type)) {
              sounds.playFail();
              showRestrictedFeedback(chef, temp.type);
              return;
            }
            held.contents = held.contents || [];
            held.contents.push(temp.type);
            station.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          }
        }
      } else if (station.type === 'sink') {
        const temp = station.heldItem;
        if (held && !temp) {
          if (held.type === 'plato_sucio') {
            station.heldItem = held;
            chef.heldItem = null;
            station.progress = 0;
            sounds.playSelect();
          }
        } else if (!held && temp) {
          chef.heldItem = temp;
          station.heldItem = null;
          station.progress = 0;
          sounds.playSelect();
        }
      } else if (station.type === 'delivery') {
        if (held) {
          if (gameMode === 'ONLINE') {
            if (isHost) {
              handleDelivery(held);
              chef.heldItem = null;
              pushAuthoritativeGameState(true);
            } else {
              // Remote client puts plate on the delivery window for the Host to process authoritatively
              station.heldItem = held;
              chef.heldItem = null;
            }
          } else {
            handleDelivery(held);
            chef.heldItem = null;
          }
        }
      }
      if (station) {
        pushStationUpdate(station);
      }
    }

    if (gameMode === 'ONLINE') {
      const localChef = myRoleNumRef.current === 1 ? p1Ref.current :
                        myRoleNumRef.current === 2 ? p2Ref.current :
                        myRoleNumRef.current === 3 ? p3Ref.current :
                        p4Ref.current;
      if (chef === localChef) {
        syncMyPlayerState(true);
      }
    }
  };

  // Determine if ingredient fits clean plate recipes
  const canCombineOnPlate = (plate: HeldItem, item: ItemType): boolean => {
    // Only ready toppings can go on a plate
    if (item === 'carne_cruda' || item === 'pasta_seca' || item === 'tomate' || item === 'lechuga' || item === 'queso' || item === 'masa') {
      return false;
    }
    const contents = plate.contents || [];
    // Can't hold exact duplicates that violate recipe definitions
    if (contents.includes(item)) return false;
    return true;
  };

  // Submits a plate to see if it matches orders
  const handleDelivery = (plate: HeldItem) => {
    // Check "Plato de la Casa" (id 38) - trying to deliver empty or dirty plates
    if (plate.type === 'plato_sucio' || (plate.type === 'plato_limpio' && (!plate.contents || plate.contents.length === 0))) {
      onUnlockAchievement?.(38);
    }

    // Make sure we are holding plate
    if (plate.type !== 'plato_limpio' || !plate.contents) {
      sounds.playFail();
      createScoreText('¡Lleva un plato!', TILE_SIZE * 5, TILE_SIZE * 5, '#EF4444');
      return;
    }

    const items = plate.contents;
    // Walk orders to see if we match requirements
    let matchIdx = -1;

    for (let i = 0; i < ordersRef.current.length; i++) {
      const order = ordersRef.current[i];
      // Check if exact elements match
      const reqs = order.requiredItems;
      
      // Let's compare array contents symmetrically
      if (items.length === reqs.length) {
        const sortedItems = [...items].sort();
        const sortedReqs = [...reqs].sort();
        
        // Symmetrical element check
        const match = sortedItems.every((val, idx) => val === sortedReqs[idx]);
        if (match) {
          matchIdx = i;
          break;
        }
      }
    }

    if (matchIdx !== -1) {
      // SUCCESSFUL ORDER!
      const orderCompleted = ordersRef.current[matchIdx];
      
      // Real-time achievement unlocks:
      // Hamburguesa Real (id 9)
      if (orderCompleted.recipeId === 'burger_deluxe') {
        onUnlockAchievement?.(9);
      }
      
      // Banquete de Pasta (id 12)
      if (orderCompleted.recipeId === 'pasta_marinara' || orderCompleted.recipeId === 'pasta_cheese') {
        pastaDeliveredCountRef.current++;
        if (pastaDeliveredCountRef.current >= 3) {
          onUnlockAchievement?.(12);
        }
      }
      
      // Pizza Master (id 13)
      if (orderCompleted.recipeId === 'pizza_margherita') {
        onUnlockAchievement?.(13);
      }
      
      // Cocina Relámpago (id 18) - deliver within first 15s of level start
      const timeUsed = effectiveTimeLimit - gameTimeRef.current;
      if (timeUsed <= 15) {
        onUnlockAchievement?.(18);
      }
      
      // El Toque de Sal (id 21) - 5 successfully delivered dishes
      deliveryCountRef.current++;
      if (deliveryCountRef.current >= 5) {
        onUnlockAchievement?.(21);
      }
      
      // La Receta del Día (id 25) - deliver order with 3+ ingredients
      if (orderCompleted.requiredItems.length >= 3) {
        onUnlockAchievement?.(25);
      }
      
      // Mente Fría (id 27) - deliver with screen full of orders (3 active orders)
      if (ordersRef.current.length >= 3) {
        onUnlockAchievement?.(27);
      }
      
      // Sabor Rústico (id 42) - oven pizza in level 3
      if (level.id === 3 && orderCompleted.recipeId === 'pizza_margherita') {
        onUnlockAchievement?.(42);
      }
      
      // Servicio Express (id 44) - deliver in top third of order time bar
      if (orderCompleted.timeLeft >= (orderCompleted.maxTime * 2 / 3)) {
        onUnlockAchievement?.(44);
      }
      
      // Fiebre del Delivery (id 49) - 5 successful deliveries streak
      deliveryStreakRef.current++;
      if (deliveryStreakRef.current >= 5) {
        onUnlockAchievement?.(49);
      }

      // Points calculation
      const bonus = Math.floor((orderCompleted.timeLeft / orderCompleted.maxTime) * 15);
      const basePoints = orderCompleted.reward + bonus;
      const points = Math.round(basePoints * diffMods.scoreMult);
      
      scoreRef.current += points;
      setScore(scoreRef.current);
      
      // Audio ding
      sounds.playDing();

      // Confetti burst
      const midX = TILE_SIZE * 2;
      const midY = TILE_SIZE * 6;
      createDeliveryConfetti(midX, midY);

      // Label indicator
      createScoreText(`+${points} pts`, midX, midY - 30, '#10B981');

      // Remove from active list
      ordersRef.current.splice(matchIdx, 1);
      setActiveOrders([...ordersRef.current]);

      // Recycle: return plato_sucio to an empty countertop, or close to sink!
      recycleDirtyPlate();
      
      pushAuthoritativeGameState(true);
    } else {
      // FAILED DELIVERY - wrong ingredients
      sounds.playFail();
      scoreRef.current = Math.max(0, scoreRef.current - 15);
      setScore(scoreRef.current);

      createScoreText('-15 pts - Incorrecto!', TILE_SIZE * 2, TILE_SIZE * 5, '#EF4444');

      // Reset delivery streak and track level order failure
      deliveryStreakRef.current = 0;
      didFailAnyOrderRef.current = true;
      
      pushAuthoritativeGameState(true);
    }
  };

  // Puts plato_sucio back in kitchen
  const recycleDirtyPlate = () => {
    // Try to find a sink counter first, otherwise look for empty counters
    let found = false;
    
    // Check if a sink is empty
    for (const station of stationsRef.current) {
      if (station.type === 'sink' && !station.heldItem) {
        station.heldItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'plato_sucio'
        };
        station.progress = 0;
        found = true;
        pushStationUpdate(station);
        break;
      }
    }

    // Otherwise place on any standard empty counter
    if (!found) {
      for (const station of stationsRef.current) {
        if (station.type === 'counter' && !station.heldItem) {
          station.heldItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'plato_sucio'
          };
          found = true;
          pushStationUpdate(station);
          break;
        }
      }
    }
  };

  // Particle Generators
  const spawnParticle = (x: number, y: number, vx: number, vy: number, color: string, size = 6, type: GameParticle['type'] = 'smoke') => {
    particlesRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      vx,
      vy,
      color,
      size,
      alpha: 1,
      life: 0,
      maxLife: 30 + Math.random() * 20,
      type
    });
  };

  const createDeliveryConfetti = (x: number, y: number) => {
    const colors = ['#FFC107', '#4CAF50', '#2196F3', '#FF5722', '#E91E63', '#9C27B0'];
    for (let i = 0; i < 35; i++) {
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        type: 'confetti'
      });
    }
  };

  const scoreLabels = useRef<{ text: string; x: number; y: number; alpha: number; color: string; life: number }[]>([]);
  const createScoreText = (text: string, x: number, y: number, color = '#10B981') => {
    scoreLabels.current.push({
      text,
      x,
      y,
      alpha: 1,
      color,
      life: 50
    });
  };

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

  // Poll for connected gamepads and drive virtual mouse cursor joystick in PAUSED mode
  useEffect(() => {
    if (!isPaused) {
      setCursorVisible(false);
      cursorVisibleRef.current = false;
      return;
    }

    let animFrameId: number;

    const checkPausedGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let foundActive = false;
      let activeGp: Gamepad | null = null;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          activeGp = gp;
          foundActive = true;
          break;
        }
      }

      if (!foundActive) {
        setCursorVisible(false);
        cursorVisibleRef.current = false;
      }

      // Handle Virtual Mouse Pointer Navigation with Joystick if active gamepad exists and game is paused
      if (foundActive && activeGp && isPaused) {
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

        // 3. Resume / Unpause with Button 1 (B/Circle)
        const btn1 = activeGp.buttons[1]?.pressed || false;
        if (btn1 && !prevButtonsRef.current[1]) {
          sounds.playSelect();
          setIsPaused(false);
        }
        prevButtonsRef.current[1] = btn1;

        // 4. Tab switching with bumpers (LB / RB)
        const btn4 = activeGp.buttons[4]?.pressed || false;
        const btn5 = activeGp.buttons[5]?.pressed || false;

        if (btn4 && !prevButtonsRef.current[4]) {
          sounds.playSelect();
          setSettingsTab('sound');
        }
        prevButtonsRef.current[4] = btn4;

        if (btn5 && !prevButtonsRef.current[5]) {
          sounds.playSelect();
          setSettingsTab('actions');
        }
        prevButtonsRef.current[5] = btn5;
      }

      animFrameId = requestAnimationFrame(checkPausedGamepads);
    };

    animFrameId = requestAnimationFrame(checkPausedGamepads);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isPaused]);

  // Main game ticks loop
  useEffect(() => {
    if (countdown > 0 || isPaused || isGameOver) return;

    let animFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      
      // Target roughly 60fps (16ms)
      if (elapsed > 16) {
        updatePhysics();
        updateLevelTimer(elapsed / 1000);
        updateStationsAndOvens();
        updateParticles();
        drawKitchen();
        lastTimeRef.current = timestamp;
      }
      
      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [countdown, isPaused, isGameOver]);

  const updateLevelTimer = (deltaSecs: number) => {
    gameTimeRef.current -= deltaSecs;
    if (gameTimeRef.current <= 0) {
      gameTimeRef.current = 0;
      setIsGameOver(true);
      sounds.playWinFanfare();
      
      // Calculate star thresholds to complete
      const finalStars =
        scoreRef.current >= Math.round(level.targetScoreStars[2] * diffMods.scoreMult)
          ? 3
          : scoreRef.current >= Math.round(level.targetScoreStars[1] * diffMods.scoreMult)
          ? 2
          : scoreRef.current >= Math.round(level.targetScoreStars[0] * diffMods.scoreMult)
          ? 1
          : 0;

      // End of level real-time achievement checks:
      if (scoreRef.current > 0) {
        // Turno Nocturno (id 19) - complete any level successfully
        onUnlockAchievement?.(19);

        // ¡No Se Tira Nada! (id 23) - complete level without trashing
        if (!wasTrashUsedRef.current) {
          onUnlockAchievement?.(23);
        }

        // Fuego Bajo Control (id 24) - complete level without burning anything
        if (!didBurnAnythingRef.current) {
          onUnlockAchievement?.(24);
        }

        // Limpieza Extrema (id 22) - no dirty plates left in the kitchen
        const hasDirtyPlates = stationsRef.current.some(s => s.heldItem?.type === 'plato_sucio');
        if (!hasDirtyPlates) {
          onUnlockAchievement?.(22);
        }

        // Organización Perfecta (id 48) - complete level with 0 failed/expired orders
        if (!didFailAnyOrderRef.current) {
          onUnlockAchievement?.(48);
        }

        // Orden en la Sala (id 36) - all preparation countertops empty
        const hasItemsOnCounters = stationsRef.current.some(s => s.type === 'counter' && s.heldItem !== null);
        if (!hasItemsOnCounters) {
          onUnlockAchievement?.(36);
        }

        // Olor a Carbón (id 35) - complete level with burnt meat left on any cooker/counter
        const hasBurntMeat = stationsRef.current.some(s => s.heldItem?.type === 'carne_quemada');
        if (hasBurntMeat) {
          onUnlockAchievement?.(35);
        }
      }

      onLevelComplete(scoreRef.current, finalStars);
    }
    setTimeRemaining(gameTimeRef.current);

    // Spawn new orders periodically
    orderSpawnCounter.current += deltaSecs;
    if (orderSpawnCounter.current > diffMods.orderSpawnTime && ordersRef.current.length < 3) {
      orderSpawnCounter.current = 0;
      spawnNewOrder();
    }

    // Tick active order countdowns
    ordersRef.current.forEach((order, idx) => {
      order.timeLeft -= deltaSecs;
    });

    // Check failed orders (timer hits zero)
    const activeLength = ordersRef.current.length;
    ordersRef.current = ordersRef.current.filter((order) => {
      if (order.timeLeft <= 0) {
        sounds.playFail();
        scoreRef.current = Math.max(0, scoreRef.current - 10);
        setScore(scoreRef.current);
        createScoreText('-10 pts Expíró!', TILE_SIZE * 5, 100, '#EF4444');

        // Trigger "El Tiempo es Oro" (id 10) - first order failed due to time limits
        onUnlockAchievement?.(10);

        // Reset streak and track level order failure
        deliveryStreakRef.current = 0;
        didFailAnyOrderRef.current = true;

        return false;
      }
      return true;
    });

    if (ordersRef.current.length !== activeLength) {
      setActiveOrders([...ordersRef.current]);
    }

    // Real-time Chef Modelo (id 39) - quiet for 10 seconds check
    if (Date.now() - lastActionTimeRef.current >= 10000) {
      onUnlockAchievement?.(39);
    }

    // Real-time Torre de Platos (id 29) - 3 dirty plates in the kitchen simultaneously
    const dirtyPlatesCount = stationsRef.current.filter(s => s.heldItem?.type === 'plato_sucio').length +
      (p1Ref.current.heldItem?.type === 'plato_sucio' ? 1 : 0) +
      (p2Ref.current.heldItem?.type === 'plato_sucio' ? 1 : 0);
    if (dirtyPlatesCount >= 3) {
      onUnlockAchievement?.(29);
    }

    pushAuthoritativeGameState();
  };

  const updatePhysics = () => {
    // Process input keys for speed
    const applyMovementForce = (chef: Chef, inputs: { up: boolean; down: boolean; left: boolean; right: boolean }) => {
      // Standard run speed factor
      const speed = 2.85;
      
      let moveX = 0;
      let moveY = 0;
      
      if (inputs.up) moveY = -1;
      if (inputs.down) moveY = 1;
      if (inputs.left) moveX = -1;
      if (inputs.right) moveX = 1;

      // Normalize diagonal vectors
      if (moveX !== 0 && moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= len;
        moveY /= len;
      }

      // Add gradual slide velocity
      if (moveX !== 0 || moveY !== 0) {
        chef.vx += moveX * 0.97;
        chef.vy += moveY * 0.97;
        chef.angle = Math.atan2(moveY, moveX);
        chef.animFrame = (chef.animFrame + 0.15) % 4;
      } else {
        chef.vx *= 0.5;
        chef.vy *= 0.5;
      }

      // Cap horizontal drag velocities
      const maxSpeed = 3.5;
      const currentSpeed = Math.sqrt(chef.vx * chef.vx + chef.vy * chef.vy);
      if (currentSpeed > maxSpeed) {
        // Only cap back slowly to allow high dash speeds
        chef.vx = (chef.vx / currentSpeed) * (currentSpeed * 0.88);
        chef.vy = (chef.vy / currentSpeed) * (currentSpeed * 0.88);
      }
    };

    // Read gamepads if available for native controller support
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp0 = gamepads[0];
    const gp1 = gamepads[1];
    const gp0Connected = !!(gp0 && gp0.connected);
    const gp1Connected = !!(gp1 && gp1.connected);

    let gp0Inputs = { up: false, down: false, left: false, right: false };
    let gp1Inputs = { up: false, down: false, left: false, right: false };

    // Threshold/deadzone for analog sticks
    const deadzone = 0.25;

    if (gp0Connected && gp0) {
      const ax = gp0.axes[0];
      const ay = gp0.axes[1];
      const dpadUp = gp0.buttons[12]?.pressed;
      const dpadDown = gp0.buttons[13]?.pressed;
      const dpadLeft = gp0.buttons[14]?.pressed;
      const dpadRight = gp0.buttons[15]?.pressed;

      gp0Inputs = {
        up: ay < -deadzone || dpadUp || false,
        down: ay > deadzone || dpadDown || false,
        left: ax < -deadzone || dpadLeft || false,
        right: ax > deadzone || dpadRight || false,
      };
    }

    if (gp1Connected && gp1) {
      const ax = gp1.axes[0];
      const ay = gp1.axes[1];
      const dpadUp = gp1.buttons[12]?.pressed;
      const dpadDown = gp1.buttons[13]?.pressed;
      const dpadLeft = gp1.buttons[14]?.pressed;
      const dpadRight = gp1.buttons[15]?.pressed;

      gp1Inputs = {
        up: ay < -deadzone || dpadUp || false,
        down: ay > deadzone || dpadDown || false,
        left: ax < -deadzone || dpadLeft || false,
        right: ax > deadzone || dpadRight || false,
      };
    }

    let gp0ActionHeld = false;
    let gp1ActionHeld = false;

    const processGamepadButtons = (gp: Gamepad, gpIdx: number, chef: Chef) => {
      if (!prevGamepadButtonsRef.current[gpIdx]) {
        prevGamepadButtonsRef.current[gpIdx] = {};
      }
      const prev = prevGamepadButtonsRef.current[gpIdx];

      // Button 0 (A/Cross): GRAB / INTERACT (Trigger on down)
      const btn0Pressed = gp.buttons[0]?.pressed || false;
      if (btn0Pressed && !prev[0]) {
        if (countdown === 0 && !isPaused && !isGameOver) {
          handleChefAction(chef, 'GRAB');
        }
      }
      prev[0] = btn0Pressed;

      // Button 1 (B/Circle): DASH (Trigger on down)
      const btn1Pressed = gp.buttons[1]?.pressed || false;
      if (btn1Pressed && !prev[1]) {
        if (countdown === 0 && !isPaused && !isGameOver) {
          handleChefAction(chef, 'DASH');
        }
      }
      prev[1] = btn1Pressed;

      // Button 2 (X/Square): Action held (chopping/washing)
      const btn2Pressed = gp.buttons[2]?.pressed || false;

      // Button 9 (Select/Options) or 8 (Start): Pause game (Trigger on down)
      const btn9Pressed = (gp.buttons[8]?.pressed || gp.buttons[9]?.pressed) || false;
      if (btn9Pressed && !prev[9]) {
        if (countdown === 0 && !isGameOver) {
          setIsPaused(p => !p);
          sounds.playSelect();
        }
      }
      prev[9] = btn9Pressed;

      return {
        actionHeld: btn2Pressed
      };
    };

    if (gp0Connected && gp0) {
      if (gameMode === 'ONLINE') {
        const res = processGamepadButtons(gp0, 0, getLocalChef());
        gp0ActionHeld = res.actionHeld;
      } else if (gameMode === 'COOP') {
        const res = processGamepadButtons(gp0, 0, p1Ref.current);
        gp0ActionHeld = res.actionHeld;
      } else {
        // Solo mode: Gamepad 0 controls p1
        const res = processGamepadButtons(gp0, 0, p1Ref.current);
        gp0ActionHeld = res.actionHeld;
      }
    }

    if (gp1Connected && gp1 && gameMode === 'COOP') {
      const res = processGamepadButtons(gp1, 1, p2Ref.current);
      gp1ActionHeld = res.actionHeld;
    }

    gp0ActionHeldRef.current = gp0ActionHeld;
    gp1ActionHeldRef.current = gp1ActionHeld;

    // Keyboard bindings list
    // Chef 1 standard list: WASD
    const p1Inputs = {
      up: keysPressed.current['w'] || keysPressed.current['W'] || (gp0Connected && gp0Inputs.up),
      down: keysPressed.current['s'] || keysPressed.current['S'] || (gp0Connected && gp0Inputs.down),
      left: keysPressed.current['a'] || keysPressed.current['A'] || (gp0Connected && gp0Inputs.left),
      right: keysPressed.current['d'] || keysPressed.current['D'] || (gp0Connected && gp0Inputs.right)
    };

    // Chef 2 standard list: Arrows
    const p2Inputs = {
      up: keysPressed.current['arrowup'] || (gp1Connected && gp1Inputs.up),
      down: keysPressed.current['arrowdown'] || (gp1Connected && gp1Inputs.down),
      left: keysPressed.current['arrowleft'] || (gp1Connected && gp1Inputs.left),
      right: keysPressed.current['arrowright'] || (gp1Connected && gp1Inputs.right)
    };

    const isAnyMoveKeyPressed = 
      p1Inputs.up || p1Inputs.down || p1Inputs.left || p1Inputs.right ||
      p2Inputs.up || p2Inputs.down || p2Inputs.left || p2Inputs.right;

    if (isAnyMoveKeyPressed) {
      lastActionTimeRef.current = Date.now();
    }

    // Apply movement according to gameMode constraints
    if (gameMode === 'ONLINE') {
      const onlineLocalInputs = {
        up: keysPressed.current['w'] || keysPressed.current['W'] || keysPressed.current['arrowup'] || (gp0Connected && gp0Inputs.up),
        down: keysPressed.current['s'] || keysPressed.current['S'] || keysPressed.current['arrowdown'] || (gp0Connected && gp0Inputs.down),
        left: keysPressed.current['a'] || keysPressed.current['A'] || keysPressed.current['arrowleft'] || (gp0Connected && gp0Inputs.left),
        right: keysPressed.current['d'] || keysPressed.current['D'] || keysPressed.current['arrowright'] || (gp0Connected && gp0Inputs.right)
      };
      
      // Save local inputs to ref for the outgoing sync interval tick
      myInputsRef.current = onlineLocalInputs;

      // Move local chef on this client
      const localChef = myRoleNumRef.current === 1 ? p1Ref.current :
                        myRoleNumRef.current === 2 ? p2Ref.current :
                        myRoleNumRef.current === 3 ? p3Ref.current :
                        p4Ref.current;
      applyMovementForce(localChef, onlineLocalInputs);

      // Force vx and vy to 0 for other chefs to avoid runaways
      const allChefs = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current];
      allChefs.forEach((c, idx) => {
        if (idx + 1 !== myRoleNumRef.current) {
          c.vx = 0;
          c.vy = 0;
        }
      });
    } else if (gameMode === 'COOP') {
      applyMovementForce(p1Ref.current, p1Inputs);
      applyMovementForce(p2Ref.current, p2Inputs);
    } else {
      // Solo Mode: Keyboard input and/or Gamepad 0 moves p1; p2 stays still
      const soloActiveInputs = {
        up: p1Inputs.up || keysPressed.current['arrowup'],
        down: p1Inputs.down || keysPressed.current['arrowdown'],
        left: p1Inputs.left || keysPressed.current['arrowleft'],
        right: p1Inputs.right || keysPressed.current['arrowright'],
      };

      applyMovementForce(p1Ref.current, soloActiveInputs);
      p2Ref.current.vx = 0;
      p2Ref.current.vy = 0;
    }

    // Slide resolve function for both Chefs
    const moveChefWithCollision = (chef: Chef) => {
      let nextX = chef.x + chef.vx;
      let nextY = chef.y + chef.vy;

      // Dynamic collision limits against grid size (increased padding from 25 to 32)
      const maxLimitX = level.gridWidth * TILE_SIZE - 32;
      const maxLimitY = level.gridHeight * TILE_SIZE - 32;
      nextX = Math.max(32, Math.min(nextX, maxLimitX));
      nextY = Math.max(32, Math.min(nextY, maxLimitY));

      const resolved = resolveCircularAABBCollision(nextX, nextY, 28);
      chef.x = resolved.x;
      chef.y = resolved.y;
    };

    if (gameMode === 'ONLINE') {
      // Run local collision for our local chef
      const localChef = myRoleNumRef.current === 1 ? p1Ref.current :
                        myRoleNumRef.current === 2 ? p2Ref.current :
                        myRoleNumRef.current === 3 ? p3Ref.current :
                        p4Ref.current;
      moveChefWithCollision(localChef);

      // Interpolate other remote chefs towards their targets received from playersState
      const activeRoles = getActiveRoles();

      const allChefs = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current];
      allChefs.forEach((c, idx) => {
        const roleNum = idx + 1;
        if (roleNum !== myRoleNumRef.current) {
          if (activeRoles.includes(roleNum)) {
            const targetX = (c as any).targetX;
            const targetY = (c as any).targetY;
            if (targetX !== undefined && targetY !== undefined) {
              const dx = targetX - c.x;
              const dy = targetY - c.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0.5) {
                c.animFrame = (c.animFrame + 0.135) % 4;
                // High responsiveness real-time interpolation factor
                const lerpFactor = dist > 100 ? 0.95 : dist > 40 ? 0.75 : 0.55;
                c.x += dx * lerpFactor;
                c.y += dy * lerpFactor;
              } else {
                c.x = targetX;
                c.y = targetY;
              }
            }

            // Smoothly interpolate angle using shortest angular path to prevent character direction deforming
            const targetAngle = (c as any).targetAngle;
            if (targetAngle !== undefined) {
              let diff = targetAngle - c.angle;
              // Normalize difference to [-Math.PI, Math.PI] to choose the shortest rotation path
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;
              c.angle += diff * 0.55;
            }
          } else {
            // Position inactive chef offscreen so colliders and interaction prompts are disabled
            c.x = -9999;
            c.y = -9999;
          }
        }
      });
    } else {
      moveChefWithCollision(p1Ref.current);
      moveChefWithCollision(p2Ref.current);
      p3Ref.current.x = -9999;
      p3Ref.current.y = -9999;
      p4Ref.current.x = -9999;
      p4Ref.current.y = -9999;
    }

    if (gameMode === 'ONLINE') {
      const myChef = myRoleNumRef.current === 1 ? p1Ref.current :
                     myRoleNumRef.current === 2 ? p2Ref.current :
                     myRoleNumRef.current === 3 ? p3Ref.current :
                     p4Ref.current;
      const playersList = onlinePlayersRef.current.length > 0 ? onlinePlayersRef.current : Object.values(roomDataRef.current?.players || {});
      const activeRoles = playersList.map((p: any) => p.roleNum);
      const otherChefs = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current].filter((c, idx) => {
        const roleNum = idx + 1;
        return roleNum !== myRoleNumRef.current && activeRoles.includes(roleNum);
      });
      otherChefs.forEach((other) => {
        const distChef = Math.hypot(myChef.x - other.x, myChef.y - other.y);
        if (distChef < 48) {
          const overlap = 48 - distChef;
          const angle = Math.atan2(other.y - myChef.y, other.x - myChef.x);
          const mySpeed = Math.hypot(myChef.vx, myChef.vy);
          const otherSpeed = Math.hypot(other.vx, other.vy);
          const knockForce = overlap * 0.6;
          if (mySpeed >= otherSpeed) {
            // Local chef is faster — push other back
            other.x += Math.cos(angle) * knockForce;
            other.y += Math.sin(angle) * knockForce;
            other.vx += Math.cos(angle) * (mySpeed * 0.5);
            other.vy += Math.sin(angle) * (mySpeed * 0.5);
          } else {
            // Remote chef is faster — push local back
            myChef.x -= Math.cos(angle) * knockForce;
            myChef.y -= Math.sin(angle) * knockForce;
            myChef.vx -= Math.cos(angle) * (otherSpeed * 0.5);
            myChef.vy -= Math.sin(angle) * (otherSpeed * 0.5);
          }
        }
      });
    } else if (gameMode === 'COOP') {
      // Collision check between P1 and P2 — faster chef keeps going, slower gets knocked back
      const distChef = Math.hypot(p1Ref.current.x - p2Ref.current.x, p1Ref.current.y - p2Ref.current.y);
      if (distChef < 48) {
        const overlap = 48 - distChef;
        const angle = Math.atan2(p2Ref.current.y - p1Ref.current.y, p2Ref.current.x - p1Ref.current.x);
        const speed1 = Math.hypot(p1Ref.current.vx, p1Ref.current.vy);
        const speed2 = Math.hypot(p2Ref.current.vx, p2Ref.current.vy);
        const knockForce = overlap * 0.6;
        if (speed1 >= speed2) {
          // P1 is faster — P2 gets knocked back
          p2Ref.current.x += Math.cos(angle) * knockForce;
          p2Ref.current.y += Math.sin(angle) * knockForce;
          p2Ref.current.vx += Math.cos(angle) * (speed1 * 0.5);
          p2Ref.current.vy += Math.sin(angle) * (speed1 * 0.5);
        } else {
          // P2 is faster — P1 gets knocked back
          p1Ref.current.x -= Math.cos(angle) * knockForce;
          p1Ref.current.y -= Math.sin(angle) * knockForce;
          p1Ref.current.vx -= Math.cos(angle) * (speed2 * 0.5);
          p1Ref.current.vy -= Math.sin(angle) * (speed2 * 0.5);
        }
      }
    } else {
      // Solo Mode: no collision between active chef and inactive static chef
    }

    if (gameMode === 'ONLINE') {
      syncMyPlayerState(false);
    }
  };

  // Check collision against all block stations (non-floor)
  const resolveCircularAABBCollision = (cx: number, cy: number, radius = 28) => {
    let px = cx;
    let py = cy;

    const width = level.gridWidth;
    const height = level.gridHeight;

    for (const station of stationsRef.current) {
      // Do not collide with inaccessible stations/counters (avoids invisible bumps/walls)
      if (!isTileAccessible(station.gridX, station.gridY)) {
        continue;
      }

      const sx = station.gridX * TILE_SIZE;
      const sy = station.gridY * TILE_SIZE;

      // Closest point on rectangular tile to circular chef center
      const closestX = Math.max(sx, Math.min(px, sx + TILE_SIZE));
      const closestY = Math.max(sy, Math.min(py, sy + TILE_SIZE));

      const dx = px - closestX;
      const dy = py - closestY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius && dist > 0.001) {
        // Collided! Push away smoothly
        const overlap = radius - dist;
        px += (dx / dist) * overlap;
        py += (dy / dist) * overlap;
      }
    }
    return { x: px, y: py };
  };

  // Chop progression and Stove fry intervals simulation logic
  const updateStationsAndOvens = () => {
    const handleStationProcessing = (chef: Chef, actionKeyHeld: boolean) => {
      // Find what station chef is facing
      const dx = Math.cos(chef.angle);
      const dy = Math.sin(chef.angle);
      const gridX = Math.floor((chef.x + dx * INTERACT_DIST) / TILE_SIZE);
      const gridY = Math.floor((chef.y + dy * INTERACT_DIST) / TILE_SIZE);

      const target = stationsRef.current.find(
        (s) => s.gridX === gridX && s.gridY === gridY
      );

      if (!target) {
        chef.isChopping = false;
        chef.isWashing = false;
        return;
      }

      if (actionKeyHeld) {
        if ((target.type === 'counter' && target.heldItem?.type === 'masa') && target.heldItem) {
          const item = target.heldItem;
          if (!canChefHandleItem(chef.id, item.type)) {
            return;
          }
          // Knead masa on counter using grab animation
          if (item.type === 'masa') {
            chef.takeAnimTimer = 0.75;
            target.progress += 1.4 * diffMods.chopWashSpeed;
            
            if (gameMode === 'ONLINE') {
              const prev = target.lastSyncedProgress || 0;
              if (Math.abs(target.progress - prev) >= 4) {
                target.lastSyncedProgress = target.progress;
                pushStationUpdate(target);
              }
            }

            // Periodical Chop sound
            if (Math.floor(target.progress) % 18 === 0) {
              sounds.playChop();
            }

            // Slice splash particle
            spawnParticle(
              target.gridX * TILE_SIZE + 30,
              target.gridY * TILE_SIZE + 30,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              item.type === 'tomate' ? '#EF4444' : item.type === 'lechuga' ? '#10B981' : '#FBBF24',
              3,
              'bubble'
            );

            if (target.progress >= 100) {
              target.progress = 0;
              
              // Mutate item
              if (item.type === 'masa') {
                item.type = 'masa_estirada';
              }
              sounds.playDing();

              if (gameMode === 'ONLINE') {
                target.lastSyncedProgress = 0;
                pushStationUpdate(target);
              }
            }
          }
        } else if (target.type === 'chopping_board' && target.heldItem) {
          const item = target.heldItem;
          if (!canChefHandleItem(chef.id, item.type)) {
            chef.isChopping = false;
            return;
          }
          // Only chop raw things
          if (item.type === 'tomate' || item.type === 'lechuga' || item.type === 'queso') {
            chef.isChopping = true;
            chef.animFrame = (chef.animFrame + 0.2) % 4;
            target.progress += 1.4 * diffMods.chopWashSpeed;

            if (gameMode === 'ONLINE') {
              const prev = target.lastSyncedProgress || 0;
              if (Math.abs(target.progress - prev) >= 4) {
                target.lastSyncedProgress = target.progress;
                pushStationUpdate(target);
              }
            }

            if (Math.floor(target.progress) % 18 === 0) {
              sounds.playChop();
            }

            spawnParticle(
              target.gridX * TILE_SIZE + 30,
              target.gridY * TILE_SIZE + 30,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              item.type === 'tomate' ? '#EF4444' : item.type === 'lechuga' ? '#10B981' : '#FBBF24',
              3,
              'bubble'
            );

            if (target.progress >= 100) {
              target.progress = 0;
              chef.isChopping = false;

              chopCountRef.current++;
              if (chopCountRef.current >= 10) {
                onUnlockAchievement?.(17);
              }

              if (item.type === 'tomate') {
                item.type = 'tomate_picado';
                choppedTomatoCountRef.current++;
                if (choppedTomatoCountRef.current >= 4) {
                  onUnlockAchievement?.(14);
                }
              } else if (item.type === 'lechuga') {
                item.type = 'lechuga_picada';
              } else if (item.type === 'queso') {
                item.type = 'queso_picado';
                choppedCheeseCountRef.current++;
                if (choppedCheeseCountRef.current >= 4) {
                  onUnlockAchievement?.(8);
                }
              }
              sounds.playDing();

              if (gameMode === 'ONLINE') {
                target.lastSyncedProgress = 0;
                pushStationUpdate(target);
              }
            }
          }
        } else if (target.type === 'sink' && target.heldItem && target.heldItem.type === 'plato_sucio') {
          chef.isWashing = true;
          chef.animFrame = (chef.animFrame + 0.2) % 4; // Advance washing animation
          target.progress += 1.6 * diffMods.chopWashSpeed; // Wash speed
          
          if (gameMode === 'ONLINE') {
            const prev = target.lastSyncedProgress || 0;
            if (Math.abs(target.progress - prev) >= 4) {
              target.lastSyncedProgress = target.progress;
              pushStationUpdate(target);
            }
          }

          if (Math.floor(target.progress) % 16 === 0) {
            sounds.playSplash();
          }

          // bubble particle
          spawnParticle(
            target.gridX * TILE_SIZE + 30,
            target.gridY * TILE_SIZE + 30,
            (Math.random() - 0.5) * 4,
            -Math.random() * 3,
            '#93C5FD',
            4,
            'bubble'
          );

          if (target.progress >= 100) {
            target.progress = 0;
            chef.isWashing = false;
            // Complete wash
            target.heldItem.type = 'plato_limpio';
            target.heldItem.contents = [];
            sounds.playDing();

            // Trigger Professional Plate Washer (id 6)
            washedDishesCountRef.current++;
            if (washedDishesCountRef.current >= 5) {
              onUnlockAchievement?.(6);
            }

            if (gameMode === 'ONLINE') {
              target.lastSyncedProgress = 0;
              pushStationUpdate(target);
            }
          }
        }
      } else {
        chef.isChopping = false;
        chef.isWashing = false;
      }
    };

    // Extract action key bindings (Keyboard + Gamepad)
    let p1ActionHeld = false;
    let p2ActionHeld = false;
    let p3ActionHeld = false;
    let p4ActionHeld = false;

    if (gameMode === 'ONLINE') {
      const localActionHeld = keysPressed.current['e'] || keysPressed.current[','] || gp0ActionHeldRef.current;
      if (myRoleNumRef.current === 1) p1ActionHeld = localActionHeld;
      else if (myRoleNumRef.current === 2) p2ActionHeld = localActionHeld;
      else if (myRoleNumRef.current === 3) p3ActionHeld = localActionHeld;
      else if (myRoleNumRef.current === 4) p4ActionHeld = localActionHeld;
    } else {
      p1ActionHeld = keysPressed.current['e'] || (gameMode === 'COOP' ? gp0ActionHeldRef.current : gp0ActionHeldRef.current);
      p2ActionHeld = keysPressed.current[','] || (gameMode === 'COOP' ? gp1ActionHeldRef.current : false);
    }

    if (gameMode === 'ONLINE') {
      const myChef = myRoleNumRef.current === 1 ? p1Ref.current :
                     myRoleNumRef.current === 2 ? p2Ref.current :
                     myRoleNumRef.current === 3 ? p3Ref.current :
                     p4Ref.current;
      const myActionHeld = myRoleNumRef.current === 1 ? p1ActionHeld :
                           myRoleNumRef.current === 2 ? p2ActionHeld :
                           myRoleNumRef.current === 3 ? p3ActionHeld :
                           p4ActionHeld;
      handleStationProcessing(myChef, myActionHeld);
    } else if (gameMode === 'COOP') {
      handleStationProcessing(p1Ref.current, p1ActionHeld);
      handleStationProcessing(p2Ref.current, p2ActionHeld);
    } else {
      handleStationProcessing(p1Ref.current, p1ActionHeld);
      p2Ref.current.isChopping = false;
      p2Ref.current.isWashing = false;
    }

    // Cookers tick progress AUTOMATICALLY on placing item (doesn't need key hold)
    // In ONLINE mode, ONLY the Host simulates the cooker progress to prevent drift and double events
    if (gameMode !== 'ONLINE' || isHost) {
      stationsRef.current.forEach((station) => {
        // Stove/Grill automatic baking
        if ((station.type === 'grill' || station.type === 'stove_pot') && station.heldItem) {
          const item = station.heldItem;
          
          // Progress cooking
          if (item.type === 'carne_cruda' || item.type === 'pasta_seca') {
            station.progress += 0.45; // cook rate
            
            if (Math.random() < 0.15) {
              sounds.playSizzle();
              spawnParticle(
                station.gridX * TILE_SIZE + 30 + (Math.random() - 0.5) * 16,
                station.gridY * TILE_SIZE + 20,
                (Math.random() - 0.5) * 1,
                -Math.random() * 2,
                '#FFFFFF',
                4,
                'smoke'
              );
            }

            if (station.progress >= 100) {
              station.progress = 0;
              const wasMeatCruda = item.type === 'carne_cruda';
              item.type = item.type === 'carne_cruda' ? 'carne_cocinada' : 'pasta_cocida';
              sounds.playDing();

              // Trigger "Atracción de Carne" (id 15) - cooked 4 meats in a single game
              if (wasMeatCruda) {
                cookedMeatCountRef.current++;
                if (cookedMeatCountRef.current >= 4) {
                  onUnlockAchievement?.(15);
                }
              }
            }
          } else if (item.type === 'carne_cocinada' || item.type === 'pasta_cocida') {
            // Burn danger overcook
            station.progress += 0.22 * diffMods.burnSpeed; // overcook rate (slower)
            station.isWarning = station.progress > 60;

            if (station.progress > 60 && Math.random() < 0.08) {
              sounds.playWarning();
              spawnParticle(
                station.gridX * TILE_SIZE + 30,
                station.gridY * TILE_SIZE + 10,
                0,
                -Math.random() * 2 - 1,
                '#EF4444',
                7,
                'fire'
              );
            }

            if (station.progress >= 100) {
              station.progress = 0;
              station.isWarning = false;
              item.type = item.type === 'carne_cocinada' ? 'carne_quemada' : 'pasta_quemada';
              sounds.playBurn();

              // Track that something burnt
              didBurnAnythingRef.current = true;
            }
          }
        }

        // Pizza Oven automatic cooking
        if (station.type === 'oven' && station.heldItem) {
          const item = station.heldItem;
          
          if (item.type === 'pizza_cruda') {
            station.progress += 0.35; // bake rate
            
            if (Math.random() < 0.1) {
              spawnParticle(
                station.gridX * TILE_SIZE + 30,
                station.gridY * TILE_SIZE + 25,
                (Math.random() - 0.5) * 1,
                -Math.random() * 2,
                '#F59E0B',
                3.5,
                'spark'
              );
            }

            if (station.progress >= 100) {
              station.progress = 0;
              item.type = 'pizza_horneada';
              sounds.playDing();
            }
          } else if (item.type === 'pizza_horneada') {
            station.progress += 0.18 * diffMods.burnSpeed; // Pizza burning
            station.isWarning = station.progress > 60;

            if (station.progress > 60 && Math.random() < 0.08) {
              sounds.playWarning();
              spawnParticle(
                station.gridX * TILE_SIZE + 30,
                station.gridY * TILE_SIZE + 10,
                0,
                -Math.random() * 2 - 1,
                '#EF4444',
                7,
                'fire'
              );
            }

            if (station.progress >= 100) {
              station.progress = 0;
              station.isWarning = false;
              item.type = 'pizza_quemada';
              sounds.playBurn();

              // Track that something burnt
              didBurnAnythingRef.current = true;
            }
          }
        }

        // Masa Olvidada (id 37) - Left stretched dough on a cutting board for > 30s
        if (station.type === 'chopping_board' && station.heldItem?.type === 'masa_estirada') {
          station.masaTime = (station.masaTime || 0) + (1 / 60); // Roughly 60fps tick rate
          if (station.masaTime >= 30) {
            onUnlockAchievement?.(37);
          }
        } else if (station.type === 'chopping_board') {
          station.masaTime = 0;
        }

        // If Host in ONLINE mode, push automatic station progress updates
        if (gameMode === 'ONLINE' && isHost) {
          const isCooking = (station.type === 'grill' || station.type === 'stove_pot' || station.type === 'oven') && station.heldItem;
          if (isCooking) {
            // Push every 4% progress change, or when progress resets or item cooks (mutation)
            const prevProgress = station.lastSyncedProgress || 0;
            if (station.progress === 0 || Math.abs(station.progress - prevProgress) >= 4) {
              station.lastSyncedProgress = station.progress;
              // FIX: Removed pushStationUpdate to prevent stale updates from overwriting guest pickups
            }
          }
        }
      });
    }

    // Ollas Calientes (id 30) - Have 2 active cooker pots/grills cooking simultaneously
    const activeCookers = stationsRef.current.filter(s => 
      (s.type === 'grill' || s.type === 'stove_pot') && 
      s.heldItem && 
      (s.heldItem.type === 'carne_cruda' || s.heldItem.type === 'pasta_seca')
    ).length;
    if (activeCookers >= 2) {
      onUnlockAchievement?.(30);
    }

    if (gameMode === 'ONLINE') {
      syncMyPlayerState(false);
    }
  };

  // Tick particles mechanics
  const updateParticles = () => {
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      // Decay alphas
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      
      if (p.type === 'smoke') {
        p.vy -= 0.05; // float up
        p.size += 0.15; // puff out
      } else if (p.type === 'fire') {
        p.vy -= 0.1;
        p.vx += (Math.random() - 0.5) * 0.4;
      } else if (p.type === 'bubble') {
        p.vy += 0.02;
      } else if (p.type === 'confetti') {
        p.vy += 0.12; // gravity fall
      } else if (p.type === 'dash') {
        p.vx *= 0.9;
        p.vy *= 0.9;
      }
    });

    particlesRef.current = particlesRef.current.filter(
      (p) => p.life < p.maxLife && p.alpha > 0.01
    );

    // Update floating indicators
    scoreLabels.current.forEach((lbl) => {
      lbl.y -= 0.6;
      lbl.life--;
      lbl.alpha = Math.max(0, lbl.life / 50);
    });

    scoreLabels.current = scoreLabels.current.filter((lbl) => lbl.life > 0);
  };

  // Canvas context drawer
  const drawKitchen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = activeCols * TILE_SIZE;
    const height = activeRows * TILE_SIZE;
    canvas.width = width;
    canvas.height = height;

    // Clear background with Azul Cocina Eléctrica representing the tense outer area shadows
    ctx.fillStyle = '#0C0C14';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-minC * TILE_SIZE, -minR * TILE_SIZE);

    // Draw scene background if abuela + level 1 or level 2
    if ((chef1CharId === 'abuela' && level.id === 1 && scene1Ref.current && scene1Ref.current.complete) || (chef1CharId === 'bruno' && level.id === 1 && brunoScene1Ref.current && brunoScene1Ref.current.complete) || (chef1CharId === 'kenji' && level.id === 1 && kenjiScene1Ref.current && kenjiScene1Ref.current.complete) || (chef1CharId === 'nova' && level.id === 1 && novaScene1Ref.current && novaScene1Ref.current.complete)) {
      const activeScene1 = chef1CharId === 'abuela' ? scene1Ref.current : chef1CharId === 'bruno' ? brunoScene1Ref.current : chef1CharId === 'kenji' ? kenjiScene1Ref.current : novaScene1Ref.current;
      ctx.drawImage(activeScene1!, 0, 0, width, height * 1.2);
      // Draw station name labels
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      stationsRef.current.forEach((s) => {
        if (!isTileAccessible(s.gridX, s.gridY)) return;
        let name = '';
        if (s.type === 'grill') name = 'PARRILLA';
        else if (s.type === 'chopping_board') name = 'TABLA';
        else if (s.type === 'sink') name = 'LAVABO';
        else if (s.type === 'plate_rack') name = 'PLATOS';
        else if (s.type === 'delivery') name = 'ENTREGA';
        else if (s.type === 'trash') name = 'BASURA';
        else if (s.type === 'dispenser') {
          if (s.dispensedIngredient === 'carne_cruda') name = 'CARNE';
          else if (s.dispensedIngredient === 'pan_hamburguesa') name = 'PAN';
          else if (s.dispensedIngredient === 'tomate') name = 'TOMATE';
          else if (s.dispensedIngredient === 'lechuga') name = 'LECHUGA';
          else if (s.dispensedIngredient === 'queso') name = 'QUESO';
        }
        if (name) {
          const sx = s.gridX * TILE_SIZE + TILE_SIZE / 2;
          let sy = s.gridY * TILE_SIZE + 46;
          let sxAjuste = 0;
          if (s.type === 'grill') sy += s.gridY <= 2 ? 33 : 30;
          else if (s.type === 'plate_rack') { sy += chef1CharId === 'abuela' ? 31 : 34; sxAjuste = chef1CharId === 'abuela' ? 0 : 2; }
          else if (s.type === 'chopping_board') { sy += s.gridY <= 2 ? 33 : 31; sxAjuste = 4; }
          else if (s.type === 'sink') sy += 35;
          else if (s.type === 'delivery') sy += chef1CharId === 'abuela' ? -2 : 1;
          else if (s.type === 'trash') sy += chef1CharId === 'abuela' ? -6 : 14;
          else if (s.type === 'dispenser') sy += chef1CharId === 'bruno' ? 32 : 19;
          const tw = ctx.measureText(name).width;
          const rectH = 20;
          const rectY = sy - 16;
          ctx.fillStyle = 'rgba(210, 190, 150, 0.85)';
          drawRoundedRect(ctx, sx + sxAjuste - tw / 2 - 8, rectY, tw + 16, rectH, 4, true, true, 'rgba(160, 130, 80, 0.9)', 1);
          ctx.fillStyle = '#000000';
          ctx.fillText(name, sx + sxAjuste + 1, sy + 1);
          ctx.fillStyle = '#4A3520';
          ctx.fillText(name, sx + sxAjuste, sy);
        }
      });
      ctx.restore();
    } else if ((chef1CharId === 'abuela' || chef1CharId === 'bruno' || chef1CharId === 'kenji' || chef1CharId === 'nova') && level.id === 2 && ((chef1CharId === 'abuela' && scene2Ref.current && scene2Ref.current.complete) || (chef1CharId === 'bruno' && brunoScene2Ref.current && brunoScene2Ref.current.complete) || (chef1CharId === 'kenji' && kenjiScene2Ref.current && kenjiScene2Ref.current.complete) || (chef1CharId === 'nova' && novaScene2Ref.current && novaScene2Ref.current.complete))) {
      const activeScene2 = chef1CharId === 'abuela' ? scene2Ref.current : chef1CharId === 'bruno' ? brunoScene2Ref.current : chef1CharId === 'kenji' ? kenjiScene2Ref.current : novaScene2Ref.current;
      ctx.drawImage(activeScene2!, 0, -height * 0.25 + 47, width, height * 1.35);
      // Draw station name labels for level 2
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      stationsRef.current.forEach((s) => {
        if (!isTileAccessible(s.gridX, s.gridY)) return;
        let name = '';
        if (s.type === 'grill') name = 'PARRILLA';
        else if (s.type === 'stove_pot') name = 'ESTUFA';
        else if (s.type === 'chopping_board') name = 'TABLA';
        else if (s.type === 'sink') name = 'LAVABO';
        else if (s.type === 'plate_rack') name = 'PLATOS';
        else if (s.type === 'delivery') name = 'ENTREGA';
        else if (s.type === 'trash') name = 'BASURA';
        else if (s.type === 'dispenser') {
          if (s.dispensedIngredient === 'carne_cruda') name = 'CARNE';
          else if (s.dispensedIngredient === 'pan_hamburguesa') name = 'PAN';
          else if (s.dispensedIngredient === 'tomate') name = 'TOMATE';
          else if (s.dispensedIngredient === 'lechuga') name = 'LECHUGA';
          else if (s.dispensedIngredient === 'queso') name = 'QUESO';
          else if (s.dispensedIngredient === 'pasta_seca') name = 'PASTA';
          else if (s.dispensedIngredient === 'salsa_tomate') name = 'SALSA';
        }
        if (name) {
          const sx = s.gridX * TILE_SIZE + TILE_SIZE / 2;
          let sy = s.gridY * TILE_SIZE + 46;
          if (s.type === 'grill') sy += s.gridY <= 2 ? 33 : (chef1CharId === 'bruno' ? 33 : chef1CharId === 'kenji' ? 33 : 30);
          else if (s.type === 'plate_rack') sy += chef1CharId === 'abuela' ? 32 : chef1CharId === 'kenji' ? 41 : 35;
          else if (s.type === 'stove_pot') sy += 33;
          else if (s.type === 'chopping_board') sy += chef1CharId === 'abuela' ? 17 : chef1CharId === 'kenji' ? 38 : 32;
          else if (s.type === 'sink') sy += 35;
          else if (s.type === 'delivery') sy += chef1CharId === 'abuela' ? 4 : chef1CharId === 'kenji' ? 6 : chef1CharId === 'nova' ? 4 : 9;
          else if (s.type === 'trash') sy += chef1CharId === 'abuela' ? 0 : chef1CharId === 'kenji' ? 20 : 6;
          else if (s.type === 'dispenser') sy += chef1CharId === 'bruno' ? 24 : 14;
          const tw = ctx.measureText(name).width;
          const rectH = 20;
          const rectY = sy - 16;
          ctx.fillStyle = 'rgba(210, 190, 150, 0.85)';
          drawRoundedRect(ctx, sx - tw / 2 - 8, rectY, tw + 16, rectH, 4, true, true, 'rgba(160, 130, 80, 0.9)', 1);
          ctx.fillStyle = '#000000';
          ctx.fillText(name, sx + 1, sy + 1);
          ctx.fillStyle = '#4A3520';
          ctx.fillText(name, sx, sy);
        }
      });
      ctx.restore();
    } else if ((chef1CharId === 'abuela' || chef1CharId === 'bruno' || chef1CharId === 'kenji' || chef1CharId === 'nova') && level.id === 3 && ((chef1CharId === 'abuela' && scene3Ref.current && scene3Ref.current.complete) || (chef1CharId === 'bruno' && brunoScene3Ref.current && brunoScene3Ref.current.complete) || (chef1CharId === 'kenji' && kenjiScene3Ref.current && kenjiScene3Ref.current.complete) || (chef1CharId === 'nova' && novaScene3Ref.current && novaScene3Ref.current.complete))) {
      const activeScene3 = chef1CharId === 'abuela' ? scene3Ref.current : chef1CharId === 'bruno' ? brunoScene3Ref.current : chef1CharId === 'kenji' ? kenjiScene3Ref.current : novaScene3Ref.current;
      ctx.drawImage(activeScene3!, 0, -height * 0.25 + 5, width, height * 1.45);
      // Draw station name labels for level 3
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      stationsRef.current.forEach((s) => {
        if (!isTileAccessible(s.gridX, s.gridY)) return;
        let name = '';
        if (s.type === 'grill') name = 'PARRILLA';
        else if (s.type === 'oven') name = 'HORNO';
        else if (s.type === 'stove_pot') name = 'ESTUFA';
        else if (s.type === 'chopping_board') name = 'TABLA';
        else if (s.type === 'sink') name = 'LAVABO';
        else if (s.type === 'plate_rack') name = 'PLATOS';
        else if (s.type === 'delivery') name = 'ENTREGA';
        else if (s.type === 'trash') name = 'BASURA';
        else if (s.type === 'dispenser') {
          if (s.dispensedIngredient === 'carne_cruda') name = 'CARNE';
          else if (s.dispensedIngredient === 'pan_hamburguesa') name = 'PAN';
          else if (s.dispensedIngredient === 'tomate') name = 'TOMATE';
          else if (s.dispensedIngredient === 'lechuga') name = 'LECHUGA';
          else if (s.dispensedIngredient === 'pasta_seca') name = 'PASTA';
          else if (s.dispensedIngredient === 'queso') name = 'QUESO';
          else if (s.dispensedIngredient === 'salsa_tomate') name = 'SALSA';
          else if (s.dispensedIngredient === 'masa') name = 'MASA';
        }
        if (name) {
          const sx = s.gridX * TILE_SIZE + TILE_SIZE / 2;
          let sy = s.gridY * TILE_SIZE + 46;
          let sxAjuste = 0;
          if (s.type === 'grill') sy += s.gridY <= 2 ? 33 : (chef1CharId === 'kenji' ? 34 : chef1CharId === 'nova' ? 33 : 30);
          else if (s.type === 'oven') { sy += chef1CharId === 'kenji' ? 38 : chef1CharId === 'nova' ? 34 : 31; sxAjuste = 6; }
          else if (s.type === 'plate_rack') { sy += chef1CharId === 'bruno' ? 35 : chef1CharId === 'kenji' ? 37 : chef1CharId === 'nova' ? 33 : 30; if (chef1CharId === 'bruno' || chef1CharId === 'kenji') sxAjuste = chef1CharId === 'kenji' ? 5 : 2; }
          else if (s.type === 'stove_pot') { sy += 33; sxAjuste = 3; }
          else if (s.type === 'chopping_board') { const base = chef1CharId === 'bruno' ? 5 : chef1CharId === 'kenji' ? 7 : chef1CharId === 'nova' ? (s.gridX <= 4 ? 4 : 10) : 0; sy += s.gridX <= 4 ? 28 + base : 24 + base; if (s.gridX > 4) sxAjuste = 4; if (s.gridX <= 4 && chef1CharId === 'kenji') sxAjuste = 3; }
          else if (s.type === 'sink') sy += 35;
          else if (s.type === 'delivery') { sy += chef1CharId === 'kenji' ? 2 : 5; sxAjuste = 3; }
          else if (s.type === 'trash') sy += chef1CharId === 'bruno' ? 7 : chef1CharId === 'kenji' ? 21 : 1;
          else if (s.type === 'dispenser') { sy += s.dispensedIngredient === 'masa' ? 34 : 19; if (s.dispensedIngredient === 'masa') sxAjuste = 2; }
          const tw = ctx.measureText(name).width;
          const rectH = 20;
          const rectY = sy - 16;
          ctx.fillStyle = 'rgba(210, 190, 150, 0.85)';
          drawRoundedRect(ctx, sx + sxAjuste - tw / 2 - 8, rectY, tw + 16, rectH, 4, true, true, 'rgba(160, 130, 80, 0.9)', 1);
          ctx.fillStyle = '#000000';
          ctx.fillText(name, sx + sxAjuste + 1, sy + 1);
          ctx.fillStyle = '#4A3520';
          ctx.fillText(name, sx + sxAjuste, sy);
        }
      });
      ctx.restore();
    } else {
      // Draw checkered floor tiles using Gris Metal Fluorescente and darker steel tile accents
      for (let r = 0; r < level.gridHeight; r++) {
        for (let c = 0; c < level.gridWidth; c++) {
          if (!isTileAccessible(c, r)) {
            continue; // Keep it as deep dark kitchen shadow
          }
          
          const isOdd = (r + c) % 2 === 0;
          ctx.fillStyle = isOdd ? '#1A1A2E' : '#24303C';
          ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          // Draw subtle fluorescent grout lines
          ctx.strokeStyle = '#1A232C';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Draw Stations and Countertops
    const hasScene = (charId: string, lvl: number) => {
      if (charId === 'abuela') { const refs = [scene1Ref, scene2Ref, scene3Ref]; return refs[lvl - 1]?.current?.complete; }
      if (charId === 'bruno') { const refs = [brunoScene1Ref, brunoScene2Ref, brunoScene3Ref]; return refs[lvl - 1]?.current?.complete; }
      if (charId === 'kenji') { const refs = [kenjiScene1Ref, kenjiScene2Ref, kenjiScene3Ref]; return refs[lvl - 1]?.current?.complete; }
      if (charId === 'nova') { const refs = [novaScene1Ref, novaScene2Ref, novaScene3Ref]; return refs[lvl - 1]?.current?.complete; }
      return false;
    };
    const useScene1 = hasScene(chef1CharId, level.id);

    stationsRef.current.forEach((station) => {
      // Do not render inaccessible counters/stations (blend them completely in black void)
      if (!isTileAccessible(station.gridX, station.gridY)) {
        return;
      }

      const sx = station.gridX * TILE_SIZE;
      const sy = station.gridY * TILE_SIZE;

      if (!useScene1) {
      ctx.fillStyle = '#555'; // Default

      // Style drawing by Type
      if (station.type === 'counter') {
        const hasLeft = stationsRef.current.some(s => s.type === 'counter' && s.gridX === station.gridX - 1 && s.gridY === station.gridY && isTileAccessible(s.gridX, s.gridY));
        const hasRight = stationsRef.current.some(s => s.type === 'counter' && s.gridX === station.gridX + 1 && s.gridY === station.gridY && isTileAccessible(s.gridX, s.gridY));
        const hasTop = stationsRef.current.some(s => s.type === 'counter' && s.gridX === station.gridX && s.gridY === station.gridY - 1 && isTileAccessible(s.gridX, s.gridY));
        const hasBottom = stationsRef.current.some(s => s.type === 'counter' && s.gridX === station.gridX && s.gridY === station.gridY + 1 && isTileAccessible(s.gridX, s.gridY));

        // Drop shadow (using Azul Cocina Eléctrica with transparency)
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        const shadowInset = 4;
        const shX = hasLeft ? sx : sx + shadowInset;
        const shY = hasTop ? sy : sy + shadowInset + 4; // Shift down slightly
        const shW = TILE_SIZE - (hasLeft ? 0 : shadowInset) - (hasRight ? 0 : shadowInset);
        const shH = TILE_SIZE - (hasTop ? 0 : shadowInset) - (hasBottom ? 0 : shadowInset);
        
        ctx.beginPath();
        const shR = 12;
        if (!hasLeft && !hasTop) {
          ctx.moveTo(shX + shR, shY);
        } else {
          ctx.moveTo(shX, shY);
        }
        if (!hasRight && !hasTop) {
          ctx.lineTo(shX + shW - shR, shY);
          ctx.quadraticCurveTo(shX + shW, shY, shX + shW, shY + shR);
        } else {
          ctx.lineTo(shX + shW, shY);
        }
        if (!hasRight && !hasBottom) {
          ctx.lineTo(shX + shW, shY + shH - shR);
          ctx.quadraticCurveTo(shX + shW, shY + shH, shX + shW - shR, shY + shH);
        } else {
          ctx.lineTo(shX + shW, shY + shH);
        }
        if (!hasLeft && !hasBottom) {
          ctx.lineTo(shX + shR, shY + shH);
          ctx.quadraticCurveTo(shX, shY + shH, shX, shY + shH - shR);
        } else {
          ctx.lineTo(shX, shY + shH);
        }
        if (!hasLeft && !hasTop) {
          ctx.lineTo(shX, shY + shR);
          ctx.quadraticCurveTo(shX, shY, shX + shR, shY);
        } else {
          ctx.lineTo(shX, shY);
        }
        ctx.closePath();
        ctx.fill();

        // Draw Cobre / Grasa Quemada console base seamlessly
        drawCounterBaseSegment(ctx, sx, sy, hasLeft, hasRight, hasTop, hasBottom);

        // Draw Stainless Steel countertop seamlessly
        drawCounterTopSegment(ctx, sx, sy, hasLeft, hasRight, hasTop, hasBottom);

        // Wood cabinet drawers/handles details (Azul Cocina Eléctrica outline)
        if (!hasBottom) {
          ctx.fillStyle = '#0C0C14';
          ctx.fillRect(sx + TILE_SIZE / 2 - 12, sy + TILE_SIZE - 12, 24, 4);
        }
      } else if (station.type === 'trash') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 6, sy + 10, TILE_SIZE - 12, TILE_SIZE - 12, 14, true, false);

        // Industrial copper/grease trash bin casing
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8, 14, true, true, '#0C0C14', 4.5);

        // Fluted body lines
        ctx.strokeStyle = '#0C0C14';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx + 15, sy + 16); ctx.lineTo(sx + 15, sy + TILE_SIZE - 16);
        ctx.moveTo(sx + TILE_SIZE - 15, sy + 16); ctx.lineTo(sx + TILE_SIZE - 15, sy + TILE_SIZE - 16);
        ctx.stroke();

        // Handle (Stainless Steel)
        ctx.fillStyle = '#555';
        ctx.fillRect(sx + TILE_SIZE / 2 - 12, sy + 7, 24, 4.5);

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const label = '🗑️ BASURA';
        const lw = ctx.measureText(label).width;
        ctx.fillStyle = '#140D0B';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - lw/2 - 6, sy + TILE_SIZE/2 - 8, lw + 12, 17, 5, true, true, '#EF4444', 1.5);
        ctx.fillStyle = '#EF4444';
        ctx.fillText(label, sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 0.5);
        ctx.restore();
      } else if (station.type === 'plate_rack') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Base console (Cobre / Grasa Quemada)
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Stack of plates
        ctx.fillStyle = '#D2D7DF';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 - i * 3.5, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 1.25;
          ctx.stroke();

          ctx.strokeStyle = '#5C4A3C';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 - i * 3.5, 17, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const labelPlates = '🍽️ PLATOS';
        const lwPlates = ctx.measureText(labelPlates).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - lwPlates/2 - 6, sy + TILE_SIZE - 22, lwPlates + 12, 17, 5, true, true, '#555', 1.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelPlates, sx + TILE_SIZE / 2, sy + TILE_SIZE - 13.5);
        ctx.restore();
      } else if (station.type === 'sink') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Basin structure (Cobre / Grasa Quemada)
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Water basin inside (Fuego de Gas / Vapor Frío blue)
        ctx.fillStyle = '#4A90E2';
        drawRoundedRect(ctx, sx + 8, sy + 12, TILE_SIZE - 16, TILE_SIZE - 24, 8, true, true, '#0C0C14', 2.5);

        // Tap
        ctx.fillStyle = '#555';
        ctx.fillRect(sx + TILE_SIZE / 2 - 5, sy + 4, 10, 8);
        ctx.fillStyle = '#D2D7DF';
        ctx.fillRect(sx + TILE_SIZE / 2 - 2.5, sy + 12, 5, 5);

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const labelSink = '🧼 LAVAR';
        const lwSink = ctx.measureText(labelSink).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - lwSink/2 - 6, sy + TILE_SIZE - 22, lwSink + 12, 17, 5, true, true, '#4A90E2', 1.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelSink, sx + TILE_SIZE / 2, sy + TILE_SIZE - 13.5);
        ctx.restore();
      } else if (station.type === 'delivery') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Runway table (Ámbar de Desastre / Comida)
        ctx.fillStyle = '#E6A15C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Conveyor belt striped texture
        ctx.strokeStyle = '#5C4A3C';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx + 8, sy + 8); ctx.lineTo(sx + TILE_SIZE - 8, sy + 8);
        ctx.moveTo(sx + 8, sy + TILE_SIZE - 8); ctx.lineTo(sx + TILE_SIZE - 8, sy + TILE_SIZE - 8);
        ctx.stroke();

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 12px sans-serif';
        const labelDel = '🛎️ ENTREGA';
        const lwDel = ctx.measureText(labelDel).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - lwDel/2 - 7, sy + TILE_SIZE/2 - 10, lwDel + 14, 21, 6, true, true, '#E6A15C', 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelDel, sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 0.5);
        ctx.restore();
      } else if (station.type === 'chopping_board') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Toasted Cobre / Grasa Quemada table structure
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Cutting Board plate inset (Blanco Uniforme Sucio)
        ctx.fillStyle = '#D2D7DF';
        drawRoundedRect(ctx, sx + 9, sy + 13, TILE_SIZE - 18, TILE_SIZE - 26, 6, true, true, '#5C4A3C', 2.5);

        // Cartoon knife asset
        ctx.fillStyle = '#555';
        ctx.fillRect(sx + 15, sy + 6, 12, 3);
        ctx.fillStyle = '#0C0C14';
        ctx.fillRect(sx + 27, sy + 6, 7, 3);

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const label = '🔪 PICAR';
        const lw = ctx.measureText(label).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - lw/2 - 6, sy + TILE_SIZE - 22, lw + 12, 17, 5, true, true, '#E6A15C', 1.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, sx + TILE_SIZE / 2, sy + TILE_SIZE - 13.5);
        ctx.restore();
      } else if (station.type === 'grill' || station.type === 'stove_pot') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Stainless Steel Metal Casing
        ctx.fillStyle = '#555';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Stove Burner (Active is Fuego de Gas / Vapor Frío blue)
        ctx.fillStyle = station.heldItem ? '#4A90E2' : '#0C0C14';
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 - 3, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0C0C14';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const labelText = station.type === 'grill' ? '🥩 PARRILLA' : '♨️ ESTUFA';
        const labelW = ctx.measureText(labelText).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - labelW/2 - 6, sy + TILE_SIZE - 22, labelW + 12, 17, 5, true, true, '#4A90E2', 1.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelText, sx + TILE_SIZE/2, sy + TILE_SIZE - 13.5);
        ctx.restore();
      } else if (station.type === 'oven') {
        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Industrial copper/brick structure (Cobre / Grasa Quemada)
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, '#0C0C14', 4.5);

        // Dark arch mouth
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + 9, sy + 13, TILE_SIZE - 18, TILE_SIZE - 26, 8, true, true, '#0C0C14', 2);

        // Fire glow (Ámbar de Desastre / Comida)
        ctx.fillStyle = '#E6A15C';
        ctx.fillRect(sx + 14, sy + 22, TILE_SIZE - 28, 11);

        // Label
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px sans-serif';
        const labelText = '🍕 HORNO';
        const labelW = ctx.measureText(labelText).width;
        ctx.fillStyle = '#0C0C14';
        drawRoundedRect(ctx, sx + TILE_SIZE/2 - labelW/2 - 6, sy + TILE_SIZE - 22, labelW + 12, 17, 5, true, true, '#E6A15C', 1.5);
        ctx.fillStyle = '#FFF7ED';
        ctx.fillText(labelText, sx + TILE_SIZE/2, sy + TILE_SIZE - 13.5);
        ctx.restore();
      } else if (station.type === 'dispenser') {
        const baseIdx = station.dispensedIngredient ? getBaseIngredient(station.dispensedIngredient) : null;
        const owner = baseIdx ? assignedIngredients[baseIdx] : null;
        let strokeColor = '#0C0C14';
        let strokeWidth = 4.5;
        if (gameMode === 'COOP' && owner) {
          strokeColor = owner === 1 ? '#D29F75' : '#8FA889';
          strokeWidth = 5.5;
        }

        // Drop shadow
        ctx.fillStyle = 'rgba(10, 17, 24, 0.4)';
        drawRoundedRect(ctx, sx + 4, sy + 8, TILE_SIZE - 8, TILE_SIZE - 8, 12, true, false);

        // Industrial copper box casing (Cobre / Grasa Quemada)
        ctx.fillStyle = '#5C4A3C';
        drawRoundedRect(ctx, sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12, true, true, strokeColor, strokeWidth);

        // Metal support cross bars
        ctx.strokeStyle = '#0C0C14';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx + 7, sy + 7); ctx.lineTo(sx + TILE_SIZE - 7, sy + TILE_SIZE - 7);
        ctx.moveTo(sx + TILE_SIZE - 7, sy + 7); ctx.lineTo(sx + 7, sy + TILE_SIZE - 7);
        ctx.stroke();

        // Label details for dispensers
        if (station.dispensedIngredient) {
          const det = getItemDetails(station.dispensedIngredient);
          
          let innerStroke = '#0C0C14';
          let innerBg = '#D2D7DF';
          let innerStrokeWidth = 2;
          if (gameMode === 'COOP' && owner) {
            innerStroke = owner === 1 ? '#EF4444' : '#059669';
            innerBg = owner === 1 ? '#FFE5D9' : '#D1FAE5';
            innerStrokeWidth = 3;
          }
          
          ctx.fillStyle = innerBg;
          ctx.fillRect(sx + TILE_SIZE / 2 - 20, sy + TILE_SIZE / 2 - 20, 40, 40);
          ctx.strokeStyle = innerStroke;
          ctx.lineWidth = innerStrokeWidth;
          ctx.strokeRect(sx + TILE_SIZE / 2 - 20, sy + TILE_SIZE / 2 - 20, 40, 40);

          ctx.save();
          ctx.fillStyle = '#451A03';
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(det.emoji, sx + TILE_SIZE / 2, sy + TILE_SIZE / 2);
          ctx.restore();

          // Add a highly legible physical "sticker" label at the bottom of the dispenser
          let dispLabel = '';
          if (station.dispensedIngredient === 'pan_hamburguesa') dispLabel = 'PAN';
          else if (station.dispensedIngredient === 'carne_cruda') dispLabel = 'CARNE';
          else if (station.dispensedIngredient === 'tomate') dispLabel = 'TOMATE';
          else if (station.dispensedIngredient === 'lechuga') dispLabel = 'LECHUGA';
          else if (station.dispensedIngredient === 'queso') dispLabel = 'QUESO';
          else if (station.dispensedIngredient === 'pasta_seca') dispLabel = 'PASTA';
          else if (station.dispensedIngredient === 'salsa_tomate') dispLabel = 'SALSA';
          else if (station.dispensedIngredient === 'masa') dispLabel = 'MASA';
          else dispLabel = det.name.split(' ')[0].toUpperCase();

          if (dispLabel) {
            ctx.save();
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labelW = ctx.measureText(dispLabel).width;
            
            // Solid backing label
            ctx.fillStyle = '#451A03'; // deep wooden brown capsule
            drawRoundedRect(ctx, sx + TILE_SIZE/2 - labelW/2 - 6, sy + TILE_SIZE - 21, labelW + 12, 17, 5, true, true, '#EAD3B5', 1);
            ctx.fillStyle = '#FCD34D'; // Bright gold readable text
            ctx.fillText(dispLabel, sx + TILE_SIZE/2, sy + TILE_SIZE - 13.5);
            ctx.restore();
          }

          // Draw a small P1 or P2 badge in the corner
          if (gameMode === 'COOP' && owner) {
            ctx.save();
            ctx.fillStyle = owner === 1 ? '#D29F75' : '#8FA889';
            ctx.beginPath();
            ctx.arc(sx + TILE_SIZE - 10, sy + 10, 8.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(owner === 1 ? 'P1' : 'P2', sx + TILE_SIZE - 10, sy + 10.5);
            ctx.restore();
          }
        }
      }
      } // end if (!useScene1)

      // Draw resting items on countertops
      if (station.heldItem) {
        const grillOffset = (useScene1 && (station.type === 'grill' || station.type === 'stove_pot')) ? -30 : 0;
        const chopOffset = (useScene1 && station.type === 'chopping_board') ? (chef1CharId === 'abuela' ? (level.id === 2 ? -20 : -10) : -11) : 0;
        const pastaOffset = (station.type === 'stove_pot' && station.heldItem?.type === 'pasta_seca') ? -10 : 0;
        drawItemImage(ctx, station.heldItem, sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + grillOffset + chopOffset + pastaOffset);
      }

      // Draw active progress bar above stations if cooking or chopping is moving (enlarged for high visibility)
      if (station.progress > 0) {
        const barHeight = 12;
        const barY = sy - barHeight - 4;
        
        // Deep dark container frame
        ctx.fillStyle = '#0C0C14';
        ctx.fillRect(sx + 4, barY, TILE_SIZE - 8, barHeight);
        
        ctx.strokeStyle = '#D2D7DF';
        ctx.lineWidth = 1.75;
        ctx.strokeRect(sx + 4, barY, TILE_SIZE - 8, barHeight);
        
        // Shiny high-visibility progress color (Ámbar de Desastre/warning vs Fuego de Gas/Vapor Frío blue)
        ctx.fillStyle = station.isWarning ? '#E6A15C' : '#4A90E2';
        ctx.fillRect(sx + 5, barY + 1.25, (TILE_SIZE - 10) * (station.progress / 100), barHeight - 2.5);
      }
    });

    // Highlight targeted stations for intuitive usability feedback
    const isCoop = gameMode === 'COOP';
    
    const getTargetStationAndPrompt = (chef: Chef) => {
      const dx = Math.cos(chef.angle);
      const dy = Math.sin(chef.angle);
      const gridX = Math.floor((chef.x + dx * INTERACT_DIST) / TILE_SIZE);
      const gridY = Math.floor((chef.y + dy * INTERACT_DIST) / TILE_SIZE);
      const station = stationsRef.current.find(s => s.gridX === gridX && s.gridY === gridY);
      if (!station) return null;
      
      let promptText = '';
      if (station.type === 'plate_rack') {
        promptText = 'TOMAR PLATO';
      } else if (station.type === 'dispenser') {
        const itemD = station.dispensedIngredient ? getItemDetails(station.dispensedIngredient) : null;
        promptText = itemD ? `TOMAR ${itemD.emoji}` : 'TOMAR';
      } else if (station.type === 'chopping_board') {
        promptText = station.heldItem ? 'MANTENER E PARA PICAR' : 'DEPOSITAR';
      } else if (station.type === 'sink') {
        promptText = station.heldItem?.type === 'plato_sucio' ? 'MANTENER E PARA LAVAR' : (station.heldItem ? 'TOMAR PLATO LIMPIO' : 'DEPOSITAR');
      } else if (station.type === 'delivery') {
        promptText = 'ENTREGAR ORDEN';
      } else if (station.type === 'trash') {
        promptText = 'BOTAR';
      } else if (station.type === 'grill' || station.type === 'stove_pot' || station.type === 'oven') {
        promptText = station.heldItem ? 'TOMAR COMIDA' : 'COCINAR';
      } else if (station.type === 'counter') {
        promptText = station.heldItem ? 'SWAP / COMBINAR' : 'DEPOSITAR';
      }
      return { station, promptText };
    };

    const drawTargetHighlight = (station: KitchenStation, promptText: string, color: string) => {
      const sx = station.gridX * TILE_SIZE;
      const sy = station.gridY * TILE_SIZE;
      ctx.save();
      // Pulsing opacity effect using sine of Date
      const pulseVal = 0.7 + Math.sin(Date.now() / 150) * 0.15;
      ctx.globalAlpha = pulseVal;
      
      // Draw standard curved outline around the countertop block
      drawRoundedRect(ctx, sx - 2, sy - 2, TILE_SIZE + 4, TILE_SIZE + 4, 10, false, true, color, 3);
      
      // Render text bubble
      if (promptText) {
        ctx.font = 'bold 8px sans-serif';
        const textW = ctx.measureText(promptText).width;
        ctx.fillStyle = '#0F172A';
        drawRoundedRect(ctx, sx + TILE_SIZE / 2 - textW / 2 - 4, sy - 14, textW + 8, 12, 4, true, false);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(promptText, sx + TILE_SIZE / 2 - textW / 2, sy - 5);
      }
      ctx.restore();
    };

    if (gameMode === 'ONLINE') {
      const playersList = onlinePlayersRef.current.length > 0 ? onlinePlayersRef.current : Object.values(roomDataRef.current?.players || {});
      const activeRoles = playersList.map((p: any) => p.roleNum);
      const allChefs = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current];
      allChefs.forEach((c, idx) => {
        const role = idx + 1;
        if (activeRoles.includes(role) || role === myRoleNumRef.current) {
          const res = getTargetStationAndPrompt(c);
          if (res) {
            const actualChefId = (c as any).chefId;
            const charConfig = CHARACTERS.find(char => char.id === actualChefId) || CHARACTERS[idx % CHARACTERS.length];
            const chefColor = charConfig ? charConfig.color : '#4A90E2';
            let promptTxt = res.promptText;
            if (role !== 1) {
              if (promptTxt.includes('MANTENER E')) {
                promptTxt = promptTxt.replace('MANTENER E', 'MANTENER ,');
              }
            }
            drawTargetHighlight(res.station, promptTxt, chefColor);
          }
        }
      });
    } else {
      const char1Info = CHARACTERS.find(c => c.id === chef1CharId) || CHARACTERS[0];

      // Solo mode: only highlight p1's target
      const p1Res = getTargetStationAndPrompt(p1Ref.current);
      if (p1Res) {
        drawTargetHighlight(p1Res.station, p1Res.promptText, char1Info.color);
      }
      if (isCoop) {
        const char2Info = CHARACTERS.find(c => c.id === chef2CharId) || CHARACTERS[1];
        const p2Res = getTargetStationAndPrompt(p2Ref.current);
        if (p2Res) {
          let promptTxt = p2Res.promptText;
          if (promptTxt.includes('MANTENER E')) {
            promptTxt = promptTxt.replace('MANTENER E', 'MANTENER ,');
          }
          drawTargetHighlight(p2Res.station, promptTxt, char2Info.color);
        }
      }
    }

    // Draw active particles
    particlesRef.current.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      
      if (p.type === 'fire') {
        const colors = ['#EF4444', '#F59E0B', '#FBBF24'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        // Rotating confetti rectangles
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Decrement take animation timers for all chefs every frame
    [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current].forEach(chef => {
      if (chef.takeAnimTimer > 0) {
        chef.takeAnimTimer = Math.max(0, chef.takeAnimTimer - 0.05);
        chef.animFrame = (chef.animFrame + 0.2) % 4; // Advance animation for grill sprites
        // Advance take frame: 0 = frame 5, 1 = frame 4
        chef.takeAnimFrame = chef.takeAnimTimer > 0.5 ? 0 : 1;
      } else {
        chef.takeAnimFrame = 0;
      }
    });

    // Draw BOTH Chefs (P1 & P2)
    const drawChefEntity = (chef: Chef, isActive: boolean) => {
      ctx.save();
      ctx.translate(chef.x, chef.y);

      // Resolve chef's role number (1-indexed)
      const chefRole = chef === p1Ref.current ? 1 :
                       chef === p2Ref.current ? 2 :
                       chef === p3Ref.current ? 3 :
                       chef === p4Ref.current ? 4 : 1;

      // Find character configuration
      let actualChefId = (chef as any).chefId;

      // Robust check for ONLINE mode: try to retrieve chefId and name from roomDataRef or onlinePlayers
      if (gameMode === 'ONLINE') {
        const pInOnline = onlinePlayersRef.current.find((p: any) => p.roleNum === chefRole);
        if (pInOnline && pInOnline.chefId) {
          actualChefId = pInOnline.chefId;
        } else {
          const rPlayers = roomDataRef.current?.players || {};
          const pInRoom = Object.values(rPlayers).find((p: any) => p.roleNum === chefRole) as any;
          if (pInRoom && pInRoom.chefId) {
            actualChefId = pInRoom.chefId;
          }
        }
      }

      if (!actualChefId) {
        if (gameMode === 'ONLINE') {
          const charOptions = ['abuela', 'kenji', 'nova', 'bruno'];
          actualChefId = charOptions[chefRole - 1];
        } else {
          actualChefId = chef.id === 1 ? chef1CharId : chef2CharId;
        }
      }

      const charConfig = CHARACTERS.find(c => actualChefId === c.id) || CHARACTERS[chef.id === 1 ? 0 : 1];

      const outlineColor = '#2A211D'; // Contorno oscuro
      const cBase = charConfig.color;
      const cDark = charConfig.colorDark;
      const cPiel = charConfig.pielColor;
      const cApron = charConfig.apronColor;
      const cApronDark = charConfig.apronColorDark;
      const cHat = charConfig.hatColor;
      const cExtra = charConfig.extraColor;

      // Draw a neat, modern floating player name badge above head before applying rotation
      ctx.save();
      
      let displayName = chef.name;
      if (gameMode === 'ONLINE') {
        const pInOnline = onlinePlayersRef.current.find((p: any) => p.roleNum === chefRole);
        if (pInOnline && pInOnline.name) {
          displayName = pInOnline.name;
        } else {
          const rPlayers = roomDataRef.current?.players || {};
          const pInRoom = Object.values(rPlayers).find((p: any) => p.roleNum === chefRole) as any;
          if (pInRoom && pInRoom.name) {
            displayName = pInRoom.name;
          }
        }
      }
      if (!displayName || displayName === 'Chef') {
        displayName = lang === 'es' ? charConfig.nameEs : charConfig.nameEn;
      }
      if (gameMode === 'ONLINE') {
        displayName = `Player_${chefRole} (${displayName})`;
      }

      ctx.font = 'bold 10px sans-serif';
      const isMe = gameMode === 'ONLINE' 
        ? (chef === (myRoleNumRef.current === 1 ? p1Ref.current : myRoleNumRef.current === 2 ? p2Ref.current : myRoleNumRef.current === 3 ? p3Ref.current : p4Ref.current))
        : isActive;
      const drawText = isMe ? `★ ${displayName}` : displayName;
      
      const textWidth = ctx.measureText(drawText).width;
      const paddingX = 6;
      const paddingY = 3;
      const badgeW = textWidth + paddingX * 2;
      const badgeH = 15;
      const badgeX = -badgeW / 2;
      const chefBobY = Math.abs(Math.sin(chef.animFrame * Math.PI)) * 4.5;
      const badgeY = -38 - chefBobY;

      // Draw background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Slate 900 translucent
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        ctx.fill();
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      }

      if (isMe) {
        ctx.strokeStyle = '#22C55E'; // Vibrant green border for yourself
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drawText, 0, badgeY + badgeH / 2 + 0.5);
      ctx.restore();

      // Active player highlight halo (enlarged from 24 to 32)
      if (isActive && gameMode === 'SOLO') {
        ctx.strokeStyle = cBase; // Premium character-specific highlight halo
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Rotate body shadow with Azul Cocina Eléctrica shadow tone
      ctx.fillStyle = 'rgba(10, 17, 24, 0.55)'; // high-quality ambient drop shadow in electric kitchen blue
      ctx.beginPath();
      ctx.arc(0, 5, 24, 0, Math.PI * 2);
      ctx.fill();

      // Bob up-and-down walking cycle offsets
      const bobY = Math.abs(Math.sin(chef.animFrame * Math.PI)) * 4.5;

      // Chef Main Body capsule (looking in angular direction dx, dy)
      ctx.rotate(chef.angle);

      // Sprite-based rendering for all characters
      const isTaking = chef.takeAnimTimer > 0;
      
      // Get sprite refs based on character
      let walkSprites: HTMLImageElement[] = [];
      let takeSprites: HTMLImageElement[] = [];
      let cutSprites: HTMLImageElement[] = [];
      let grillSprites: HTMLImageElement[] = [];
      let washSprites: HTMLImageElement[] = [];
      let ovenSprites: HTMLImageElement[] = [];
      
      if (charConfig.id === 'abuela') {
        walkSprites = abuelaSpritesRef.current;
        takeSprites = abuelaTakeSpritesRef.current;
        cutSprites = abuelaCutSpritesRef.current;
        grillSprites = abuelaGrillSpritesRef.current;
        washSprites = abuelaWashSpritesRef.current;
        ovenSprites = abuelaOvenSpritesRef.current;
      } else if (charConfig.id === 'kenji') {
        walkSprites = kenjiSpritesRef.current;
        takeSprites = kenjiTakeSpritesRef.current;
        cutSprites = kenjiCutSpritesRef.current;
        grillSprites = kenjiGrillSpritesRef.current;
        washSprites = kenjiWashSpritesRef.current;
        ovenSprites = kenjiOvenSpritesRef.current;
      } else if (charConfig.id === 'nova') {
        walkSprites = novaSpritesRef.current;
        takeSprites = novaTakeSpritesRef.current;
        cutSprites = novaCutSpritesRef.current;
        grillSprites = novaGrillSpritesRef.current;
        washSprites = novaWashSpritesRef.current;
        ovenSprites = novaOvenSpritesRef.current;
      } else if (charConfig.id === 'bruno') {
        walkSprites = brunoSpritesRef.current;
        takeSprites = brunoTakeSpritesRef.current;
        cutSprites = brunoCutSpritesRef.current;
        grillSprites = brunoGrillSpritesRef.current;
        washSprites = brunoWashSpritesRef.current;
        ovenSprites = brunoOvenSpritesRef.current;
      }

      // Check if chef is facing a cooking station (grill, stove, oven)
      const chefDx = Math.cos(chef.angle);
      const chefDy = Math.sin(chef.angle);
      const chefGridX = Math.floor((chef.x + chefDx * INTERACT_DIST) / TILE_SIZE);
      const chefGridY = Math.floor((chef.y + chefDy * INTERACT_DIST) / TILE_SIZE);
      const facingStation = stationsRef.current.find(s => s.gridX === chefGridX && s.gridY === chefGridY);
      const isAtGrill = facingStation && (facingStation.type === 'grill' || facingStation.type === 'stove_pot') && grillSprites.length > 0;
      const isAtOven = facingStation && facingStation.type === 'oven' && ovenSprites.length >= 3;
      
      // Use sprite frames if available
      if (walkSprites.length === 4) {
        let sprite: HTMLImageElement;
        
        if (chef.isChopping && cutSprites.length === 2) {
          // Cutting animation: alternating c1/c2 frames
          const cutFrame = Math.floor(chef.animFrame) % 2;
          sprite = cutSprites[cutFrame];
        } else if (chef.isWashing && washSprites.length === 2) {
          // Washing animation: alternating w1/w2 frames
          const washFrame = Math.floor(chef.animFrame) % 2;
          sprite = washSprites[washFrame];
        } else if (isAtOven && isTaking && chef.ovenGrabType === 'place') {
          // Oven placing: ping-pong gk2-gk3-gk3-gk2
          const ovenFrame = (chef.takeAnimTimer > 0.75 || chef.takeAnimTimer < 0.25) ? 1 : 2;
          sprite = ovenSprites[ovenFrame];
        } else if (isAtOven && isTaking && chef.ovenGrabType === 'take') {
          // Oven taking: ping-pong gk3-gk2-gk2-gk3
          const ovenFrame = (chef.takeAnimTimer > 0.75 || chef.takeAnimTimer < 0.25) ? 2 : 1;
          sprite = ovenSprites[ovenFrame];
        } else if (isAtOven) {
          // Oven idle: gk1 (standing near oven)
          sprite = ovenSprites[0];
        } else if (isAtGrill && isTaking) {
          // Grill interaction: ping-pong sg1-sg2-sg2-sg1 (grab in, grab out, release out, release in)
          const grillFrame = (chef.takeAnimTimer > 0.75 || chef.takeAnimTimer < 0.25) ? 0 : 1;
          sprite = grillSprites[grillFrame];
        } else if (isTaking && takeSprites.length === 2) {
          // Take animation: frame 5 (index 0) then frame 4 (index 1)
          sprite = takeSprites[chef.takeAnimFrame];
        } else {
          // Walk animation: frames 1-2-3-4 (cycling)
          const frameIdx = Math.floor(chef.animFrame) % 4;
          sprite = walkSprites[frameIdx];
        }
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
          const targetW = 70;
          const targetH = 100;
          ctx.rotate(-Math.PI / 2); // Rotate 90° CCW: sprite faces down → faces right (movement dir)
          ctx.drawImage(sprite, -targetW / 2, -70 + bobY, targetW, targetH);
        }
      } else {
      // 1. Colored base with multiplier shadow (Cooking Mama indie style 3D depth)
      ctx.fillStyle = cDark;
      ctx.beginPath();
      ctx.arc(0, -bobY + 2, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cBase;
      ctx.beginPath();
      ctx.arc(0, -bobY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 2. Custom Apron / Uniform Layer
      ctx.fillStyle = cApron;
      ctx.beginPath();
      ctx.rect(-11, -17 - bobY, 18, 20);
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(-11, -17 - bobY, 18, 20);

      // Apron dark details / stripes using cApronDark
      ctx.fillStyle = cApronDark;
      ctx.fillRect(-11, -17 - bobY, 4, 20);
      ctx.fillRect(-3, -17 - bobY, 3, 20);

      // 3. Custom Face / Skin Layer
      ctx.fillStyle = cPiel;
      ctx.beginPath();
      ctx.arc(10, -bobY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // 4. Character-Specific Hair / Headwear / Hats
      if (charConfig.id === 'abuela') {
        // Grey hair buns on the sides
        ctx.fillStyle = '#C2BFBA';
        ctx.beginPath();
        ctx.arc(-2, -9 - bobY, 8, 0, Math.PI * 2);
        ctx.arc(-2, 9 - bobY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Puffy traditional white chef hat
        ctx.fillStyle = cHat;
        ctx.beginPath();
        ctx.arc(0, -20 - bobY, 12, 0, Math.PI * 2);
        ctx.arc(-10, -18 - bobY, 9, 0, Math.PI * 2);
        ctx.arc(10, -18 - bobY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gold band around hat
        ctx.fillStyle = cApron; // Amarillo del delantal
        ctx.fillRect(-12, -13 - bobY, 24, 5);
        ctx.strokeRect(-12, -13 - bobY, 24, 5);
      } else if (charConfig.id === 'kenji') {
        // Spiky brown hair in the back
        ctx.fillStyle = cExtra; // Café cabello
        ctx.beginPath();
        ctx.arc(-8, -10 - bobY, 8, 0, Math.PI * 2);
        ctx.arc(-8, 10 - bobY, 8, 0, Math.PI * 2);
        ctx.arc(-12, -bobY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cool black bandana on top of head
        ctx.fillStyle = cHat; // Negro pañuelo
        ctx.beginPath();
        ctx.arc(0, -14 - bobY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bandana tie at back of head
        ctx.beginPath();
        ctx.moveTo(-10, -14 - bobY);
        ctx.lineTo(-20, -19 - bobY);
        ctx.lineTo(-17, -11 - bobY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (charConfig.id === 'nova') {
        // Spiky cyber purple buns
        ctx.fillStyle = cHat; // Morado cabello
        ctx.beginPath();
        ctx.arc(-6, -11 - bobY, 9, 0, Math.PI * 2);
        ctx.arc(-6, 11 - bobY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cyber head band
        ctx.beginPath();
        ctx.arc(0, -14 - bobY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Yellow glowing star/visor on forehead
        ctx.fillStyle = cExtra; // Amarillo llama
        ctx.beginPath();
        ctx.arc(9, -12 - bobY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (charConfig.id === 'bruno') {
        // Black beard around face
        ctx.fillStyle = cExtra; // Negro barba
        ctx.beginPath();
        ctx.arc(11, -bobY + 5, 9, 0, Math.PI * 2);
        ctx.arc(11, -bobY - 5, 9, 0, Math.PI * 2);
        ctx.arc(15, -bobY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Red headband
        ctx.fillStyle = cHat; // Rojo cinta
        ctx.beginPath();
        ctx.arc(0, -14 - bobY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red band ties at back
        ctx.beginPath();
        ctx.moveTo(-10, -14 - bobY);
        ctx.lineTo(-20, -17 - bobY);
        ctx.lineTo(-16, -9 - bobY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Generic fallback chef hat
        ctx.fillStyle = cHat;
        ctx.beginPath();
        ctx.arc(4, -15 - bobY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-9, -15 - bobY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = cHat;
        ctx.fillRect(-14, -10 - bobY, 28, 8);
        ctx.strokeRect(-14, -10 - bobY, 28, 8);
      }

      // 5. Cartoon Blinking Eyes with White reflections
      ctx.fillStyle = '#1D1D1D';
      ctx.beginPath();
      ctx.arc(13, -5 - bobY, 4, 0, Math.PI * 2);
      ctx.arc(13, 5 - bobY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(14.5, -6.5 - bobY, 1.2, 0, Math.PI * 2);
      ctx.arc(14.5, 3.5 - bobY, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Blushing cheeks
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)'; // rich cooking blush
      ctx.beginPath();
      ctx.arc(11, -10 - bobY, 3, 0, Math.PI * 2);
      ctx.arc(11, 10 - bobY, 3, 0, Math.PI * 2);
      ctx.fill();
      } // end else (non-abuela procedural drawing)

      // Draw Action indicators (washing bubbles or slicing knife)
      if (chef.isChopping) {
        ctx.fillStyle = '#78716C';
        ctx.font = '18px sans-serif';
        ctx.fillText('🔪', 14, -7);
      }
      if (chef.isWashing) {
        ctx.fillStyle = '#3B82F6';
        ctx.font = '18px sans-serif';
        ctx.fillText('🫧', 14, -7);
      }

      ctx.restore();

      // Draw Held Item separately in front of chef vector to handle layered overlays (placed further to match 24-radius body)
      if (chef.heldItem) {
        const itemX = chef.x + Math.cos(chef.angle) * 32;
        const itemY = chef.y + Math.sin(chef.angle) * 32;
        drawItemImage(ctx, chef.heldItem, itemX, itemY);
      }
    };

    if (gameMode === 'ONLINE') {
      const activeRoles = getActiveRoles();
      
      if (activeRoles.includes(1) || myRoleNumRef.current === 1) drawChefEntity(p1Ref.current, myRoleNumRef.current === 1);
      if (activeRoles.includes(2) || myRoleNumRef.current === 2) drawChefEntity(p2Ref.current, myRoleNumRef.current === 2);
      if (activeRoles.includes(3) || myRoleNumRef.current === 3) drawChefEntity(p3Ref.current, myRoleNumRef.current === 3);
      if (activeRoles.includes(4) || myRoleNumRef.current === 4) drawChefEntity(p4Ref.current, myRoleNumRef.current === 4);
    } else {
      if (gameMode === 'COOP') {
        drawChefEntity(p1Ref.current, true);
        drawChefEntity(p2Ref.current, false);
      } else {
        // Solo Mode: only draw p1
        drawChefEntity(p1Ref.current, true);
      }
    }

    // Score popups floating indicators
    scoreLabels.current.forEach((lbl) => {
      ctx.save();
      ctx.globalAlpha = lbl.alpha;
      ctx.fillStyle = lbl.color;
      ctx.font = 'bold 15px sans-serif';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeText(lbl.text, lbl.x, lbl.y);
      ctx.fillText(lbl.text, lbl.x, lbl.y);
      ctx.restore();
    });

    ctx.restore(); // Balance the save() from the active offset translation

    // --- CINEMATIC "THE BEAR" LAYERING EFFECTS ---
    // 1. Efecto Viñeta (Vignette) for claustrophobic kitchen tension
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.max(width, height) * 0.72;
    const vignetteGrad = ctx.createRadialGradient(
      centerX, centerY, outerRadius * 0.35,
      centerX, centerY, outerRadius
    );
    vignetteGrad.addColorStop(0, 'rgba(10, 17, 24, 0)');
    vignetteGrad.addColorStop(0.5, 'rgba(10, 17, 24, 0.22)');
    vignetteGrad.addColorStop(1, 'rgba(10, 17, 24, 0.85)'); // Azul Cocina Eléctrica shadow representing the tight room

    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Filtro de Pantalla (Overlay 2D) - Cian/Azul Verdoso (#1A353D) at 8% opacity with Multiply mode
    ctx.save();
    ctx.fillStyle = '#1A353D';
    ctx.globalAlpha = 0.08;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  // Dedicated helper to draw ingredients and Layered Plate Combinations
  const drawItemImage = (ctx: CanvasRenderingContext2D, held: HeldItem, cx: number, cy: number) => {
    const det = getItemDetails(held.type);

    ctx.save();
    
    if (held.type === 'plato_limpio' && held.contents) {
      // Plate base circle (enlarged from 15 to 22) - Blanco Uniforme Sucio
      ctx.fillStyle = '#D2D7DF';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#555'; // Acero Inoxidable border
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner plate rim (enlarged from 11 to 16)
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // Draw ingredients layered inside the plate coordinates
      const items = held.contents;

      // Try to find if items match any recipe
      let matchedRecipe: Recipe | null = null;
      for (const key of Object.keys(RECIPES)) {
        const recipe = RECIPES[key];
        const reqs = recipe.requiredItems;
        if (items.length === reqs.length) {
          const sortedItems = [...items].sort();
          const sortedReqs = [...reqs].sort();
          if (sortedItems.every((val, idx) => val === sortedReqs[idx])) {
            matchedRecipe = recipe;
            break;
          }
        }
      }

      if (matchedRecipe) {
        // Draw matched recipe glow ring (enlarged from 16 to 24)
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.strokeStyle = matchedRecipe.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw recipe emoji in the middle (enlarged to 24px and centered)
        ctx.save();
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(matchedRecipe.icon, cx, cy);
        ctx.restore();

        // Draw a small recipe label above the plate (larger font and capsule)
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        const nameText = matchedRecipe.name;
        const textWidth = ctx.measureText(nameText).width;
        
        // Draw capsule background above plate
        ctx.fillStyle = matchedRecipe.color;
        drawRoundedRect(ctx, cx - textWidth / 2 - 4, cy - 36, textWidth + 8, 14, 5, true, false);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nameText, cx, cy - 29);
        ctx.restore();
      } else if (items.length > 0) {
        // Draw ingredients layered inside the plate coordinates (larger emojis & centered spacing)
        items.forEach((subType, idx) => {
          const subDet = getItemDetails(subType);
          const offset = (idx - (items.length - 1) / 2) * 8;
          const ix = cx + offset;
          const iy = cy;

          // Draw meat patties procedurally inside plate
          if (subType === 'carne_cruda') {
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.ellipse(ix, iy, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#991B1B';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(ix, iy, 8, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (subType === 'carne_cocinada') {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(ix, iy, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3D1A06';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ix - 6, iy - 2); ctx.lineTo(ix + 6, iy - 2);
            ctx.moveTo(ix - 6, iy + 2); ctx.lineTo(ix + 6, iy + 2);
            ctx.stroke();
            ctx.strokeStyle = '#5C2D0A';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(ix, iy, 8, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (subType === 'carne_quemada') {
            ctx.fillStyle = '#1C1917';
            ctx.beginPath();
            ctx.ellipse(ix, iy, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0C0A09';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ix - 6, iy - 2); ctx.lineTo(ix + 6, iy - 2);
            ctx.moveTo(ix - 6, iy + 2); ctx.lineTo(ix + 6, iy + 2);
            ctx.stroke();
          } else if (subType === 'queso_picado') {
            // Pile of shredded cheese inside plate
            ctx.fillStyle = '#FFE066';
            ctx.beginPath();
            ctx.moveTo(ix - 6, iy + 4);
            ctx.lineTo(ix - 4, iy - 1);
            ctx.lineTo(ix - 1, iy + 2);
            ctx.lineTo(ix + 1, iy - 4);
            ctx.lineTo(ix + 3, iy - 1);
            ctx.lineTo(ix + 6, iy + 4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#D4A843';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(ix - 3, iy + 2); ctx.lineTo(ix - 1, iy - 1);
            ctx.moveTo(ix + 1, iy + 1); ctx.lineTo(ix + 3, iy - 2);
            ctx.stroke();
          } else if (subType === 'pasta_seca') {
            ctx.strokeStyle = '#E8C547';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            for (let i = -2; i <= 2; i++) {
              ctx.beginPath();
              ctx.moveTo(ix + i * 2, iy - 5);
              ctx.quadraticCurveTo(ix + i * 2.5 + 1, iy, ix + i * 2, iy + 5);
              ctx.stroke();
            }
          } else if (subType === 'lechuga_picada') {
            // Mini chopped lettuce pieces inside plate
            ctx.fillStyle = '#22C55E';
            const lpieces = [
              { x: -5, y: -3, w: 4, h: 2.5, r: -0.3 },
              { x: 2, y: -4, w: 5, h: 2.5, r: 0.4 },
              { x: -3, y: 1, w: 4, h: 2, r: -0.5 },
              { x: 3, y: 0, w: 4.5, h: 2.5, r: 0.2 },
              { x: 0, y: 4, w: 5, h: 2.5, r: -0.1 },
              { x: -5, y: 3, w: 3.5, h: 2, r: 0.6 },
            ];
            lpieces.forEach(p => {
              ctx.save();
              ctx.translate(ix + p.x, iy + p.y);
              ctx.rotate(p.r);
              ctx.beginPath();
              ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#16A34A';
              ctx.lineWidth = 0.5;
              ctx.stroke();
              ctx.restore();
            });
          } else if (subType === 'tomate_picado') {
            // Mini tomato slices inside plate
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.ellipse(ix + 3, iy + 1, 5, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // 3 seeds on visible corner of back slice
            ctx.fillStyle = '#FEF9C3';
            const pbsx = ix + 4, pbsy = iy + 1;
            for (let i = 0; i < 3; i++) {
              const a = (i * Math.PI * 2 / 3) - Math.PI / 2 + 0.8;
              const sx = pbsx + Math.cos(a) * 1.8;
              const sy = pbsy + Math.sin(a) * 1.8;
              ctx.beginPath();
              ctx.ellipse(sx, sy, 0.8, 0.5, a + Math.PI / 2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.ellipse(ix - 1, iy - 1, 5, 4, -0.1, 0, Math.PI * 2);
            ctx.fill();
            // 3 seeds on visible corner of middle slice
            ctx.fillStyle = '#FEF9C3';
            const pmsx = ix + 1, pmsy = iy - 2;
            for (let i = 0; i < 3; i++) {
              const a = (i * Math.PI * 2 / 3) - Math.PI / 2 - 0.5;
              const sx = pmsx + Math.cos(a) * 1.8;
              const sy = pmsy + Math.sin(a) * 1.8;
              ctx.beginPath();
              ctx.ellipse(sx, sy, 0.8, 0.5, a + Math.PI / 2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.ellipse(ix - 4, iy + 2, 5, 4, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // 5 seeds on front slice
            const psx = ix - 4, psy = iy + 2, psr = 3;
            for (let i = 0; i < 5; i++) {
              const a = (i * Math.PI * 2 / 5) - Math.PI / 2;
              const sx = psx + Math.cos(a) * psr;
              const sy = psy + Math.sin(a) * psr;
              ctx.beginPath();
              ctx.ellipse(sx, sy, 1, 0.7, a + Math.PI / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.save();
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(subDet.emoji, ix, iy);
            ctx.restore();
          }
        });
      } else {
        // Just empty plate text tag
        ctx.save();
        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VACÍO', cx, cy);
        ctx.restore();
      }
    } else if (held.type === 'masa') {
      // Custom dough ball drawing (not emoji - looks like a waffle)
      ctx.fillStyle = '#E8D5A3';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C4A96A';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Dough highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (held.type === 'masa_estirada') {
      // Custom stretched dough drawing (flat disc)
      ctx.fillStyle = '#F0DDB8';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C4A96A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Spiral lines on the stretched dough
      ctx.strokeStyle = 'rgba(180, 150, 100, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 1.5);
      ctx.stroke();
    } else if (held.type === 'pizza_con_queso' || held.type === 'pizza_con_salsa' || held.type === 'pizza_cruda') {
      // Custom pizza assembly drawings
      // Dough base
      ctx.fillStyle = '#F0DDB8';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C4A96A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (held.type === 'pizza_con_queso') {
        // Cheese layer
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (held.type === 'pizza_con_salsa') {
        // Sauce layer
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // pizza_cruda: cheese + sauce
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (held.type === 'pasta_seca') {
      // Custom raw pasta drawing - spaghetti bundle
      ctx.strokeStyle = '#E8C547';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      // Bundle of spaghetti strands
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 2, cy - 10);
        ctx.quadraticCurveTo(cx + i * 3 + 2, cy, cx + i * 2, cy + 10);
        ctx.stroke();
      }
      // Band/tie in the middle
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 1);
      ctx.lineTo(cx + 6, cy - 1);
      ctx.stroke();
    } else if (held.type === 'queso_picado') {
      // Pile of shredded cheese - yellow mountain shape
      ctx.fillStyle = '#FFE066';
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy + 8);
      ctx.lineTo(cx - 9, cy - 2);
      ctx.lineTo(cx - 5, cy + 3);
      ctx.lineTo(cx - 2, cy - 8);
      ctx.lineTo(cx + 2, cy - 4);
      ctx.lineTo(cx + 5, cy - 10);
      ctx.lineTo(cx + 9, cy - 3);
      ctx.lineTo(cx + 13, cy + 8);
      ctx.closePath();
      ctx.fill();
      // Shredded texture lines
      ctx.strokeStyle = '#D4A843';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + 4); ctx.lineTo(cx - 4, cy - 1);
      ctx.moveTo(cx - 1, cy + 2); ctx.lineTo(cx + 1, cy - 5);
      ctx.moveTo(cx + 4, cy + 3); ctx.lineTo(cx + 7, cy - 1);
      ctx.stroke();
    } else if (held.type === 'tomate_picado') {
      // Tomato slices - 3 round red slices overlapping
      // Back slice
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.ellipse(cx + 5, cy + 2, 9, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx + 5, cy + 2, 9, 8, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      // 3 seeds on visible corner of back slice (right side)
      ctx.fillStyle = '#FEF9C3';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 0.5;
      const bsx = cx + 8, bsy = cy + 1, bsr = 3;
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2 / 3) - Math.PI / 2 + 0.8;
        const sx = bsx + Math.cos(a) * bsr;
        const sy = bsy + Math.sin(a) * bsr;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.8, 1.1, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Middle slice
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.ellipse(cx - 1, cy - 1, 9, 8, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx - 1, cy - 1, 9, 8, -0.1, 0, Math.PI * 2);
      ctx.stroke();
      // Tomato center/star
      ctx.fillStyle = '#FCA5A5';
      ctx.beginPath();
      ctx.ellipse(cx - 1, cy - 1, 3, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 3 seeds on visible corner of middle slice (top right)
      ctx.fillStyle = '#FEF9C3';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 0.5;
      const msx = cx + 2, msy = cy - 4, msr = 3;
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2 / 3) - Math.PI / 2 - 0.5;
        const sx = msx + Math.cos(a) * msr;
        const sy = msy + Math.sin(a) * msr;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.8, 1.1, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Front slice
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy + 3, 9, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy + 3, 9, 8, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      // 5 seeds evenly around the center of front slice
      const fsx = cx - 5, fsy = cy + 3, fsr = 5;
      ctx.fillStyle = '#FEF9C3';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2 / 5) - Math.PI / 2;
        const sx = fsx + Math.cos(a) * fsr;
        const sy = fsy + Math.sin(a) * fsr;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2, 1.3, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (held.type === 'carne_cruda') {
      // Raw burger patty - detailed raw meat with fat marbling
      // Base patty
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dark outline
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Edge shadow
      ctx.fillStyle = 'rgba(100, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy + 5, 10, 4, 0, 0, Math.PI);
      ctx.fill();

    } else if (held.type === 'carne_cocinada') {
      // Cooked burger patty - brown with detailed grill marks and texture
      // Base patty
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Browning gradient (darker bottom)
      const gradPatty = ctx.createRadialGradient(cx, cy - 3, 2, cx, cy, 14);
      gradPatty.addColorStop(0, 'rgba(180, 100, 40, 0.6)');
      gradPatty.addColorStop(1, 'rgba(80, 30, 5, 0.4)');
      ctx.fillStyle = gradPatty;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Grill marks (3 diagonal lines)
      ctx.strokeStyle = '#3D1A06';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 5); ctx.lineTo(cx + 10, cy - 5);
      ctx.moveTo(cx - 11, cy + 0); ctx.lineTo(cx + 11, cy + 0);
      ctx.moveTo(cx - 10, cy + 5); ctx.lineTo(cx + 10, cy + 5);
      ctx.stroke();
      // Juices/fat glistening
      ctx.fillStyle = 'rgba(220, 160, 80, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy - 3, 3, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 2, 2, 1.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Dark edge
      ctx.strokeStyle = '#5C2D0A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.stroke();

    } else if (held.type === 'carne_quemada') {
      // Burnt patty - charred black with cracks and smoke
      // Base patty
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Char texture overlay
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(cx - 3, cy - 2, 6, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Deep char lines
      ctx.strokeStyle = '#0C0A09';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 5); ctx.lineTo(cx + 9, cy - 5);
      ctx.moveTo(cx - 10, cy + 0); ctx.lineTo(cx + 10, cy + 0);
      ctx.moveTo(cx - 9, cy + 5); ctx.lineTo(cx + 9, cy + 5);
      ctx.stroke();
      // Cracks
      ctx.strokeStyle = '#44403C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 6); ctx.lineTo(cx + 1, cy - 1); ctx.lineTo(cx - 1, cy + 3);
      ctx.moveTo(cx + 5, cy - 4); ctx.lineTo(cx + 3, cy + 2);
      ctx.stroke();
      // Ember glow
      ctx.fillStyle = 'rgba(220, 60, 20, 0.3)';
      ctx.beginPath();
      ctx.ellipse(cx - 4, cy + 1, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 80, 20, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx + 5, cy - 2, 2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dark edge
      ctx.strokeStyle = '#0C0A09';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Smoke wisps (3 wavy lines)
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 11); ctx.bezierCurveTo(cx - 6, cy - 15, cx - 3, cy - 18, cx - 5, cy - 20);
      ctx.moveTo(cx + 1, cy - 12); ctx.bezierCurveTo(cx + 3, cy - 16, cx, cy - 19, cx + 2, cy - 21);
      ctx.moveTo(cx + 6, cy - 10); ctx.bezierCurveTo(cx + 8, cy - 14, cx + 5, cy - 17, cx + 7, cy - 19);
      ctx.stroke();
    } else if (held.type === 'lechuga_picada') {
      // Chopped lettuce - small scattered pieces/slices
      ctx.fillStyle = '#22C55E';
      const pieces = [
        { x: -8, y: -6, w: 7, h: 4, r: -0.3 },
        { x: 2, y: -8, w: 8, h: 4, r: 0.4 },
        { x: -5, y: 0, w: 6, h: 3.5, r: -0.6 },
        { x: 4, y: -1, w: 7, h: 4, r: 0.2 },
        { x: -9, y: 4, w: 6, h: 3.5, r: 0.5 },
        { x: 0, y: 5, w: 8, h: 4, r: -0.1 },
        { x: 7, y: 3, w: 6, h: 3.5, r: 0.7 },
        { x: -3, y: -3, w: 5, h: 3, r: -0.4 },
      ];
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(cx + p.x, cy + p.y);
        ctx.rotate(p.r);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#16A34A';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      });
      // Lighter vein lines on some pieces
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx - 3, cy - 5);
      ctx.moveTo(cx + 4, cy - 1); ctx.lineTo(cx + 7, cy);
      ctx.moveTo(cx - 1, cy + 5); ctx.lineTo(cx + 3, cy + 5);
      ctx.stroke();
    } else {
      // Standard ingredient bubble drawing (enlarged from 12 to 19) - Blanco Uniforme Sucio
      ctx.fillStyle = 'rgba(210, 215, 223, 0.93)';
      ctx.beginPath();
      ctx.arc(cx, cy, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#555'; // Stainless steel boundary
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(det.emoji, cx, cy);
      ctx.restore();
    }

    ctx.restore();
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill = true,
    stroke = false,
    strokeColor = '#000000',
    lineWidth = 1
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  const drawCounterBaseSegment = (
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    hasLeft: boolean,
    hasRight: boolean,
    hasTop: boolean,
    hasBottom: boolean
  ) => {
    const R = 12; // Base corner radius
    const inset = 2; // original base inset is sx + 2, sy + 2, width TILE_SIZE - 4, height TILE_SIZE - 4

    // Calculate actual bounds of this cell's base
    const x = hasLeft ? sx : sx + inset;
    const y = hasTop ? sy : sy + inset;
    const w = TILE_SIZE - (hasLeft ? 0 : inset) - (hasRight ? 0 : inset);
    const h = TILE_SIZE - (hasTop ? 0 : inset) - (hasBottom ? 0 : inset);

    // 1. Create the path for filling (includes all corners, sharp if connected)
    ctx.beginPath();
    
    // Top-Left corner
    if (!hasLeft && !hasTop) {
      ctx.moveTo(x + R, y);
    } else {
      ctx.moveTo(x, y);
    }

    // Top-Right corner
    if (!hasRight && !hasTop) {
      ctx.lineTo(x + w - R, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + R);
    } else {
      ctx.lineTo(x + w, y);
    }

    // Bottom-Right corner
    if (!hasRight && !hasBottom) {
      ctx.lineTo(x + w, y + h - R);
      ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
    } else {
      ctx.lineTo(x + w, y + h);
    }

    // Bottom-Left corner
    if (!hasLeft && !hasBottom) {
      ctx.lineTo(x + R, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - R);
    } else {
      ctx.lineTo(x, y + h);
    }

    // Back to Top-Left
    if (!hasLeft && !hasTop) {
      ctx.lineTo(x, y + R);
      ctx.quadraticCurveTo(x, y, x + R, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = '#5C4A3C';
    ctx.fill();

    // 2. Now, draw the stroke (border) ONLY on the outer sides!
    ctx.beginPath();
    ctx.strokeStyle = '#0C0C14';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Let's trace the perimeter. We only add lines (or curves) for the outer edges.
    
    // Top edge
    if (!hasTop) {
      if (!hasLeft) {
        ctx.moveTo(x, y + R);
        ctx.quadraticCurveTo(x, y, x + R, y);
      } else {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x + w - (hasRight ? 0 : R), y);
      if (!hasRight) {
        ctx.quadraticCurveTo(x + w, y, x + w, y + R);
      }
    }

    // Right edge
    if (!hasRight) {
      if (hasTop) {
        ctx.moveTo(x + w, y);
      } else {
        ctx.moveTo(x + w, y + R);
      }
      ctx.lineTo(x + w, y + h - (hasBottom ? 0 : R));
      if (!hasBottom) {
        ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
      }
    }

    // Bottom edge
    if (!hasBottom) {
      if (hasRight) {
        ctx.moveTo(x + w, y + h);
      } else {
        ctx.moveTo(x + w - R, y + h);
      }
      ctx.lineTo(x + (hasLeft ? 0 : R), y + h);
      if (!hasLeft) {
        ctx.quadraticCurveTo(x, y + h, x, y + h - R);
      }
    }

    // Left edge
    if (!hasLeft) {
      if (hasBottom) {
        ctx.moveTo(x, y + h);
      } else {
        ctx.moveTo(x, y + h - R);
      }
      ctx.lineTo(x, y + (hasTop ? 0 : R));
      if (!hasTop) {
        ctx.quadraticCurveTo(x, y, x + R, y);
      }
    }

    ctx.stroke();
  };

  const drawCounterTopSegment = (
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    hasLeft: boolean,
    hasRight: boolean,
    hasTop: boolean,
    hasBottom: boolean
  ) => {
    const R = 6; // Countertop corner radius
    const insetX = 5;
    const insetY = 5;

    // Calculate bounds
    const x = hasLeft ? sx : sx + insetX;
    const y = hasTop ? sy : sy + insetY;
    const w = TILE_SIZE - (hasLeft ? 0 : insetX) - (hasRight ? 0 : insetX);
    const bottomY = hasBottom ? (sy + TILE_SIZE) : (sy + TILE_SIZE - 20);
    const h = bottomY - y;

    // 1. Fill path
    ctx.beginPath();
    
    // Top-Left corner
    if (!hasLeft && !hasTop) {
      ctx.moveTo(x + R, y);
    } else {
      ctx.moveTo(x, y);
    }

    // Top-Right corner
    if (!hasRight && !hasTop) {
      ctx.lineTo(x + w - R, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + R);
    } else {
      ctx.lineTo(x + w, y);
    }

    // Bottom-Right corner
    if (!hasRight && !hasBottom) {
      ctx.lineTo(x + w, y + h - R);
      ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
    } else {
      ctx.lineTo(x + w, y + h);
    }

    // Bottom-Left corner
    if (!hasLeft && !hasBottom) {
      ctx.lineTo(x + R, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - R);
    } else {
      ctx.lineTo(x, y + h);
    }

    // Back to Top-Left
    if (!hasLeft && !hasTop) {
      ctx.lineTo(x, y + R);
      ctx.quadraticCurveTo(x, y, x + R, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = '#555';
    ctx.fill();

    // 2. Stroke outer borders only
    ctx.beginPath();
    ctx.strokeStyle = '#0C0C14';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Top edge
    if (!hasTop) {
      if (!hasLeft) {
        ctx.moveTo(x, y + R);
        ctx.quadraticCurveTo(x, y, x + R, y);
      } else {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x + w - (hasRight ? 0 : R), y);
      if (!hasRight) {
        ctx.quadraticCurveTo(x + w, y, x + w, y + R);
      }
    }

    // Right edge
    if (!hasRight) {
      if (hasTop) {
        ctx.moveTo(x + w, y);
      } else {
        ctx.moveTo(x + w, y + R);
      }
      ctx.lineTo(x + w, y + h - (hasBottom ? 0 : R));
      if (!hasBottom) {
        ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
      }
    }

    // Bottom edge
    if (!hasBottom) {
      if (hasRight) {
        ctx.moveTo(x + w, y + h);
      } else {
        ctx.moveTo(x + w - R, y + h);
      }
      ctx.lineTo(x + (hasLeft ? 0 : R), y + h);
      if (!hasLeft) {
        ctx.quadraticCurveTo(x, y + h, x, y + h - R);
      }
    }

    // Left edge
    if (!hasLeft) {
      if (hasBottom) {
        ctx.moveTo(x, y + h);
      } else {
        ctx.moveTo(x, y + h - R);
      }
      ctx.lineTo(x, y + (hasTop ? 0 : R));
      if (!hasTop) {
        ctx.quadraticCurveTo(x, y, x + R, y);
      }
    }

    ctx.stroke();
  };

  return (
    <div className="w-full h-full relative bg-transparent font-sans p-0 select-none overflow-hidden">
      
      {/* Playfield Area - inset to leave space for HUD */}
      <div className="absolute bg-[#070605] overflow-hidden" style={{ top: '60px', left: '60px', right: '60px', bottom: '0px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 object-contain shadow-inner cursor-default block"
          style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }}
        />

          {/* Player 1 Smooth Touch controls Overlay */}
          {showTouchControls && !showTaskAssignment && !isPaused && !isGameOver && (
            <>
              {/* Left Side: Virtual Joystick */}
              <div className={`absolute bottom-8 left-8 z-20 select-none pointer-events-auto transition-all duration-200 touch-none ${countdown > 0 ? 'opacity-40' : (joystickActive ? 'opacity-70' : 'opacity-50')}`}>
                <div 
                  ref={joystickRef}
                  onTouchStart={handleJoystickStart}
                  onMouseDown={handleJoystickMouseDown}
                  className="w-28 h-28 sm:w-32 sm:h-32 bg-white/5 border border-white/10 rounded-full relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none backdrop-blur-sm"
                  title="Joystick de movimiento"
                  style={{ touchAction: 'none' }}
                >
                  {/* Crosshair lines */}
                  <div className="absolute w-px h-full bg-white/5" />
                  <div className="absolute w-full h-px bg-white/5" />
                  
                  {/* Moveable Joystick Knob */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-white/20 border border-white/20 rounded-full flex items-center justify-center select-none pointer-events-none absolute backdrop-blur-sm ${joystickActive ? 'transition-none' : 'transition-transform duration-150 ease-out'}`}
                    style={{ transform: `translate3d(${joystickPos.x}px, ${joystickPos.y}px, 0)`, touchAction: 'none' }}
                  >
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Right Side: Virtual Action Buttons */}
              <div className={`absolute bottom-8 right-8 z-20 flex gap-3 items-center select-none pointer-events-auto transition-opacity duration-300 touch-none ${countdown > 0 ? 'opacity-40' : 'opacity-50 hover:opacity-70 active:opacity-80'}`}>
                
                {/* ACCION/TRABAJAR Button */}
                <button
                  {...getTouchKeyHandlers('e')}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 rounded-full flex flex-col items-center justify-center transition-all outline-none select-none cursor-pointer backdrop-blur-sm touch-none"
                  style={{ touchAction: 'none' }}
                >
                  <span className="text-base sm:text-lg opacity-80">🔪</span>
                  <span className="text-[7px] sm:text-[8px] font-medium tracking-wider uppercase whitespace-nowrap text-white/50 mt-0.5">ACCIÓN</span>
                </button>

                {/* AGARRAR/SOLTAR Button */}
                <button
                  onTouchStart={handleTouchGrab}
                  onMouseDown={handleTouchGrab}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 rounded-full flex flex-col items-center justify-center transition-all outline-none select-none cursor-pointer backdrop-blur-sm touch-none"
                  style={{ touchAction: 'none' }}
                >
                  <span className="text-base sm:text-lg opacity-80">🫳</span>
                  <span className="text-[7px] sm:text-[8px] font-medium tracking-wider uppercase whitespace-nowrap text-white/50 mt-0.5">TOMAR</span>
                </button>

                {/* DASH Button */}
                <button
                  onTouchStart={handleTouchDash}
                  onMouseDown={handleTouchDash}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 rounded-full flex flex-col items-center justify-center transition-all outline-none select-none cursor-pointer backdrop-blur-sm touch-none"
                  style={{ touchAction: 'none' }}
                >
                  <span className="text-base sm:text-lg opacity-80">⚡</span>
                  <span className="text-[7px] sm:text-[8px] font-medium tracking-wider uppercase whitespace-nowrap text-white/50 mt-0.5">CORRER</span>
                </button>

              </div>
            </>
          )}
        </div>

        {/* Ready, Set, Cook! Screen Countdown Overlay */}
        {countdown > 0 && !showTaskAssignment && (
          <div className="absolute inset-0 bg-[#0C0C14]/90 backdrop-blur-md z-30 flex items-center justify-center p-4">
            <div className="bg-[#0C0C14] rounded-2xl border-2 border-[#2A2A3A] p-6 sm:p-8 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),-6px_-6px_0px_var(--theme-color-accent)] max-w-sm w-[85%] sm:w-full flex flex-col gap-4 items-center justify-center text-center transform rotate-[-1deg] animate-scaleIn relative">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-[1] rounded-2xl" style={{background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'}} />
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--theme-color-accent)] bg-[#1A1A2E] px-3 py-1 rounded border border-[#2A2A3A] relative z-[2]">
                🚀 {t('coop_prep_kitchen')}
              </span>
              
              <div className="text-3xl sm:text-4xl font-black uppercase text-white bg-[var(--theme-color-primary)] px-5 py-3.5 border-2 border-[#2A2A3A] transform skew-x-[-12deg] shadow-[0_0_30px_var(--theme-color-primary),4px_4px_0px_var(--theme-color-accent)] my-2 block font-mono tracking-tighter w-full relative z-[2]">
                {countdown === 4 ? t('coop_countdown_listos') : countdown === 3 ? t('coop_countdown_establecidos') : countdown === 2 ? t('coop_countdown_cocinar') : t('coop_countdown_ya')}
              </div>
              
              {/* Guide overlay */}
              <div className="w-full bg-[#1A1A2E] border border-[#2A2A3A] p-3.5 rounded-xl text-[10px] sm:text-xs text-[#D2D7DF] transform rotate-[1.5deg] shadow-[3px_3px_0px_var(--theme-color-accent)] mt-2 font-mono relative z-[2]">
                <span className="font-bold uppercase text-[#FFAE58] block mb-1 border-b border-white/10 pb-1">{t('coop_target_obj')}</span>
                <span>
                  {t('coop_target_msg').split('<strong>').map((part, index) => {
                    if (part.includes('</strong>')) {
                      const [boldText, restText] = part.split('</strong>');
                      return (
                        <React.Fragment key={index}>
                          <strong className="text-[var(--theme-color-accent)] font-black">{boldText.replace('{score}', Math.round(level.targetScoreStars[0] * diffMods.scoreMult).toString())}</strong>
                          {restText}
                        </React.Fragment>
                      );
                    }
                    return part.replace('{score}', Math.round(level.targetScoreStars[0] * diffMods.scoreMult).toString());
                  })}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* Task Assignment Screen Overlay (COOP mode pre-game) - zero scroll */}
        {showTaskAssignment && (
          <div className="absolute inset-0 bg-[#0C0C14]/95 z-40 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden font-mono select-none">
            <div className="w-full max-w-2xl max-h-[96vh] bg-[#0C0C14] rounded-2xl border-2 border-[#2A2A3A] p-3.5 sm:p-5 shadow-[0_0_60px_rgba(220,38,38,0.15),0_0_120px_rgba(0,0,0,0.8),8px_8px_0px_var(--theme-color-primary),-6px_-6px_0px_var(--theme-color-accent)] flex flex-col justify-between items-center gap-2.5 transform rotate-[-0.5deg] animate-scaleIn overflow-hidden relative">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-[1] rounded-2xl" style={{background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'}} />
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--theme-color-accent)] z-[2]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--theme-color-accent)] z-[2]" />
              
              {/* Decorative Header Banner */}
              <div className="text-center w-full flex flex-col items-center shrink-0 relative z-[2]">
                <div className="bg-[var(--theme-color-primary)] text-white py-1.5 px-5 rounded-lg border-2 border-[#2A2A3A] transform rotate-[-0.5deg] skew-x-[-4deg] shadow-[0_0_20px_var(--theme-color-primary),3px_3px_0px_var(--theme-color-accent)] inline-block text-center">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-[var(--theme-color-accent)] uppercase block">
                    {t('coop_assignment_title')}
                  </span>
                  <h2 className="text-sm sm:text-lg font-black text-white tracking-tight leading-none uppercase mt-0.5">
                    {t('coop_assignment_header')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#555] mt-1.5 max-w-md leading-tight font-black uppercase">
                  {t('coop_assignment_desc')}
                </p>
              </div>

              {/* Dual Columns & Swap Arena */}
              <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 items-stretch flex-1 min-h-0 relative z-[2]">
                
                {/* Chef Fuego (Player 1) Column */}
                <div className="bg-[#0C0C14] rounded-xl border border-[#2A2A3A] p-2.5 sm:p-3 flex flex-col justify-between relative shadow-[0_0_20px_rgba(211,31,38,0.3),3px_3px_0px_#D31F26] min-h-0 transform rotate-[-0.5deg]">
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#D31F26] rounded-full animate-ping" />
                  
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2.5 mb-2 border-b border-dashed border-[#2A2A3A] pb-1.5 shrink-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#D31F26] flex items-center justify-center text-white font-black text-xs sm:text-sm border border-[#2A2A3A] transform skew-x-[-4deg]">
                        1
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-[#D29F75] uppercase leading-none">{t('coop_chef_p1_name')}</h3>
                        <span className="text-[10px] sm:text-[11px] text-[#555] font-bold uppercase block mt-0.5">{t('coop_chef_p1_ctrl')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1 overflow-hidden justify-center min-h-0">
                      {Object.keys(assignedIngredients)
                        .filter(k => assignedIngredients[k as ItemType] === 1)
                        .map(k => {
                          const details = getItemDetails(k as ItemType);
                          return (
                            <button
                              key={k}
                              onClick={() => handleToggleIngredient(k as ItemType)}
                              className="w-full bg-[#1A1A2E] hover:bg-[#D31F26] hover:text-white hover:border-[#F9D014] active:translate-y-0.5 transition-all px-2.5 py-1.5 rounded-md flex items-center justify-between border border-[#2A2A3A] text-left group cursor-pointer shadow-[2px_2px_0px_#0C0C14]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base shrink-0">{details.emoji}</span>
                                <span className="text-xs sm:text-sm font-black text-white truncate group-hover:text-white">{details.name}</span>
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-black text-[#D31F26] group-hover:text-white uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                {t('coop_pass_right')}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  
                  <div className="border-t border-[#2A2A3A] mt-1.5 pt-1.5 flex justify-between items-center text-[10px] sm:text-xs font-black text-[#D29F75] uppercase leading-none shrink-0">
                    <span>{t('coop_p1_title')}</span>
                    <span className="bg-[#1A1A2E] px-2 py-0.5 rounded border border-[#2A2A3A]">
                      {t('tab_play') === 'JOGAR' || t('tab_play') === 'GIOCA' ? 'Qty:' : t('tab_play') === 'PLAY' ? 'Qty:' : 'Cant:'} {Object.keys(assignedIngredients).filter(k => assignedIngredients[k as ItemType] === 1).length}
                    </span>
                  </div>
                </div>

                {/* Chef Verde (Player 2) Column */}
                <div className="bg-[#0C0C14] rounded-xl border border-[#2A2A3A] p-2.5 sm:p-3 flex flex-col justify-between relative shadow-[0_0_20px_rgba(143,168,137,0.3),3px_3px_0px_#8FA889] min-h-0 transform rotate-[0.5deg]">
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#8FA889] rounded-full animate-ping" />
                  
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2.5 mb-2 border-b border-dashed border-[#2A2A3A] pb-1.5 shrink-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#8FA889] flex items-center justify-center text-[#0C0C14] font-black text-xs sm:text-sm border border-[#2A2A3A] transform skew-x-[4deg]">
                        2
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-[#8FA889] uppercase leading-none">{t('coop_chef_p2_name')}</h3>
                        <span className="text-[10px] sm:text-[11px] text-[#555] font-bold uppercase block mt-0.5">{t('coop_chef_p2_ctrl')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 flex-1 overflow-hidden justify-center min-h-0">
                      {Object.keys(assignedIngredients)
                        .filter(k => assignedIngredients[k as ItemType] === 2)
                        .map(k => {
                          const details = getItemDetails(k as ItemType);
                          return (
                            <button
                              key={k}
                              onClick={() => handleToggleIngredient(k as ItemType)}
                              className="w-full bg-[#1A1A2E] hover:bg-[#8FA889] hover:text-[#0C0C14] hover:border-white active:translate-y-0.5 transition-all px-2.5 py-1.5 rounded-md flex items-center justify-between border border-[#2A2A3A] text-left group cursor-pointer shadow-[2px_2px_0px_#0C0C14]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base shrink-0">{details.emoji}</span>
                                <span className="text-xs sm:text-sm font-black text-white truncate group-hover:text-[#0C0C14]">{details.name}</span>
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-black text-[#8FA889] group-hover:text-[#0C0C14] uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
                                {t('coop_pass_left')}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  
                  <div className="border-t border-[#2A2A3A] mt-1.5 pt-1.5 flex justify-between items-center text-[10px] sm:text-xs font-black text-[#8FA889] uppercase leading-none shrink-0">
                    <span>{t('coop_p2_title')}</span>
                    <span className="bg-[#1A1A2E] px-2 py-0.5 rounded border border-[#2A2A3A]">
                      {t('tab_play') === 'JOGAR' || t('tab_play') === 'GIOCA' ? 'Qty:' : t('tab_play') === 'PLAY' ? 'Qty:' : 'Cant:'} {Object.keys(assignedIngredients).filter(k => assignedIngredients[k as ItemType] === 2).length}
                    </span>
                  </div>
                </div>

              </div>

              {/* Call to Action Button */}
              <div className="w-full flex flex-col items-center gap-1.5 shrink-0 relative z-[2]">
                <button
                  onClick={handleStartCoopGame}
                  className="px-8 py-2.5 bg-[var(--theme-color-primary)] hover:bg-[var(--theme-color-primary)]/90 text-white border-2 border-[#2A2A3A] rounded-lg font-black text-sm sm:text-base uppercase tracking-wider transform skew-x-[-6deg] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--theme-color-primary),3px_3px_0px_var(--theme-color-accent)] cursor-pointer shrink-0"
                >
                  {t('coop_start_btn')}
                </button>
                <span className="text-[9px] sm:text-[10px] text-[#555] font-mono font-bold tracking-widest uppercase text-center">
                  {t('coop_agree_msg')}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* HUD Overlay with complete metrics */}
        <HUD
          score={score}
          timeRemaining={timeRemaining}
          level={level}
          activeOrders={activeOrders}
          onReplay={() => {
            sounds.playWinFanfare();
            if (gameMode === 'ONLINE') {
              multiplayerClient.resetToLobby();
            } else {
              setLevelReset();
            }
          }}
          onExit={onExit}
          gameMode={gameMode}
          activeChefId={1}
          isPaused={isPaused}
          onTogglePause={() => {
            sounds.playSelect();
            setIsPaused(p => !p);
          }}
          isGameOver={isGameOver}
          difficulty={difficulty}
        />

        {isPaused && (
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
                  {t('pause_settings_title')}
                </span>
              </div>

              {/* Combined Pause & Settings Box */}
              <div className="flex flex-col gap-3 bg-[#1A1A2E] border border-[#2A2A3A] rounded-md p-4 shadow-[4px_4px_0px_var(--theme-color-primary)] transform rotate-[-0.5deg] overflow-hidden relative z-[2]">
                
                {/* Audio & Controls Row */}
                <div className="grid grid-cols-2 gap-2.5 border-b border-[#2A2A3A] pb-3 mb-0.5">
                  <button
                    onClick={() => {
                      const updatedMuted = sounds.toggleMute();
                      setLocalMuted(updatedMuted);
                      sounds.playSelect();
                    }}
                    className={`py-2 px-2.5 rounded-md font-mono font-black text-xs sm:text-[13px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                      localMuted
                        ? 'bg-[#1A1A2E] text-red-500 border-red-500/50 hover:bg-red-950/40'
                        : 'bg-[#0C0C14] text-emerald-400 border-emerald-500/50 hover:bg-emerald-950/30'
                    }`}
                    id="settings_toggle_sound_btn"
                  >
                    {localMuted ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    <span className="truncate">{localMuted ? t('pause_sound_muted').split(':')[0] : t('pause_sound_active').split(':')[0]}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTouchControls(prev => {
                        const nextVal = !prev;
                        try {
                          localStorage.setItem('touch_controls_enabled', String(nextVal));
                        } catch {}
                        return nextVal;
                      });
                      sounds.playSelect();
                    }}
                    className={`py-2 px-2.5 rounded-md font-mono font-black text-xs sm:text-[13px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                      !showTouchControls
                        ? 'bg-[#1A1A2E] text-red-500 border-red-500/50 hover:bg-red-950/40'
                        : 'bg-[#0C0C14] text-[#FFAE58] border-[#FFAE58]/50 hover:bg-[#FFAE58]/10'
                    }`}
                    id="settings_toggle_touch_btn"
                  >
                    <span className="text-sm">🎮</span>
                    <span className="truncate">{showTouchControls ? (lang === 'es' ? 'TÁCTIL: SÍ' : 'TOUCH: ON') : (lang === 'es' ? 'TÁCTIL: NO' : 'TOUCH: OFF')}</span>
                  </button>
                </div>

                {/* Game Actions */}
                <button
                  onClick={() => {
                    sounds.playSelect();
                    setIsPaused(false);
                  }}
                  className="py-2.5 px-4 bg-[var(--theme-color-primary)] text-white font-mono font-black rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-[#2A2A3A] hover:brightness-110 active:translate-y-0.5 transition-all shadow-[0_0_20px_var(--theme-color-primary),3px_3px_0px_var(--theme-color-accent)] transform rotate-[-0.5deg]"
                  id="paused_resume_canvas_btn"
                >
                  <Play className="w-4 h-4 text-white fill-current" />
                  <span>{t('pause_resume_btn')}</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playSelect();
                    setLevelReset();
                    setIsPaused(false);
                  }}
                  className="py-2.5 px-4 bg-[var(--theme-color-accent)] text-[#0C0C14] font-mono font-black rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-[#2A2A3A] hover:brightness-110 active:translate-y-0.5 transition-all shadow-[3px_3px_0px_var(--theme-color-primary)] transform rotate-[0.5deg]"
                  id="paused_reset_canvas_btn"
                >
                  <RotateCcw className="w-4 h-4 text-[#0C0C14]" />
                  <span>{t('pause_restart_btn')}</span>
                </button>

                <button
                  onClick={onExit}
                  className="py-2.5 px-4 bg-[#1A1A2E] hover:bg-[#1A1A2E]/80 text-white font-mono font-black rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#2A2A3A] hover:border-[var(--theme-color-accent)] cursor-pointer transition-all active:translate-y-0.5 shadow-[3px_3px_0px_var(--theme-color-primary)] mt-0.5"
                  id="paused_exit_canvas_btn"
                >
                  <Home className="w-4 h-4 text-[var(--theme-color-accent)]" />
                  <span>{t('pause_exit_btn')}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      {/* Gamepad Click Ripples when Paused */}
      {isPaused && ripples.map(r => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-[9998] w-8 h-8 rounded-full border-4 border-[#ff9b22]/80 animate-ping"
          style={{
            left: r.x - 16,
            top: r.y - 16,
          }}
        />
      ))}

      {/* Gamepad Virtual Mouse Cursor Joystick Pointer when Paused */}
      {isPaused && cursorVisible && (
        <div
          className="fixed pointer-events-none z-[9999] transition-all duration-75 select-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Pulsing ring underneath */}
            <div className="absolute w-10 h-10 -top-1 rounded-full border-2 border-[#BA8179]/60 animate-pulse pointer-events-none" />
            
            {/* Chef Hat Bubble pointer */}
            <div className="bg-gradient-to-b from-[#BA8179] to-[#995E57] text-white p-2 rounded-full border-4 border-white shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center justify-center scale-105 active:scale-95 transition-transform">
              <span className="text-sm font-bold">👨‍🍳</span>
            </div>

            {/* Downward pointer tail */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white -mt-0.5 filter drop-shadow-md" />

            {/* Glowing active indicator dot */}
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white absolute -top-1 -right-1 shadow animate-pulse" />

            {/* Quick Helper Tag */}
            <div className="bg-[#111214]/90 border-2 border-[#434854] text-[9.5px] font-mono font-black text-[#BA8179] px-2 py-0.5 rounded-lg shadow-md whitespace-nowrap mt-1.5 uppercase tracking-wide">
              🕹️ MANDO
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Set resetting routine
  function setLevelReset() {
    // Reset stations to fresh state
    const freshStations: KitchenStation[] = [];
    level.mapLayout.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        const { type, dispensed } = getStationTypeFromChar(char);
        if (type !== 'floor') {
          freshStations.push({
            gridX: c,
            gridY: r,
            type: type as any,
            dispensedIngredient: dispensed,
            heldItem: null,
            progress: 0,
            isWarning: false
          });
        }
      }
    });
    stationsRef.current = freshStations;

    // Place initial dirty plates on sinks so players have something to wash
    let dirtyPlatesToPlace = 2;
    for (const station of stationsRef.current) {
      if (dirtyPlatesToPlace <= 0) break;
      if (station.type === 'sink') {
        station.heldItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'plato_sucio'
        };
        dirtyPlatesToPlace--;
      }
    }

    setScore(0);
    scoreRef.current = 0;
    gameTimeRef.current = effectiveTimeLimit;
    setTimeRemaining(effectiveTimeLimit);
    setIsGameOver(false);
    ordersRef.current = [];
    setActiveOrders([]);
    particlesRef.current = [];
    scoreLabels.current = [];
    setCountdown(4);

    washedDishesCountRef.current = 0;
    choppedCheeseCountRef.current = 0;
    choppedTomatoCountRef.current = 0;
    cookedMeatCountRef.current = 0;
    chopCountRef.current = 0;
    deliveryStreakRef.current = 0;
    deliveryCountRef.current = 0;
    pastaDeliveredCountRef.current = 0;
    wasTrashUsedRef.current = false;
    didBurnAnythingRef.current = false;
    didFailAnyOrderRef.current = false;
    lastActionTimeRef.current = Date.now();
    orderSpawnCounter.current = 0;

    if (gameMode !== 'ONLINE') {
      const char1 = CHARACTERS.find(c => c.id === chef1CharId) || CHARACTERS[0];
      const char2 = CHARACTERS.find(c => c.id === chef2CharId) || CHARACTERS[1];

      p1Ref.current.name = lang === 'es' ? char1.nameEs : char1.nameEn;
      p1Ref.current.color = char1.color;
      p1Ref.current.hatColor = char1.hatColor;

      p2Ref.current.name = lang === 'es' ? char2.nameEs : char2.nameEn;
      p2Ref.current.color = char2.color;
      p2Ref.current.hatColor = char2.hatColor;
    }

    p1Ref.current.x = TILE_SIZE * 2.5;
    p1Ref.current.y = TILE_SIZE * 3.5;
    p1Ref.current.heldItem = null;
    p1Ref.current.isChopping = false;
    p1Ref.current.isWashing = false;
    p1Ref.current.isStunned = false;
    p1Ref.current.stunTimer = 0;
    p1Ref.current.takeAnimTimer = 0;
    p1Ref.current.takeAnimFrame = 0;

    p2Ref.current.x = TILE_SIZE * 8.5;
    p2Ref.current.y = TILE_SIZE * 3.5;
    p2Ref.current.heldItem = null;
    p2Ref.current.isChopping = false;
    p2Ref.current.isWashing = false;
    p2Ref.current.isStunned = false;
    p2Ref.current.stunTimer = 0;
    p2Ref.current.takeAnimTimer = 0;
    p2Ref.current.takeAnimFrame = 0;

    p3Ref.current.x = TILE_SIZE * 5.5;
    p3Ref.current.y = TILE_SIZE * 2.5;
    p3Ref.current.heldItem = null;
    p3Ref.current.isChopping = false;
    p3Ref.current.isWashing = false;
    p3Ref.current.isStunned = false;
    p3Ref.current.stunTimer = 0;
    p3Ref.current.takeAnimTimer = 0;
    p3Ref.current.takeAnimFrame = 0;

    p4Ref.current.x = TILE_SIZE * 6.5;
    p4Ref.current.y = TILE_SIZE * 2.5;
    p4Ref.current.heldItem = null;
    p4Ref.current.isChopping = false;
    p4Ref.current.isWashing = false;
    p4Ref.current.isStunned = false;
    p4Ref.current.stunTimer = 0;
    p4Ref.current.takeAnimTimer = 0;
    p4Ref.current.takeAnimFrame = 0;

    spawnNewOrder();
    spawnNewOrder();

    if (gameMode === 'COOP') {
      setShowTaskAssignment(true);
    } else {
      startCountdownSequence();
    }
  }
}

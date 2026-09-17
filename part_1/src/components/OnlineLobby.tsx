import React, { useState, useEffect, useRef } from 'react';
import { multiplayerClient, RoomData } from '../services/multiplayerClient';
import { ArrowLeft, Users, Send, Check, Play, Shield, Wifi, Key } from 'lucide-react';
import { CHARACTERS, Difficulty } from '../types';
import { sounds } from '../sounds';

interface OnlineLobbyProps {
  onBack: () => void;
  chef1CharId: string;
  onStartOnlineGame: (roomId: string, playerId: string, levelId: number, difficulty: Difficulty) => void;
  lang: string;
  t: (key: any, options?: any) => string;
  lobbyId?: string | null;
  onLeaveRoom?: () => void;
}

export default function OnlineLobby({
  onBack,
  chef1CharId,
  onStartOnlineGame,
  lang,
  t,
  lobbyId,
  onLeaveRoom
}: OnlineLobbyProps) {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(() => {
    // Only restore from lobbyId prop, NOT from stale lastRoomData
    return lobbyId || null;
  });

  const [roomData, setRoomData] = useState<any | null>(null);

  const [matchmakingMode, setMatchmakingMode] = useState<'selection' | 'lobby'>(() => {
    return lobbyId ? 'lobby' : 'selection';
  });
  const [matchType, setMatchType] = useState<'web' | 'code'>('web');
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [lobbyCode, setLobbyCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  
  const [playerName, setPlayerName] = useState<string>(() => {
    const char = CHARACTERS.find(c => c.id === chef1CharId);
    const chefName = char ? (lang === 'es' ? char.nameEs : char.nameEn) : 'Cocinero';
    return localStorage.getItem('online_player_name') || `${chefName}_${Math.floor(Math.random() * 900) + 100}`;
  });

  const [playerId] = useState<string>(() => {
    let id = sessionStorage.getItem('online_player_id');
    if (!id) {
      id = `chef_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('online_player_id', id);
    }
    return id;
  });

  const roomDataRef = useRef<any>(null);
  const gameStartedRef = useRef<boolean>(false);

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chatText, setChatText] = useState<string>('');

  // Persist name change
  const handleNameChange = (val: string) => {
    setPlayerName(val);
    localStorage.setItem('online_player_name', val);
    setStatusMsg('');
  };

  // Clear statusMsg when matchType or inputCode or maxPlayers changes
  useEffect(() => {
    setStatusMsg('');
  }, [matchType, inputCode, maxPlayers]);

  // Establish connection (no auto-rejoin here - GameCanvas handles reconnection during gameplay)
  useEffect(() => {
    // Clear any stale room data from previous sessions
    multiplayerClient.clearStaleState();
    sessionStorage.removeItem('online_lobby_id');
    multiplayerClient.connect();
  }, []);

  // Listen to the lobby room once joined
  useEffect(() => {
    if (!currentRoomId) return;

    const unsubRoom = multiplayerClient.onRoomUpdate((data) => {
      setRoomData(data);

      // Check if host started the game
      if (data.status === 'playing' && data.players[playerId]) {
        // Mark game as started to prevent cleanup from sending LEAVE_LOBBY
        gameStartedRef.current = true;
        // Trigger start of online game
        onStartOnlineGame(currentRoomId, playerId, data.levelId, data.difficulty);
      }
    });

    return () => {
      unsubRoom();
    };
  }, [currentRoomId, playerId, onStartOnlineGame]);

  // Handle successful join and error events (registered immediately on mount)
  useEffect(() => {
    const unsubJoin = multiplayerClient.onJoinSuccess((data) => {
      setIsConnecting(false);
      setCurrentRoomId(data.roomId);
      setRoomData(data.roomData);
      setMatchmakingMode('lobby');
      sessionStorage.setItem('online_lobby_id', data.roomId);
    });

    const unsubError = multiplayerClient.onError((error) => {
      setIsConnecting(false);
      sounds.playFail();
      if (error.code === 'NOT_FOUND') {
        setStatusMsg(lang === 'es' ? 'La sala no existe o ha expirado.' : 'Lobby does not exist or has expired.');
      } else if (error.code === 'ALREADY_STARTED') {
        setStatusMsg(lang === 'es' ? 'La partida ya ha comenzado.' : 'Game has already started.');
      } else if (error.code === 'FULL') {
        setStatusMsg(lang === 'es' ? 'La sala está llena (máx. 4 jugadores).' : 'Lobby is full (max 4 players).');
      } else {
        setStatusMsg(error.message);
      }
    });

    return () => {
      unsubJoin();
      unsubError();
    };
  }, [lang]);

  // NOTE: No LEAVE_LOBBY on unmount cleanup.
  // Explicit leave is handled by the "ABANDONAR SALA" / "SALIR DE LA SALA" buttons.
  // Server handles implicit disconnections with a 30s grace period.

  // Quick Preset Messages
  const PRESET_MESSAGES = lang === 'es' ? [
    '¡Hola chefs! 👋',
    '¡A cocinar con todo! 🔥',
    'Yo lavo los platos 🫧',
    '¡Cuidado con quemar la carne! 🥩',
    '¡Rápido, entrega la orden! ⏱️',
    '¡Jajaja qué caos! 😂'
  ] : [
    'Hello chefs! 👋',
    'Let\'s cook! 🔥',
    'I\'ll wash the dishes 🫧',
    'Don\'t burn the meat! 🥩',
    'Quick, deliver! ⏱️',
    'Haha what chaos! 😂'
  ];

  // Leave lobby function
  const leaveLobby = async (roomId: string) => {
    sounds.playSelect();
    multiplayerClient.leaveLobby();
    setCurrentRoomId(null);
    setRoomData(null);
    setStatusMsg('');
    setMatchmakingMode('selection');
    sessionStorage.removeItem('online_lobby_id');
    onLeaveRoom?.();
  };

  // Create or Join Lobby
  const handleMatchmaking = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setStatusMsg(lang === 'es' ? 'Buscando salas...' : 'Searching for lobbies...');
    sounds.playSelect();

    // Clear stale state before joining
    multiplayerClient.clearStaleState();
    sessionStorage.removeItem('online_lobby_id');
    setCurrentRoomId(null);
    setRoomData(null);

    multiplayerClient.joinLobby(playerId, playerName, matchType, maxPlayers, inputCode);
  };

  // Toggle ready status
  const toggleReady = async () => {
    if (!currentRoomId || !roomData) return;
    sounds.playSelect();
    multiplayerClient.toggleReady();
  };

  // Select Character (Chef character)
  const selectCharacter = async (chefId: string) => {
    if (!currentRoomId || !roomData) return;
    
    // Check if another player already selected this chefId
    const isAlreadyChosen = Object.values(roomData.players).some(
      (p: any) => p.id !== playerId && p.chefId === chefId
    );
    if (isAlreadyChosen) {
      sounds.playFail();
      return;
    }

    sounds.playSelect();
    multiplayerClient.chooseChef(chefId);
  };

  // Host starts the game
  const hostStartGame = async () => {
    if (!currentRoomId || !roomData) return;
    
    // Check if everyone is ready
    const playersArr = Object.values(roomData.players);
    const nonHostPlayers = playersArr.filter((p: any) => p.id !== playerId);
    const allReady = nonHostPlayers.every((p: any) => p.isReady);

    if (!allReady && playersArr.length > 1) {
      alert(lang === 'es' ? '¡Todos los jugadores deben estar Listos!' : 'All players must be Ready!');
      return;
    }

    sounds.playWinFanfare();
    multiplayerClient.startGame();
  };

  // Change Level (Host only)
  const changeLevel = async (lvlId: number) => {
    if (!currentRoomId || !roomData || roomData.hostId !== playerId) return;
    sounds.playSelect();
    multiplayerClient.changeLevel(lvlId);
  };

  // Change Difficulty (Host only)
  const changeDifficulty = async (diff: Difficulty) => {
    if (!currentRoomId || !roomData || roomData.hostId !== playerId) return;
    sounds.playSelect();
    multiplayerClient.changeDifficulty(diff);
  };

  // Send Chat message
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || !currentRoomId || !roomData) return;
    sounds.playSelect();
    multiplayerClient.sendChat(text);
    setChatText('');
  };

  const getChefEmoji = (chefId: string) => {
    return CHARACTERS.find(c => c.id === chefId)?.emoji || '🧑‍🍳';
  };

  const getChefColor = (chefId: string) => {
    return CHARACTERS.find(c => c.id === chefId)?.color || '#4A90E2';
  };

  return (
    <div className="w-full h-full flex flex-col justify-between animate-fadeIn text-white">
      {matchmakingMode === 'selection' ? (
        /* STEP 1: CONFIGURE & JOIN/CREATE SCREEN */
        <div className="flex flex-col gap-2 justify-center max-w-md mx-auto w-full h-full animate-fadeIn py-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2E3A46] pb-1 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#2E3A46] bg-[#0A1118]/80 hover:bg-[#2E3A46]/30 transition-all cursor-pointer text-[10px] font-mono uppercase tracking-wider shadow-[2px_2px_0px_#0A1118]"
            >
              <ArrowLeft className="w-3 h-3 text-[#E6A15C]" />
              <span>{lang === 'es' ? 'VOLVER' : 'BACK'}</span>
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[var(--theme-color-accent)] font-bold text-[10px] uppercase bg-[#0a1118] border border-[#2E3A46] px-2 py-0.5 rounded-md">
              <Wifi className="w-3 h-3 animate-pulse text-[#2ECC71]" />
              <span>COOP ONLINE 🌐</span>
            </div>
          </div>

          {/* Unified Snug Rectangular Control Center - Fits beautifully without any overflow */}
          <div className="bg-[#141D26] p-3.5 rounded-xl border-2 border-white shadow-[4px_4px_0px_#0A1118] flex flex-col gap-2.5">
            
            {/* 1. Kitchen Nickname */}
            <div className="flex flex-col gap-0.5 text-left">
              <label className="text-[9px] font-mono text-[#788896] font-black uppercase tracking-wider">
                👤 {lang === 'es' ? 'Apodo de Cocinero:' : 'Cook Nickname:'}
              </label>
              <div className="flex gap-1.5 items-center bg-[#0A1118] border border-[#2E3A46] rounded-lg px-2.5 py-1.5 focus-within:border-white transition-all">
                <span className="text-xs font-mono text-[#788896] font-bold">🍳</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={16}
                  placeholder="Nickname..."
                  className="bg-transparent text-white font-mono font-black text-xs outline-none flex-1 uppercase tracking-wide"
                />
              </div>
            </div>

            {/* 2. Room size (UP - "el maximo de sala arriba") */}
            <div className="flex flex-col gap-0.5 text-left">
              <label className="text-[9px] font-mono text-[#788896] font-black uppercase tracking-wider">
                👥 {lang === 'es' ? 'Tamaño Máximo de Sala:' : 'Max Room Size:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => { sounds.playSelect(); setMaxPlayers(num); }}
                    className={`py-1.5 rounded-lg border-2 text-[10px] font-mono font-black tracking-wider transition-all cursor-pointer ${
                      maxPlayers === num
                        ? 'bg-[var(--theme-color-primary)] text-white border-white shadow-[2px_2px_0px_#0A1118]'
                        : 'border-[#2E3A46] bg-[#0A1118] text-[#788896] hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {num} {lang === 'es' ? 'CHEFS' : 'CHEFS'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Connection Method (DOWN - "abajo metodo de coneccion") */}
            <div className="flex flex-col gap-0.5 text-left">
              <label className="text-[9px] font-mono text-[#788896] font-black uppercase tracking-wider">
                🔌 {lang === 'es' ? 'Método de Conexión:' : 'Connection Method:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { sounds.playSelect(); setMatchType('web'); }}
                  className={`py-2 rounded-lg border-2 font-mono text-[10px] font-black tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1 ${
                    matchType === 'web'
                      ? 'bg-[var(--theme-color-primary)] text-white border-white shadow-[2px_2px_0px_#0a1118]'
                      : 'border-[#2E3A46] bg-[#0A1118] text-[#788896] hover:border-white/40 hover:text-white'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'PARTIDA PÚBLICA' : 'PUBLIC MATCH'}</span>
                </button>
                <button
                  onClick={() => { sounds.playSelect(); setMatchType('code'); }}
                  className={`py-2 rounded-lg border-2 font-mono text-[10px] font-black tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1 ${
                    matchType === 'code'
                      ? 'bg-[var(--theme-color-primary)] text-white border-white shadow-[2px_2px_0px_#0a1118]'
                      : 'border-[#2E3A46] bg-[#0A1118] text-[#788896] hover:border-white/40 hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'SALA PRIVADA' : 'PRIVATE CODE'}</span>
                </button>
              </div>
            </div>

            {/* Sub-options for matchType */}
            {matchType === 'web' ? (
              <div className="bg-[#0A1118] border border-[#2E3A46] p-2.5 rounded-lg text-[9px] text-[#788896] leading-relaxed font-bold font-mono text-center uppercase">
                🌎 {lang === 'es' 
                  ? 'Busca salas públicas para unirse al instante, o crea una nueva si no hay activas.' 
                  : 'Search public lobbies to join instantly, or spin up a new room if none active.'}
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-left animate-fadeIn bg-[#0A1118] p-2 rounded-lg border border-[#2E3A46]">
                <label className="text-[9px] font-mono text-[#788896] font-black uppercase tracking-wider">
                  {lang === 'es' ? 'Código de Sala (5 Letras):' : 'Room Code (5 Letters):'}
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  placeholder="ABCDE"
                  className="bg-[#141D26] border border-[#2E3A46] rounded-md py-1 px-2.5 font-mono font-black text-center text-xs uppercase tracking-widest text-[#E6A15C] outline-none focus:border-white"
                />
              </div>
            )}

            {/* Error/Status Banner */}
            {statusMsg && !isConnecting && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-[10px] font-mono p-2 rounded-lg text-center leading-normal mb-2 uppercase select-text">
                {statusMsg}
              </div>
            )}

            {/* Submit / Matchmake Button */}
            <button
              onClick={handleMatchmaking}
              disabled={isConnecting}
              className="w-full py-2.5 bg-[#2ECC71] hover:bg-white text-white hover:text-[#2ECC71] rounded-lg font-mono text-[11px] tracking-wider uppercase border-2 border-white font-black shadow-[3px_3px_0px_#0A1118] transition-all cursor-pointer disabled:opacity-50 active:translate-y-0.5 mt-0.5"
            >
              {isConnecting ? (
                <span className="animate-pulse text-yellow-300">
                  ⏳ {statusMsg || (lang === 'es' ? 'CONECTANDO...' : 'CONNECTING...')}
                </span>
              ) : (
                matchType === 'web' 
                  ? (lang === 'es' ? '🔍 BUSCAR PARTIDA RÁPIDA' : '🔍 SEARCH WEB MATCH')
                  : (inputCode.trim() 
                      ? (lang === 'es' ? '🚪 UNIRSE A LA SALA' : '🚪 JOIN ROOM')
                      : (lang === 'es' ? '🔑 CREAR NUEVA SALA PRIVADA' : '🔑 CREATE NEW PRIVATE ROOM'))
              )}
            </button>
          </div>
        </div>
      ) : (() => {
        const myChefId = roomData?.players[playerId]?.chefId || '';
        const hasSelectedCharacter = myChefId !== '';

        if (!hasSelectedCharacter) {
          /* CHARACTER SELECTION OVERLAY (Maintaining 16:9 ratio) */
          return (
            <div className="flex flex-col items-center justify-center h-full w-full py-2 animate-fadeIn bg-[#0A1118]/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-4xl aspect-video bg-[#141D26] border-4 border-white rounded-2xl p-4.5 shadow-2xl flex flex-col justify-between text-left relative overflow-hidden">
                {/* Decorative top-left tab */}
                <div className="absolute top-0 left-0 bg-[var(--theme-color-primary)] text-white font-mono text-[9px] px-3.5 py-1.5 uppercase font-black rounded-br-lg tracking-widest">
                  {lang === 'es' ? 'Fase de Selección' : 'Selection Phase'}
                </div>

                <div className="mt-3">
                  <h2 className="font-sans font-black text-xl text-white tracking-wider uppercase leading-none">
                    🎭 {lang === 'es' ? 'SELECCIONAR PERSONAJE' : 'SELECT YOUR CHARACTER'}
                  </h2>
                  <p className="font-mono text-[10px] text-[#788896] font-bold mt-1 uppercase leading-snug">
                    {lang === 'es' 
                      ? 'Elige tu chef para la cocina. Los personajes ya elegidos por tus compañeros se bloquean en tiempo real.' 
                      : 'Choose your chef for the kitchen. Characters already chosen by your teammates are locked in real-time.'}
                  </p>
                </div>

                {/* Connected players helper list */}
                <div className="flex gap-2 flex-wrap items-center bg-[#0A1118]/80 border border-[#2E3A46] p-1.5 px-3 rounded-xl my-1 shrink-0">
                  <span className="text-[9px] font-mono text-[#788896] font-black uppercase flex items-center gap-1 shrink-0">
                    👥 {lang === 'es' ? 'JUGADORES EN LA SALA:' : 'PLAYERS IN THE ROOM:'}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {roomData ? Object.values(roomData.players).map((p: any) => {
                      const charEmoji = CHARACTERS.find(c => c.id === p.chefId)?.emoji || '⏳';
                      const isSelf = p.id === playerId;
                      return (
                        <span key={p.id} className="text-[9px] font-mono bg-[#141D26] border border-[#2E3A46] px-2 py-0.5 rounded-md text-white font-black flex items-center gap-1 shadow-sm">
                          <span>{charEmoji}</span>
                          <span className="text-[#E6A15C]">{p.name}</span>
                          {isSelf && <span className="text-yellow-400 text-[7px]">({lang === 'es' ? 'Tú' : 'You'})</span>}
                        </span>
                      );
                    }) : null}
                  </div>
                </div>

                {/* The 4 Characters grid */}
                <div className="grid grid-cols-4 gap-3 my-auto">
                  {CHARACTERS.map((char) => {
                    // Find other player who took it
                    const takenByPlayer = roomData ? Object.values(roomData.players).find(
                      (p: any) => p.id !== playerId && p.chefId === char.id
                    ) as any : null;
                    const isTaken = !!takenByPlayer;

                    return (
                      <button
                        key={char.id}
                        disabled={isTaken}
                        onClick={() => selectCharacter(char.id)}
                        className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-between transition-all duration-300 relative h-40 group ${
                          isTaken
                            ? 'bg-[#0A1118]/40 border-[#2E3A46]/60 opacity-45 cursor-not-allowed text-[#556370]'
                            : 'bg-[#0A1118] border-[#2E3A46] hover:bg-[#2E3A46]/20 hover:border-white text-white cursor-pointer hover:scale-[1.03] shadow-md'
                        }`}
                      >
                        {/* Top Indicator */}
                        <div className="text-[8px] font-mono font-black uppercase tracking-wider">
                          {isTaken ? (
                            <span className="text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/30">
                              {lang === 'es' ? 'BLOQUEADO' : 'LOCKED'}
                            </span>
                          ) : (
                            <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                              {lang === 'es' ? 'ELEGIR' : 'SELECT'}
                            </span>
                          )}
                        </div>

                        {/* Emoji */}
                        <span 
                          className={`text-4xl w-12 h-12 rounded-full border-2 flex items-center justify-center my-0.5 shadow-lg select-none transition-all duration-300 ${
                            isTaken ? 'bg-[#141D26] border-[#2E3A46]' : 'bg-white/5 border-white/20 group-hover:border-white'
                          }`}
                          style={!isTaken ? { backgroundColor: `${char.color}25`, borderColor: char.color } : {}}
                        >
                          {char.emoji}
                        </span>

                        {/* Name and Description */}
                        <div className="mt-0.5">
                          <p className="font-mono font-black text-[10px] uppercase tracking-wide leading-none">
                            {lang === 'es' ? char.nameEs : char.nameEn}
                          </p>
                          <p className="text-[7.5px] font-mono text-[#788896] leading-tight font-bold mt-1 uppercase line-clamp-2">
                            {isTaken 
                              ? (lang === 'es' ? `Por ${takenByPlayer.name}` : `By ${takenByPlayer.name}`)
                              : (lang === 'es' ? char.descriptionEs : char.descriptionEn)
                            }
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Cancel button to leave lobby */}
                <div className="flex justify-between items-center border-t border-[#2E3A46]/50 pt-2 shrink-0">
                  <button
                    onClick={() => leaveLobby(currentRoomId!)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2E3A46] bg-[#0A1118]/80 hover:bg-red-950/40 hover:border-red-500 transition-all cursor-pointer text-[9px] font-mono uppercase tracking-wider font-bold text-red-500"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {lang === 'es' ? 'SALIR DE LA SALA' : 'EXIT LOBBY'}
                  </button>

                  <span className="text-[9px] font-mono font-bold text-[#556370] uppercase">
                    {lang === 'es' ? 'ID Sala: ' : 'Room ID: '} <strong className="text-white font-black">{currentRoomId}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        }

        /* MAIN ACTIVE LOBBY SCREEN (Once Character is selected) */
        return (
          <div className="flex flex-col gap-1.5 pt-2 pb-0 h-full animate-scaleIn">
            {/* Header Row (8px from the top) */}
            <div className="flex justify-between items-center border-b border-[#2E3A46] pb-1 shrink-0">
              <button
                onClick={() => leaveLobby(currentRoomId!)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#2E3A46] bg-[#0A1118]/80 hover:bg-red-950/40 hover:border-red-500 transition-all cursor-pointer text-[10px] font-mono uppercase tracking-wider shadow-[2px_2px_0px_#0A1118]"
              >
                <ArrowLeft className="w-3 h-3 text-red-500" />
                <span>{lang === 'es' ? 'ABANDONAR SALA' : 'LEAVE LOBBY'}</span>
              </button>
              
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-black text-[var(--theme-color-accent)] bg-[#0A1118] px-2.5 py-0.5 rounded-md border border-[#2E3A46] tracking-widest flex items-center gap-1 uppercase">
                  <Shield className="w-3 h-3 text-[#E6A15C]" />
                  {lang === 'es' ? 'SALA:' : 'ROOM:'} <strong className="text-white text-xs font-black">{currentRoomId}</strong>
                </span>
                <span className="text-[9px] font-mono font-black text-emerald-400 bg-[#0A1118] px-2 py-0.5 rounded-md border border-[#2E3A46] tracking-widest flex items-center gap-1 uppercase">
                  <span>●</span>
                  {roomData?.matchmakingType === 'web' ? 'PÚBLICA' : 'PRIVADA'}
                </span>
              </div>
            </div>

            {/* TOP PANEL: EQUIPO DE CHEFS */}
            <div className="bg-[#141D26] p-2 rounded-xl border border-[#2E3A46] shadow-[2px_2px_0px_#0A1118] flex flex-col gap-1.5 shrink-0">
              <div className="flex justify-between items-center border-b border-[#2E3A46] pb-1 mb-0.5">
                <span className="text-[10px] font-mono font-black text-[var(--theme-color-accent)] uppercase block leading-none">
                  🧑‍🍳 {lang === 'es' ? `EQUIPO DE CHEFS (${roomData?.maxPlayers || 4} INTEGRANTES)` : `TEAM OF CHEFS (${roomData?.maxPlayers || 4} MEMBERS)`}
                </span>
                <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase">
                  {lang === 'es' ? 'JUGADORES CONECTADOS:' : 'CONNECTED PLAYERS:'} {Object.keys(roomData?.players || {}).length} / {roomData?.maxPlayers || 4}
                </span>
              </div>

              {/* 4-Chef Grid displaying all 4 chefs horizontally - Very tight spacing and height */}
              <div className="grid grid-cols-4 gap-2">
                {CHARACTERS.map((char) => {
                  // Is this chef chosen by any player in the room?
                  const p: any = roomData ? Object.values(roomData.players).find((player: any) => player.chefId === char.id) : null;
                  const isSelf = p && p.id === playerId;
                  const isChosen = !!p;
                  
                  return (
                    <div
                      key={char.id}
                      className={`p-2 rounded-lg border transition-all duration-300 flex items-center gap-2 relative overflow-hidden h-[74px] ${
                        isChosen 
                          ? isSelf
                            ? 'bg-[#0A1118] border-white shadow-[0_0_8px_rgba(255,255,255,0.15)]' 
                            : 'bg-[#0A1118]/80 border-emerald-500/50'
                          : 'bg-[#0A1118]/10 border-dashed border-[#2E3A46]/60 opacity-35'
                      }`}
                    >
                      {/* Chef Avatar */}
                      <span 
                        className={`text-2xl w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-md select-none shrink-0 ${
                          isChosen ? 'bg-white/5 border-white' : 'bg-transparent border-dashed border-[#2E3A46]'
                        }`}
                        style={isChosen ? { backgroundColor: `${char.color}30`, borderColor: char.color } : {}}
                      >
                        {isChosen ? char.emoji : '👤'}
                      </span>

                      <div className="text-left flex-1 min-w-0 leading-tight">
                        <p className="font-mono font-black text-[10px] text-white truncate uppercase tracking-wider">
                          {lang === 'es' ? char.nameEs : char.nameEn}
                        </p>
                        {isChosen ? (
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-[9px] text-[#E6A15C] truncate">
                              {p.name} {isSelf && `(${lang === 'es' ? 'Tú' : 'You'})`}
                            </p>
                            {/* State badges */}
                            <div className="flex items-center gap-1 mt-0.5">
                              {p.isHost ? (
                                <span className="bg-[#E6A15C] text-[#0A1118] text-[6px] font-mono font-black uppercase px-1 rounded leading-none py-0.5">
                                  HOST
                                </span>
                              ) : p.isReady ? (
                                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[6px] px-1 rounded font-mono font-black animate-pulse leading-none py-0.5">
                                  ✓ {lang === 'es' ? 'LISTO' : 'READY'}
                                </span>
                              ) : (
                                <span className="bg-[#141D26] text-[#788896] border border-[#2E3A46] text-[6px] px-1 rounded font-mono font-bold leading-none py-0.5">
                                  {lang === 'es' ? 'ESPERANDO' : 'WAITING'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[8px] text-[#556370] font-mono font-black tracking-widest uppercase">
                            {lang === 'es' ? 'LIBRE' : 'FREE'}
                          </p>
                        )}
                      </div>
                      
                      {/* Switch Character button */}
                      {isSelf && (
                        <button
                          onClick={() => {
                            sounds.playSelect();
                            multiplayerClient.chooseChef('');
                          }}
                          title={lang === 'es' ? 'Cambiar personaje' : 'Change character'}
                          className="absolute bottom-1 right-2 text-[7px] font-mono font-black text-yellow-400 hover:text-white transition-all underline cursor-pointer"
                        >
                          {lang === 'es' ? 'CAMBIAR' : 'SWITCH'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM PANEL: REDESIGNED COMPACT KITCHEN CONFIGURATION & PLAY ACTIONS */}
            <div className="bg-[#141D26] p-2.5 rounded-xl border border-[#2E3A46] shadow-[2px_2px_0px_#0A1118] flex flex-col gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-black text-[var(--theme-color-accent)] uppercase block border-b border-[#2E3A46] pb-1 leading-none shrink-0 text-left">
                🎮 {lang === 'es' ? 'CONFIGURACIÓN DE COCINA & JUEGO' : 'GAME CONFIGURATION & PLAY'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-left items-center">
                {/* 1. Map Selector (Cols: 4) */}
                <div className="md:col-span-4 flex flex-col gap-0.5">
                  <label className="text-[8px] font-mono text-[#788896] font-black uppercase tracking-wider">
                    🗺️ {lang === 'es' ? 'NIVEL / MAPA:' : 'LEVEL / MAP:'}
                  </label>
                  {roomData?.hostId === playerId ? (
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3].map((id) => (
                        <button
                          key={id}
                          onClick={() => changeLevel(id)}
                          className={`py-1 rounded-md border text-[9px] font-mono font-black cursor-pointer transition-all ${
                            roomData?.levelId === id
                              ? 'bg-[var(--theme-color-primary)] border-white text-white font-black shadow-[1px_1px_0px_#0A1118]'
                              : 'bg-[#0A1118] border-[#2E3A46] text-[#788896] hover:border-white/40 hover:text-white'
                          }`}
                        >
                          {lang === 'es' ? `NV ${id}` : `L ${id}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0A1118] border border-[#2E3A46] py-1.5 px-2 rounded-md font-mono text-[10px] font-black text-[#E6A15C] flex items-center justify-between">
                      <span>{lang === 'es' ? 'Nivel:' : 'Level:'}</span>
                      <span className="text-white">NIVEL {roomData?.levelId}</span>
                    </div>
                  )}
                </div>

                {/* 2. Difficulty Selector (Cols: 2) */}
                <div className="md:col-span-2 flex flex-col gap-0.5">
                  <label className="text-[8px] font-mono text-[#788896] font-black uppercase tracking-wider">
                    🔥 {lang === 'es' ? 'DIFICULTAD:' : 'DIFFICULTY:'}
                  </label>
                  {roomData?.hostId === playerId ? (
                    <select
                      value={roomData?.difficulty || 'NORMAL'}
                      onChange={(e) => changeDifficulty(e.target.value as Difficulty)}
                      className="bg-[#0A1118] border border-[#2E3A46] py-1 px-1 rounded-md font-mono text-[9px] text-[#E6A15C] outline-none font-black cursor-pointer w-full hover:border-white/40"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="DIFICIL">DIFICIL</option>
                      <option value="EXTREMO">EXTREMO</option>
                      <option value="CAOTICO">CAOTICO</option>
                    </select>
                  ) : (
                    <div className="bg-[#0A1118] border border-[#2E3A46] py-1.5 px-2 rounded-md font-mono text-[9px] font-black text-red-400 uppercase flex items-center justify-between">
                      <span className="text-white font-black">{roomData?.difficulty}</span>
                    </div>
                  )}
                </div>

                {/* 3. Room Capacity (Cols: 3) */}
                <div className="md:col-span-3 flex flex-col gap-0.5">
                  <label className="text-[8px] font-mono text-[#788896] font-black uppercase tracking-wider">
                    👥 {lang === 'es' ? 'SALA MÁXIMA:' : 'ROOM SIZE:'}
                  </label>
                  {roomData?.hostId === playerId ? (
                    <div className="grid grid-cols-3 gap-1">
                      {[2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          disabled={Object.keys(roomData?.players || {}).length > num}
                          onClick={() => {
                            sounds.playSelect();
                            multiplayerClient.changeMaxPlayers(num);
                          }}
                          className={`py-1 rounded-md border text-[9px] font-mono font-black cursor-pointer transition-all ${
                            (roomData?.maxPlayers || 4) === num
                              ? 'bg-[var(--theme-color-primary)] border-white text-white font-black shadow-[1px_1px_0px_#0A1118]'
                              : 'bg-[#0A1118] border-[#2E3A46] text-[#788896] hover:border-white/40 hover:text-white'
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {num} {lang === 'es' ? 'CHEFS' : 'CHEFS'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0A1118] border border-[#2E3A46] py-1.5 px-2 rounded-md font-mono text-[10px] font-black text-[#E6A15C] flex items-center justify-between">
                      <span>{lang === 'es' ? 'Máx:' : 'Max:'}</span>
                      <span className="text-white">{roomData?.maxPlayers || 4} CHEFS</span>
                    </div>
                  )}
                </div>

                {/* 4. Action Buttons (Cols: 3) */}
                <div className="md:col-span-3 flex flex-col justify-end">
                  {roomData && (
                    <div className="flex flex-col gap-1">
                      {roomData.hostId !== playerId ? (
                        <button
                          onClick={toggleReady}
                          className="w-full py-2 rounded-md font-mono text-[11px] font-black tracking-wider uppercase border border-white cursor-pointer shadow-[1px_1px_0px_#0A1118] transition-all text-center flex items-center justify-center gap-1 active:translate-y-0.5"
                          style={{
                            backgroundColor: roomData.players[playerId]?.isReady ? '#E74C3C' : '#2ECC71',
                            color: 'white'
                          }}
                        >
                          {roomData.players[playerId]?.isReady 
                            ? (lang === 'es' ? '❌ QUITAR LISTO' : '❌ UNREADY') 
                            : (lang === 'es' ? '✅ MARCAR LISTO' : '✅ MARK READY')
                          }
                        </button>
                      ) : (
                        <button
                          onClick={hostStartGame}
                          className="w-full py-2 bg-[var(--theme-color-primary)] hover:bg-white text-white hover:text-[var(--theme-color-primary)] border border-white rounded-md font-mono text-[11px] font-black tracking-widest uppercase cursor-pointer shadow-[2px_2px_0px_#0A1118] transition-all flex items-center justify-center gap-1 active:translate-y-0.5"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{lang === 'es' ? '🍳 EMPEZAR COCINA' : '🍳 START COOKING'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

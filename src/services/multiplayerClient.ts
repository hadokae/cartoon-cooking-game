import { Difficulty } from '../types';

export interface Player {
  id: string;
  name: string;
  chefId: string;
  isReady: boolean;
  isHost: boolean;
  roleNum: number;
}

export interface RoomData {
  id: string;
  status: 'waiting' | 'playing';
  levelId: number;
  difficulty: Difficulty;
  matchmakingType: 'web' | 'code';
  maxPlayers: number;
  hostId: string;
  players: { [playerId: string]: Player };
  chatMessages: Array<{
    id: string;
    senderName: string;
    text: string;
  }>;
  stationsState?: { [key: string]: any };
  playersState?: { [playerId: string]: any };
}

type RoomUpdateListener = (room: RoomData) => void;
type JoinSuccessListener = (data: { roomId: string; roleNum: number; isHost: boolean; roomData: RoomData }) => void;
type GameSyncListener = (gameState: any) => void;
type PlayersSyncListener = (playersState: { [playerId: string]: any }) => void;
type StationSyncListener = (data: { key: string; stationState: any }) => void;
type ErrorListener = (error: { message: string; code: string }) => void;

class MultiplayerClient {
  private socket: WebSocket | null = null;
  private roomUpdateListeners = new Set<RoomUpdateListener>();
  private joinSuccessListeners = new Set<JoinSuccessListener>();
  private gameSyncListeners = new Set<GameSyncListener>();
  private playersSyncListeners = new Set<PlayersSyncListener>();
  private stationSyncListeners = new Set<StationSyncListener>();
  private errorListeners = new Set<ErrorListener>();
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public isConnected = false;
  public lastRoomData: RoomData | null = null;
  private reconnectInterval: any = null;
  private pendingJoin: (() => void) | null = null;

  public connect(onConnect?: () => void, onDisconnect?: () => void) {
    if (onConnect !== undefined) this.onConnectCallback = onConnect;
    if (onDisconnect !== undefined) this.onDisconnectCallback = onDisconnect;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      // Don't fire onConnect callback here - let the socket.onopen handle it to avoid
      // duplicate JOIN_LOBBY messages on mount.
      return;
    }

    const MULTIPLAYER_SERVER = 'wss://cartoon-cooking-game-production.up.railway.app/ws';
    const isCapacitor = !!(window as any).Capacitor;
    const wsUrl = isCapacitor
      ? MULTIPLAYER_SERVER
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

    console.log(`[MultiplayerClient] Connecting to ${wsUrl}`);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('[MultiplayerClient] Connected to server.');
      this.isConnected = true;
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      // Fire onConnect callback first (may trigger auto-rejoin from GameCanvas)
      if (this.onConnectCallback) this.onConnectCallback();
      // Only fire pendingJoin if no callback already sent a join (prevents double JOIN_LOBBY)
      if (this.pendingJoin && (!this.lastRoomData || this.lastRoomData.status !== 'playing')) {
        this.pendingJoin();
        this.pendingJoin = null;
      } else if (this.pendingJoin) {
        // Game is playing, don't rejoin via pendingJoin - GameCanvas handles this
        console.log('[MultiplayerClient] Clearing pendingJoin during active game.');
        this.pendingJoin = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        switch (type) {
          case 'JOIN_SUCCESS':
            this.lastRoomData = payload.roomData;
            this.joinSuccessListeners.forEach(listener => listener(payload));
            break;
          case 'ROOM_UPDATED':
            this.lastRoomData = payload;
            this.roomUpdateListeners.forEach(listener => listener(payload));
            break;
          case 'GAME_SYNCED':
            this.gameSyncListeners.forEach(listener => listener(payload));
            break;
          case 'PLAYER_STATES_SYNC':
            console.log('[WS-RECV] PLAYER_STATES_SYNC keys:', Object.keys(payload || {}));
            this.playersSyncListeners.forEach(listener => listener(payload));
            break;
          case 'STATION_STATE_SYNC':
            this.stationSyncListeners.forEach(listener => listener(payload));
            break;
          case 'ERROR':
            this.errorListeners.forEach(listener => listener(payload));
            break;
        }
      } catch (e) {
        console.error('[MultiplayerClient] Message error:', e);
      }
    };

    this.socket.onclose = () => {
      console.log('[MultiplayerClient] Disconnected.');
      this.isConnected = false;
      this.socket = null;
      if (this.onDisconnectCallback) this.onDisconnectCallback();
      
      // Auto reconnect
      if (!this.reconnectInterval) {
        this.reconnectInterval = setInterval(() => {
          this.connect();
        }, 3000);
      }
    };

    this.socket.onerror = (err) => {
      console.error('[MultiplayerClient] WebSocket error:', err);
    };
  }

  public disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  private send(type: string, payload?: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (type === 'UPDATE_PLAYER_STATE') {
        console.log('[WS-SEND] UPDATE_PLAYER_STATE -> server, readyState:', this.socket.readyState);
      }
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn(`[MultiplayerClient] Can't send ${type}, WebSocket not connected. readyState:`, this.socket?.readyState);
    }
  }

  public joinLobby(playerId: string, playerName: string, matchType: 'web' | 'code', maxPlayers: number, inputCode?: string) {
    const doJoin = () => {
      this.send('JOIN_LOBBY', { playerId, playerName, matchType, maxPlayers, inputCode });
    };

    if (this.isConnected) {
      doJoin();
    } else {
      this.pendingJoin = doJoin;
      this.connect();
    }
  }

  public leaveLobby() {
    this.send('LEAVE_LOBBY');
    this.pendingJoin = null;
    this.lastRoomData = null;
  }

  public clearStaleState() {
    this.lastRoomData = null;
    this.pendingJoin = null;
  }

  public toggleReady() {
    this.send('TOGGLE_READY');
  }

  public resetToLobby() {
    this.send('RESET_TO_LOBBY');
  }

  public chooseChef(chefId: string) {
    this.send('CHOOSE_CHEF', { chefId });
  }

  public changeLevel(levelId: number) {
    this.send('CHANGE_LEVEL', { levelId });
  }

  public changeDifficulty(difficulty: Difficulty) {
    this.send('CHANGE_DIFFICULTY', { difficulty });
  }

  public changeMaxPlayers(maxPlayers: number) {
    this.send('CHANGE_MAX_PLAYERS', { maxPlayers });
  }

  public sendChat(text: string) {
    this.send('SEND_CHAT', { text });
  }

  public startGame() {
    this.send('START_GAME');
  }

  public syncGameState(gameState: any) {
    this.send('SYNC_GAME_STATE', gameState);
  }

  public updatePlayerState(playerState: any) {
    this.send('UPDATE_PLAYER_STATE', playerState);
  }

  public updateStationState(key: string, stationState: any) {
    this.send('UPDATE_STATION_STATE', { key, stationState });
  }

  // Subscription APIs
  public onJoinSuccess(listener: JoinSuccessListener) {
    this.joinSuccessListeners.add(listener);
    return () => this.joinSuccessListeners.delete(listener);
  }

  public onRoomUpdate(listener: RoomUpdateListener) {
    this.roomUpdateListeners.add(listener);
    return () => this.roomUpdateListeners.delete(listener);
  }

  public onGameSync(listener: GameSyncListener) {
    this.gameSyncListeners.add(listener);
    return () => this.gameSyncListeners.delete(listener);
  }

  public onPlayersSync(listener: PlayersSyncListener) {
    this.playersSyncListeners.add(listener);
    return () => this.playersSyncListeners.delete(listener);
  }

  public onStationSync(listener: StationSyncListener) {
    this.stationSyncListeners.add(listener);
    return () => this.stationSyncListeners.delete(listener);
  }

  public onError(listener: ErrorListener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public clearListeners() {
    this.roomUpdateListeners.clear();
    this.joinSuccessListeners.clear();
    this.gameSyncListeners.clear();
    this.playersSyncListeners.clear();
    this.stationSyncListeners.clear();
    this.errorListeners.clear();
  }
}

export const multiplayerClient = new MultiplayerClient();

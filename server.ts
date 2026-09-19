import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// In-memory room and lobby state
interface Player {
  id: string;
  name: string;
  chefId: string;
  isReady: boolean;
  isHost: boolean;
  roleNum: number;
}

interface Room {
  id: string;
  status: 'waiting' | 'playing';
  levelId: number;
  difficulty: string;
  matchmakingType: 'web' | 'code';
  maxPlayers: number;
  hostId: string;
  createdAt: number;
  players: { [playerId: string]: Player };
  chatMessages: Array<{
    id: string;
    senderName: string;
    text: string;
  }>;
  gameState: any;
  playersState: { [playerId: string]: any };
  stationsState: { [key: string]: any };
}

const rooms: { [roomId: string]: Room } = {};

// Station locks to prevent race condition (duplicate item pickups)
// key: `${roomId}:${stationKey}`, value: { playerId, lockedAt }
const stationLocks = new Map<string, { playerId: string; lockedAt: number }>();
const LOCK_TIMEOUT_MS = 800;

// Per-station grab cooldown: key: `${roomId}:${stationKey}`, value: timestamp of last grab
const stationGrabTimestamps = new Map<string, number>();
const GRAB_COOLDOWN_MS = 500;

function tryLockStation(roomId: string, stationKey: string, playerId: string): boolean {
  const lockId = `${roomId}:${stationKey}`;
  const existing = stationLocks.get(lockId);
  if (existing) {
    // Lock held by another player and not expired
    if (existing.playerId !== playerId && Date.now() - existing.lockedAt < LOCK_TIMEOUT_MS) {
      return false;
    }
  }
  stationLocks.set(lockId, { playerId, lockedAt: Date.now() });
  return true;
}

function releaseStationLock(roomId: string, stationKey: string, playerId: string) {
  const lockId = `${roomId}:${stationKey}`;
  const existing = stationLocks.get(lockId);
  if (existing && existing.playerId === playerId) {
    stationLocks.delete(lockId);
  }
}

function isStationLockedByOther(roomId: string, stationKey: string, playerId: string): boolean {
  const lockId = `${roomId}:${stationKey}`;
  const existing = stationLocks.get(lockId);
  if (!existing) return false;
  if (existing.playerId === playerId) return false;
  if (Date.now() - existing.lockedAt >= LOCK_TIMEOUT_MS) {
    stationLocks.delete(lockId);
    return false;
  }
  return true;
}

// Keep track of socket's current roomId and playerId
const socketData = new Map<WebSocket, { roomId: string; playerId: string }>();

// Disconnection grace periods for robust multiplayer session recovery
const disconnectTimers = new Map<string, NodeJS.Timeout>();

// Helper to broadcast room changes
function broadcastToRoom(roomId: string, message: any, excludeSocket?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const [ws, data] of socketData.entries()) {
    if (data.roomId === roomId && ws !== excludeSocket && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// Generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] New client connected');

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message);
      const { type, payload } = parsed;

      switch (type) {
        case 'JOIN_LOBBY': {
          const { playerId, playerName, matchType, maxPlayers, inputCode } = payload;
          const requestedMax = Math.max(2, Math.min(4, Number(maxPlayers) || 4));
          let targetRoom: Room | null = null;

          console.log(`[WS] JOIN_LOBBY from ${playerId} (matchType: ${matchType}, maxPlayers: ${requestedMax}, inputCode: ${inputCode || 'none'})`);

          if (matchType === 'web') {
            // Find an open quickplay room - prefer rooms with players waiting
            for (const rId in rooms) {
              const r = rooms[rId];
              if (r.matchmakingType === 'web' && r.status === 'waiting') {
                const count = Object.keys(r.players).length;
                const limit = r.maxPlayers || 4;
                // Match if room has space and either maxPlayers match or room is empty
                if (count < limit && count > 0 && r.maxPlayers === requestedMax) {
                  targetRoom = r;
                  console.log(`[WS] Found matching room ${rId} (${count}/${limit} players)`);
                  break;
                }
              }
            }
            // If no room with players found, check for empty rooms
            if (!targetRoom) {
              for (const rId in rooms) {
                const r = rooms[rId];
                if (r.matchmakingType === 'web' && r.status === 'waiting') {
                  const count = Object.keys(r.players).length;
                  if (count === 0) {
                    targetRoom = r;
                    console.log(`[WS] Joining empty room ${rId}`);
                    break;
                  }
                }
              }
            }
          } else if (inputCode) {
            // Join specific code
            const codeUpper = inputCode.trim().toUpperCase();
            const r = rooms[codeUpper];
            if (!r) {
              ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Lobby does not exist.', code: 'NOT_FOUND' } }));
              return;
            }
            if (r.status !== 'waiting') {
              const isRejoining = r.players[playerId] !== undefined;
              if (!isRejoining) {
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Game has already started.', code: 'ALREADY_STARTED' } }));
                return;
              }
            }
            const count = Object.keys(r.players).length;
            const isRejoining = r.players[playerId] !== undefined;
            const limit = Math.min(4, r.maxPlayers || 4);
            if (!isRejoining && count >= limit) {
              ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Lobby is full (max ${limit} players).`, code: 'FULL' } }));
              return;
            }
            targetRoom = r;
          }

          if (!targetRoom) {
            // Create a new room
            const newCode = generateRoomCode();
            targetRoom = {
              id: newCode,
              status: 'waiting',
              levelId: 1,
              difficulty: 'NORMAL',
              matchmakingType: matchType || 'web',
              maxPlayers: requestedMax,
              hostId: playerId,
              createdAt: Date.now(),
              players: {},
              chatMessages: [],
              gameState: null,
              playersState: {},
              stationsState: {}
            };
            rooms[newCode] = targetRoom;
            console.log(`[WS] Created new room ${newCode} (${matchType}, maxPlayers: ${requestedMax}). Player ${playerId} is host.`);
          } else {
            console.log(`[WS] Player ${playerId} joining existing room ${targetRoom.id}`);
          }

          const rId = targetRoom.id;
          
          // Clear any active disconnect timer for this player in this room
          const timerId = `${rId}_${playerId}`;
          if (disconnectTimers.has(timerId)) {
            console.log(`[WS] Player ${playerId} reconnected to room ${rId} within grace period. Clearing timer.`);
            clearTimeout(disconnectTimers.get(timerId)!);
            disconnectTimers.delete(timerId);
          }

          const updatedPlayers = { ...targetRoom.players };

          // Determine role number
          const existingRoles = Object.values(updatedPlayers).map((p: Player) => p.roleNum);
          let assignedRole = 1;
          if (targetRoom.hostId !== playerId) {
            assignedRole = 2;
            for (let r = 2; r <= 4; r++) {
              if (!existingRoles.includes(r)) {
                assignedRole = r;
                break;
              }
            }
          }

          const isHost = targetRoom.hostId === playerId;
          const existingPlayer = updatedPlayers[playerId];

          updatedPlayers[playerId] = {
            id: playerId,
            name: playerName.substring(0, 16),
            chefId: existingPlayer ? existingPlayer.chefId : '',
            isReady: existingPlayer ? existingPlayer.isReady : false,
            isHost: isHost,
            roleNum: existingPlayer ? existingPlayer.roleNum : assignedRole
          };

          targetRoom.players = updatedPlayers;
          socketData.set(ws, { roomId: rId, playerId });

          ws.send(JSON.stringify({
            type: 'JOIN_SUCCESS',
            payload: {
              roomId: rId,
              roleNum: assignedRole,
              isHost: isHost,
              roomData: targetRoom
            }
          }));

          broadcastToRoom(rId, { type: 'ROOM_UPDATED', payload: targetRoom });
          break;
        }

        case 'TOGGLE_READY': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room) return;

          const player = room.players[info.playerId];
          if (player) {
            player.isReady = !player.isReady;
            broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          }
          break;
        }

        case 'CHOOSE_CHEF': {
          const info = socketData.get(ws);
          if (!info) return;
          const { chefId } = payload;
          const room = rooms[info.roomId];
          if (!room) return;

          const player = room.players[info.playerId];
          if (player) {
            player.chefId = chefId;
            broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          }
          break;
        }

        case 'CHANGE_LEVEL': {
          const info = socketData.get(ws);
          if (!info) return;
          const { levelId } = payload;
          const room = rooms[info.roomId];
          if (!room || room.hostId !== info.playerId) return;

          room.levelId = levelId;
          broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          break;
        }

        case 'CHANGE_DIFFICULTY': {
          const info = socketData.get(ws);
          if (!info) return;
          const { difficulty } = payload;
          const room = rooms[info.roomId];
          if (!room || room.hostId !== info.playerId) return;

          room.difficulty = difficulty;
          broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          break;
        }

        case 'CHANGE_MAX_PLAYERS': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room || room.hostId !== info.playerId) return;

          const newMax = Math.max(2, Math.min(4, Number(payload.maxPlayers) || 4));
          const currentCount = Object.keys(room.players).length;
          if (newMax >= currentCount) {
            room.maxPlayers = newMax;
            broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          } else {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `No se puede reducir el tamaño por debajo de los jugadores conectados (${currentCount}).` } }));
          }
          break;
        }

        case 'SEND_CHAT': {
          const info = socketData.get(ws);
          if (!info) return;
          const { text } = payload;
          const room = rooms[info.roomId];
          if (!room) return;

          const player = room.players[info.playerId];
          if (!player) return;

          const newMsg = {
            id: Math.random().toString(36).substring(2, 9),
            senderName: player.name,
            text: text.substring(0, 60)
          };

          room.chatMessages.push(newMsg);
          if (room.chatMessages.length > 30) {
            room.chatMessages.shift();
          }

          broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          break;
        }

        case 'START_GAME': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room || room.hostId !== info.playerId) return;

          room.status = 'playing';
          // Reset players readiness so that when they eventually return to lobby, they aren't auto-ready
          for (const pid in room.players) {
            room.players[pid].isReady = false;
          }
          broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          break;
        }

        case 'RESET_TO_LOBBY': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room) return;

          room.status = 'waiting';
          // Reset gameplay cache
          room.gameState = null;
          room.playersState = {};
          room.stationsState = {};
          for (const pid in room.players) {
            room.players[pid].isReady = false;
          }
          broadcastToRoom(info.roomId, { type: 'ROOM_UPDATED', payload: room });
          break;
        }

        case 'LEAVE_LOBBY': {
          handleDisconnect(ws, true);
          break;
        }

        case 'SYNC_GAME_STATE': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room) return;

          room.gameState = payload;
          broadcastToRoom(info.roomId, { type: 'GAME_SYNCED', payload }, ws);
          break;
        }

        case 'UPDATE_PLAYER_STATE': {
          const info = socketData.get(ws);
          if (!info) return;
          const room = rooms[info.roomId];
          if (!room) return;

          // Override lastUpdated with server time to solve system clock drift issues across clients
          payload.lastUpdated = Date.now();

          room.playersState[info.playerId] = payload;
          console.log(`[WS] UPDATE_PLAYER_STATE from ${info.playerId} (role ${payload.roleNum}) pos: ${payload.x?.toFixed(0)},${payload.y?.toFixed(0)} -> broadcasting to room ${info.roomId}`);
          broadcastToRoom(info.roomId, {
            type: 'PLAYER_STATES_SYNC',
            payload: room.playersState
          }, ws);
          break;
        }

        case 'LOCK_STATION': {
          const info = socketData.get(ws);
          if (!info) return;
          const { stationKey } = payload;
          const granted = tryLockStation(info.roomId, stationKey, info.playerId);
          ws.send(JSON.stringify({
            type: 'STATION_LOCK_RESULT',
            payload: { stationKey, granted }
          }));
          break;
        }

        case 'UNLOCK_STATION': {
          const info = socketData.get(ws);
          if (!info) return;
          const { stationKey } = payload;
          releaseStationLock(info.roomId, stationKey, info.playerId);
          break;
        }

        case 'UPDATE_STATION_STATE': {
          const info = socketData.get(ws);
          if (!info) return;
          const { key, stationState } = payload;
          const room = rooms[info.roomId];
          if (!room) return;

          const prevStation = room.stationsState[key];
          const grabKey = `${info.roomId}:${key}`;

          // Detect grab action: item went from non-null to null
          const isGrabAction = prevStation?.heldItem && !stationState.heldItem;

          if (isGrabAction) {
            const lastGrabTime = stationGrabTimestamps.get(grabKey) || 0;
            if (Date.now() - lastGrabTime < GRAB_COOLDOWN_MS) {
              // Another grab happened too recently — reject this duplicate grab
              ws.send(JSON.stringify({
                type: 'STATION_CONFLICT',
                payload: { key, correctState: prevStation }
              }));
              console.log(`[WS] Duplicate grab rejected for station ${key} by ${info.playerId} (cooldown active)`);
              return;
            }
            // Record this grab timestamp
            stationGrabTimestamps.set(grabKey, Date.now());
          }

          // Detect stale placement: item went from null to non-null, but a grab happened recently
          // This handles the race where Player 2's placement arrives AFTER Player 1's pickup
          const isPlacementAction = !prevStation?.heldItem && stationState.heldItem;
          if (isPlacementAction) {
            const lastGrabTime = stationGrabTimestamps.get(grabKey) || 0;
            if (Date.now() - lastGrabTime < GRAB_COOLDOWN_MS) {
              // A grab just happened on this station — this placement is stale (from before the grab)
              ws.send(JSON.stringify({
                type: 'STATION_CONFLICT',
                payload: { key, correctState: prevStation }
              }));
              console.log(`[WS] Stale placement rejected for station ${key} by ${info.playerId} (recent grab on station)`);
              return;
            }
          }

          // Override lastUpdated with server time to solve system clock drift issues across clients
          stationState.lastUpdated = Date.now();

          // Auto-release lock after successful update
          releaseStationLock(info.roomId, key, info.playerId);

          room.stationsState[key] = stationState;
          broadcastToRoom(info.roomId, {
            type: 'STATION_STATE_SYNC',
            payload: { key, stationState }
          }, ws);
          break;
        }

        default:
          console.warn(`[WS] Unknown message type: ${type}`);
      }
    } catch (e) {
      console.error('[WS] Error processing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client closed connection');
    handleDisconnect(ws, false);
  });

  ws.on('error', (err) => {
    console.error('[WS] Client socket error:', err);
    handleDisconnect(ws, false);
  });
});

// Handles cleanup of a disconnected socket
function handleDisconnect(ws: WebSocket, isExplicitLeave: boolean = false) {
  const info = socketData.get(ws);
  if (!info) return;

  const { roomId, playerId } = info;
  socketData.delete(ws);

  const room = rooms[roomId];
  if (room) {
    if (isExplicitLeave) {
      console.log(`[WS] Player ${playerId} explicitly left room ${roomId}. Performing immediate cleanup.`);
      performPlayerCleanup(roomId, playerId);
    } else {
      console.log(`[WS] Player ${playerId} disconnected implicitly from room ${roomId}. Starting 30s grace period.`);
      const timerId = `${roomId}_${playerId}`;
      if (disconnectTimers.has(timerId)) {
        clearTimeout(disconnectTimers.get(timerId)!);
      }

      const timer = setTimeout(() => {
        disconnectTimers.delete(timerId);
        console.log(`[WS] Grace period expired. Cleaning up player ${playerId} from room ${roomId}`);
        performPlayerCleanup(roomId, playerId);
      }, 30000);

      disconnectTimers.set(timerId, timer);
    }
  }
}

// Performs actual removal of a player and room deletion if empty
function performPlayerCleanup(roomId: string, playerId: string) {
  const room = rooms[roomId];
  if (!room) return;

  // Check if player has another active socket connected (reconnection case)
  let hasActiveSocket = false;
  for (const [ws, data] of socketData.entries()) {
    if (data.roomId === roomId && data.playerId === playerId && ws.readyState === WebSocket.OPEN) {
      hasActiveSocket = true;
      break;
    }
  }

  // If player has another active socket, skip cleanup (they reconnected)
  if (hasActiveSocket) {
    console.log(`[WS] Player ${playerId} has active socket in room ${roomId}. Skipping cleanup.`);
    return;
  }

  delete room.players[playerId];
  delete room.playersState[playerId];

  const remainingPlayerIds = Object.keys(room.players);
  if (remainingPlayerIds.length === 0) {
    console.log(`[WS] Room ${roomId} empty. Destroying.`);
    delete rooms[roomId];
  } else {
    // Re-evaluate host if host left
    if (room.hostId === playerId) {
      room.hostId = remainingPlayerIds[0];
      const newHost = room.players[room.hostId];
      if (newHost) {
        newHost.isHost = true;
        newHost.roleNum = 1; // Assign Host roleNum = 1
      }
      console.log(`[WS] Host migrated to player ${room.hostId}`);
    }

    broadcastToRoom(roomId, { type: 'ROOM_UPDATED', payload: room });
  }
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  const roomsDetails = Object.values(rooms).map(r => ({
    id: r.id,
    status: r.status,
    matchmakingType: r.matchmakingType,
    maxPlayers: r.maxPlayers,
    playersCount: Object.keys(r.players).length,
    hostId: r.hostId,
    players: Object.values(r.players).map(p => ({ id: p.id, name: p.name, chefId: p.chefId, isReady: p.isReady }))
  }));
  res.json({ status: 'ok', roomsCount: Object.keys(rooms).length, rooms: roomsDetails });
});

// Setup Vite middleware / Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Server running on http://localhost:${PORT}`);
  });
}

startServer();

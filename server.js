import http from 'node:http';
import sirv from 'sirv';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT) || 80;

// Serve Vite build from dist
const serve = sirv('dist', {
  single: true,
  dev: false,
  etag: true,
  dotfiles: false,
});

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }
  serve(req, res);
});

// WebSocket Server attached to the same HTTP server
const wss = new WebSocketServer({ server });

// Room storage: roomId -> Map<WebSocket, { id: string, name: string }>
const rooms = new Map();

function broadcastToRoom(roomId, message, excludeSocket = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = typeof message === 'string' ? message : JSON.stringify(message);

  for (const [client] of room.entries()) {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('Failed to send to client in room', roomId, err);
      }
    }
  }
}

function getRoomPeers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values()).map((p) => ({ id: p.id, name: p.name }));
}

wss.on('connection', (ws, req) => {
  let currentRoom = null;
  let clientId = Math.random().toString(36).substring(2, 9);
  let clientName = 'Bryggare';

  // Parse URL query if provided: /ws?room=BROR&user=Viktor
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const qRoom = url.searchParams.get('room');
    const qUser = url.searchParams.get('user');
    if (qRoom) currentRoom = qRoom.toUpperCase();
    if (qUser) clientName = qUser;
  } catch (e) {}

  if (currentRoom) {
    if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Map());
    rooms.get(currentRoom).set(ws, { id: clientId, name: clientName });
    broadcastToRoom(currentRoom, {
      type: 'PEERS',
      room: currentRoom,
      peers: getRoomPeers(currentRoom),
    });
  }

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', time: Date.now() }));
        return;
      }

      if (data.type === 'JOIN') {
        const targetRoom = (data.room || 'BROR').trim().toUpperCase();
        if (data.user) clientName = data.user;

        // Leave previous room if any
        if (currentRoom && rooms.has(currentRoom)) {
          const oldRoom = rooms.get(currentRoom);
          oldRoom.delete(ws);
          if (oldRoom.size === 0) rooms.delete(currentRoom);
          else {
            broadcastToRoom(currentRoom, {
              type: 'PEERS',
              room: currentRoom,
              peers: getRoomPeers(currentRoom),
            });
          }
        }

        currentRoom = targetRoom;
        if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Map());
        rooms.get(currentRoom).set(ws, { id: clientId, name: clientName });

        // Confirm join to client
        ws.send(
          JSON.stringify({
            type: 'JOINED',
            room: currentRoom,
            id: clientId,
            name: clientName,
            peers: getRoomPeers(currentRoom),
          })
        );

        // Notify room
        broadcastToRoom(currentRoom, {
          type: 'PEERS',
          room: currentRoom,
          peers: getRoomPeers(currentRoom),
        });
        return;
      }

      if (!currentRoom) return;

      if (data.type === 'CHEERS') {
        // Broadcast cheers to EVERYONE in the room including sender or with sender attribution
        broadcastToRoom(currentRoom, {
          type: 'CHEERS',
          user: data.user || clientName,
          senderId: clientId,
          message: data.message || '',
          timestamp: Date.now(),
        });
        return;
      }

      if (data.type === 'RECIPE_UPDATE') {
        // Broadcast recipe update to all peers in the room
        broadcastToRoom(
          currentRoom,
          {
            type: 'RECIPE_UPDATE',
            user: data.user || clientName,
            senderId: clientId,
            recipe: data.recipe,
            version: data.version || Date.now(),
          },
          ws
        );
        return;
      }

      if (data.type === 'STEP_TOGGLE') {
        broadcastToRoom(
          currentRoom,
          {
            type: 'STEP_TOGGLE',
            user: data.user || clientName,
            senderId: clientId,
            stepId: data.stepId,
            completed: data.completed,
          },
          ws
        );
        return;
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.delete(ws);
      if (room.size === 0) {
        rooms.delete(currentRoom);
      } else {
        broadcastToRoom(currentRoom, {
          type: 'PEERS',
          room: currentRoom,
          peers: getRoomPeers(currentRoom),
        });
      }
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
  });
});

// Periodic heartbeat ping to keep connection alive through reverse proxies
const interval = setInterval(() => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.ping();
      } catch (e) {}
    }
  }
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🍺 Bryggkompis Co-op Server listening on http://0.0.0.0:${PORT}`);
});

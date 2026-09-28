// index.js — ChatWithMe Server (Express + Socket.IO)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { findMatch } = require('./matchmaker');
const { broadcastOnlineCount } = require('./presence');

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// ─── In-Memory State ─────────────────────────────────────────────────────────
const waitingQueue = new Map(); // socketId → userData
const activeRooms = new Map();  // roomId   → { users: [socketId, socketId] }
const socketToRoom = new Map(); // socketId → roomId

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateRoomId() {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanupRoom(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  room.users.forEach((id) => {
    socketToRoom.delete(id);
    const sock = io.sockets.sockets.get(id);
    if (sock) sock.leave(roomId);
  });
  activeRooms.delete(roomId);
}

function tryMatch() {
  const match = findMatch(waitingQueue);
  if (!match) return false;

  const { idA, idB } = match;
  const roomId = generateRoomId();

  activeRooms.set(roomId, { users: [idA, idB] });
  socketToRoom.set(idA, roomId);
  socketToRoom.set(idB, roomId);

  const idAData = waitingQueue.get(idA);
  const idBData = waitingQueue.get(idB);
  if (idAData?.timeoutId) clearTimeout(idAData.timeoutId);
  if (idBData?.timeoutId) clearTimeout(idBData.timeoutId);

  waitingQueue.delete(idA);
  waitingQueue.delete(idB);

  const sockA = io.sockets.sockets.get(idA);
  const sockB = io.sockets.sockets.get(idB);
  sockA?.join(roomId);
  sockB?.join(roomId);

  io.to(idA).emit('matched', { roomId });
  io.to(idB).emit('matched', { roomId });

  return true;
}

// ─── Socket.IO Events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  broadcastOnlineCount(io);

  // ── Join Queue ──────────────────────────────────────────────────────────────
  socket.on('join_queue', (userData) => {
    // Server-side age validation
    const age = Number(userData.age);
    if (!age || age < 18 || age > 120) {
      socket.emit('error', { message: 'You must be 18 or older to use ChatWithMe.' });
      return;
    }

    // Sanitize inputs
    const sanitized = {
      age,
      gender: String(userData.gender || '').toLowerCase(),
      preferredGender: String(userData.preferredGender || 'any').toLowerCase(),
      city: String(userData.city || '').trim().slice(0, 100),
      socketId: socket.id,
      timeoutId: setTimeout(() => {
        if (waitingQueue.has(socket.id)) {
          socket.emit('queue_timeout');
        }
      }, 20000)
    };

    // Remove from any existing queue entry (re-queue scenario)
    const existing = waitingQueue.get(socket.id);
    if (existing && existing.timeoutId) clearTimeout(existing.timeoutId);
    waitingQueue.delete(socket.id);

    waitingQueue.set(socket.id, sanitized);

    if (!tryMatch()) {
      socket.emit('queue_waiting');
    }
  });

  // ── Leave Queue (cancel while waiting) ──────────────────────────────────────
  socket.on('leave_queue', () => {
    const user = waitingQueue.get(socket.id);
    if (user && user.timeoutId) clearTimeout(user.timeoutId);
    waitingQueue.delete(socket.id);
    // Re-run match in case this opened a slot
    tryMatch();
  });

  // ── Chat Message ────────────────────────────────────────────────────────────
  socket.on('chat_message', ({ roomId, text }) => {
    if (!roomId || !text || typeof text !== 'string') return;
    const sanitizedText = text.slice(0, 2000); // cap message length
    socket.to(roomId).emit('chat_message', {
      text: sanitizedText,
      timestamp: Date.now(),
    });
  });

  // ── Typing Indicator ────────────────────────────────────────────────────────
  socket.on('typing_start', ({ roomId }) => {
    if (roomId) socket.to(roomId).emit('partner_typing', { isTyping: true });
  });

  socket.on('typing_stop', ({ roomId }) => {
    if (roomId) socket.to(roomId).emit('partner_typing', { isTyping: false });
  });

  // ── End Chat ────────────────────────────────────────────────────────────────
  socket.on('end_chat', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('partner_disconnected');
      cleanupRoom(roomId);
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    // Remove from waiting queue
    const user = waitingQueue.get(socket.id);
    if (user && user.timeoutId) clearTimeout(user.timeoutId);
    waitingQueue.delete(socket.id);

    // Notify chat partner if in a room
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('partner_disconnected');
      cleanupRoom(roomId);
    }

    broadcastOnlineCount(io);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ ChatWithMe server running on http://localhost:${PORT}`);
});

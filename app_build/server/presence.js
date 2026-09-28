// presence.js — Online user count management

/**
 * Broadcasts current online socket count to all connected clients.
 * @param {import('socket.io').Server} io
 */
function broadcastOnlineCount(io) {
  const count = io.sockets.sockets.size;
  io.emit('online_count', { count });
}

module.exports = { broadcastOnlineCount };

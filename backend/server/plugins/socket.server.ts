import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

// This file runs on the server side. It starts a small HTTP server
// that hosts a Socket.IO server attached to it. We use ioredis and
// @socket.io/redis-adapter so events propagate across multiple replicas.

export default defineNitroPlugin((nitroApp) => {
  // Prevent starting multiple Socket servers during Nuxt dev hot-reloads
  const g = globalThis as any;
  if (g.__ls_socket && g.__ls_socket.started) {
    console.log('[socket] already initialized, skipping plugin startup');
    return;
  }
  const config = useRuntimeConfig();
  const redisUrl = config.redisUrl || process.env.REDIS_URL;
  const port = Number(process.env.SOCKET_PORT || 4001);

  if (!redisUrl) {
    console.warn('[socket] REDIS_URL not configured; continuing without Redis adapter');
  }

  // create redis clients for adapter if redisUrl is present, but guard against connection errors
  let pubClient: Redis | null = null;
  let subClient: Redis | null = null;
  if (redisUrl) {
    try {
      pubClient = new Redis(redisUrl);
      subClient = pubClient.duplicate();
      pubClient.on('error', (e) => console.warn('[socket][redis] pub error', e));
      subClient.on('error', (e) => console.warn('[socket][redis] sub error', e));
    } catch (e) {
      console.warn('[socket] failed to create ioredis clients, continuing without adapter', e);
      pubClient = null;
      subClient = null;
    }
  }

  const httpServer = createServer((req, res) => {
    // Basic response for root path so that the port is reachable via browser
    if (req.url === '/' || req.url?.startsWith('/socket.io/')) {
      res.statusCode = 200;
      res.end('Socket.IO server');
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigin = process.env.NUXT_DEV_URL || 'http://localhost:3001';
  const io = new Server(httpServer, {
    cors: {
      // In development allow any origin to make local testing easier (file:// and multiple dev ports)
      origin: isDev ? true : allowedOrigin,
      credentials: true
    },
    // increase ping interval/timeouts on server options
    pingInterval: 25000,
    pingTimeout: 60000
  });

  if (pubClient && subClient) {
    try {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[socket] Redis adapter configured');
    } catch (e) {
      console.warn('[socket] failed to configure redis adapter', e);
    }
  }

  // Basic auth placeholder — replace with your auth check (JWT, cookies, etc.)
  io.use((socket, next) => {
    try {
      // Example: token can be passed as query param: io(url, { auth: { token } })
      const token = (socket.handshake.auth && (socket.handshake.auth as any).token) || (socket.handshake.query && (socket.handshake.query as any).token);
      // TODO: validate token and set socket.data.user
      socket.data.user = token ? { id: token } : { id: 'anonymous' };
      return next();
    } catch (err) {
      return next(err as Error);
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log('[socket] connection', socket.id, 'user=', user?.id, 'transport=', socket.conn.transport.name);

    // log transport events for debugging stability issues
    try {
      socket.conn.on('upgrade', () => console.log('[socket] transport upgraded', socket.id, socket.conn.transport.name));
    } catch (e) {
      // ignore if low-level transport events unavailable
    }

    // Join a room for a specific order: room names should follow a convention like `order:<id>`
    // Accept an optional callback to acknowledge join so clients can wait before sending messages.
    socket.on('join', (room: string, cb?: (res: any) => void) => {
      if (!room) {
        if (cb) cb({ ok: false, error: 'missing room' });
        return;
      }
      // Enforce a single active order room per socket: leave other order:* rooms first
      try {
        for (const r of socket.rooms) {
          if (typeof r === 'string' && r.startsWith('order:') && r !== room) {
            socket.leave(r);
            console.log(`[socket] ${socket.id} left previous room ${r} due to new join ${room}`);
          }
        }
      } catch (e) {
        // ignore
      }

      socket.join(room);
      io.to(room).emit('presence', { type: 'joined', user: socket.data.user, room });
      console.log(`[socket] ${socket.id} joined ${room}`);
      if (cb) cb({ ok: true, room });
    });

    // support leave with optional ack
    socket.on('leave', (room: string, cb?: (res: any) => void) => {
      if (!room) {
        if (cb) cb({ ok: false, error: 'missing room' });
        return;
      }
      socket.leave(room);
      io.to(room).emit('presence', { type: 'left', user: socket.data.user, room });
      console.log(`[socket] ${socket.id} left ${room}`);
      if (cb) cb({ ok: true, room });
    });

    // Message handler supports an optional callback/ack so the sender knows delivery succeeded.
    socket.on('message', (payload: any, cb?: (res: any) => void) => {
      // payload should include { room, text, meta }
      const room = payload?.room;
      if (!room) {
        if (cb) cb({ ok: false, error: 'missing room' });
        return;
      }
      const msg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        room,
        user: socket.data.user,
        text: payload.text,
        meta: payload.meta || {},
        ts: Date.now()
      };
      // Emit to room (includes sender). If you want sender excluded use socket.to(room).emit
      io.to(room).emit('message', msg);
      console.log('[socket] message emitted', msg.id, 'room=', room);
      if (cb) cb({ ok: true, id: msg.id, ts: msg.ts });
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnect', socket.id, reason);
    });
  });

  httpServer.on('error', (err) => {
    console.error('[socket] HTTP server error', err);
  });

  httpServer.listen(port, () => {
    console.log(`[socket] Socket.IO server listening on port ${port}`);
  });

  // Close resources on Nitro shutdown
  // Store instance on global so dev hot-reloads won't start a second server
  g.__ls_socket = g.__ls_socket || {};
  g.__ls_socket.started = true;
  g.__ls_socket.httpServer = httpServer;
  g.__ls_socket.io = io;
  g.__ls_socket.pubClient = pubClient;
  g.__ls_socket.subClient = subClient;

  nitroApp.hooks.hook('close', async () => {
    console.log('[socket] shutting down');
    try {
      // Only close resources if they exist on the global instance
      const inst = (globalThis as any).__ls_socket || {};
      if (inst.io) await inst.io.close();
      if (inst.httpServer) inst.httpServer.close();
      if (inst.pubClient) await inst.pubClient.quit();
      if (inst.subClient) await inst.subClient.quit();
      // clear flag
      (globalThis as any).__ls_socket = null;
    } catch (e) {
      console.warn('[socket] error during shutdown', e);
    }
  });
});

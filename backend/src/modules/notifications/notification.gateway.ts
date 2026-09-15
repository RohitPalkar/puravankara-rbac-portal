import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    // Prefer JWT from handshake auth; fallback to query only if verified externally
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');
    let userId: string | null = null;
    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        userId = payload.sub || payload.userId || null;
      } catch {
        userId = null;
      }
    }
    // Legacy query param fallback is now gated: only allow if token validated
    if (!userId) {
      const queryUserId = client.handshake.query.userId as string;
      // Reject unauthenticated WS connections instead of trusting query
      if (queryUserId) {
        this.logger.warn(
          `WS rejected unauthenticated connection for user=${queryUserId} socket=${client.id}`,
        );
        client.disconnect(true);
        return;
      }
      return;
    }
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);
    this.logger.log(`WS connected: user=${userId} socket=${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.delete(client.id) && sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}

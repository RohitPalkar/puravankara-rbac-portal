import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
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
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      client.join(`user:${userId}`);
      this.logger.log(`WS connected: user=${userId} socket=${client.id}`);
    }
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

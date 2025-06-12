import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

export class SockerClientConnection {
  socket: WebSocket;
  connectedMessage: IncomingMessage;

  constructor(socket: WebSocket, message: IncomingMessage) {
    this.socket = socket;
    this.connectedMessage = message;
  }
}

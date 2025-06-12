import { IncomingMessage } from "http";
import { WebSocket } from "ws";
export declare class SockerClientConnection {
    socket: WebSocket;
    connectedMessage: IncomingMessage;
    constructor(socket: WebSocket, message: IncomingMessage);
}

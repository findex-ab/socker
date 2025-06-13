import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { IncomingMessage } from "http";
import { SocketType } from "./socket";
export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;
export declare class SocketClient {
    socket: SocketType;
    connectedMessage: IncomingMessage | null;
    id: string;
    authenticated: boolean;
    constructor(socket: SocketType, id: string, message?: IncomingMessage);
    private checkSocketAndWarn;
    send(data: BinaryKeyValueStore): void;
    isReady(): boolean;
    isConnecting(): boolean;
    isClosed(): boolean;
    onMessage(fn: SocketClientMessageCallbackFunction): (() => void);
    onReady(fn: (client: SocketClient) => any): void;
}

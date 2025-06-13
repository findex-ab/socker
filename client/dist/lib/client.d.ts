import { BinaryKeyValueStore } from "socker/shared";
import { IncomingMessage } from "http";
import { SocketType } from "./socket";
export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;
export type SocketClientTransferArgs = {
    data: Blob | File;
    name: string;
    app: string;
    chunkSize?: number;
    onFinish?: (socket: SocketClient, ok: boolean) => any;
    onProgress?: (socket: SocketClient, bytesSent: number, totalBytes: number) => any;
};
export type SocketClientTransferResult = {
    ok: boolean;
};
export type ISocketClientInit = {
    socket: SocketType;
    id: string;
    message?: IncomingMessage;
    socketFactory?: () => SocketType;
    maxReconnectRetries?: number;
};
export declare class SocketClient {
    socket: SocketType;
    connectedMessage: IncomingMessage | null;
    id: string;
    authenticated: boolean;
    socketFactory?: () => SocketType;
    maxReconnectRetries: number;
    constructor(init: ISocketClientInit);
    private addReconnectHandler;
    reconnect(): Promise<void>;
    setAuthenticated(authenticated: boolean): void;
    private checkSocketAndWarn;
    send(data: BinaryKeyValueStore): void;
    isReady(): boolean;
    isConnecting(): boolean;
    isClosed(): boolean;
    onMessage(fn: SocketClientMessageCallbackFunction): (() => void);
    onReady(fn: (client: SocketClient) => any): void;
    wait(timeout?: number): Promise<SocketClient | null>;
    receive(match: Record<string, any>, timeout?: number): Promise<BinaryKeyValueStore | null>;
    private startTransaction;
    private sendTransactionChunk;
    transfer(args: SocketClientTransferArgs): Promise<SocketClientTransferResult>;
}

import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { IncomingMessage } from "http";
import { SocketType } from "./socket";
import { EventSystem } from "#/shared/eventSystem";
export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;
export type SocketClientTransferArgs = {
    data: Blob | File;
    name: string;
    app: string;
    startParams?: Record<string, any>;
    chunkSize?: number;
    onFinish?: (socket: SocketClient, ok: boolean) => any;
    onProgress?: (socket: SocketClient, bytesSent: number, totalBytes: number) => any;
};
export type SocketClientTransferResult = {
    ok: boolean;
    canceled?: boolean;
    [key: string]: any;
};
export type ISocketClientInit = {
    socket: SocketType;
    id: string;
    message?: IncomingMessage;
    socketFactory?: () => SocketType;
    maxReconnectRetries?: number;
    autoReconnect?: boolean;
};
export type SocketClientTransactionState = {
    canceled: boolean;
};
export declare enum ESocketClientEvent {
    RECONNECTED = "RECONNECTED"
}
export type SocketClientEventMap = {
    [ESocketClientEvent.RECONNECTED]: {
        eventType: ESocketClientEvent.RECONNECTED;
    };
};
export declare class SocketClient {
    socket: SocketType;
    connectedMessage: IncomingMessage | null;
    id: string;
    socketFactory?: () => SocketType;
    maxReconnectRetries: number;
    events: EventSystem<SocketClientEventMap>;
    transactionStates: Map<string, SocketClientTransactionState>;
    constructor(init: ISocketClientInit);
    private addReconnectHandler;
    reconnect(): Promise<void>;
    private checkSocketAndWarn;
    send(data: BinaryKeyValueStore): void;
    isReady(): boolean;
    isConnecting(): boolean;
    isClosed(): boolean;
    onMessage(fn: SocketClientMessageCallbackFunction): (() => void);
    onReady(fn: (client: SocketClient) => any): void;
    wait(timeout?: number): Promise<SocketClient | null>;
    receive(match: Record<string, any>, timeout?: number): Promise<BinaryKeyValueStore | null>;
    private createTransactionState;
    private transactionIsCanceled;
    private deleteTransactionState;
    cancelTransaction(name: string): void;
    private withTransactionState;
    private startTransaction;
    private sendTransactionChunk;
    private _transfer;
    transfer(args: SocketClientTransferArgs): Promise<SocketClientTransferResult>;
}

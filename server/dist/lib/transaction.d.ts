import { BinaryKeyValueStore } from '#/shared/binaryKVStore';
export declare enum ETransactionState {
    NONE = "NONE",
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}
export type ITransactionInit = {
    id: string;
    outputDir?: string;
};
export type ITransactionWriteArgs = {
    chunkIndex: number;
    data: Uint8Array;
};
export declare class Transaction {
    state: ETransactionState;
    id: string;
    uuid: string;
    outputDir: string;
    private fd;
    constructor(init: ITransactionInit);
    getFilename(): string;
    getFilepath(): string;
    isOpen(): boolean;
    isClosed(): boolean;
    open(mode?: string): void;
    close(): void;
    write(args: ITransactionWriteArgs): void;
    read(): Generator<BinaryKeyValueStore, void, undefined> | null;
}

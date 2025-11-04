import { BinaryKeyValueStore } from '#/shared/binaryKVStore';
export declare enum ETransactionState {
    NONE = "NONE",
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}
export type ITransactionInit<MetaData = any> = {
    id: string;
    outputDir?: string;
    meta?: MetaData;
};
export type ITransactionWriteArgs = {
    chunkIndex: number;
    data: Uint8Array;
};
export declare class Transaction<MetaData = any> {
    state: ETransactionState;
    id: string;
    uuid: string;
    outputDir: string;
    fd: number;
    meta?: MetaData;
    private dataSize;
    constructor(init: ITransactionInit<MetaData>);
    getDataSize(): number;
    getFilename(): string;
    getFilepath(): string;
    isOpen(): boolean;
    isClosed(): boolean;
    open(mode?: string, filepath?: string): void;
    close(): void;
    write(args: ITransactionWriteArgs): void;
    read(): Generator<BinaryKeyValueStore, void, undefined> | null;
}

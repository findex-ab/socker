import { BinaryBlob } from "./blob";
export type BinaryKeyValueStoreValue = BinaryBlob;
export type BinaryKeyValueStoreRow = {
    key: string;
    value: BinaryKeyValueStoreValue;
    index: number;
};
export declare class BinaryKeyValueStore {
    index: number;
    key_to_index: Map<string, number>;
    rows: Array<BinaryKeyValueStoreRow>;
    getRow(key: string): BinaryKeyValueStoreRow | null;
    set(key: string, value: BinaryKeyValueStoreValue): void;
    setString(key: string, value: string): void;
    setFloat32(key: string, value: number): void;
    setUint32(key: string, value: number): void;
    setInt32(key: string, value: number): void;
    get(key: string): BinaryKeyValueStoreValue | null;
    getString(key: string): string | null;
    getFloat32(key: string): number;
    getUint32(key: string): number;
    getInt32(key: string): number;
    toBinary(): Uint8Array;
    static fromBinary(data: ArrayBufferLike): BinaryKeyValueStore;
    static fromBinarySafe(data: ArrayBufferLike): BinaryKeyValueStore | null;
}

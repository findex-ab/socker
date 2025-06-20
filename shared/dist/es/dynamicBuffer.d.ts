import { BinaryPrimitive } from "./binaryPrimitive";
import { BinaryBlob } from "./blob";
export declare class DynamicBuffer {
    data: Uint8Array;
    cursor: number;
    constructor(buffer?: ArrayBufferLike | string);
    clampCursor(): void;
    seek(pos: number): void;
    withCursor<T = any>(cursor: number, fn: () => T): T;
    getView(): DataView;
    load(buffer: ArrayBufferLike | string): void;
    realloc(newSize: number): void;
    grow(extraSize: number): void;
    read(size: number): Uint8Array;
    readBytes(size: number): number[];
    readUint32(): number;
    readInt32(): number;
    readFloat32(): number;
    readFloat64(): number;
    readString(length: number): string;
    readBinaryBlob(): BinaryBlob | null;
    readBinaryPrimitive(): BinaryPrimitive | null;
    toString(): string;
    write(data: ArrayBufferLike | Array<number>): void;
    writeString(text: string): void;
    writeUint32(x: number): void;
    writeInt32(x: number): void;
    writeFloat32(x: number): void;
    writeFloat64(x: number): void;
    writeBinaryBlob(blob: BinaryBlob): void;
    writeBinaryPrimitive(prim: BinaryPrimitive): void;
}

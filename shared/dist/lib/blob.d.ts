export declare enum EBinaryBlob {
    INT32 = 0,
    INT64 = 1,
    UINT32 = 2,
    UINT64 = 3,
    FLOAT32 = 4,
    FLOAT64 = 5,
    STRING = 6,
    STRING_JSON = 7,
    BINARY_KV_STORE = 8,
    ARB = 9
}
export type BinaryBlob = {
    type: EBinaryBlob;
    size: number;
    data: ArrayBufferLike;
};
export declare const binaryStringBlob: (value: string) => BinaryBlob;
export declare const binaryUint32Blob: (value: number) => BinaryBlob;
export declare const binaryInt32Blob: (value: number) => BinaryBlob;
export declare const binaryFloat32Blob: (value: number) => BinaryBlob;
export declare const binaryBlobToBytes: (blob: BinaryBlob) => number[];
export declare const binaryBlobToFloat32: (blob: BinaryBlob) => number;
export declare const binaryBlobToUint32: (blob: BinaryBlob) => number;
export declare const binaryBlobToInt32: (blob: BinaryBlob) => number;
export declare const binaryBlobToString: (blob: BinaryBlob) => string;

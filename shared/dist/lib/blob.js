import { float32ToByteArray, int32ToByteArray, uint32ToByteArray, } from "./binary";
export var EBinaryBlob;
(function (EBinaryBlob) {
    EBinaryBlob[EBinaryBlob["INT32"] = 0] = "INT32";
    EBinaryBlob[EBinaryBlob["INT64"] = 1] = "INT64";
    EBinaryBlob[EBinaryBlob["UINT32"] = 2] = "UINT32";
    EBinaryBlob[EBinaryBlob["UINT64"] = 3] = "UINT64";
    EBinaryBlob[EBinaryBlob["FLOAT32"] = 4] = "FLOAT32";
    EBinaryBlob[EBinaryBlob["FLOAT64"] = 5] = "FLOAT64";
    EBinaryBlob[EBinaryBlob["STRING"] = 6] = "STRING";
    EBinaryBlob[EBinaryBlob["STRING_JSON"] = 7] = "STRING_JSON";
    EBinaryBlob[EBinaryBlob["BINARY_KV_STORE"] = 8] = "BINARY_KV_STORE";
    EBinaryBlob[EBinaryBlob["ARB"] = 9] = "ARB";
})(EBinaryBlob || (EBinaryBlob = {}));
export const binaryStringBlob = (value) => {
    return {
        type: EBinaryBlob.STRING,
        size: value.length,
        data: Uint8Array.from(Array.from(value).map((letter) => letter.charCodeAt(0))),
    };
};
export const binaryUint32Blob = (value) => {
    return {
        type: EBinaryBlob.UINT32,
        size: 4,
        data: uint32ToByteArray(value),
    };
};
export const binaryInt32Blob = (value) => {
    return {
        type: EBinaryBlob.INT32,
        size: 4,
        data: int32ToByteArray(value),
    };
};
export const binaryFloat32Blob = (value) => {
    return {
        type: EBinaryBlob.FLOAT32,
        size: 4,
        data: float32ToByteArray(value),
    };
};
export const binaryBlobToBytes = (blob) => {
    return Array.from(new Uint8Array(blob.data).values());
};
export const binaryBlobToFloat32 = (blob) => {
    const buff = Buffer.from(blob.data);
    return buff.readFloatBE();
};
export const binaryBlobToUint32 = (blob) => {
    const buff = Buffer.from(blob.data);
    return buff.readUint32BE();
};
export const binaryBlobToInt32 = (blob) => {
    const buff = Buffer.from(blob.data);
    return buff.readInt32BE();
};
export const binaryBlobToString = (blob) => {
    return binaryBlobToBytes(blob)
        .map((code) => String.fromCharCode(Number(code)))
        .join("");
};

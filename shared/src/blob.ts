import {
  float32ToByteArray,
  int32ToByteArray,
  uint32ToByteArray,
} from "./binary";

export enum EBinaryBlob {
  INT32 = 0,
  INT64 = 1,
  UINT32 = 2,
  UINT64 = 3,
  FLOAT32 = 4,
  FLOAT64 = 5,
  STRING = 6,
  STRING_JSON = 7,
  BINARY_KV_STORE = 8,
  ARB = 9,
}

export type BinaryBlob = {
  type: EBinaryBlob;
  size: number;
  data: ArrayBufferLike;
};

export const binaryStringBlob = (value: string): BinaryBlob => {
  return {
    type: EBinaryBlob.STRING,
    size: value.length,
    data: Uint8Array.from(
      Array.from(value).map((letter) => letter.charCodeAt(0)),
    ),
  };
};

export const binaryUint32Blob = (value: number): BinaryBlob => {
  return {
    type: EBinaryBlob.UINT32,
    size: 4,
    data: uint32ToByteArray(value),
  };
};

export const binaryInt32Blob = (value: number): BinaryBlob => {
  return {
    type: EBinaryBlob.INT32,
    size: 4,
    data: int32ToByteArray(value),
  };
};

export const binaryFloat32Blob = (value: number): BinaryBlob => {
  return {
    type: EBinaryBlob.FLOAT32,
    size: 4,
    data: float32ToByteArray(value),
  };
};

export const binaryBlobToBytes = (blob: BinaryBlob): number[] => {
  return Array.from(new Uint8Array(blob.data).values());
};

export const binaryBlobToFloat32 = (blob: BinaryBlob): number => {
  const buff = Buffer.from(blob.data);
  return buff.readFloatBE();
};

export const binaryBlobToUint32 = (blob: BinaryBlob): number => {
  const buff = Buffer.from(blob.data);
  return buff.readUint32BE();
};

export const binaryBlobToInt32 = (blob: BinaryBlob): number => {
  const buff = Buffer.from(blob.data);
  return buff.readInt32BE();
};

export const binaryBlobToString = (blob: BinaryBlob): string => {
  return binaryBlobToBytes(blob)
    .map((code) => String.fromCharCode(Number(code)))
    .join("");
};

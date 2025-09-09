"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/blob.ts
var blob_exports = {};
__export(blob_exports, {
  EBinaryBlob: () => EBinaryBlob,
  binaryBlobToBytes: () => binaryBlobToBytes,
  binaryBlobToFloat32: () => binaryBlobToFloat32,
  binaryBlobToInt32: () => binaryBlobToInt32,
  binaryBlobToString: () => binaryBlobToString,
  binaryBlobToUint32: () => binaryBlobToUint32,
  binaryFloat32Blob: () => binaryFloat32Blob,
  binaryInt32Blob: () => binaryInt32Blob,
  binaryStringBlob: () => binaryStringBlob,
  binaryUint32Blob: () => binaryUint32Blob
});
module.exports = __toCommonJS(blob_exports);

// src/binary.ts
var uint32ToByteArray = (x) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, x);
  return new Uint8Array(buffer);
};
var int32ToByteArray = (x) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, x);
  return new Uint8Array(buffer);
};
var float32ToByteArray = (x) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, x);
  return new Uint8Array(buffer);
};

// src/blob.ts
var EBinaryBlob = /* @__PURE__ */ ((EBinaryBlob2) => {
  EBinaryBlob2[EBinaryBlob2["INT32"] = 0] = "INT32";
  EBinaryBlob2[EBinaryBlob2["INT64"] = 1] = "INT64";
  EBinaryBlob2[EBinaryBlob2["UINT32"] = 2] = "UINT32";
  EBinaryBlob2[EBinaryBlob2["UINT64"] = 3] = "UINT64";
  EBinaryBlob2[EBinaryBlob2["FLOAT32"] = 4] = "FLOAT32";
  EBinaryBlob2[EBinaryBlob2["FLOAT64"] = 5] = "FLOAT64";
  EBinaryBlob2[EBinaryBlob2["STRING"] = 6] = "STRING";
  EBinaryBlob2[EBinaryBlob2["STRING_JSON"] = 7] = "STRING_JSON";
  EBinaryBlob2[EBinaryBlob2["BINARY_KV_STORE"] = 8] = "BINARY_KV_STORE";
  EBinaryBlob2[EBinaryBlob2["ARB"] = 9] = "ARB";
  return EBinaryBlob2;
})(EBinaryBlob || {});
var binaryStringBlob = (value) => {
  return {
    type: 6 /* STRING */,
    size: value.length,
    data: Uint8Array.from(
      Array.from(value).map((letter) => letter.charCodeAt(0))
    )
  };
};
var binaryUint32Blob = (value) => {
  return {
    type: 2 /* UINT32 */,
    size: 4,
    data: uint32ToByteArray(value)
  };
};
var binaryInt32Blob = (value) => {
  return {
    type: 0 /* INT32 */,
    size: 4,
    data: int32ToByteArray(value)
  };
};
var binaryFloat32Blob = (value) => {
  return {
    type: 4 /* FLOAT32 */,
    size: 4,
    data: float32ToByteArray(value)
  };
};
var binaryBlobToBytes = (blob) => {
  return Array.from(new Uint8Array(blob.data).values());
};
var binaryBlobToFloat32 = (blob) => {
  const buff = Buffer.from(blob.data);
  return buff.readFloatBE();
};
var binaryBlobToUint32 = (blob) => {
  const buff = Buffer.from(blob.data);
  return buff.readUint32BE();
};
var binaryBlobToInt32 = (blob) => {
  const buff = Buffer.from(blob.data);
  return buff.readInt32BE();
};
var binaryBlobToString = (blob) => {
  return binaryBlobToBytes(blob).map((code) => String.fromCharCode(Number(code))).join("");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EBinaryBlob,
  binaryBlobToBytes,
  binaryBlobToFloat32,
  binaryBlobToInt32,
  binaryBlobToString,
  binaryBlobToUint32,
  binaryFloat32Blob,
  binaryInt32Blob,
  binaryStringBlob,
  binaryUint32Blob
});

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

// src/binary.ts
var binary_exports = {};
__export(binary_exports, {
  float32ToByteArray: () => float32ToByteArray,
  float64ToByteArray: () => float64ToByteArray,
  int32ToByteArray: () => int32ToByteArray,
  packNumber: () => packNumber,
  uint32ToByteArray: () => uint32ToByteArray,
  unpackNumber: () => unpackNumber,
  unpackUint32: () => unpackUint32
});
module.exports = __toCommonJS(binary_exports);

// src/arrays.ts
var range = (n) => Array.from(Array(n).keys());

// src/binary.ts
var unpackNumber = (x, numBytes) => {
  return range(numBytes).map((i) => x >> i * numBytes & 255);
};
var packNumber = (bytes) => {
  let v = 0;
  for (let i = 0; i < bytes.length; i++) {
    v = v << bytes.length | bytes[i];
  }
  return v;
};
var unpackUint32 = (x) => {
  return unpackNumber(x, 4);
};
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
var float64ToByteArray = (x) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, x);
  return new Uint8Array(buffer);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  float32ToByteArray,
  float64ToByteArray,
  int32ToByteArray,
  packNumber,
  uint32ToByteArray,
  unpackNumber,
  unpackUint32
});

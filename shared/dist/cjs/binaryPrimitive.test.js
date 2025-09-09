"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/binaryPrimitive.test.ts
var import_node_test = require("node:test");

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

// src/math.ts
var fract = (x) => x - Math.floor(x);

// src/is.ts
var isFloat = (x) => fract(x) > 0;
var isInt = (x) => !isFloat(x);
var isUint = (x) => isInt(x) && x >= 0;

// src/binaryPrimitive.ts
var BinaryPrimitive = class _BinaryPrimitive {
  data = new Uint8Array();
  type = 0 /* SCALAR */;
  componentType = 0 /* NULL */;
  size = 0;
  tag = 0;
  constructor(data, type, componentType) {
    if (!data) return;
    if (typeof type !== "number") return;
    if (typeof componentType !== "number") return;
    this.data = data;
    this.type = type;
    this.componentType = componentType;
    this.size = this.data.length;
  }
  setType(typ) {
    this.type = typ;
    return this;
  }
  setComponentType(compType) {
    this.componentType = compType;
    return this;
  }
  setTag(tag) {
    this.tag = tag;
    return this;
  }
  getRawBytes() {
    return Array.from(this.data.values());
  }
  getBuffer() {
    const bytes = this.getRawBytes();
    const buff = Buffer.from(bytes);
    return buff;
  }
  // PI = platform independant
  getPIBuffer() {
    return new DataView(this.data.buffer);
  }
  setUint32(value) {
    this.type = 0 /* SCALAR */;
    this.componentType = 3 /* UINT32 */;
    this.data = uint32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }
  getUint32() {
    return this.getPIBuffer().getUint32(0, false);
  }
  setInt32(value) {
    this.type = 0 /* SCALAR */;
    this.componentType = 1 /* INT32 */;
    this.data = int32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }
  getInt32() {
    return this.getPIBuffer().getInt32(0, false);
  }
  setFloat32(value) {
    this.type = 0 /* SCALAR */;
    this.componentType = 5 /* FLOAT32 */;
    this.data = float32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }
  getFloat32() {
    return this.getPIBuffer().getFloat32(0, false);
  }
  setNumber(value) {
    if (isFloat(value)) return this.setFloat32(value);
    if (isUint(value)) return this.setUint32(value);
    return this.setInt32(value);
  }
  getNumber() {
    switch (this.componentType) {
      case 3 /* UINT32 */:
        return this.getUint32();
      case 1 /* INT32 */:
        return this.getInt32();
      case 5 /* FLOAT32 */:
        return this.getFloat32();
      case 7 /* CHAR */:
        return this.getChar();
      case 8 /* BYTE */:
        return this.getByte();
      default:
        return 0;
    }
  }
  setByte(value) {
    this.type = 0 /* SCALAR */;
    this.componentType = 8 /* BYTE */;
    this.data = new Uint8Array([value]);
    this.size = this.data.length;
    return this;
  }
  setBool(value) {
    this.type = 0 /* SCALAR */;
    this.componentType = 9 /* BOOL */;
    this.data = new Uint8Array([value === true ? 1 : 0]);
    this.size = this.data.length;
    return this;
  }
  getBool() {
    return this.getByte() >= 1;
  }
  setBytes(data) {
    this.type = 1 /* ARRAY */;
    this.componentType = 8 /* BYTE */;
    this.data = data;
    this.size = this.data.length;
    return this;
  }
  getBytes() {
    return this.data;
  }
  getByte() {
    return this.getPIBuffer().getUint8(0);
  }
  setChar(value) {
    return this.setByte(value.charCodeAt(0)).setComponentType(7 /* CHAR */);
  }
  getChar() {
    return this.getByte();
  }
  setString(value) {
    this.type = 1 /* ARRAY */;
    this.componentType = 7 /* CHAR */;
    const encoder = new TextEncoder();
    this.data = encoder.encode(value);
    this.size = this.data.length;
    return this;
  }
  getString() {
    const decoder = new TextDecoder();
    return decoder.decode(this.getBytes());
  }
  setNull() {
    this.data = new Uint8Array();
    this.size = 0;
    this.componentType = 0 /* NULL */;
    this.type = 0 /* SCALAR */;
    return this;
  }
  setArray(arr) {
    if (arr.length <= 0) {
      return this.setNull();
    }
    this.componentType = arr[0].componentType;
    this.type = 1 /* ARRAY */;
    let totalSize = 0;
    for (const prim of arr) {
      totalSize += prim.data.length;
    }
    if (totalSize <= 0) return this;
    this.data = new Uint8Array(totalSize);
    let offset = 0;
    for (const prim of arr) {
      this.data.set(prim.data, offset);
      offset += prim.data.length;
    }
    this.size = this.data.length;
    return this;
  }
  getComponentSize() {
    if (this.type === 0 /* SCALAR */) return this.data.length;
    switch (this.componentType) {
      case 0 /* NULL */:
        return 0;
      case 7 /* CHAR */:
        return 1;
      case 8 /* BYTE */:
        return 1;
      case 10 /* ARB */:
        return 1;
      case 1 /* INT32 */:
        return 4;
      case 3 /* UINT32 */:
        return 4;
      case 5 /* FLOAT32 */:
        return 4;
      case 6 /* FLOAT64 */:
        return 8;
      default:
        return 1;
    }
  }
  getSlice(offset, length) {
    const part = this.data.slice(offset, offset + length);
    const prim = new _BinaryPrimitive();
    prim.data = part;
    prim.size = part.length;
    prim.type = this.type;
    prim.componentType = this.componentType;
    return prim;
  }
  getArray() {
    const componentSize = this.getComponentSize();
    if (componentSize <= 0) return [];
    const prims = [];
    let offset = 0;
    while (offset < this.data.length) {
      const prim = this.getSlice(offset, componentSize);
      prims.push(prim);
      offset += componentSize;
    }
    return prims;
  }
};

// src/binaryPrimitive.test.ts
var import_node_assert = __toESM(require("node:assert"));
(0, import_node_test.describe)("Store and retreive arrays", () => {
  const prim = new BinaryPrimitive();
  prim.setArray([5, 7, 3, 9].map((it) => new BinaryPrimitive().setNumber(it)));
  import_node_assert.default.strictEqual(prim.size, 4 * 4);
  import_node_assert.default.strictEqual(prim.getComponentSize(), 4);
  const arr = prim.getArray();
  import_node_assert.default.strictEqual(arr.length, 4);
  const values = arr.map((it) => it.getNumber());
  import_node_assert.default.strictEqual(values[0], 5);
  import_node_assert.default.strictEqual(values[1], 7);
  import_node_assert.default.strictEqual(values[2], 3);
  import_node_assert.default.strictEqual(values[3], 9);
});

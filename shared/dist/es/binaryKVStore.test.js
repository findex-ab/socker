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

// src/binaryKVStore.test.ts
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
var isStringArray = (arr) => {
  return arr.filter((it) => typeof it === "string").length >= arr.length;
};

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
    const bytes = this.getBytes();
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
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

// src/dynamicBuffer.ts
var DynamicBuffer = class {
  data = new Uint8Array(0);
  cursor = 0;
  constructor(buffer) {
    if (buffer) {
      this.load(buffer);
    }
  }
  clampCursor() {
    this.cursor = Math.max(0, Math.min(this.cursor, this.data.length));
  }
  seek(pos) {
    if (pos === 0) {
      this.cursor = pos;
    } else if (pos < 0) {
      this.cursor = this.data.length - 1;
    } else {
      this.cursor = pos;
    }
    this.clampCursor();
  }
  withCursor(cursor, fn) {
    const oldCursor = this.cursor;
    this.cursor = cursor;
    const ret = fn();
    this.cursor = oldCursor;
    return ret;
  }
  getView() {
    return new DataView(this.data.slice(this.cursor).buffer);
  }
  load(buffer) {
    if (typeof buffer === "string") {
      this.data = Uint8Array.from(Array.from(buffer).map((letter) => letter.charCodeAt(0)));
      return;
    }
    if (buffer instanceof Uint8Array) {
      this.data = buffer;
      return;
    }
    this.data = new Uint8Array(buffer);
  }
  realloc(newSize) {
    const data = new Uint8Array(newSize);
    if (data.length >= this.data.length) {
      data.set(this.data, 0);
    }
    this.data = data;
  }
  grow(extraSize) {
    this.realloc(this.data.length + extraSize);
  }
  read(size) {
    const chunk = this.data.slice(this.cursor, this.cursor + size);
    this.cursor += chunk.length;
    return chunk;
  }
  readBytes(size) {
    return Array.from(this.read(size).values());
  }
  readUint32() {
    const bytes = this.readBytes(4);
    const view = new DataView(new Uint8Array(bytes).buffer);
    return view.getUint32(0, false);
  }
  readInt32() {
    const bytes = this.readBytes(4);
    const view = new DataView(new Uint8Array(bytes).buffer);
    return view.getInt32(0, false);
  }
  readFloat32() {
    const bytes = this.readBytes(4);
    const view = new DataView(new Uint8Array(bytes).buffer);
    return view.getFloat32(0, false);
  }
  readFloat64() {
    const bytes = this.readBytes(8);
    const view = new DataView(new Uint8Array(bytes).buffer);
    return view.getFloat64(0, false);
  }
  readString(length) {
    return this.readBytes(length).map((code) => String.fromCharCode(Number(code))).join("");
  }
  readBinaryBlob() {
    const blobType = this.readUint32();
    const size = this.readUint32();
    if (size <= 0) return null;
    const data = this.read(size);
    return {
      type: blobType,
      size,
      data
    };
  }
  readBinaryPrimitive() {
    const primType = this.readUint32();
    const compType = this.readUint32();
    const tag = this.readUint32();
    const size = this.readUint32();
    if (size <= 0) return null;
    const data = this.read(size);
    const prim = new BinaryPrimitive();
    prim.data = data;
    prim.size = size;
    prim.type = primType;
    prim.tag = tag;
    prim.componentType = compType;
    return prim;
  }
  toString() {
    return this.withCursor(0, () => {
      return this.readString(this.data.length);
    });
  }
  write(data) {
    const buffer = new Uint8Array(data);
    if (buffer.length <= 0) return;
    this.grow(buffer.length);
    this.data.set(buffer, this.cursor);
    this.cursor += buffer.length;
    this.clampCursor();
  }
  writeString(text) {
    this.write(Uint8Array.from(Array.from(text).map((letter) => letter.charCodeAt(0))));
  }
  writeUint32(x) {
    this.write(uint32ToByteArray(x));
  }
  writeInt32(x) {
    this.write(int32ToByteArray(x));
  }
  writeFloat32(x) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, x);
    this.write(buffer);
  }
  writeFloat64(x) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, x);
    this.write(buffer);
  }
  writeBinaryBlob(blob) {
    this.writeUint32(blob.type);
    this.writeUint32(blob.size);
    this.write(blob.data);
  }
  writeBinaryPrimitive(prim) {
    this.writeUint32(prim.type);
    this.writeUint32(prim.componentType);
    this.writeUint32(prim.tag);
    this.writeUint32(prim.data.length);
    this.write(prim.data);
  }
};

// src/binaryKVStore.ts
var MAGIC = "BinaryKeyValueStore";
var TAG = 20868;
var STRING_TAG = 21905;
var STRING_ARRAY_TAG = 21907;
var stringArrayFromBinary = (data) => {
  const buff = new DynamicBuffer(data.data);
  const numStrings = buff.readUint32();
  const strings = [];
  for (let i = 0; i < numStrings; i++) {
    const strLen = buff.readUint32();
    if (strLen <= 0) continue;
    const strContent = buff.readString(strLen);
    strings.push(strContent);
  }
  return strings;
};
var stringArrayToBinary = (arr) => {
  const strings = arr.map((val) => {
    const lengthPrim = new BinaryPrimitive().setUint32(val.length);
    const contentPrim = new BinaryPrimitive().setString(val);
    const buff2 = new DynamicBuffer();
    buff2.write(lengthPrim.data);
    buff2.write(contentPrim.data);
    return new BinaryPrimitive().setBytes(buff2.data).setTag(STRING_TAG).setType(1 /* ARRAY */).setComponentType(8 /* BYTE */).data;
  });
  const buff = new DynamicBuffer();
  buff.writeUint32(strings.length);
  for (const str of strings) {
    buff.write(str);
  }
  const prim = new BinaryPrimitive().setTag(STRING_ARRAY_TAG).setBytes(buff.data).setType(1 /* ARRAY */).setComponentType(8 /* BYTE */);
  return prim;
};
var BinaryKeyValueStore = class _BinaryKeyValueStore {
  index = 0;
  key_to_index = /* @__PURE__ */ new Map();
  rows = [];
  getRow(key) {
    const idx = this.key_to_index.get(key);
    if (typeof idx !== "number") return null;
    if (idx < 0 || idx >= this.rows.length) return null;
    return this.rows[idx];
  }
  set(key, value) {
    const row = this.getRow(key);
    if (row) {
      row.value = value;
      return;
    }
    const newRow = {
      key,
      value,
      index: this.index
    };
    this.key_to_index.set(key, this.index);
    this.rows.push(newRow);
    this.index += 1;
  }
  setString(key, value) {
    this.set(key, new BinaryPrimitive().setString(value));
  }
  setStringArray(key, value) {
    const bin = stringArrayToBinary(value);
    this.set(key, bin);
  }
  setFloat32(key, value) {
    this.set(key, new BinaryPrimitive().setFloat32(value));
  }
  setUint32(key, value) {
    this.set(key, new BinaryPrimitive().setUint32(value));
  }
  setInt32(key, value) {
    this.set(key, new BinaryPrimitive().setInt32(value));
  }
  setNumber(key, value) {
    if (isFloat(value)) {
      this.setFloat32(key, value);
      return;
    }
    if (isUint(value)) {
      this.setUint32(key, value);
      return;
    }
    this.setInt32(key, value);
  }
  setBytes(key, value) {
    this.set(
      key,
      new BinaryPrimitive(
        value,
        1 /* ARRAY */,
        8 /* BYTE */
      )
    );
  }
  setBool(key, value) {
    this.set(key, new BinaryPrimitive().setBool(value));
  }
  getBool(key) {
    const value = this.get(key);
    if (value === null) return false;
    if (value.componentType !== 9 /* BOOL */) return false;
    return value.getBool();
  }
  setKeyValueStore(key, value) {
    this.set(
      key,
      new BinaryPrimitive(
        value.toBinary(),
        1 /* ARRAY */,
        8 /* BYTE */
      ).setTag(TAG)
    );
  }
  get(key) {
    const row = this.getRow(key);
    if (!row) return null;
    return row.value;
  }
  getString(key) {
    const value = this.get(key);
    if (!value) return null;
    return value.getString();
  }
  getStringArray(key) {
    const value = this.get(key);
    if (!value) return [];
    if (value.tag !== STRING_ARRAY_TAG) return [];
    return stringArrayFromBinary(value);
  }
  getFloat32(key) {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getFloat32();
  }
  getUint32(key) {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getUint32();
  }
  getInt32(key) {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getInt32();
  }
  getNumber(key) {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getNumber();
  }
  getBytes(key) {
    const value = this.get(key);
    if (value === null) return null;
    return value.getBytes();
  }
  getKeyValueStore(key) {
    const value = this.get(key);
    if (value === null) return null;
    const bytes = value.getBytes();
    return _BinaryKeyValueStore.fromBinary(bytes);
  }
  toBinary() {
    const buff = new DynamicBuffer();
    buff.writeString(MAGIC);
    buff.writeUint32(this.rows.length);
    this.rows.forEach((row) => {
      buff.writeUint32(row.key.length);
      buff.writeString(row.key);
      buff.writeUint32(row.index);
      buff.writeBinaryPrimitive(row.value);
    });
    buff.seek(0);
    return buff.data;
  }
  static fromBinary(data) {
    const buff = new DynamicBuffer(new Uint8Array(data));
    const kv = new _BinaryKeyValueStore();
    buff.seek(0);
    const magic = buff.readString(MAGIC.length);
    if (magic !== MAGIC) {
      throw new Error(`Magic does not match "${MAGIC}"`);
    }
    const numRows = buff.readUint32();
    for (let i = 0; i < numRows; i++) {
      const keyLength = buff.readUint32();
      const key = buff.readString(keyLength);
      const index = buff.readUint32();
      const blob = buff.readBinaryPrimitive();
      if (!blob) break;
      const row = {
        key,
        index,
        value: blob
      };
      kv.rows.push(row);
      kv.key_to_index.set(key, row.index);
      kv.index = Math.max(kv.index, index);
    }
    return kv;
  }
  static fromBinarySafe(data) {
    try {
      return this.fromBinary(data);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  static fromJS(obj) {
    const kv = new _BinaryKeyValueStore();
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        if (isStringArray(value)) {
          kv.set(key, stringArrayToBinary(value));
          continue;
        }
      }
      switch (typeof value) {
        case "boolean":
          {
            kv.setBool(key, value);
            continue;
          }
          ;
        case "number": {
          if (isFloat(value)) {
            kv.setFloat32(key, value);
            continue;
          }
          if (isInt(value)) {
            if (isUint(value)) {
              kv.setUint32(key, value);
              continue;
            }
            kv.setInt32(key, value);
            continue;
          }
          console.warn(`Invalid number: ${key} = ${value}`);
          continue;
        }
        case "string": {
          kv.setString(key, value);
          continue;
        }
        case "object": {
          if (value instanceof Uint8Array) {
            kv.setBytes(key, value);
            continue;
          }
          if (value instanceof BinaryPrimitive) {
            kv.set(key, value);
            continue;
          }
          const keys = Object.keys(value);
          const isStrings = keys.filter((it) => typeof it === "string").length >= keys.length;
          if (isStrings) {
            kv.setKeyValueStore(key, this.fromJS(value));
            continue;
          }
        }
        default: {
          console.warn(
            `Unsupported type: "${typeof value}", ${key} = ${value}`
          );
          continue;
        }
      }
    }
    return kv;
  }
  toJS() {
    const data = {};
    for (const row of this.rows) {
      if (row.value.type === 1 /* ARRAY */) {
        switch (row.value.componentType) {
          case 7 /* CHAR */:
            {
              data[row.key] = row.value.getString();
            }
            break;
          case 8 /* BYTE */:
            {
              if (row.value.tag === TAG) {
                const bytes = row.value.getBytes();
                const store = _BinaryKeyValueStore.fromBinarySafe(bytes);
                if (store) {
                  data[row.key] = store.toJS();
                }
              } else if (row.value.tag === STRING_ARRAY_TAG) {
                data[row.key] = stringArrayFromBinary(row.value);
              } else {
                data[row.key] = row.value.getBytes();
              }
            }
            break;
          case 5 /* FLOAT32 */:
          case 3 /* UINT32 */:
          case 1 /* INT32 */:
            {
              data[row.key] = row.value.getArray().map((it) => it.getNumber());
            }
            break;
        }
        continue;
      }
      switch (row.value.componentType) {
        case 9 /* BOOL */:
          {
            data[row.key] = row.value.getBool();
            continue;
          }
          ;
        case 1 /* INT32 */:
        case 5 /* FLOAT32 */:
        case 3 /* UINT32 */: {
          data[row.key] = row.value.getNumber();
          continue;
        }
        case 7 /* CHAR */: {
          data[row.key] = row.value.getChar();
          continue;
        }
        default: {
          console.warn(`Unsupported type: "${row.value.type}", ${row.key}`);
        }
      }
    }
    return data;
  }
};

// src/binaryKVStore.test.ts
var import_node_assert = __toESM(require("node:assert"));
var import_fs = __toESM(require("fs"));
(0, import_node_test.describe)("To binary and back", () => {
  const kv = new BinaryKeyValueStore();
  kv.setString("firstname", "john");
  kv.setString("lastname", "doe");
  kv.setFloat32("weight", 10.3);
  kv.setUint32("age", 47);
  import_node_assert.default.strictEqual(kv.getString("firstname"), "john");
  import_node_assert.default.strictEqual(kv.getString("lastname"), "doe");
  import_node_assert.default.strictEqual(Math.abs(kv.getFloat32("weight") - 10.3) <= 1e-5, true);
  import_node_assert.default.strictEqual(kv.getUint32("age"), 47);
  const binary = kv.toBinary();
  import_node_assert.default.strictEqual(binary instanceof Uint8Array, true);
  const decoded = BinaryKeyValueStore.fromBinary(binary);
  import_node_assert.default.strictEqual(decoded instanceof BinaryKeyValueStore, true);
  import_node_assert.default.strictEqual(decoded.getString("firstname"), "john");
  import_node_assert.default.strictEqual(decoded.getString("lastname"), "doe");
  import_node_assert.default.strictEqual(
    Math.abs(decoded.getFloat32("weight") - 10.3) <= 1e-5,
    true
  );
  import_node_assert.default.strictEqual(decoded.getUint32("age"), 47);
});
(0, import_node_test.describe)("From JS and back", () => {
  const imgPixels = [
    119,
    34,
    227,
    54,
    225,
    131,
    160,
    104,
    103,
    241,
    9,
    11,
    157,
    114,
    101,
    34,
    179,
    162,
    242,
    179,
    25,
    196,
    120,
    135,
    13,
    235,
    20,
    117,
    204,
    246,
    43,
    187,
    126,
    69,
    154,
    214,
    57,
    71,
    119,
    22,
    173,
    119,
    23,
    67,
    235,
    83,
    153,
    73,
    54,
    33,
    85,
    181,
    45,
    242,
    108,
    249,
    207,
    95,
    13,
    50,
    143,
    216,
    122,
    238,
    217,
    119,
    130,
    90,
    255,
    160,
    225,
    96,
    195,
    130,
    157,
    116,
    1,
    4,
    218,
    76,
    195,
    246,
    145,
    241,
    113,
    123,
    218,
    147,
    28,
    8,
    40,
    155,
    101,
    130,
    96,
    33,
    254,
    126,
    87,
    70,
    179,
    133,
    89,
    91,
    212,
    2,
    227,
    15,
    131,
    10,
    140,
    85,
    42,
    162,
    84,
    181,
    80,
    165,
    126,
    53,
    211,
    110,
    84,
    101,
    194,
    25,
    129,
    118,
    182,
    188,
    227,
    123,
    116,
    60,
    128,
    94,
    163,
    144,
    255,
    229,
    144,
    110,
    254,
    8,
    59,
    63,
    103,
    120,
    52,
    38,
    235,
    11,
    100,
    138,
    28,
    239,
    5,
    169,
    188,
    34,
    153,
    136,
    106,
    54,
    216,
    173,
    233,
    21,
    206,
    249,
    105,
    50,
    101,
    51,
    178,
    154,
    182,
    100,
    126,
    9,
    15,
    220,
    248,
    207,
    136,
    92,
    85,
    255,
    78,
    207,
    207,
    102,
    71,
    66,
    0,
    101,
    200,
    109,
    167,
    60,
    54,
    153,
    12,
    78,
    167,
    114,
    20,
    230,
    216,
    236,
    117,
    42,
    158,
    147,
    221,
    113,
    47,
    145,
    26,
    6,
    189,
    147,
    47,
    92,
    201,
    199,
    179,
    125,
    8,
    217,
    165,
    175,
    205,
    249,
    48,
    127,
    204,
    87,
    113,
    72,
    168,
    190,
    131,
    132,
    137,
    127,
    105,
    178,
    11,
    217,
    99,
    156,
    72,
    201,
    167,
    68
  ];
  const imageData = new Uint8Array(imgPixels);
  const kv = BinaryKeyValueStore.fromJS({
    firstname: "john",
    lastname: "doe",
    weight: 10.3,
    age: 47,
    image: imageData,
    state: {
      count: 10
    },
    colors: ["red", "green", "blue"],
    isAdmin: true,
    isKing: false
  });
  import_node_assert.default.strictEqual(kv.getString("firstname"), "john");
  import_node_assert.default.strictEqual(kv.getString("lastname"), "doe");
  import_node_assert.default.strictEqual(Math.abs(kv.getFloat32("weight") - 10.3) <= 1e-5, true);
  import_node_assert.default.strictEqual(kv.getUint32("age"), 47);
  import_node_assert.default.strictEqual(kv.getBytes("image") instanceof Uint8Array, true);
  import_node_assert.default.strictEqual(kv.getBytes("image")?.length, imageData.length);
  const colors = kv.getStringArray("colors");
  import_node_assert.default.strictEqual(Array.isArray(colors), true);
  import_node_assert.default.strictEqual(colors.length, 3);
  import_node_assert.default.strictEqual(colors[0], "red");
  import_node_assert.default.strictEqual(colors[1], "green");
  import_node_assert.default.strictEqual(colors[2], "blue");
  import_node_assert.default.strictEqual(kv.getBool("isAdmin"), true);
  import_node_assert.default.strictEqual(kv.getBool("isKing"), false);
  const data = kv.toJS();
  console.log(JSON.stringify(data, void 0, 2));
  import_node_assert.default.strictEqual(data["firstname"], "john");
  import_node_assert.default.strictEqual(data["lastname"], "doe");
  import_node_assert.default.strictEqual(Math.abs(Number(data["weight"]) - 10.3) <= 1e-5, true);
  import_node_assert.default.strictEqual(data["age"], 47);
  import_node_assert.default.strictEqual(data["image"] instanceof Uint8Array, true);
  import_node_assert.default.strictEqual(data["image"].length, imageData.length);
  import_node_assert.default.strictEqual(typeof data["state"], "object");
  import_node_assert.default.strictEqual(typeof data["state"]["count"], "number");
  import_node_assert.default.strictEqual(data["state"]["count"], 10);
  import_node_assert.default.strictEqual(data["isAdmin"], true);
  import_node_assert.default.strictEqual(data["isKing"], false);
});
(0, import_node_test.describe)("To a file and back", () => {
  const kv = BinaryKeyValueStore.fromJS({
    firstname: "john",
    lastname: "doe",
    age: 5018
  });
  const binary = kv.toBinary();
  const filepath = "/tmp/kv.bin";
  import_fs.default.writeFileSync(filepath, binary);
  const fileContents = import_fs.default.readFileSync(filepath);
  const back = BinaryKeyValueStore.fromBinary(fileContents);
  console.log(back.getNumber("age"));
});

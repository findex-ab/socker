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

// src/binaryKVStore.ts
var binaryKVStore_exports = {};
__export(binaryKVStore_exports, {
  BinaryKeyValueStore: () => BinaryKeyValueStore
});
module.exports = __toCommonJS(binaryKVStore_exports);

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
    this.data = new Uint8Array(Array.from(value).map((c) => c.charCodeAt(0)));
    this.size = this.data.length;
    return this;
  }
  getString() {
    return this.getRawBytes().map((code) => String.fromCharCode(Number(code))).join("");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BinaryKeyValueStore
});

import { BinaryPrimitive, EBinaryPrimitiveComponentType, EBinaryPrimitiveType } from "./binaryPrimitive";
import { DynamicBuffer } from "./dynamicBuffer";
import { isFloat, isInt, isUint } from "./is";

export type BinaryKeyValueStoreValue = BinaryPrimitive;

const MAGIC = "BinaryKeyValueStore";

export type BinaryKeyValueStoreRow = {
  key: string;
  value: BinaryKeyValueStoreValue;
  index: number;
};

export class BinaryKeyValueStore {
  index: number = 0;
  key_to_index: Map<string, number> = new Map();
  rows: Array<BinaryKeyValueStoreRow> = [];

  getRow(key: string): BinaryKeyValueStoreRow | null {
    const idx = this.key_to_index.get(key);
    if (typeof idx !== "number") return null;
    if (idx < 0 || idx >= this.rows.length) return null;
    return this.rows[idx];
  }

  set(key: string, value: BinaryKeyValueStoreValue) {
    const row = this.getRow(key);
    if (row) {
      row.value = value;
      return;
    }

    const newRow: BinaryKeyValueStoreRow = {
      key: key,
      value: value,
      index: this.index,
    };
    this.key_to_index.set(key, this.index);
    this.rows.push(newRow);

    this.index += 1;
  }

  setString(key: string, value: string) {
    this.set(key, new BinaryPrimitive().setString(value));
  }

  setFloat32(key: string, value: number) {
    this.set(key, new BinaryPrimitive().setFloat32(value));
  }

  setUint32(key: string, value: number) {
    this.set(key, new BinaryPrimitive().setUint32(value));
  }

  setInt32(key: string, value: number) {
    this.set(key, new BinaryPrimitive().setInt32(value));
  }

  setNumber(key: string, value: number) {
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

  setBytes(key: string, value: Uint8Array) {
    this.set(key, new BinaryPrimitive(value, EBinaryPrimitiveType.ARRAY, EBinaryPrimitiveComponentType.BYTE));
  }

  get(key: string): BinaryKeyValueStoreValue | null {
    const row = this.getRow(key);
    if (!row) return null;
    return row.value;
  }

  getString(key: string): string | null {
    const value = this.get(key);
    if (!value) return null;
    return value.getString();
  }

  getFloat32(key: string): number {
    const value = this.get(key);
    if (value === null) return 0.0;
    return value.getFloat32();
  }

  getUint32(key: string): number {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getUint32();
  }

  getInt32(key: string): number {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getInt32();
  }

  getNumber(key: string): number {
    const value = this.get(key);
    if (value === null) return 0;
    return value.getNumber();
  }

  getBytes(key: string): Uint8Array | null {
    const value = this.get(key);
    if (value === null) return null;
    return value.getBytes();
  }

  toBinary(): Uint8Array {
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

  static fromBinary(data: ArrayBufferLike): BinaryKeyValueStore {
    const buff = new DynamicBuffer(data);
    const kv = new BinaryKeyValueStore();

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
      const row: BinaryKeyValueStoreRow = {
        key: key,
        index: index,
        value: blob,
      };
      kv.rows.push(row);
      kv.key_to_index.set(key, row.index);
      kv.index = Math.max(kv.index, index);
    }

    return kv;
  }
  static fromBinarySafe(data: ArrayBufferLike): BinaryKeyValueStore | null {
    try {
      return this.fromBinary(data);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  static fromJS(obj: Record<string, any>) {
    const kv = new BinaryKeyValueStore();

    for (const [key, value] of Object.entries(obj)) {
      switch (typeof value) {
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
        };
        case 'object': {
          if (value instanceof Uint8Array) {
            kv.setBytes(key, value);
            continue;
          }
          if (value instanceof BinaryPrimitive) {
            kv.set(key, value);
            continue;
          }
        };
        default: {
          console.warn(
            `Unsupported type: "${typeof value}", ${key} = ${value}`,
          );
          continue;
        }
      }
    }

    return kv;
  }
  toJS(): Record<string, any> {
    const data: Record<string, any> = {};

    for (const row of this.rows) {

      if (row.value.type === EBinaryPrimitiveType.ARRAY) {
        switch(row.value.componentType) {
          case EBinaryPrimitiveComponentType.CHAR: {
            data[row.key] = row.value.getString();
          } break;
          case EBinaryPrimitiveComponentType.BYTE: {
            data[row.key] = row.value.getBytes();
          }; break;
          case EBinaryPrimitiveComponentType.FLOAT32:
          case EBinaryPrimitiveComponentType.UINT32:
          case EBinaryPrimitiveComponentType.INT32: {
            data[row.key] = row.value.getArray().map(it => it.getNumber());
          } break;
        }
        continue;
      }
      
      switch (row.value.componentType) {
        case EBinaryPrimitiveComponentType.INT32:
        case EBinaryPrimitiveComponentType.FLOAT32:
        case EBinaryPrimitiveComponentType.UINT32: {
          data[row.key] = row.value.getNumber();
          continue;
        };
        case EBinaryPrimitiveComponentType.CHAR: {
          data[row.key] = row.value.getChar();
          continue;
        };
        default: {
          console.warn(`Unsupported type: "${row.value.type}", ${row.key}`);
        };
      }
    }

    return data;
  }
}

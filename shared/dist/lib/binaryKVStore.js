import { BinaryPrimitive, EBinaryPrimitiveComponentType, EBinaryPrimitiveType, } from "./binaryPrimitive";
import { DynamicBuffer } from "./dynamicBuffer";
import { isFloat, isInt, isStringArray, isUint } from "./is";
const MAGIC = "BinaryKeyValueStore";
const TAG = 0x5184;
const STRING_TAG = 0x5591;
const STRING_ARRAY_TAG = 0x5593;
const stringArrayFromBinary = (data) => {
    const buff = new DynamicBuffer(data.data);
    const numStrings = buff.readUint32();
    const strings = [];
    for (let i = 0; i < numStrings; i++) {
        const strLen = buff.readUint32();
        if (strLen <= 0)
            continue;
        const strContent = buff.readString(strLen);
        strings.push(strContent);
    }
    return strings;
};
const stringArrayToBinary = (arr) => {
    const strings = arr.map((val) => {
        const lengthPrim = new BinaryPrimitive().setUint32(val.length);
        const contentPrim = new BinaryPrimitive().setString(val);
        const buff = new DynamicBuffer();
        buff.write(lengthPrim.data);
        buff.write(contentPrim.data);
        return new BinaryPrimitive()
            .setBytes(buff.data)
            .setTag(STRING_TAG)
            .setType(EBinaryPrimitiveType.ARRAY)
            .setComponentType(EBinaryPrimitiveComponentType.BYTE).data;
    });
    const buff = new DynamicBuffer();
    buff.writeUint32(strings.length);
    for (const str of strings) {
        buff.write(str);
    }
    const prim = new BinaryPrimitive()
        .setTag(STRING_ARRAY_TAG)
        .setBytes(buff.data)
        .setType(EBinaryPrimitiveType.ARRAY)
        .setComponentType(EBinaryPrimitiveComponentType.BYTE);
    return prim;
};
export class BinaryKeyValueStore {
    index = 0;
    key_to_index = new Map();
    rows = [];
    getRow(key) {
        const idx = this.key_to_index.get(key);
        if (typeof idx !== "number")
            return null;
        if (idx < 0 || idx >= this.rows.length)
            return null;
        return this.rows[idx];
    }
    set(key, value) {
        const row = this.getRow(key);
        if (row) {
            row.value = value;
            return;
        }
        const newRow = {
            key: key,
            value: value,
            index: this.index,
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
        this.set(key, new BinaryPrimitive(value, EBinaryPrimitiveType.ARRAY, EBinaryPrimitiveComponentType.BYTE));
    }
    setBool(key, value) {
        this.set(key, new BinaryPrimitive().setBool(value));
    }
    getBool(key) {
        const value = this.get(key);
        if (value === null)
            return false;
        if (value.componentType !== EBinaryPrimitiveComponentType.BOOL)
            return false;
        return value.getBool();
    }
    setKeyValueStore(key, value) {
        this.set(key, new BinaryPrimitive(value.toBinary(), EBinaryPrimitiveType.ARRAY, EBinaryPrimitiveComponentType.BYTE).setTag(TAG));
    }
    get(key) {
        const row = this.getRow(key);
        if (!row)
            return null;
        return row.value;
    }
    getString(key) {
        const value = this.get(key);
        if (!value)
            return null;
        return value.getString();
    }
    getStringArray(key) {
        const value = this.get(key);
        if (!value)
            return [];
        if (value.tag !== STRING_ARRAY_TAG)
            return [];
        return stringArrayFromBinary(value);
    }
    getFloat32(key) {
        const value = this.get(key);
        if (value === null)
            return 0.0;
        return value.getFloat32();
    }
    getUint32(key) {
        const value = this.get(key);
        if (value === null)
            return 0;
        return value.getUint32();
    }
    getInt32(key) {
        const value = this.get(key);
        if (value === null)
            return 0;
        return value.getInt32();
    }
    getNumber(key) {
        const value = this.get(key);
        if (value === null)
            return 0;
        return value.getNumber();
    }
    getBytes(key) {
        const value = this.get(key);
        if (value === null)
            return null;
        return value.getBytes();
    }
    getKeyValueStore(key) {
        const value = this.get(key);
        if (value === null)
            return null;
        const bytes = value.getBytes();
        return BinaryKeyValueStore.fromBinary(bytes);
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
            if (!blob)
                break;
            const row = {
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
    static fromBinarySafe(data) {
        try {
            return this.fromBinary(data);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    static fromJS(obj) {
        const kv = new BinaryKeyValueStore();
        for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {
                if (isStringArray(value)) {
                    kv.set(key, stringArrayToBinary(value));
                    continue;
                }
            }
            switch (typeof value) {
                case 'boolean':
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
                    console.warn(`Unsupported type: "${typeof value}", ${key} = ${value}`);
                    continue;
                }
            }
        }
        return kv;
    }
    toJS() {
        const data = {};
        for (const row of this.rows) {
            /*
              const strings = value.map((val: string) => {
                  const lengthPrim = (new BinaryPrimitive()).setUint32(val.length);
                  const contentPrim = (new BinaryPrimitive()).setString(val);
                  const buff = new DynamicBuffer();
                  buff.write(lengthPrim.data);
                  buff.write(contentPrim.data);
                  return ((new BinaryPrimitive()).setBytes(buff.data).setTag(STRING_TAG).setType(EBinaryPrimitiveType.ARRAY).setComponentType(EBinaryPrimitiveComponentType.BYTE)).data;
                });
      
                const buff = new DynamicBuffer();
                buff.writeUint32(strings.length);
                for (const str of strings) {
                  buff.write(str);
                }
      
                const prim = (new BinaryPrimitive()).setTag(STRING_ARRAY_TAG).setBytes(buff.data).setType(EBinaryPrimitiveType.ARRAY).setComponentType(EBinaryPrimitiveComponentType.BYTE);
                kv.set(key, prim);
             */
            if (row.value.type === EBinaryPrimitiveType.ARRAY) {
                switch (row.value.componentType) {
                    case EBinaryPrimitiveComponentType.CHAR:
                        {
                            data[row.key] = row.value.getString();
                        }
                        break;
                    case EBinaryPrimitiveComponentType.BYTE:
                        {
                            if (row.value.tag === TAG) {
                                const bytes = row.value.getBytes();
                                const store = BinaryKeyValueStore.fromBinarySafe(bytes);
                                if (store) {
                                    data[row.key] = store.toJS();
                                }
                            }
                            else if (row.value.tag === STRING_ARRAY_TAG) {
                                data[row.key] = stringArrayFromBinary(row.value);
                            }
                            else {
                                data[row.key] = row.value.getBytes();
                            }
                        }
                        break;
                    case EBinaryPrimitiveComponentType.FLOAT32:
                    case EBinaryPrimitiveComponentType.UINT32:
                    case EBinaryPrimitiveComponentType.INT32:
                        {
                            data[row.key] = row.value.getArray().map((it) => it.getNumber());
                        }
                        break;
                }
                continue;
            }
            switch (row.value.componentType) {
                case EBinaryPrimitiveComponentType.BOOL:
                    {
                        data[row.key] = row.value.getBool();
                        continue;
                    }
                    ;
                case EBinaryPrimitiveComponentType.INT32:
                case EBinaryPrimitiveComponentType.FLOAT32:
                case EBinaryPrimitiveComponentType.UINT32: {
                    data[row.key] = row.value.getNumber();
                    continue;
                }
                case EBinaryPrimitiveComponentType.CHAR: {
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
}

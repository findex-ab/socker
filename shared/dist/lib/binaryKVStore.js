import { binaryBlobToFloat32, binaryBlobToInt32, binaryBlobToString, binaryBlobToUint32, binaryFloat32Blob, binaryInt32Blob, binaryStringBlob, binaryUint32Blob } from "./blob";
import { DynamicBuffer } from "./dynamicBuffer";
const MAGIC = 'BinaryKeyValueStore';
export class BinaryKeyValueStore {
    index = 0;
    key_to_index = new Map();
    rows = [];
    getRow(key) {
        const idx = this.key_to_index.get(key);
        if (typeof idx !== 'number')
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
            index: this.index
        };
        this.key_to_index.set(key, this.index);
        this.rows.push(newRow);
        this.index += 1;
    }
    setString(key, value) {
        this.set(key, binaryStringBlob(value));
    }
    setFloat32(key, value) {
        this.set(key, binaryFloat32Blob(value));
    }
    setUint32(key, value) {
        this.set(key, binaryUint32Blob(value));
    }
    setInt32(key, value) {
        this.set(key, binaryInt32Blob(value));
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
        return binaryBlobToString(value);
    }
    getFloat32(key) {
        const value = this.get(key);
        if (value === null)
            return 0.0;
        return binaryBlobToFloat32(value);
    }
    getUint32(key) {
        const value = this.get(key);
        if (value === null)
            return 0.0;
        return binaryBlobToUint32(value);
    }
    getInt32(key) {
        const value = this.get(key);
        if (value === null)
            return 0.0;
        return binaryBlobToInt32(value);
    }
    toBinary() {
        const buff = new DynamicBuffer();
        buff.writeString(MAGIC);
        buff.writeUint32(this.rows.length);
        this.rows.forEach((row) => {
            buff.writeUint32(row.key.length);
            buff.writeString(row.key);
            buff.writeUint32(row.index);
            buff.writeBinaryBlob(row.value);
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
            const blob = buff.readBinaryBlob();
            if (!blob)
                break;
            const row = {
                key: key,
                index: index,
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
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
}

//const range = (n: number): Array<number> => Array.from(Array(n).keys())
import { int32ToByteArray, uint32ToByteArray } from "./binary";
export class DynamicBuffer {
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
        }
        else if (pos < 0) {
            this.cursor = this.data.length - 1;
        }
        else {
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
        return new DataView(Buffer.from(this.data.slice(this.cursor)).buffer);
    }
    load(buffer) {
        if (typeof buffer === 'string') {
            this.data = Uint8Array.from(Array.from(buffer).map(letter => letter.charCodeAt(0)));
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
        const buff = Buffer.from(bytes);
        return buff.readUint32BE();
    }
    readInt32() {
        const bytes = this.readBytes(4);
        const buff = Buffer.from(bytes);
        return buff.readInt32BE();
    }
    readFloat32() {
        const bytes = this.readBytes(4);
        const buff = Buffer.from(bytes);
        return buff.readFloatBE();
    }
    readFloat64() {
        const bytes = this.readBytes(8);
        const buff = Buffer.from(bytes);
        return buff.readDoubleBE();
    }
    readString(length) {
        return this.readBytes(length).map(code => String.fromCharCode(Number(code))).join('');
    }
    readBinaryBlob() {
        const blobType = this.readUint32();
        const size = this.readUint32();
        if (size <= 0)
            return null;
        const data = this.read(size);
        return {
            type: blobType,
            size: size,
            data: data
        };
    }
    toString() {
        return this.withCursor(0, () => {
            return this.readString(this.data.length);
        });
    }
    write(data) {
        const buffer = new Uint8Array(data);
        if (buffer.length <= 0)
            return;
        this.grow(buffer.length);
        this.data.set(buffer, this.cursor);
        this.cursor += buffer.length;
        this.clampCursor();
    }
    writeString(text) {
        this.write(Uint8Array.from(Array.from(text).map(letter => letter.charCodeAt(0))));
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
}

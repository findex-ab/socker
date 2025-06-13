//const range = (n: number): Array<number> => Array.from(Array(n).keys())

import { int32ToByteArray, packNumber, uint32ToByteArray, unpackUint32 } from "./binary";
import { BinaryBlob, EBinaryBlob } from "./blob";

export class DynamicBuffer {
  data: Uint8Array = new Uint8Array(0)
  cursor: number = 0;

  constructor(buffer?: ArrayBufferLike | string) {
    if (buffer) {
      this.load(buffer);
    }
  }

  clampCursor() {
    this.cursor = Math.max(0, Math.min(this.cursor, this.data.length));
  }

  seek(pos: number) {
    if (pos === 0) {
      this.cursor = pos;
    } else if (pos < 0) {
      this.cursor = this.data.length - 1;
    } else {
      this.cursor = pos;
    }

    this.clampCursor();
  }

  withCursor<T = any>(cursor: number, fn: () => T): T {
    const oldCursor = this.cursor;
    this.cursor = cursor;
    const ret = fn();
    this.cursor = oldCursor;
    return ret;
  }

  getView(): DataView {
    return new DataView(Buffer.from(this.data.slice(this.cursor)).buffer)
  }

  load(buffer: ArrayBufferLike | string) {
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

  realloc(newSize: number) {
    const data = new Uint8Array(newSize);
    if (data.length >= this.data.length) {
      data.set(this.data, 0);
    }
    this.data = data;
  }

  grow(extraSize: number) {
    this.realloc(this.data.length + extraSize);
  }

  read(size: number): Uint8Array {
    const chunk = this.data.slice(this.cursor, this.cursor + size);
    this.cursor += chunk.length;
    return chunk;
  }

  readBytes(size: number): number[] {
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

  readString(length: number) {
    return this.readBytes(length).map(code => String.fromCharCode(Number(code))).join('')
  }

  readBinaryBlob(): BinaryBlob | null {
    const blobType = this.readUint32() as EBinaryBlob;
    const size = this.readUint32();
    if (size <= 0) return null;
    const data  = this.read(size);

    return {
      type: blobType,
      size: size,
      data: data
    }
  }

  toString() {
    return this.withCursor(0, () => {
      return this.readString(this.data.length);
    }); 
  }


  write(data: ArrayBufferLike | Array<number>) {
    const buffer = new Uint8Array(data);
    if (buffer.length <= 0) return;
    this.grow(buffer.length);
    this.data.set(buffer, this.cursor);
    this.cursor += buffer.length;
    this.clampCursor();
  }

  writeString(text: string) {
    this.write(Uint8Array.from(Array.from(text).map(letter => letter.charCodeAt(0))));
  }

  writeUint32(x: number) {
    this.write(uint32ToByteArray(x));
  }

  writeInt32(x: number) {
    this.write(int32ToByteArray(x));
  }

  writeFloat32(x: number) {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer);
    view.setFloat32(0, x);
    this.write(buffer);
  }

  writeFloat64(x: number) {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer);
    view.setFloat64(0, x);
    this.write(buffer);
  }

  writeBinaryBlob(blob: BinaryBlob) {
    this.writeUint32(blob.type);
    this.writeUint32(blob.size);
    this.write(blob.data);
  }
}

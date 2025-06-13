import { describe } from "node:test";
import { DynamicBuffer } from "./dynamicBuffer";
import assert from "node:assert";
describe('Dynamic buffer', () => {
    const buff = new DynamicBuffer();
    buff.writeString('hello');
    assert.strictEqual(buff.cursor, 5);
    buff.writeUint32(123);
    assert.strictEqual(buff.cursor, 9);
    buff.seek(0);
    assert.strictEqual(buff.cursor, 0);
    const msg = buff.readString(5);
    assert.strictEqual(msg, "hello");
    const num = buff.readUint32();
    assert.strictEqual(num, 123);
});

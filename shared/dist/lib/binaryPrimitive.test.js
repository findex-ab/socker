import { describe } from "node:test";
import { BinaryPrimitive } from "./binaryPrimitive";
import assert from "node:assert";
describe('Store and retreive arrays', () => {
    const prim = new BinaryPrimitive();
    prim.setArray([5, 7, 3, 9].map(it => new BinaryPrimitive().setNumber(it)));
    assert.strictEqual(prim.size, 4 * 4);
    assert.strictEqual(prim.getComponentSize(), 4);
    const arr = prim.getArray();
    assert.strictEqual(arr.length, 4);
    const values = arr.map(it => it.getNumber());
    assert.strictEqual(values[0], 5);
    assert.strictEqual(values[1], 7);
    assert.strictEqual(values[2], 3);
    assert.strictEqual(values[3], 9);
});

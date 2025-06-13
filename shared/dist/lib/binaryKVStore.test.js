import { describe } from "node:test";
import { BinaryKeyValueStore } from "./binaryKVStore";
import assert from "node:assert";
describe('To binary and back', () => {
    const kv = new BinaryKeyValueStore();
    kv.setString('firstname', 'john');
    kv.setString('lastname', 'doe');
    kv.setFloat32('weight', 10.3);
    kv.setUint32('age', 47);
    assert.strictEqual(kv.getString('firstname'), 'john');
    assert.strictEqual(kv.getString('lastname'), 'doe');
    assert.strictEqual(Math.abs(kv.getFloat32('weight') - 10.3) <= 0.00001, true);
    assert.strictEqual(kv.getUint32('age'), 47);
    const binary = kv.toBinary();
    assert.strictEqual(binary instanceof Uint8Array, true);
    const decoded = BinaryKeyValueStore.fromBinary(binary);
    assert.strictEqual(decoded instanceof BinaryKeyValueStore, true);
    assert.strictEqual(decoded.getString('firstname'), 'john');
    assert.strictEqual(decoded.getString('lastname'), 'doe');
    assert.strictEqual(Math.abs(decoded.getFloat32('weight') - 10.3) <= 0.00001, true);
    assert.strictEqual(decoded.getUint32('age'), 47);
});
describe('From JS and back', () => {
    const imgPixels = [119, 34, 227, 54, 225, 131, 160, 104, 103, 241, 9, 11, 157, 114, 101, 34, 179, 162, 242, 179, 25, 196, 120, 135, 13, 235, 20, 117, 204, 246, 43, 187, 126, 69, 154, 214, 57, 71, 119, 22, 173, 119, 23, 67, 235, 83, 153, 73, 54, 33, 85, 181, 45, 242, 108, 249, 207, 95, 13, 50, 143, 216, 122, 238, 217, 119, 130, 90, 255, 160, 225, 96, 195, 130, 157, 116, 1, 4, 218, 76, 195, 246, 145, 241, 113, 123, 218, 147, 28, 8, 40, 155, 101, 130, 96, 33, 254, 126, 87, 70, 179, 133, 89, 91, 212, 2, 227, 15, 131, 10, 140, 85, 42, 162, 84, 181, 80, 165, 126,
        53, 211, 110, 84, 101, 194, 25, 129, 118, 182, 188, 227, 123, 116, 60, 128, 94, 163, 144, 255, 229, 144, 110, 254, 8, 59, 63, 103, 120, 52, 38, 235, 11, 100, 138, 28, 239, 5, 169, 188, 34, 153, 136, 106, 54, 216, 173, 233, 21, 206, 249, 105, 50, 101, 51, 178, 154, 182, 100, 126, 9, 15, 220, 248, 207, 136, 92, 85, 255, 78, 207, 207, 102, 71, 66, 0, 101, 200, 109, 167, 60, 54, 153, 12, 78, 167, 114, 20, 230, 216, 236, 117, 42, 158, 147, 221, 113, 47, 145, 26, 6, 189, 147, 47, 92, 201, 199, 179, 125, 8, 217, 165, 175, 205, 249, 48, 127, 204, 87, 113, 72, 168, 190, 131, 132, 137, 127, 105, 178, 11, 217, 99, 156, 72, 201, 167, 68];
    const imageData = new Uint8Array(imgPixels);
    const kv = BinaryKeyValueStore.fromJS({
        firstname: "john",
        lastname: "doe",
        weight: 10.3,
        age: 47,
        image: imageData
    });
    assert.strictEqual(kv.getString('firstname'), 'john');
    assert.strictEqual(kv.getString('lastname'), 'doe');
    assert.strictEqual(Math.abs(kv.getFloat32('weight') - 10.3) <= 0.00001, true);
    assert.strictEqual(kv.getUint32('age'), 47);
    assert.strictEqual(kv.getBytes('image') instanceof Uint8Array, true);
    assert.strictEqual(kv.getBytes('image')?.length, imageData.length);
    const data = kv.toJS();
    assert.strictEqual(data['firstname'], 'john');
    assert.strictEqual(data['lastname'], 'doe');
    assert.strictEqual(Math.abs(Number(data['weight']) - 10.3) <= 0.00001, true);
    assert.strictEqual(data['age'], 47);
    assert.strictEqual(data['image'] instanceof Uint8Array, true);
    assert.strictEqual(data['image'].length, imageData.length);
});

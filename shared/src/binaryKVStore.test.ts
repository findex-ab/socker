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
})

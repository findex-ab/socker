import { describe } from "node:test";
import { Transaction } from "./transaction";
import { BinaryPrimitive } from "socker/shared";
import assert from "node:assert";
describe('Transaction sanity test', () => {
    const trans = new Transaction({
        id: 'my_transaction'
    });
    const chunks = [];
    for (let i = 0; i < 10; i++) {
        const bin = (new BinaryPrimitive()).setString(`data_${i}`);
        chunks.push(bin.data);
    }
    trans.open();
    chunks.forEach((chunk, i) => {
        trans.write({
            chunkIndex: i,
            data: chunk
        });
    });
    trans.close();
    trans.open('r');
    const gen = trans.read();
    if (gen) {
        let i = 0;
        for (const item of gen) {
            assert.strictEqual(item.getNumber('chunkIndex'), i);
            assert.strictEqual(item.getBytes('data') !== null, true);
            assert.strictEqual(item.getBytes('data') instanceof Uint8Array, true);
            const data = item.getString('data');
            assert.strictEqual(data, `data_${i}`);
            i++;
        }
    }
    trans.close();
});

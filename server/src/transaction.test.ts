import { describe } from "node:test";
import { Transaction } from "./transaction";
import { BinaryPrimitive } from "#/shared/binaryPrimitive";
import assert from "node:assert";
import fs from "fs";

// /tmp/f4211f94-4dd7-5e4d-88c4-034a56fd250d.bin
describe("Stuff", () => {
  const trans = new Transaction({
    id: "my_transaction",
  });

  //trans.fd = fs.openSync("/tmp/f4211f94-4dd7-5e4d-88c4-034a56fd250d.bin", "r");

  trans.open("r", "/tmp/514b6f50-37f1-54ef-9034-f3a42d711c5e.bin");
  const gen = trans.read();
  if (gen) {
    let i: number = 0;
    for (const chunk of gen) {
      const chunkIndex = chunk.getNumber("chunkIndex");
      const data = chunk.getBytes("data");
      if (!data) {
        console.error("No data in chunk.");
        i++;
        continue;
      }
      console.log(`${i}: chunkIndex=${chunkIndex}`);
      i++;
    }
  }
  trans.close();
});

describe("Transaction sanity test", () => {
  const trans = new Transaction({
    id: "my_transaction",
  });

  const chunks: Array<Uint8Array> = [];

  for (let i = 0; i < 1024; i++) {
    const bin = new BinaryPrimitive().setString(`data_${i}`);
    chunks.push(bin.data);
  }

  trans.open();

  chunks.forEach((chunk, i) => {
    trans.write({
      chunkIndex: i,
      data: chunk,
    });
  });

  trans.close();

  trans.open("r");
  const gen = trans.read();
  if (gen) {
    let i: number = 0;
    for (const item of gen) {
      assert.strictEqual(item.getNumber("chunkIndex"), i);
      assert.strictEqual(item.getBytes("data") !== null, true);
      assert.strictEqual(item.getBytes("data") instanceof Uint8Array, true);
      const data = item.getString("data")!;
      assert.strictEqual(data, `data_${i}`);
      i++;
    }
  }
  trans.close();
});

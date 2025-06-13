import { describe } from "node:test";
import { merge } from "./objects";
import assert from "node:assert";

describe('Merge objects', () => {
  const obj = {
    firstname: 'john',
    lastname: 'doe',
    age: 47,
    pets: [
      {
        animal: 'dog',
        name: 'Boo',
        age: 2
      },
      {
        animal: 'cat',
        name: 'Foo',
        age: 7
      }
    ],
    address: {
      country: 'France',
      street: 'The way street 33'
    }
  };

  merge(obj, {
    weight: 10,
    address: {
      zip: 5312
    } 
  });

  assert.strictEqual(obj.firstname, 'john');
  assert.strictEqual(obj.lastname, 'doe');
  assert.strictEqual(obj.age, 47);
  assert.strictEqual((obj as any)['weight'], 10);
  assert.strictEqual(obj.pets.length, 2);
  
  assert.strictEqual(obj.pets[0].animal, 'dog');
  assert.strictEqual(obj.pets[0].name, 'Boo');
  assert.strictEqual(obj.pets[0].age, 2);

  assert.strictEqual(obj.pets[1].animal, 'cat');
  assert.strictEqual(obj.pets[1].name, 'Foo');
  assert.strictEqual(obj.pets[1].age, 7);

  assert.strictEqual(typeof obj.address, 'object');
  assert.strictEqual(obj.address.country, 'France');
  assert.strictEqual(obj.address.street, 'The way street 33');
  assert.strictEqual((obj as any).address.zip, 5312);


  merge(obj, {
    pets: [
      {
        animal: 'rabbit',
        name: 'Baz',
        age: 5
      }
    ]
  });

  assert.strictEqual(obj.pets.length, 1);
  assert.strictEqual(obj.pets[0].animal, 'rabbit');
  assert.strictEqual(obj.pets[0].name, 'Baz');
  assert.strictEqual(obj.pets[0].age, 5);
})

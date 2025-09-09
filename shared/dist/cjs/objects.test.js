"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/objects.test.ts
var import_node_test = require("node:test");

// src/objects.ts
function isObject(item) {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}
function merge(target, source) {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (Array.isArray(srcVal)) {
      if (Array.isArray(tgtVal)) {
        target[key] = srcVal;
      } else {
        target[key] = srcVal.slice();
      }
    } else if (isObject(srcVal)) {
      if (isObject(tgtVal)) {
        merge(tgtVal, srcVal);
      } else {
        target[key] = merge({}, srcVal);
      }
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

// src/objects.test.ts
var import_node_assert = __toESM(require("node:assert"));
(0, import_node_test.describe)("Merge objects", () => {
  const obj = {
    firstname: "john",
    lastname: "doe",
    age: 47,
    pets: [
      {
        animal: "dog",
        name: "Boo",
        age: 2
      },
      {
        animal: "cat",
        name: "Foo",
        age: 7
      }
    ],
    address: {
      country: "France",
      street: "The way street 33"
    }
  };
  merge(obj, {
    weight: 10,
    address: {
      zip: 5312
    }
  });
  import_node_assert.default.strictEqual(obj.firstname, "john");
  import_node_assert.default.strictEqual(obj.lastname, "doe");
  import_node_assert.default.strictEqual(obj.age, 47);
  import_node_assert.default.strictEqual(obj["weight"], 10);
  import_node_assert.default.strictEqual(obj.pets.length, 2);
  import_node_assert.default.strictEqual(obj.pets[0].animal, "dog");
  import_node_assert.default.strictEqual(obj.pets[0].name, "Boo");
  import_node_assert.default.strictEqual(obj.pets[0].age, 2);
  import_node_assert.default.strictEqual(obj.pets[1].animal, "cat");
  import_node_assert.default.strictEqual(obj.pets[1].name, "Foo");
  import_node_assert.default.strictEqual(obj.pets[1].age, 7);
  import_node_assert.default.strictEqual(typeof obj.address, "object");
  import_node_assert.default.strictEqual(obj.address.country, "France");
  import_node_assert.default.strictEqual(obj.address.street, "The way street 33");
  import_node_assert.default.strictEqual(obj.address.zip, 5312);
  merge(obj, {
    pets: [
      {
        animal: "rabbit",
        name: "Baz",
        age: 5
      }
    ]
  });
  import_node_assert.default.strictEqual(obj.pets.length, 1);
  import_node_assert.default.strictEqual(obj.pets[0].animal, "rabbit");
  import_node_assert.default.strictEqual(obj.pets[0].name, "Baz");
  import_node_assert.default.strictEqual(obj.pets[0].age, 5);
});

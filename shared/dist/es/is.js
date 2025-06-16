"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/is.ts
var is_exports = {};
__export(is_exports, {
  isFloat: () => isFloat,
  isInt: () => isInt,
  isStringArray: () => isStringArray,
  isUint: () => isUint
});
module.exports = __toCommonJS(is_exports);

// src/math.ts
var fract = (x) => x - Math.floor(x);

// src/is.ts
var isFloat = (x) => fract(x) > 0;
var isInt = (x) => !isFloat(x);
var isUint = (x) => isInt(x) && x >= 0;
var isStringArray = (arr) => {
  return arr.filter((it) => typeof it === "string").length >= arr.length;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isFloat,
  isInt,
  isStringArray,
  isUint
});

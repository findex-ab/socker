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

// src/objects.ts
var objects_exports = {};
__export(objects_exports, {
  merge: () => merge
});
module.exports = __toCommonJS(objects_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  merge
});

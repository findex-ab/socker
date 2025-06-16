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

// src/serverEvents.ts
var serverEvents_exports = {};
__export(serverEvents_exports, {
  EServerEvent: () => EServerEvent
});
module.exports = __toCommonJS(serverEvents_exports);
var EServerEvent = /* @__PURE__ */ ((EServerEvent2) => {
  EServerEvent2["CLIENT_CONNECTION"] = "CLIENT_CONNECTION";
  EServerEvent2["CLIENT_OPEN"] = "CLIENT_OPEN";
  EServerEvent2["CLIENT_CLOSE"] = "CLIENT_CLOSE";
  EServerEvent2["CLIENT_ERROR"] = "CLIENT_ERROR";
  EServerEvent2["CLIENT_MESSAGE"] = "CLIENT_MESSAGE";
  EServerEvent2["CLIENT_UPGRADE"] = "CLIENT_UPGRADE";
  EServerEvent2["RECEIVED_HEADERS"] = "RECEIVED_HEADERS";
  EServerEvent2["SERVER_ERROR"] = "SERVER_ERROR";
  return EServerEvent2;
})(EServerEvent || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EServerEvent
});

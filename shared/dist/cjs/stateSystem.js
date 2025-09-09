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

// src/stateSystem.ts
var stateSystem_exports = {};
__export(stateSystem_exports, {
  EStateSystemEvent: () => EStateSystemEvent,
  StateSystem: () => StateSystem
});
module.exports = __toCommonJS(stateSystem_exports);

// src/eventSystem.ts
var EventSystem = class {
  slots;
  globalListeners;
  constructor() {
    this.globalListeners = /* @__PURE__ */ new Set();
    this.slots = /* @__PURE__ */ new Map();
  }
  emit(event) {
    this.globalListeners.forEach((fn) => {
      fn(event);
    });
    const listeners = this.slots.get(event.eventType);
    if (listeners) {
      listeners.forEach((fn) => {
        fn(event);
      });
    }
  }
  subscribe(eventType, callback) {
    const listeners = this.slots.get(eventType);
    if (listeners) {
      listeners.add(callback);
    } else {
      const listeners2 = /* @__PURE__ */ new Set();
      listeners2.add(callback);
      this.slots.set(eventType, listeners2);
    }
    return () => {
      const listeners2 = this.slots.get(eventType);
      if (listeners2) {
        listeners2.delete(callback);
      }
    };
  }
  subscribeAll(callback) {
    this.globalListeners.add(callback);
    return () => {
      this.globalListeners.delete(callback);
    };
  }
  clearAllSubscribers() {
    this.slots.clear();
  }
};

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

// src/stateSystem.ts
var EStateSystemEvent = /* @__PURE__ */ ((EStateSystemEvent2) => {
  EStateSystemEvent2["STATE_CREATED"] = "STATE_CREATED";
  EStateSystemEvent2["STATE_SET"] = "STATE_SET";
  EStateSystemEvent2["STATE_DIFFERENT"] = "STATE_DIFFERENT";
  EStateSystemEvent2["STATE_MERGED"] = "STATE_MERGED";
  EStateSystemEvent2["STATE_DELETED"] = "STATE_DELETED";
  EStateSystemEvent2["STATE_USE"] = "STATE_USE";
  return EStateSystemEvent2;
})(EStateSystemEvent || {});
var StateSystem = class {
  states = /* @__PURE__ */ new Map();
  events = new EventSystem();
  deleteState(key) {
    if (!this.states.has(key)) return;
    this.states.delete(key);
    this.events.emit({
      eventType: "STATE_DELETED" /* STATE_DELETED */,
      key
    });
  }
  getState(key) {
    return this.states.get(key) || null;
  }
  getOrCreateState(key, defaultState) {
    const state = this.getState(key);
    if (state) return state;
    this.states.set(key, defaultState);
    const created = this.states.get(key);
    this.events.emit({
      eventType: "STATE_CREATED" /* STATE_CREATED */,
      key,
      state: created
    });
    return created;
  }
  setState(key, state) {
    this.states.set(key, state);
    this.events.emit({
      eventType: "STATE_SET" /* STATE_SET */,
      key,
      state: this.states.get(key)
    });
  }
  useState(key, defaultState) {
    let state = this.getOrCreateState(key, defaultState);
    this.events.emit({
      eventType: "STATE_USE" /* STATE_USE */,
      key,
      state
    });
    return [
      state,
      (fn) => {
        const nextState = fn(state);
        if (nextState !== state) {
          this.events.emit({
            eventType: "STATE_DIFFERENT" /* STATE_DIFFERENT */,
            key,
            previousState: state,
            nextState
          });
          this.setState(key, nextState);
        }
        merge(state, nextState);
        this.events.emit({
          eventType: "STATE_MERGED" /* STATE_MERGED */,
          key,
          state
        });
      }
    ];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EStateSystemEvent,
  StateSystem
});

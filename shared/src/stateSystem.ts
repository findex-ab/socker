import { EventSystem } from "./eventSystem";
import { merge } from "./objects";

export type BasicState = Record<PropertyKey, any>;

export enum EStateSystemEvent {
  STATE_CREATED = "STATE_CREATED",
  STATE_SET = "STATE_SET",
  STATE_DIFFERENT = "STATE_DIFFERENT",
  STATE_MERGED = "STATE_MERGED",
  STATE_DELETED = "STATE_DELETED",
  STATE_USE = "STATE_USE",
}

export type StateSystemEventMap = {
  [EStateSystemEvent.STATE_CREATED]: {
    eventType: EStateSystemEvent.STATE_CREATED;
    key: PropertyKey;
    state: BasicState;
  };
  [EStateSystemEvent.STATE_SET]: {
    eventType: EStateSystemEvent.STATE_SET;
    key: PropertyKey;
    state: BasicState;
  };
  [EStateSystemEvent.STATE_MERGED]: {
    eventType: EStateSystemEvent.STATE_MERGED;
    key: PropertyKey;
    state: BasicState;
  };
  [EStateSystemEvent.STATE_DIFFERENT]: {
    eventType: EStateSystemEvent.STATE_DIFFERENT;
    key: PropertyKey;
    previousState: BasicState;
    nextState: BasicState;
  };
  [EStateSystemEvent.STATE_DELETED]: {
    eventType: EStateSystemEvent.STATE_DELETED;
    key: PropertyKey;
  };
  [EStateSystemEvent.STATE_USE]: {
    eventType: EStateSystemEvent.STATE_USE;
    key: PropertyKey;
    state: BasicState;
  };
};

export type AnyStateSystemEvent = StateSystemEventMap[keyof StateSystemEventMap];

export class StateSystem {
  states: Map<PropertyKey, BasicState> = new Map();
  events: EventSystem<StateSystemEventMap> = new EventSystem();

  deleteState(key: PropertyKey) {
    if (!this.states.has(key)) return;
    this.states.delete(key);
    this.events.emit({
      eventType: EStateSystemEvent.STATE_DELETED,
      key: key,
    });
  }

  getState<T extends BasicState>(key: PropertyKey): T | null {
    return this.states.get(key) || null;
  }

  getOrCreateState<T extends BasicState>(key: PropertyKey, defaultState: T): T {
    const state = this.getState(key);
    if (state) return state;
    this.states.set(key, defaultState);
    const created = this.states.get(key)!;
    this.events.emit({
      eventType: EStateSystemEvent.STATE_CREATED,
      key: key,
      state: created,
    });
    return created;
  }

  setState<T extends BasicState>(key: PropertyKey, state: T) {
    this.states.set(key, state);
    this.events.emit({
      eventType: EStateSystemEvent.STATE_SET,
      key: key,
      state: this.states.get(key)!,
    });
  }

  useState<T extends BasicState>(
    key: PropertyKey,
    defaultState: T,
  ): [T, (fn: (old: T) => T) => void] {
    let state = this.getOrCreateState<T>(key, defaultState);

    this.events.emit({
      eventType: EStateSystemEvent.STATE_USE,
      key: key,
      state: state,
    });

    return [
      state,
      (fn: (old: T) => T) => {
        const nextState = fn(state);
        if (nextState !== state) {
          this.events.emit({
            eventType: EStateSystemEvent.STATE_DIFFERENT,
            key: key,
            previousState: state,
            nextState: nextState,
          });
          this.setState(key, nextState);
        }
        merge(state, nextState);
        this.events.emit({
          eventType: EStateSystemEvent.STATE_MERGED,
          key: key,
          state: state,
        });
      },
    ];
  }
}

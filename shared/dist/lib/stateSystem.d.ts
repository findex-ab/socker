import { EventSystem } from "./eventSystem";
export type BasicState = Record<PropertyKey, any>;
export declare enum EStateSystemEvent {
    STATE_CREATED = "STATE_CREATED",
    STATE_SET = "STATE_SET",
    STATE_DIFFERENT = "STATE_DIFFERENT",
    STATE_MERGED = "STATE_MERGED",
    STATE_DELETED = "STATE_DELETED",
    STATE_USE = "STATE_USE"
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
export declare class StateSystem {
    states: Map<PropertyKey, BasicState>;
    events: EventSystem<StateSystemEventMap>;
    deleteState(key: PropertyKey): void;
    getState<T extends BasicState>(key: PropertyKey): T | null;
    getOrCreateState<T extends BasicState>(key: PropertyKey, defaultState: T): T;
    setState<T extends BasicState>(key: PropertyKey, state: T): void;
    useState<T extends BasicState>(key: PropertyKey, defaultState: T): [T, (fn: (old: T) => T) => void];
}

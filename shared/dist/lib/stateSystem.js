import { EventSystem } from "./eventSystem";
import { merge } from "./objects";
export var EStateSystemEvent;
(function (EStateSystemEvent) {
    EStateSystemEvent["STATE_CREATED"] = "STATE_CREATED";
    EStateSystemEvent["STATE_SET"] = "STATE_SET";
    EStateSystemEvent["STATE_DIFFERENT"] = "STATE_DIFFERENT";
    EStateSystemEvent["STATE_MERGED"] = "STATE_MERGED";
    EStateSystemEvent["STATE_DELETED"] = "STATE_DELETED";
    EStateSystemEvent["STATE_USE"] = "STATE_USE";
})(EStateSystemEvent || (EStateSystemEvent = {}));
export class StateSystem {
    states = new Map();
    events = new EventSystem();
    deleteState(key) {
        if (!this.states.has(key))
            return;
        this.states.delete(key);
        this.events.emit({
            eventType: EStateSystemEvent.STATE_DELETED,
            key: key,
        });
    }
    getState(key) {
        return this.states.get(key) || null;
    }
    getOrCreateState(key, defaultState) {
        const state = this.getState(key);
        if (state)
            return state;
        this.states.set(key, defaultState);
        const created = this.states.get(key);
        this.events.emit({
            eventType: EStateSystemEvent.STATE_CREATED,
            key: key,
            state: created,
        });
        return created;
    }
    setState(key, state) {
        this.states.set(key, state);
        this.events.emit({
            eventType: EStateSystemEvent.STATE_SET,
            key: key,
            state: this.states.get(key),
        });
    }
    useState(key, defaultState) {
        let state = this.getOrCreateState(key, defaultState);
        this.events.emit({
            eventType: EStateSystemEvent.STATE_USE,
            key: key,
            state: state,
        });
        return [
            state,
            (fn) => {
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

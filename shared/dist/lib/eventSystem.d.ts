import { Dict } from "./dict";
export type EventSystemEvent<T extends Dict = Dict> = T & {
    eventType: PropertyKey;
};
export type EventSystemEventCallback<T> = (event: T) => any;
export type EventSystemGlobalEventCallback<EventMap extends Record<string, EventSystemEvent>> = <EvType extends keyof EventMap = keyof EventMap>(event: EventMap[EvType]) => any;
export declare class EventSystem<EventMap extends Record<string, EventSystemEvent>> {
    slots: Map<PropertyKey, Set<EventSystemEventCallback<EventMap[keyof EventMap]>>>;
    globalListeners: Set<EventSystemGlobalEventCallback<EventMap>>;
    constructor();
    emit<K extends keyof EventMap>(event: EventMap[K]): void;
    subscribe<K extends keyof EventMap>(eventType: K, callback: EventSystemEventCallback<EventMap[K]>): () => void;
    subscribeAll(callback: EventSystemGlobalEventCallback<EventMap>): () => void;
    clearAllSubscribers(): void;
}

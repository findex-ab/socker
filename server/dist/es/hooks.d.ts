import { BinaryKeyValueStore } from "socker/shared";
import { EServerEvent, ServerEventMap } from "./serverEvents";
export type ServerMessageEventHook<T = any> = {
    action: string;
    parse: (data: BinaryKeyValueStore) => T;
    callback: (data: T, event: ServerEventMap[EServerEvent.CLIENT_MESSAGE]) => any;
};

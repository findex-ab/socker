import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { SockerServer } from "./server";
import { EServerEvent, ServerEventMap } from "./serverEvents";
export type ServerMessageEventHook<T = any> = {
    action: string;
    parse: (data: BinaryKeyValueStore) => T;
    callback: (data: T, event: ServerEventMap[EServerEvent.CLIENT_MESSAGE], server: SockerServer) => any;
};

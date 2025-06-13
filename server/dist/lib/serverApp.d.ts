import { SocketClient } from "#/client/client";
import { BinaryKeyValueStore } from "socker/shared/binaryKVStore";
import { ServerMessageEventHook } from "./hooks";
import { SockerServer } from "./server";
import { AnyServerEvent } from "./serverEvents";
export interface IServerApp {
    name: string;
    init?: (server: SockerServer) => void | Promise<void>;
    cleanup?: () => void | Promise<void>;
    onEvent?: (event: AnyServerEvent, server: SockerServer) => any;
    onMessage?: (data: BinaryKeyValueStore, client: SocketClient, server: SockerServer) => any;
}
export type IServerAppMeta = {
    hooks: Map<string, Set<ServerMessageEventHook>>;
    connectedClients: Set<string>;
};

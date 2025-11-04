import { SocketClient } from "#/client/client";
import { ServerMessageEventHook } from "./hooks";
import { SockerServer } from "./server";
import { AnyServerEvent } from "./serverEvents";
export interface IServerApp {
    name: string;
    init?: (server: SockerServer) => void | Promise<void>;
    cleanup?: (client: SocketClient) => void | Promise<void>;
    onEvent?: (event: AnyServerEvent) => any;
}
export type IServerAppMeta = {
    hooks: Map<string, Set<ServerMessageEventHook>>;
    connectedClients: Set<string>;
};

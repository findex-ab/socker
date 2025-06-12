import { SockerServer } from "./server";
import { AnyServerEvent } from "./serverEvents";
export interface IServerApp {
    name: string;
    init: (server: SockerServer) => void | Promise<void>;
    cleanup?: () => void | Promise<void>;
    onEvent?: (event: AnyServerEvent, server: SockerServer) => any;
}

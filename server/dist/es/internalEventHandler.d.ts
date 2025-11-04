import { AnyStateSystemEvent } from "socker/shared";
import { type SockerServer } from "./server";
import { AnyServerEvent } from "./serverEvents";
export declare class InternalEventHandler {
    server: SockerServer;
    constructor(server: SockerServer);
    private handleClientMessageEvent;
    private handleClientCloseEvent;
    handleEvent(event: AnyServerEvent): Promise<void>;
    handleStateEvent(event: AnyStateSystemEvent): void;
}

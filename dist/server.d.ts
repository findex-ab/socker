import { WebSocketServer } from "ws";
import { EventSystem } from "./eventSystem";
import { ServerEventMap } from "./serverEvents";
import { IServerApp } from "./serverApp";
export type SockerServerConfig = {
    host: string;
    port: number;
    httpsCertificatePath?: string;
};
export declare class SockerServer {
    config: SockerServerConfig;
    socket: WebSocketServer | null;
    events: EventSystem<ServerEventMap>;
    apps: Map<string, IServerApp>;
    constructor(config: SockerServerConfig);
    use(app: IServerApp): void;
    getApp(name: string): IServerApp | null;
    private onAnyEvent;
    private initApps;
    private postStart;
    start(): import("ws").Server<typeof import("ws").default, typeof import("http").IncomingMessage>;
}

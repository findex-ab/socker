import { AnyServerEvent, SockerServer, type IServerApp } from '../../../server';
export declare class MyCounterApp implements IServerApp {
    name: string;
    init(server: SockerServer): void;
    cleanup(): void;
    onEvent(event: AnyServerEvent): void;
}

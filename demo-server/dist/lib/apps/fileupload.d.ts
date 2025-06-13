import { IServerApp, SockerServer, Transaction } from "../../../server";
export declare class FileUploadApp implements IServerApp {
    name: string;
    transactions: Map<string, Transaction>;
    private getOrCreateTransaction;
    init(server: SockerServer): void;
}

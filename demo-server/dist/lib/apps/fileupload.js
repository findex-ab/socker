import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { Transaction } from "../../../server";
import z from 'zod';
const getTransactionId = (clientId, fileName) => `${clientId}|${fileName}`;
export class FileUploadApp {
    name = 'fileUpload';
    transactions = new Map();
    getOrCreateTransaction(id) {
        if (!this.transactions.has(id)) {
            const trans = new Transaction({ id });
            this.transactions.set(id, trans);
            return trans;
        }
        return this.transactions.get(id);
    }
    init(server) {
        server.defineMessageHook(this.name, {
            action: 'TRANSACTION_START',
            parse: (data) => {
                return z.object({
                    name: z.string()
                }).parse(data.toJS());
            },
            callback: (data, event, _server) => {
                const transId = getTransactionId(event.connection.id, data.name);
                console.log(`Transaction started: ${transId}`);
                this.getOrCreateTransaction(transId).open();
                event.connection.send(BinaryKeyValueStore.fromJS({
                    app: this.name,
                    action: 'TRANSACTION_START',
                    name: data.name
                }));
            }
        });
        server.defineMessageHook(this.name, {
            action: 'TRANSACTION',
            parse: (data) => {
                return z.object({
                    name: z.string(),
                    chunkIndex: z.number(),
                    data: z.custom((value) => value instanceof Uint8Array)
                }).parse(data.toJS());
            },
            callback: (data, event, _server) => {
                const transId = getTransactionId(event.connection.id, data.name);
                console.log(`Transaction: ${transId}`);
                const trans = this.getOrCreateTransaction(transId);
                trans.write({
                    chunkIndex: data.chunkIndex,
                    data: data.data
                });
                event.connection.send(BinaryKeyValueStore.fromJS({
                    app: this.name,
                    action: 'TRANSACTION',
                    name: data.name
                }));
            }
        });
        server.defineMessageHook(this.name, {
            action: 'TRANSACTION_END',
            parse: (data) => {
                return z.object({
                    name: z.string()
                }).parse(data.toJS());
            },
            callback: (data, event, _server) => {
                const transId = getTransactionId(event.connection.id, data.name);
                console.log(`Transaction ended: ${transId}`);
                const trans = this.getOrCreateTransaction(transId);
                trans.close();
                event.connection.send(BinaryKeyValueStore.fromJS({
                    app: this.name,
                    action: 'TRANSACTION_END',
                    name: data.name
                }));
            }
        });
    }
}

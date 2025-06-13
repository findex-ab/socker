import { BinaryKeyValueStore } from "socker/shared";
import { IServerApp, SockerServer, Transaction } from "socker/server";
import z from 'zod';

const getTransactionId = (clientId: string, fileName: string): string => `${clientId}|${fileName}`;

export class FileUploadApp implements IServerApp {
  name: string = 'fileUpload';
  transactions: Map<string, Transaction> = new Map();

  private getOrCreateTransaction(id: string): Transaction {
    if (!this.transactions.has(id)) {
      const trans = new Transaction({ id });
      this.transactions.set(id, trans);
      return trans;
    }
    return this.transactions.get(id)!;
  }

  init(server: SockerServer) {
    server.defineMessageHook(this.name, {
      action: 'TRANSACTION_START',
      parse: (data) => {
        return z.object({
          name: z.string()
        }).parse(data.toJS())
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
          data: z.custom<Uint8Array>((value) => value instanceof Uint8Array)
        }).parse(data.toJS())
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
        }).parse(data.toJS())
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

import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { IncomingMessage } from "http";
import { SocketImplementation, SocketType } from "./socket";
import { sleep } from "./utils";
import { EventSystem } from "#/shared/eventSystem";

const DEFAULT_TRANSFER_CHUNKSIZE: number = 1000000; // 1mb

export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;

export type SocketClientTransferArgs = {
  data: Blob | File;
  name: string;
  app: string;
  startParams?: Record<string, any>; 
  chunkSize?: number;
  onFinish?: (socket: SocketClient, ok: boolean) => any;
  onProgress?: (socket: SocketClient, bytesSent: number, totalBytes: number) => any;
}

export type SocketClientTransferResult = {
  ok: boolean;
  canceled?: boolean;
  [key: string]: any;
}

export type ISocketClientInit = {
  socket: SocketType;
  id: string;
  message?: IncomingMessage;
  socketFactory?: () => SocketType;
  maxReconnectRetries?: number;
  autoReconnect?: boolean;
}

export type SocketClientTransactionState = {
  canceled: boolean;
}

export enum ESocketClientEvent {
  RECONNECTED = 'RECONNECTED'
}

export type SocketClientEventMap = {
  [ESocketClientEvent.RECONNECTED]: {
    eventType: ESocketClientEvent.RECONNECTED
  }
}

export class SocketClient {
  socket: SocketType;
  connectedMessage: IncomingMessage | null = null;
  id: string;
  socketFactory?: () => SocketType;
  maxReconnectRetries: number = 32;
  events: EventSystem<SocketClientEventMap> = new EventSystem();
  transactionStates: Map<string, SocketClientTransactionState> = new Map();

  constructor(init: ISocketClientInit) {
    this.socket = init.socket;
    if (init.autoReconnect !== false) {
      this.addReconnectHandler(this.socket);
    }
    this.id = init.id;
    this.connectedMessage = init.message || null;
    this.socketFactory = init.socketFactory;
    this.maxReconnectRetries = init.maxReconnectRetries || this.maxReconnectRetries;
  }

  private addReconnectHandler(socket: SocketType) {
    socket.addEventListener('close', async () => {
      console.warn(`Socket closed. Attempting to reconnect...`);
      await this.reconnect();
    });
  }


  async reconnect() {
    if (this.isReady() || this.isConnecting()) return;
    const factory = this.socketFactory;
    if (!factory) {
      console.warn(`Unable to connect, no socketFactory was provided`);
      return;
    }

    for (let i = 0; i < this.maxReconnectRetries; i++) {
      console.log(`Reconnect attempt: ${i+1} / ${this.maxReconnectRetries}`);
      this.socket = factory();
      await this.wait(3000);
      if (this.isConnecting()) {
        await sleep(3000);
      }
      if (this.isReady()) {
        console.log(`OK, connected.`);
        this.addReconnectHandler(this.socket);
        this.events.emit({
          eventType: ESocketClientEvent.RECONNECTED
        });
        return;
      } 
      await sleep(500);
    }
  }

  private checkSocketAndWarn(): boolean {
     if (this.isClosed()) {
      console.warn('Socket is closed.');
      return false;
    }
    if (!this.isReady()) {
      console.warn('Socket not ready yet.');
      return false;
    }
    return true;
  }

  send(data: BinaryKeyValueStore) {
    if (!this.checkSocketAndWarn()) return;
    try {
      this.socket.send(data.toBinary());
    } catch (e) {
      console.error(e);
    }
  }

  isReady(): boolean {
    return this.socket.readyState === SocketImplementation.OPEN;
  }

  isConnecting(): boolean {
    return this.socket.readyState === SocketImplementation.CONNECTING;
  }

  isClosed(): boolean {
    return (
      this.socket.readyState === SocketImplementation.CLOSED ||
      this.socket.readyState === SocketImplementation.CLOSING
    );
  }

  onMessage(fn: SocketClientMessageCallbackFunction): (() => void) {
    if (!this.checkSocketAndWarn()) return () => {};
    this.socket.binaryType = "arraybuffer";
    const listener = (event: MessageEvent<any>) => {
      console.log('EVENT', event);
      console.dir(event);
      const data = BinaryKeyValueStore.fromBinarySafe(event.data);
      if (data) {
        console.dir(data.toJS());
        fn(data);
      } else {
        console.error('bad data');
      }
    }
    this.socket.addEventListener('message', listener);

    return () => {
      this.socket.removeEventListener('message', listener);
    }
  }

  onReady(fn: (client: SocketClient) => any) {
    if (this.isReady()) {
      fn(this);
      return;
    }

    const listener = () => {
      fn(this);
      queueMicrotask(() => {
        this.socket.removeEventListener('open', listener);
      })
    }
    this.socket.addEventListener('open', listener);
  }

  wait(timeout: number = 4000): Promise<SocketClient | null> {
    return new Promise<SocketClient | null>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (timer === null) return;
        resolve(null);
      }, timeout);
      this.onReady((client) => {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        resolve(client);
      })
    })
  }

  receive(match: Record<string, any>, timeout: number = 4000): Promise<BinaryKeyValueStore | null> {
    const matches = (toCheck: Record<string, any>, checker: Record<string, any>): boolean => {
      for (const [key, value] of Object.entries(checker)) {
        if (toCheck[key] !== value) return false;
      }
      return true;
    }
    
    return new Promise<BinaryKeyValueStore | null>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (timer === null) return;
        resolve(null);
      }, timeout);

      this.onReady((socket) => {
        const cancel = socket.onMessage((data) => {
          try {
            const js = data.toJS();
            if (matches(js, match)) {
              if (timer !== null) {
                clearTimeout(timer);
                timer = null;
              }
              queueMicrotask(cancel);
              resolve(data);
            }
          } catch (e) {
            console.error(e);
          }
        })
      })
    })
  }


  /////////////////// Transactions
  private createTransactionState(name: string) {
    this.transactionStates.set(name, {
      canceled: false
    })
  }

  private transactionIsCanceled(name: string) {
    const state = this.transactionStates.get(name);
    if (!state) return true;
    if (state.canceled) return true;
    return false;
  }

  private deleteTransactionState(name: string) {
    this.transactionStates.delete(name);
  }

  cancelTransaction(name: string) {
    const state = this.transactionStates.get(name);
    if (!state) return;
    state.canceled = true;
    this.deleteTransactionState(name);
  }

  private async withTransactionState<T = any>(name: string, fn: () => Promise<T>): Promise<T> {
    this.createTransactionState(name);
    const resp = await fn();
    this.deleteTransactionState(name);
    return resp;
  }

  private async startTransaction(args: SocketClientTransferArgs): Promise<boolean> {
    const sock = await this.wait();
    if (!sock) return false;

    sock.send(BinaryKeyValueStore.fromJS({
      ...(args.startParams || {}),
      app: args.app,
      name: args.name,
      action: 'TRANSACTION_START'
    }));
    const resp = await sock.receive({ action: 'TRANSACTION_START', app: args.app, name: args.name });
    if (!resp) return false;

    return true;
  }

  private async sendTransactionChunk(
    args: SocketClientTransferArgs,
    data: Blob,
    chunkIndex: number
  ): Promise<boolean> {
    const sock = await this.wait();
    if (!sock) return false;

    const buff = await data.arrayBuffer();
    const bytes = new Uint8Array(buff);
    sock.socket.binaryType = "arraybuffer";
    sock.send(BinaryKeyValueStore.fromJS({
      app: args.app,
      name: args.name,
      action: 'TRANSACTION',
      chunkIndex: chunkIndex >>> 0,
      data: bytes 
    }));
    const resp = await sock.receive({ action: 'TRANSACTION', app: args.app, name: args.name });
    if (!resp) return false;

    return true;
  }

  private async _transfer(args: SocketClientTransferArgs): Promise<SocketClientTransferResult> {
    const finishWithStatus = (resp: SocketClientTransferResult) => {
      if (args.onFinish) {
        args.onFinish(this, resp.ok);
      }

      if (resp.canceled) {
        this.send(BinaryKeyValueStore.fromJS({
          app: args.app,
          name: args.name,
          action: 'TRANSACTION_CANCEL'
        }))
      }

      return resp;
    }

    
    const startOk = await this.startTransaction(args);
    if (!startOk) return finishWithStatus({ ok: false });
    if (this.transactionIsCanceled(args.name)) return finishWithStatus({ ok: false, canceled: true });

    const blob = args.data;
    const chunkSize = args.chunkSize || DEFAULT_TRANSFER_CHUNKSIZE;
    const numChunks = Math.ceil(blob.size / chunkSize);
    let chunkIndex: number = 0;
    let bytesSent: number = 0;

    while (chunkIndex < numChunks) {
      const offset = chunkIndex * chunkSize;
      const part = blob.slice(offset, offset + chunkSize);
      const ok = await this.sendTransactionChunk(args, part, chunkIndex);
      if (!ok) return finishWithStatus({ ok: false });
      if (this.transactionIsCanceled(args.name)) return finishWithStatus({ ok: false, canceled: true });
      
      chunkIndex++;
      bytesSent += part.size;

      if (args.onProgress) {
        args.onProgress(this, bytesSent, args.data.size);
      }
    }

    this.send(BinaryKeyValueStore.fromJS({
      action: 'TRANSACTION_END',
      app: args.app,
      name: args.name
    }))
    const resp = await this.receive({ action: 'TRANSACTION_END', app: args.app, name: args.name }, 10000);
    if (!resp) return finishWithStatus({ ok: false });

    if (resp.get('ok') && resp.getBool('ok') === false) {
      return finishWithStatus({ ...resp.toJS(), ok: false });
    }

    return finishWithStatus({ ...resp.toJS(), ok: true });
  }

  async transfer(args: SocketClientTransferArgs): Promise<SocketClientTransferResult> {
    return await this.withTransactionState(args.name, async () => {
      return await this._transfer(args);
    })
  }
}

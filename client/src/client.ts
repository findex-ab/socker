import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { IncomingMessage } from "http";
import { SocketImplementation, SocketType } from "./socket";

export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;

export type SocketClientTransferArgs = {
  data: Blob | File;
  name: string;
  app: string;
  chunkSize?: number;
  onFinish?: (socket: SocketClient, ok: boolean) => any;
  onProgress?: (socket: SocketClient, bytesSent: number, totalBytes: number) => any;
}

export type SocketClientTransferResult = {
  ok: boolean;
}

export class SocketClient {
  socket: SocketType;
  connectedMessage: IncomingMessage | null = null;
  id: string;
  authenticated: boolean = false;

  constructor(socket: SocketType, id: string, message?: IncomingMessage) {
    this.socket = socket;
    this.id = id;
    this.connectedMessage = message || null;
  }

  setAuthenticated(authenticated: boolean) {
    this.authenticated = authenticated;
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
  
  private async startTransaction(args: SocketClientTransferArgs): Promise<boolean> {
    const sock = await this.wait();
    if (!sock) return false;

    sock.send(BinaryKeyValueStore.fromJS({
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
    sock.send(BinaryKeyValueStore.fromJS({
      app: args.app,
      name: args.name,
      action: 'TRANSACTION',
      chunkIndex: chunkIndex,
      data: bytes 
    }));
    const resp = await sock.receive({ action: 'TRANSACTION', app: args.app, name: args.name });
    if (!resp) return false;

    return true;
  }

  async transfer(args: SocketClientTransferArgs): Promise<SocketClientTransferResult> {
    const startOk = await this.startTransaction(args);
    if (!startOk) {
      if (args.onFinish) {
        args.onFinish(this, false);
      }
      return { ok: false };
    }

    const blob = args.data;
    const chunkSize = args.chunkSize || 512;
    const numChunks = Math.ceil(blob.size / chunkSize);
    let chunkIndex: number = 0;
    let bytesSent: number = 0;

    while (chunkIndex < numChunks) {
      const offset = chunkIndex * chunkSize;
      const part = blob.slice(offset, offset + chunkSize);
      const ok = await this.sendTransactionChunk(args, part, chunkIndex);
      if (!ok) return { ok: false };
      
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
    if (!resp) {
      if (args.onFinish) {
        args.onFinish(this, false);
      }
      return { ok: false };
    }

    if (args.onFinish) {
      args.onFinish(this, true);
    }

    return { ok: true };
  }
}

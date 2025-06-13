import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { IncomingMessage } from "http";
import { SocketImplementation, SocketType } from "./socket";

export type SocketClientMessageCallbackFunction = (data: BinaryKeyValueStore) => any;


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
        fn(data);
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
}

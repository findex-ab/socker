import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { SocketImplementation } from "./socket";
export class SocketClient {
    socket;
    connectedMessage = null;
    id;
    authenticated = false;
    constructor(socket, id, message) {
        this.socket = socket;
        this.id = id;
        this.connectedMessage = message || null;
    }
    checkSocketAndWarn() {
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
    send(data) {
        if (!this.checkSocketAndWarn())
            return;
        try {
            this.socket.send(data.toBinary());
        }
        catch (e) {
            console.error(e);
        }
    }
    isReady() {
        return this.socket.readyState === SocketImplementation.OPEN;
    }
    isConnecting() {
        return this.socket.readyState === SocketImplementation.CONNECTING;
    }
    isClosed() {
        return (this.socket.readyState === SocketImplementation.CLOSED ||
            this.socket.readyState === SocketImplementation.CLOSING);
    }
    onMessage(fn) {
        if (!this.checkSocketAndWarn())
            return () => { };
        const listener = (event) => {
            console.log('EVENT', event);
            console.dir(event);
            const data = BinaryKeyValueStore.fromBinarySafe(event.data);
            if (data) {
                fn(data);
            }
        };
        this.socket.addEventListener('message', listener);
        return () => {
            this.socket.removeEventListener('message', listener);
        };
    }
    onReady(fn) {
        if (this.isReady()) {
            fn(this);
            return;
        }
        const listener = () => {
            fn(this);
            queueMicrotask(() => {
                this.socket.removeEventListener('open', listener);
            });
        };
        this.socket.addEventListener('open', listener);
    }
}

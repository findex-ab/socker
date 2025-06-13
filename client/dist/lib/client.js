import { BinaryKeyValueStore } from "socker/shared";
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
    setAuthenticated(authenticated) {
        this.authenticated = authenticated;
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
        this.socket.binaryType = "arraybuffer";
        const listener = (event) => {
            console.log('EVENT', event);
            console.dir(event);
            const data = BinaryKeyValueStore.fromBinarySafe(event.data);
            if (data) {
                console.dir(data.toJS());
                fn(data);
            }
            else {
                console.error('bad data');
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
    wait(timeout = 4000) {
        return new Promise((resolve) => {
            let timer = setTimeout(() => {
                if (timer === null)
                    return;
                resolve(null);
            }, timeout);
            this.onReady((client) => {
                if (timer !== null) {
                    clearTimeout(timer);
                    timer = null;
                }
                resolve(client);
            });
        });
    }
    receive(match, timeout = 4000) {
        const matches = (toCheck, checker) => {
            for (const [key, value] of Object.entries(checker)) {
                if (toCheck[key] !== value)
                    return false;
            }
            return true;
        };
        return new Promise((resolve) => {
            let timer = setTimeout(() => {
                if (timer === null)
                    return;
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
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
            });
        });
    }
    async startTransaction(args) {
        const sock = await this.wait();
        if (!sock)
            return false;
        sock.send(BinaryKeyValueStore.fromJS({
            app: args.app,
            name: args.name,
            action: 'TRANSACTION_START'
        }));
        const resp = await sock.receive({ action: 'TRANSACTION_START', app: args.app, name: args.name });
        if (!resp)
            return false;
        return true;
    }
    async sendTransactionChunk(args, data, chunkIndex) {
        const sock = await this.wait();
        if (!sock)
            return false;
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
        if (!resp)
            return false;
        return true;
    }
    async transfer(args) {
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
        let chunkIndex = 0;
        let bytesSent = 0;
        while (chunkIndex < numChunks) {
            const offset = chunkIndex * chunkSize;
            const part = blob.slice(offset, offset + chunkSize);
            const ok = await this.sendTransactionChunk(args, part, chunkIndex);
            if (!ok)
                return { ok: false };
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
        }));
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

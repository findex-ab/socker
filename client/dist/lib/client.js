import { BinaryKeyValueStore } from "socker/shared";
import { SocketImplementation } from "./socket";
import { sleep } from "./utils";
import { EventSystem } from "socker/shared";
const DEFAULT_TRANSFER_CHUNKSIZE = 1000000; // 1mb
export var ESocketClientEvent;
(function (ESocketClientEvent) {
    ESocketClientEvent["RECONNECTED"] = "RECONNECTED";
})(ESocketClientEvent || (ESocketClientEvent = {}));
export class SocketClient {
    socket;
    connectedMessage = null;
    id;
    socketFactory;
    maxReconnectRetries = 32;
    events = new EventSystem();
    transactionStates = new Map();
    constructor(init) {
        this.socket = init.socket;
        if (init.autoReconnect !== false) {
            this.addReconnectHandler(this.socket);
        }
        this.id = init.id;
        this.connectedMessage = init.message || null;
        this.socketFactory = init.socketFactory;
        this.maxReconnectRetries = init.maxReconnectRetries || this.maxReconnectRetries;
    }
    addReconnectHandler(socket) {
        socket.addEventListener('close', async () => {
            console.warn(`Socket closed. Attempting to reconnect...`);
            await this.reconnect();
        });
    }
    async reconnect() {
        if (this.isReady() || this.isConnecting())
            return;
        const factory = this.socketFactory;
        if (!factory) {
            console.warn(`Unable to connect, no socketFactory was provided`);
            return;
        }
        for (let i = 0; i < this.maxReconnectRetries; i++) {
            console.log(`Reconnect attempt: ${i + 1} / ${this.maxReconnectRetries}`);
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
    /////////////////// Transactions
    createTransactionState(name) {
        this.transactionStates.set(name, {
            canceled: false
        });
    }
    transactionIsCanceled(name) {
        const state = this.transactionStates.get(name);
        if (!state)
            return true;
        if (state.canceled)
            return true;
        return false;
    }
    deleteTransactionState(name) {
        this.transactionStates.delete(name);
    }
    cancelTransaction(name) {
        const state = this.transactionStates.get(name);
        if (!state)
            return;
        state.canceled = true;
        this.deleteTransactionState(name);
    }
    async withTransactionState(name, fn) {
        this.createTransactionState(name);
        const resp = await fn();
        this.deleteTransactionState(name);
        return resp;
    }
    async startTransaction(args) {
        const sock = await this.wait();
        if (!sock)
            return false;
        sock.send(BinaryKeyValueStore.fromJS({
            ...(args.startParams || {}),
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
        sock.socket.binaryType = "arraybuffer";
        sock.send(BinaryKeyValueStore.fromJS({
            app: args.app,
            name: args.name,
            action: 'TRANSACTION',
            chunkIndex: chunkIndex >>> 0,
            data: bytes
        }));
        const resp = await sock.receive({ action: 'TRANSACTION', app: args.app, name: args.name });
        if (!resp)
            return false;
        return true;
    }
    async _transfer(args) {
        const finishWithStatus = (resp) => {
            if (args.onFinish) {
                args.onFinish(this, resp.ok);
            }
            if (resp.canceled) {
                this.send(BinaryKeyValueStore.fromJS({
                    app: args.app,
                    name: args.name,
                    action: 'TRANSACTION_CANCEL'
                }));
            }
            return resp;
        };
        const startOk = await this.startTransaction(args);
        if (!startOk)
            return finishWithStatus({ ok: false });
        if (this.transactionIsCanceled(args.name))
            return finishWithStatus({ ok: false, canceled: true });
        const blob = args.data;
        const chunkSize = args.chunkSize || DEFAULT_TRANSFER_CHUNKSIZE;
        const numChunks = Math.ceil(blob.size / chunkSize);
        let chunkIndex = 0;
        let bytesSent = 0;
        while (chunkIndex < numChunks) {
            const offset = chunkIndex * chunkSize;
            const part = blob.slice(offset, offset + chunkSize);
            const ok = await this.sendTransactionChunk(args, part, chunkIndex);
            if (!ok)
                return finishWithStatus({ ok: false });
            if (this.transactionIsCanceled(args.name))
                return finishWithStatus({ ok: false, canceled: true });
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
        if (!resp)
            return finishWithStatus({ ok: false });
        if (resp.get('ok') && resp.getBool('ok') === false) {
            return finishWithStatus({ ...resp.toJS(), ok: false });
        }
        return finishWithStatus({ ...resp.toJS(), ok: true });
    }
    async transfer(args) {
        return await this.withTransactionState(args.name, async () => {
            return await this._transfer(args);
        });
    }
}

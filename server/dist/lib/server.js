import { WebSocketServer } from "ws";
import * as fs from "fs";
import * as https from "https";
import * as pathlib from "path";
import { EventSystem } from "socker/shared";
import { EServerEvent } from "./serverEvents";
import * as UUID from 'uuid';
import { BinaryKeyValueStore } from "socker/shared";
import { EStateSystemEvent, StateSystem } from "socker/shared";
import { SocketClient } from "#/client/client";
export class SockerServer {
    config;
    socket = null;
    events;
    apps = new Map();
    appMetas = new Map();
    stateSystem = new StateSystem();
    clientCleanups = new Map();
    clients = new Map();
    constructor(config) {
        this.config = config;
        this.events = new EventSystem();
        this.events.subscribeAll((event) => {
            this.onAnyEvent(event).catch(e => console.error(e));
        });
        this.stateSystem.events.subscribeAll((event) => {
            this.onAnyStateEvent(event);
        });
    }
    onAnyStateEvent(event) {
        const key = event.key.toString();
        const parts = key.split('|');
        const [appName, clientId] = parts;
        const client = this.clients.get(clientId);
        if (!client)
            return;
        if (event.eventType === EStateSystemEvent.STATE_MERGED) {
            client.send(BinaryKeyValueStore.fromJS({
                app: appName,
                action: 'STATE_MERGED',
                state: event.state
            }));
            console.log(`A state event! key=${event.key.toString()}, client: ${typeof client}`);
        }
    }
    createClientCleanup(clientId, fn) {
        if (!this.clientCleanups.has(clientId)) {
            this.clientCleanups.set(clientId, new Set());
        }
        const arrSet = this.clientCleanups.get(clientId);
        arrSet.add(fn);
    }
    runClientCleanups(clientId) {
        const arrSet = this.clientCleanups.get(clientId);
        if (!arrSet)
            return;
        arrSet.forEach((fn) => {
            console.log(`cleanup ${clientId}`);
            try {
                fn();
            }
            catch (e) {
                console.error(e);
            }
        });
        arrSet.clear();
        this.clientCleanups.delete(clientId);
    }
    use(app) {
        this.apps.set(app.name, app);
    }
    getApp(name) {
        return this.apps.get(name) || null;
    }
    getAppMeta(name) {
        return this.appMetas.get(name) || null;
    }
    getOrCreateAppMeta(name) {
        const meta = this.getAppMeta(name);
        if (meta)
            return meta;
        const appMeta = {
            hooks: new Map(),
            connectedClients: new Set()
        };
        this.appMetas.set(name, appMeta);
        return appMeta;
    }
    defineMessageHook(appName, hook) {
        const meta = this.getOrCreateAppMeta(appName);
        if (!meta.hooks.has(hook.action)) {
            meta.hooks.set(hook.action, new Set());
        }
        const hookSet = meta.hooks.get(hook.action);
        hookSet.add(hook);
    }
    useClientState(appName, clientId, init) {
        const key = `${appName}|${clientId}`;
        this.createClientCleanup(clientId, () => {
            console.log(`Deleting state: ${key}`);
            this.stateSystem.deleteState(key);
        });
        return this.stateSystem.useState(key, init);
    }
    async onAnyEvent(event) {
        console.log(`EVENT`, event.eventType);
        switch (event.eventType) {
            case EServerEvent.CLIENT_MESSAGE:
                {
                    console.log(event.data);
                    const appName = event.data.getString('app');
                    console.log({ appName });
                    if (appName) {
                        const app = this.getApp(appName);
                        if (app) {
                            if (app.onEvent) {
                                try {
                                    app.onEvent(event, this);
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                            if (app.onMessage) {
                                try {
                                    app.onMessage(event.data, event.connection, this);
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                        const meta = this.getOrCreateAppMeta(appName);
                        if (!meta.connectedClients.has(event.connection.id)) {
                            meta.connectedClients.add(event.connection.id);
                            this.createClientCleanup(event.connection.id, () => {
                                meta.connectedClients.delete(event.connection.id);
                            });
                        }
                        const action = event.data.getString('action');
                        if (action) {
                            const hookSet = meta.hooks.get(action);
                            if (hookSet) {
                                hookSet.forEach((hook) => {
                                    try {
                                        const data = hook.parse(event.data);
                                        hook.callback(data, event, this);
                                    }
                                    catch (e) {
                                        console.error(e);
                                    }
                                });
                            }
                        }
                    }
                }
                ;
                break;
            case EServerEvent.CLIENT_CLOSE:
                {
                    this.runClientCleanups(event.connection.id);
                }
                ;
                break;
        }
    }
    async initApps() {
        for (const app of Array.from(this.apps.values())) {
            if (app.init) {
                await app.init(this);
            }
        }
    }
    postStart(server) {
        server.addListener('listening', async () => {
            await this.initApps();
        });
        server.addListener('headers', (headers, req) => {
            this.events.emit({
                headers: headers,
                request: req,
                eventType: EServerEvent.RECEIVED_HEADERS
            });
        });
        server.addListener('error', (err) => {
            this.events.emit({ error: err, eventType: EServerEvent.SERVER_ERROR });
        });
        server.addListener("connection", (socket, req) => {
            const id = UUID.v4();
            const connection = new SocketClient(socket, id, req);
            this.clients.set(connection.id, connection);
            this.createClientCleanup(connection.id, () => {
                this.clients.delete(connection.id);
            });
            this.events.emit({ connection, eventType: EServerEvent.CLIENT_CONNECTION });
            socket.addEventListener("open", (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    eventType: EServerEvent.CLIENT_OPEN
                });
            });
            socket.addEventListener("close", (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    reason: ev.reason,
                    code: ev.code,
                    eventType: EServerEvent.CLIENT_CLOSE
                });
            });
            socket.addEventListener('error', (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    error: ev.error,
                    message: ev.message,
                    eventType: EServerEvent.CLIENT_ERROR
                });
            });
            socket.on('message', (data, isBinary) => {
                const convert = (x) => {
                    if (x instanceof ArrayBuffer || x instanceof Uint8Array || x instanceof SharedArrayBuffer)
                        return x;
                    if (Array.isArray(x)) {
                        if (x.length <= 0)
                            return null;
                        if (typeof x[0] === 'number')
                            return new Uint8Array(x);
                    }
                    return null;
                };
                const converted = convert(data);
                if (converted === null) {
                    console.error('Invalid message data');
                    return;
                }
                this.events.emit({
                    connection,
                    data: BinaryKeyValueStore.fromBinary(converted),
                    isBinary: isBinary,
                    eventType: EServerEvent.CLIENT_MESSAGE
                });
            });
            socket.on('upgrade', (req) => {
                this.events.emit({
                    connection,
                    message: req,
                    eventType: EServerEvent.CLIENT_UPGRADE
                });
            });
        });
    }
    start() {
        console.log(`Creating server on port ${this.config.port}`);
        if (this.config.httpsCertificatePath) {
            const pemPath = pathlib.join(this.config.httpsCertificatePath, "cert.pem");
            const privKeyPath = pathlib.join(this.config.httpsCertificatePath, "privkey.pem");
            const chainPemPath = pathlib.join(this.config.httpsCertificatePath, "chain.pem");
            const certExists = fs.existsSync(pemPath);
            if (certExists) {
                const httpsServer = https.createServer({
                    cert: fs.readFileSync(pemPath, "utf8"),
                    key: fs.readFileSync(privKeyPath, "utf8"),
                    ca: fs.readFileSync(chainPemPath, "utf8"),
                });
                httpsServer.listen({
                    port: this.config.port,
                    host: this.config.host,
                });
                const server = new WebSocketServer({
                    server: httpsServer,
                });
                this.socket = server;
                this.postStart(server);
                return server;
            }
        }
        const server = new WebSocketServer({
            port: this.config.port,
        });
        this.socket = server;
        this.postStart(server);
        return server;
    }
}

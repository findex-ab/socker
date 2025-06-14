import { WebSocketServer } from "ws";
import * as fs from "fs";
import * as https from "https";
import * as pathlib from "path";
import { EventSystem } from "socker/shared";
import { EServerEvent } from "./serverEvents";
import * as UUID from "uuid";
import { BinaryKeyValueStore } from "socker/shared";
import { StateSystem, } from "socker/shared";
import { SocketClient } from "socker/client";
import { InternalEventHandler } from "./internalEventHandler";
export class SockerServer {
    config;
    socket = null;
    events;
    internalEventHandler;
    apps = new Map();
    appMetas = new Map();
    stateSystem = new StateSystem();
    clientCleanups = new Map();
    clients = new Map();
    clientMetas = new Map();
    constructor(config) {
        this.config = config;
        this.events = new EventSystem();
        this.internalEventHandler = new InternalEventHandler(this);
        this.events.subscribeAll((event) => {
            this.internalEventHandler
                .handleEvent(event)
                .catch((e) => console.error(e));
        });
        this.stateSystem.events.subscribeAll((event) => {
            this.internalEventHandler.handleStateEvent(event);
        });
    }
    createClientCleanup(clientId, fn) {
        if (!this.clientCleanups.has(clientId)) {
            this.clientCleanups.set(clientId, new Set());
        }
        const arrSet = this.clientCleanups.get(clientId);
        arrSet.add(fn);
    }
    runClientCleanups(clientId) {
        this.getClientApps(clientId).forEach((app) => {
            const client = this.getClient(clientId);
            if (client && app.cleanup) {
                try {
                    app.cleanup(client);
                }
                catch (e) {
                    console.error(e);
                }
            }
        });
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
    getClient(id) {
        return this.clients.get(id) || null;
    }
    findClientsByMeta(meta) {
        const matchesMeta = (metaMap) => {
            for (const [key, value] of Object.entries(meta)) {
                if (metaMap.get(key) !== value)
                    return false;
            }
            return true;
        };
        return this.getAllClients().filter((client) => {
            const clientMeta = this.getClientMeta(client.id);
            return matchesMeta(clientMeta.data);
        });
    }
    findClientByMeta(meta) {
        const matchesMeta = (metaMap) => {
            for (const [key, value] of Object.entries(meta)) {
                if (metaMap.get(key) !== value)
                    return false;
            }
            return true;
        };
        return this.getAllClients().find((client) => {
            const clientMeta = this.getClientMeta(client.id);
            return matchesMeta(clientMeta.data);
        }) || null;
    }
    getClientMeta(clientId) {
        return this.clientMetas.get(clientId) || null;
    }
    getClientApps(clientId) {
        return Array.from(this.appMetas.entries())
            .filter(([_appName, meta]) => Array.from(meta.connectedClients.values()).includes(clientId))
            .map(([appName, _meta]) => this.getApp(appName))
            .filter((it) => it !== null);
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
            connectedClients: new Set(),
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
    getAllClients() {
        return Array.from(this.clients.values());
    }
    getClientsInApp(appName) {
        const appMeta = this.getAppMeta(appName);
        if (!appMeta)
            return [];
        return Array.from(appMeta.connectedClients.values())
            .map((clientId) => this.getClient(clientId))
            .filter((it) => it !== null);
    }
    broadcast(message) {
        const appName = message.getString("app");
        const clients = appName
            ? this.getClientsInApp(appName)
            : this.getAllClients();
        clients.forEach((client) => {
            client.send(message);
        });
    }
    async initApps() {
        for (const app of Array.from(this.apps.values())) {
            if (app.init) {
                await app.init(this);
            }
        }
    }
    postStart(server) {
        server.addListener("listening", async () => {
            await this.initApps();
        });
        server.addListener("headers", (headers, req) => {
            this.events.emit({
                headers: headers,
                request: req,
                eventType: EServerEvent.RECEIVED_HEADERS,
                server: this,
            });
        });
        server.addListener("error", (err) => {
            this.events.emit({
                error: err,
                eventType: EServerEvent.SERVER_ERROR,
                server: this,
            });
        });
        server.addListener("connection", (socket, req) => {
            const id = UUID.v4();
            const connection = new SocketClient({
                socket: socket,
                id: id,
                message: req,
            });
            this.clients.set(connection.id, connection);
            this.clientMetas.set(connection.id, {
                data: new Map(),
            });
            this.createClientCleanup(connection.id, () => {
                this.clients.delete(connection.id);
                this.clientMetas.delete(connection.id);
            });
            this.events.emit({
                connection,
                eventType: EServerEvent.CLIENT_CONNECTION,
                server: this,
            });
            socket.addEventListener("open", (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    eventType: EServerEvent.CLIENT_OPEN,
                    server: this,
                });
            });
            socket.addEventListener("close", (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    reason: ev.reason,
                    code: ev.code,
                    eventType: EServerEvent.CLIENT_CLOSE,
                    server: this,
                });
            });
            socket.addEventListener("error", (ev) => {
                this.events.emit({
                    connection,
                    type: ev.type,
                    error: ev.error,
                    message: ev.message,
                    eventType: EServerEvent.CLIENT_ERROR,
                    server: this,
                });
            });
            socket.on("message", (data, isBinary) => {
                const convert = (x) => {
                    try {
                        return new Uint8Array(x);
                    }
                    catch (e) {
                        console.error(e);
                        return x;
                    }
                };
                const converted = convert(data);
                if (converted === null) {
                    console.error("Invalid message data");
                    return;
                }
                this.events.emit({
                    connection,
                    data: BinaryKeyValueStore.fromBinary(converted),
                    isBinary: isBinary,
                    eventType: EServerEvent.CLIENT_MESSAGE,
                    server: this,
                });
            });
            socket.on("upgrade", (req) => {
                this.events.emit({
                    connection,
                    message: req,
                    eventType: EServerEvent.CLIENT_UPGRADE,
                    server: this,
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

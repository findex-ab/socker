import { BinaryKeyValueStore } from "socker/shared";
import { EStateSystemEvent } from "socker/shared";
import { EServerEvent } from "./serverEvents";
export class InternalEventHandler {
    server;
    constructor(server) {
        this.server = server;
    }
    async handleClientMessageEvent(event) {
        const appName = event.data.getString("app");
        const forwardTo = event.data.getStringArray('forwardTo');
        if (forwardTo && forwardTo.length > 0) {
            const clients = forwardTo.map(id => this.server.getClient(id)).filter(it => it !== null).filter(it => it.id !== event.connection.id);
            const cleanData = event.data.toJS();
            delete cleanData['forwardTo'];
            const cleanBinData = BinaryKeyValueStore.fromJS(cleanData);
            clients.forEach((client) => {
                client.send(cleanBinData);
            });
            return;
        }
        if (event.data.getBool('broadcast')) {
            const cleanData = event.data.toJS();
            delete cleanData['broadcast'];
            const cleanBinData = BinaryKeyValueStore.fromJS(cleanData);
            const clients = (appName ? this.server.getClientsInApp(appName) : this.server.getAllClients()).filter(it => it.id !== event.connection.id);
            clients.forEach((client) => {
                client.send(cleanBinData);
            });
            return;
        }
        if (appName) {
            const app = event.server.getApp(appName);
            if (app) {
                if (app.onEvent) {
                    try {
                        app.onEvent(event);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            const meta = event.server.getOrCreateAppMeta(appName);
            if (!meta.connectedClients.has(event.connection.id)) {
                meta.connectedClients.add(event.connection.id);
                event.server.createClientCleanup(event.connection.id, () => {
                    meta.connectedClients.delete(event.connection.id);
                });
            }
            const action = event.data.getString("action");
            if (action) {
                const hookSet = meta.hooks.get(action);
                if (hookSet) {
                    hookSet.forEach((hook) => {
                        try {
                            const data = hook.parse(event.data);
                            hook.callback(data, event);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    });
                }
            }
        }
    }
    handleClientCloseEvent(event) {
        event.server.runClientCleanups(event.connection.id);
    }
    async handleEvent(event) {
        console.log(`EVENT`, event.eventType);
        switch (event.eventType) {
            case EServerEvent.CLIENT_MESSAGE:
                await this.handleClientMessageEvent(event);
                break;
            case EServerEvent.CLIENT_CLOSE:
                this.handleClientCloseEvent(event);
                break;
            default:
                {
                    /* noop */
                }
                break;
        }
    }
    handleStateEvent(event) {
        const key = event.key.toString();
        const parts = key.split("|");
        const [appName, clientId] = parts;
        const client = this.server.clients.get(clientId);
        if (!client)
            return;
        if (event.eventType === EStateSystemEvent.STATE_MERGED) {
            client.send(BinaryKeyValueStore.fromJS({
                app: appName,
                action: "STATE_MERGED",
                state: event.state,
            }));
            console.log(`A state event! key=${event.key.toString()}, client: ${typeof client}`);
        }
    }
}

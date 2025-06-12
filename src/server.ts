import { WebSocketServer } from "ws";
import * as fs from "fs";
import * as https from "https";
import * as pathlib from "path";
import { SockerClientConnection } from "./clientConnection";
import { EventSystem } from "./eventSystem";
import { AnyServerEvent, EServerEvent, ServerEventMap } from "./serverEvents";
import { IServerApp } from "./serverApp";
import { tryParseMessageEvent } from "./eventUtils";

export type SockerServerConfig = {
  host: string;
  port: number;
  httpsCertificatePath?: string;
};

export class SockerServer {
  config: SockerServerConfig;
  socket: WebSocketServer | null = null;
  events: EventSystem<ServerEventMap>;
  apps: Map<string, IServerApp> = new Map() 

  constructor(config: SockerServerConfig) {
    this.config = config;
    this.events = new EventSystem();
    this.events.subscribeAll((event) => {
      this.onAnyEvent(event).catch(e => console.error(e));
    })
  }

  use(app: IServerApp) {
    this.apps.set(app.name, app);
  }

  getApp(name: string): IServerApp | null {
    return this.apps.get(name) || null;
  }

  private async onAnyEvent(event: AnyServerEvent) {
    console.log(`EVENT`, event.eventType);
    switch (event.eventType) {
      case EServerEvent.CLIENT_MESSAGE: {
        console.log(event.data);
        const parsed = tryParseMessageEvent(event);
        console.log({ parsed });
        if (parsed && parsed.app) {
          const app = this.getApp(parsed.app);
          if (app) {
            if (app.onEvent) {
              app.onEvent(event, this);
            }
          }
        }
      }; break;
    }
  }

  private async initApps() {
    for (const app of Array.from(this.apps.values())) {
      await app.init(this);
    }
  }

  private postStart(server: WebSocketServer) {
    server.addListener('listening', async () => {
      await this.initApps();
    });

    server.addListener('headers', (headers, req) => {
      this.events.emit({
        headers: headers,
        request: req,
        eventType: EServerEvent.RECEIVED_HEADERS
      })
    });

    server.addListener('error', (err) => {
      this.events.emit({ error: err, eventType: EServerEvent.SERVER_ERROR });
    });
    
    server.addListener("connection", (socket, req) => {
      const connection = new SockerClientConnection(socket, req);
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
        this.events.emit({
          connection,
          data: data,
          isBinary: isBinary,
          eventType: EServerEvent.CLIENT_MESSAGE
        })
      });

      socket.on('upgrade', (req) => {
        this.events.emit({
          connection,
          message: req,
          eventType: EServerEvent.CLIENT_UPGRADE
        })
      })
    });
  }

  start() {
    console.log(`Creating server on port ${this.config.port}`);

    if (this.config.httpsCertificatePath) {
      const pemPath = pathlib.join(
        this.config.httpsCertificatePath,
        "cert.pem",
      );
      const privKeyPath = pathlib.join(
        this.config.httpsCertificatePath,
        "privkey.pem",
      );
      const chainPemPath = pathlib.join(
        this.config.httpsCertificatePath,
        "chain.pem",
      );
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

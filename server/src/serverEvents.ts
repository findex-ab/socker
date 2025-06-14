import { IncomingMessage } from "http";
import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { SocketClient } from "#/client/client";
import { type SockerServer } from "./server";

export enum EServerEvent {
  CLIENT_CONNECTION = "CLIENT_CONNECTION",
  CLIENT_OPEN = "CLIENT_OPEN",
  CLIENT_CLOSE = "CLIENT_CLOSE",
  CLIENT_ERROR = "CLIENT_ERROR",
  CLIENT_MESSAGE = "CLIENT_MESSAGE",
  CLIENT_UPGRADE = "CLIENT_UPGRADE",
  RECEIVED_HEADERS = "RECEIVED_HEADERS",
  SERVER_ERROR = "SERVER_ERROR"
}

export type ServerEventMap = {
  [EServerEvent.CLIENT_CONNECTION]: {
    eventType: EServerEvent.CLIENT_CONNECTION;
    connection: SocketClient;
    server: SockerServer;
  };
  [EServerEvent.CLIENT_OPEN]: {
    eventType: EServerEvent.CLIENT_OPEN;
    connection: SocketClient;
    type: string;
    server: SockerServer;
  };
  [EServerEvent.CLIENT_CLOSE]: {
    eventType: EServerEvent.CLIENT_CLOSE;
    connection: SocketClient;
    type: string;
    reason: string;
    code: number;
    server: SockerServer;
  };
  [EServerEvent.CLIENT_ERROR]: {
    eventType: EServerEvent.CLIENT_ERROR;
    connection: SocketClient;
    type: string;
    error: unknown;
    message: string;
    server: SockerServer;
  };
  [EServerEvent.CLIENT_MESSAGE]: {
    eventType: EServerEvent.CLIENT_MESSAGE;
    connection: SocketClient;
    isBinary: boolean;
    data: BinaryKeyValueStore;
    server: SockerServer;
  };
  [EServerEvent.CLIENT_UPGRADE]: {
    eventType: EServerEvent.CLIENT_UPGRADE;
    connection: SocketClient;
    message: IncomingMessage
    server: SockerServer;
  };
  [EServerEvent.RECEIVED_HEADERS]: {
    eventType: EServerEvent.RECEIVED_HEADERS;
    headers: Array<string>;
    request: IncomingMessage;
    server: SockerServer;
  },
  [EServerEvent.SERVER_ERROR]: {
    eventType: EServerEvent.SERVER_ERROR;
    error: Error
    server: SockerServer;
  }
};

export type AnyServerEvent = ServerEventMap[keyof ServerEventMap]

export type ServerMessageEventPayload = {
  app?: string;
  action?: string;
  [key: string]: any;
}

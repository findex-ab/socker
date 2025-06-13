import { IncomingMessage } from "http";
import { BinaryKeyValueStore } from "#/shared/binaryKVStore";
import { SocketClient } from "#/client/client";

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
  };
  [EServerEvent.CLIENT_OPEN]: {
    eventType: EServerEvent.CLIENT_OPEN;
    connection: SocketClient;
    type: string;
  };
  [EServerEvent.CLIENT_CLOSE]: {
    eventType: EServerEvent.CLIENT_CLOSE;
    connection: SocketClient;
    type: string;
    reason: string;
    code: number;
  };
  [EServerEvent.CLIENT_ERROR]: {
    eventType: EServerEvent.CLIENT_ERROR;
    connection: SocketClient;
    type: string;
    error: unknown;
    message: string;
  };
  [EServerEvent.CLIENT_MESSAGE]: {
    eventType: EServerEvent.CLIENT_MESSAGE;
    connection: SocketClient;
    isBinary: boolean;
    data: BinaryKeyValueStore;
  };
  [EServerEvent.CLIENT_UPGRADE]: {
    eventType: EServerEvent.CLIENT_UPGRADE;
    connection: SocketClient;
    message: IncomingMessage
  };
  [EServerEvent.RECEIVED_HEADERS]: {
    eventType: EServerEvent.RECEIVED_HEADERS;
    headers: Array<string>;
    request: IncomingMessage;
  },
  [EServerEvent.SERVER_ERROR]: {
    eventType: EServerEvent.SERVER_ERROR;
    error: Error
  }
};

export type AnyServerEvent = ServerEventMap[keyof ServerEventMap]

export type ServerMessageEventPayload = {
  app?: string;
  action?: string;
  [key: string]: any;
}

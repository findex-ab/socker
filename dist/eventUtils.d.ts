import { EServerEvent, ServerEventMap } from "./serverEvents";
export declare const tryStringifyMessageEvent: (event: ServerEventMap[EServerEvent.CLIENT_MESSAGE]) => string | null;
export declare const tryJSONParseEvent: (event: ServerEventMap[EServerEvent.CLIENT_MESSAGE]) => unknown;
export declare const tryParseMessageEvent: (event: ServerEventMap[EServerEvent.CLIENT_MESSAGE]) => {
    app?: string;
    [key: string]: any;
} | null;

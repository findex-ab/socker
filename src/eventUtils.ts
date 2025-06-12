import { EServerEvent, ServerEventMap } from "./serverEvents";

export const tryStringifyMessageEvent = (
  event: ServerEventMap[EServerEvent.CLIENT_MESSAGE],
): string | null => {
  if (typeof event.data === "string") return event.data;
  if (event.data instanceof Buffer) {
    try {
      const str = event.data.toString();
      return str || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  try {
    return event.data.toString();
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const tryJSONParseEvent = (
  event: ServerEventMap[EServerEvent.CLIENT_MESSAGE],
): unknown => {
  const str = tryStringifyMessageEvent(event);
  if (typeof str !== "string") return null;
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const tryParseMessageEvent = (
  event: ServerEventMap[EServerEvent.CLIENT_MESSAGE],
): { app?: string; [key: string]: any } | null => {
  const str = tryStringifyMessageEvent(event);
  if (typeof str !== "string") return null;
  try {
    const parsed = JSON.parse(str);
    if (parsed && parsed !== null && typeof parsed === "object") {
      const app = parsed.app;
      if (typeof app === "string") {
        return {
          app: app,
        };
      }
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

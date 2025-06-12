export const tryStringifyMessageEvent = (event) => {
    if (typeof event.data === "string")
        return event.data;
    if (event.data instanceof Buffer) {
        try {
            const str = event.data.toString();
            return str || null;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    try {
        return event.data.toString();
    }
    catch (e) {
        console.error(e);
    }
    return null;
};
export const tryJSONParseEvent = (event) => {
    const str = tryStringifyMessageEvent(event);
    if (typeof str !== "string")
        return null;
    try {
        const parsed = JSON.parse(str);
        return parsed;
    }
    catch (e) {
        console.error(e);
        return null;
    }
};
export const tryParseMessageEvent = (event) => {
    const str = tryStringifyMessageEvent(event);
    if (typeof str !== "string")
        return null;
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
    }
    catch (e) {
        console.error(e);
        return null;
    }
};

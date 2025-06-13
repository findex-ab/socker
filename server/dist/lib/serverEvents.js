export var EServerEvent;
(function (EServerEvent) {
    EServerEvent["CLIENT_CONNECTION"] = "CLIENT_CONNECTION";
    EServerEvent["CLIENT_OPEN"] = "CLIENT_OPEN";
    EServerEvent["CLIENT_CLOSE"] = "CLIENT_CLOSE";
    EServerEvent["CLIENT_ERROR"] = "CLIENT_ERROR";
    EServerEvent["CLIENT_MESSAGE"] = "CLIENT_MESSAGE";
    EServerEvent["CLIENT_UPGRADE"] = "CLIENT_UPGRADE";
    EServerEvent["RECEIVED_HEADERS"] = "RECEIVED_HEADERS";
    EServerEvent["SERVER_ERROR"] = "SERVER_ERROR";
})(EServerEvent || (EServerEvent = {}));

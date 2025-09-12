export * from "./Auth";
export * from "./GroupMetadata";
export * from "./Chat";
export * from "./Contact";
export * from "./State";
export * from "./Message";
export * from "./Socket";
export * from "./Events";
export * from "./Product";
export * from "./Call";
export * from "./Signal";
export * from "./Newsletter";
export var DisconnectReason;
(function (DisconnectReason) {
    DisconnectReason[(DisconnectReason["connectionClosed"] = 428)] =
        "connectionClosed";
    DisconnectReason[(DisconnectReason["connectionLost"] = 408)] =
        "connectionLost";
    DisconnectReason[(DisconnectReason["connectionReplaced"] = 440)] =
        "connectionReplaced";
    DisconnectReason[(DisconnectReason["timedOut"] = 408)] = "timedOut";
    DisconnectReason[(DisconnectReason["loggedOut"] = 401)] = "loggedOut";
    DisconnectReason[(DisconnectReason["badSession"] = 500)] = "badSession";
    DisconnectReason[(DisconnectReason["restartRequired"] = 515)] =
        "restartRequired";
    DisconnectReason[(DisconnectReason["multideviceMismatch"] = 411)] =
        "multideviceMismatch";
    DisconnectReason[(DisconnectReason["forbidden"] = 403)] = "forbidden";
    DisconnectReason[(DisconnectReason["unavailableService"] = 503)] =
        "unavailableService";
})(DisconnectReason || (DisconnectReason = {}));

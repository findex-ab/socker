export class SockerClientConnection {
    constructor(socket, message) {
        this.socket = socket;
        this.connectedMessage = message;
    }
}

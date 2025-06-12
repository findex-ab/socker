import { SockerServer } from "./server";
class MyCounterApp {
    constructor() {
        this.name = 'counter';
    }
    init(server) {
        console.log('Counter app init!');
    }
    cleanup() {
        console.log('Cleanup counter app!');
    }
}
const main = async () => {
    const server = new SockerServer({
        host: '127.0.0.1',
        port: 44844
    });
    server.use(new MyCounterApp());
    server.start();
};
main().catch(e => console.error(e));

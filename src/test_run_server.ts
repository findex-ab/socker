import { SockerServer } from "./server";
import { IServerApp } from "./serverApp";


class MyCounterApp implements IServerApp {
  name: string = 'counter';
  
  init(server: SockerServer) {
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
}

main().catch(e => console.error(e));

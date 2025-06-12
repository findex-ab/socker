import { SockerServer } from 'socker';
import { MyCounterApp } from './apps/counter';

const main = async () => {
  const server = new SockerServer({
    host: '127.0.0.1',
    port: 44844
  });
  server.use(new MyCounterApp());
  server.start();
}

main().catch(e => console.error(e));

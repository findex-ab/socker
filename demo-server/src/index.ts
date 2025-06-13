import { SockerServer } from 'socker/server';
import { EServerEvent } from 'socker/server';
import { MyCounterApp } from './apps/counter';
import { FileUploadApp } from './apps/fileupload';

const main = async () => {
  console.log('hello world');
  const server = new SockerServer({
    host: '127.0.0.1',
    port: 44844
  });

  server.events.subscribe(EServerEvent.CLIENT_OPEN, (ev) => {
    console.log(`Hello client!`);
  })
  
  server.use(new MyCounterApp());
  server.use(new FileUploadApp());
  server.start();
}

main().catch(e => console.error(e));

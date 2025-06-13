import { AnyServerEvent, EServerEvent, SockerServer, type IServerApp } from '../../../server';
import { z } from 'zod';

export class MyCounterApp implements IServerApp {
  name: string = 'counter';
  
  init(server: SockerServer) {
    console.log('Counter app init!');

    server.defineMessageHook(this.name, {
      action: 'INCREMENT',
      parse: (store) => {
        return {
          action: store.getString('action')
        }
      },
      callback: (data) => {
        console.log('Received the increment!', data);
      }
    })
  }
  cleanup() {
    console.log('Cleanup counter app!');
  }
  onEvent(event: AnyServerEvent) {
    console.log(`I received an event`, event.eventType);
    if (event.eventType === EServerEvent.CLIENT_MESSAGE) {
    }
  }
}

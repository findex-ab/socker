import { AnyServerEvent, EServerEvent, SockerServer, tryStringifyMessageEvent, type IServerApp } from 'socker';

export class MyCounterApp implements IServerApp {
  name: string = 'counter';
  
  init(server: SockerServer) {
    console.log('Counter app init!');
  }
  cleanup() {
    console.log('Cleanup counter app!');
  }
  onEvent(event: AnyServerEvent) {
    console.log(`I received an event`, event.eventType);
    if (event.eventType === EServerEvent.CLIENT_MESSAGE) {
      console.log(tryStringifyMessageEvent(event));
    }
  }
}

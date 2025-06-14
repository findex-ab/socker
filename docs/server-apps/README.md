# Server Apps
The server architecture is "modular" and component-based,  
a component is called an "App"; here is where you implement your custom logic.

## Defining an App
You define an app by creating a class that implements the `IServerApp` interface.  
In this class you can hook into the message / event system.  
For example, you could define a function that should be called whenever a client sends a specific action.

### Minimal Example
```typescript
import { AnyServerEvent, EServerEvent, SockerServer, type IServerApp } from 'socker/server';
import { type SocketClient } from 'socker/client';
import { z } from 'zod';

type CounterState = {
  count: number;
}

const defaultState = (): CounterState => ({
  count: 0
});

export class MyCounterApp implements IServerApp {
  name: string = 'counter'; // The app needs to have a name
 
  // init() is called once the server has started
  init(server: SockerServer) {
    server.defineMessageHook(this.name, {
      action: 'INCREMENT',
      parse: (store) => {
        return z.object({
          action: z.string()
        }).parse(store.toJS())
      },
      callback: (data, ev) => {
        const [state, setState] = server.useClientState(this.name, ev.connection.id, defaultState());
        setState((state) => ({...state, count: state.count + 1}));
        console.log('Received the increment!', data, state);
      }
    });

    server.defineMessageHook(this.name, {
      action: 'DECREMENT',
      parse: (store) => {
        return z.object({
          action: z.string()
        }).parse(store.toJS())
      },
      callback: (data, ev) => {
        const [state, setState] = server.useClientState(this.name, ev.connection.id, defaultState());
        setState((state) => ({...state, count: state.count - 1}));
        console.log('Received the decrement!', data, state);
      }
    });
  }
  cleanup(client: SocketClient) {
    // This function is called when a client disconnects or unsubscribes from
    // your app.
    // It is important that you clean things up here if you have allocated something
    // during a client's session with your app,
    // otherwise; this will eat up RAM on the server.
  }
  onEvent(event: AnyServerEvent) {
    if (event.eventType === EServerEvent.CLIENT_MESSAGE) {
      // You can also act on messages here,
      // but then you have to validate the payload manually.
    }
  }
}
```
Note the use of `server.useClientState`:  
```typescript
[state, setState] = server.useClientState(...)
```
This is a utility that will automatically send state-changes to the client  
so that you don't have to think about it.  
Everytime you call `setState`, the following is sent to the client:
```typescript
{
  "app": "the-app-name",
  "action": "STATE_MERGED",
  "state": { ... } // your state
}
```

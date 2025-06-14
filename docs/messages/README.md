# Messages
The structure of socket messages

## Good to Know
All messages are sent and received in binary format  
but don't worry, `Socker` comes with some utilities to easily deal with this.

### Structure
You can think of a message as a key-value store (basically just an object),  
you can store whatever you want in these messages, however; there are some __reserved__ fields:  
```typescript
type Message = {
  app?: string;              // Which app to send the message to or the app you expect to receive a message from.
  action?: string;           // A specific action to perform.
  forwardTo?: Array<string>; // Client ID's which the message should be forwarded to.
  broadcast?: Array<string>; // Broadcast this message to all clients (or just the clients within the app if specified).
  [key: string]: any;        // Your custom fields.
}
```

#### Examples
```typescript
// Server App

import { BinaryKVStore } from 'socker/shared';
import { type AnyServerEvent, type IServerApp, EServerEvent } from 'socker/server';

class MyCounterApp extends IServerApp {
  ...
  onEvent(event: AnyServerEvent) {
    if (event.eventType === EServerEvent.CLIENT_MESSAGE) {
      if (event.data.getString("action") === 'INCREMENT') {
        this.incrementCounter();
        
        event.connection.send(BinaryKVStore.fromJS({
          app: this.name,
          action: 'INCREMENT_ACKNOWLEDGED',
          counter: this.count // My custom field
        }));
      }
    }
  }
  ...
} 

```

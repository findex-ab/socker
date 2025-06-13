import { EServerEvent } from '../../../server';
import { z } from 'zod';
const defaultState = {
    count: 0
};
export class MyCounterApp {
    name = 'counter';
    init(server) {
        console.log('Counter app init!');
        server.defineMessageHook(this.name, {
            action: 'INCREMENT',
            parse: (store) => {
                return z.object({
                    action: z.string()
                }).parse(store.toJS());
            },
            callback: (data, ev, server) => {
                const [state, setState] = server.useClientState(this.name, ev.connection.id, defaultState);
                setState((state) => ({ ...state, count: state.count + 1 }));
                console.log('Received the increment!', data, state);
            }
        });
    }
    cleanup() {
        console.log('Cleanup counter app!');
    }
    onEvent(event) {
        console.log(`I received an event`, event.eventType);
        if (event.eventType === EServerEvent.CLIENT_MESSAGE) {
        }
    }
}

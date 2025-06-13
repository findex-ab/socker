import { EServerEvent } from '../../../server';
import { z } from 'zod';
export class MyCounterApp {
    name = 'counter';
    init(server) {
        console.log('Counter app init!');
        server.defineMessageHook(this.name, {
            action: 'INCREMENT',
            parse: z.object({
                action: z.literal('INCREMENT')
            }).parse,
            callback: (data) => {
                console.log('Received the increment!', data);
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

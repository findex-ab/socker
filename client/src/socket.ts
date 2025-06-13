export const SocketImplementation = global.WebSocket || require('ws');
export type SocketType = InstanceType<typeof SocketImplementation>;

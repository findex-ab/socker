const _global = typeof global !== 'undefined' && typeof global.WebSocket !== 'undefined' ? global : typeof window !== 'undefined' ? window : undefined;


export const SocketImplementation = _global?.WebSocket || require('ws');
export type SocketType = InstanceType<typeof SocketImplementation>;

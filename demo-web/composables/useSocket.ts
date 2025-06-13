import { SocketClient } from "~client";

const SOCKET_PORT = 44844;
const SOCKET_HOST = 'localhost';
const SOCKET_URL = `ws://${SOCKET_HOST}:${SOCKET_PORT}`;


let socket: SocketClient | null = null;

export const useSocket = () => {
  if (socket) return socket;
  const sock = new SocketClient(new WebSocket(SOCKET_URL), '_');
  socket = sock;
  return sock;
}
//export type ISocketMessage = {
//  app?: string;
//  action?: string;
//  [key: string]: any;
//}
//
//export const useSocket = () => {
//  const socket = new WebSocket(SOCKET_URL);
//
//  const waitForSocket = async () => {
//    while (![WebSocket.OPEN, WebSocket.CLOSED].includes(socket.readyState as unknown as any)) {
//      await sleep(10);
//    }
//  }
//
//  const send = async (msg: BinaryKeyValueStore) => {
//    await waitForSocket();
//    socket.send(msg.toBinary());
//  }
//  
//  socket.addEventListener('open', (ev) => {
//    console.log(`OPEN`, ev);
//    const kv = new BinaryKeyValueStore();
//    kv.setString('app', 'counter');
//    kv.setString('message', 'hello');
//    socket.send(kv.toBinary());
//  });
//
//  return {
//    socket, send
//  }
//}

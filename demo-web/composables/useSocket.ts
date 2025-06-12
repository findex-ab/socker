const SOCKET_PORT = 44844;
const SOCKET_HOST = 'localhost';
const SOCKET_URL = `ws://${SOCKET_HOST}:${SOCKET_PORT}`;


export const useSocket = () => {
  const socket = new WebSocket(SOCKET_URL);
  socket.addEventListener('open', (ev) => {
    console.log(`OPEN`, ev);

    socket.send(JSON.stringify({
      app: 'counter',
      message: 'hello'
    }))
  })
}

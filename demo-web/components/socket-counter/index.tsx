import { BinaryKeyValueStore } from "~shared";

export const SocketCounter = defineComponent(() => {

  const socket = useSocket();

  const count = ref<number>(0);

  socket.onReady((sock) => {
    sock.socket.binaryType = "arraybuffer";
    sock.onMessage((data) => {
      console.log(`Got some data`, data);
    })
  })

  const increment = async () => {
    socket.send(BinaryKeyValueStore.fromJS({
      app: 'counter',
      action: 'INCREMENT'
    }));
  }

  const decrement = async () => {
    socket.send(BinaryKeyValueStore.fromJS({
      app: 'counter',
      action: 'DECREMENT'
    }));
  }
  
  return () => {
    return <div>
      <div class="w-full grid grid-cols-[max-content_max-content] gap-2">
        <button class="bg-blue-500 text-white px-2 py-1" onClick={increment}>Increment</button>
        <button class="bg-red-500 text-white px-2 py-1" onClick={decrement}>Decrement</button>
      </div>
    </div>;
  }
})

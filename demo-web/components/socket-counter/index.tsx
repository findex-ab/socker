import { BinaryKeyValueStore } from "socker/shared";

export const SocketCounter = defineComponent(() => {

  const socket = useSocket();

  const count = ref<number>(0);

  socket.onReady((sock) => {
    sock.onMessage((data) => {
      if (data.getString('app') === 'counter') {
        const state = data.getKeyValueStore('state');
        if (state) {
          count.value = state.getNumber('count');
        }
      }
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
    return <div class="grid grid-cols-[max-content_max-content]">
      <div class="w-[5rem] h-[3rem] bg-gray-200 border border-gray-300 text-gray-500 grid items-center justify-center font-semibold text-sm">
        {count.value}
      </div>
      <div class="grid items-center px-2 py-1">
        <div class="w-full grid grid-cols-[max-content_max-content] gap-2">
          <button class="bg-blue-500 text-white px-2 py-2 hover:bg-blue-400 cursor-pointer rounded-sm text-sm" onClick={increment}>Increment</button>
          <button class="bg-red-500 text-white px-2 py-2 hover:bg-red-400 cursor-pointer rounded-sm text-sm" onClick={decrement}>Decrement</button>
        </div>
      </div>
    </div>;
  }
})

import { BinaryKeyValueStore } from "../shared";

export default defineComponent(() => {

  const socket = useSocket();

  const increment = async () => {
    const msg = new BinaryKeyValueStore();
    msg.setString('app','counter');
    msg.setString('action', 'INCREMENT');
    await socket.send(msg);
  }
  
  return () => {
    return <div>
      <button class="bg-blue-500 text-white px-2 py-1" onClick={increment}>Increment</button>
    </div>;
  }
})

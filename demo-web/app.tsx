import { SocketCounter } from "@components/socket-counter";
import { SocketFileUpload } from "@components/socket-fileupload";

export default defineComponent(() => {
  
  return () => {
    return <div class="w-full h-full">
      <div class="border border-gray-200 p-2">
        <SocketCounter/>
      </div>
      <div class="border border-gray-200 p-2">
        <SocketFileUpload/>
      </div>
    </div>;
  }
})

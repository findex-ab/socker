import { useFileDialog } from "../../.nuxt/imports";

export const SocketFileUpload = defineComponent(() => {
  const socket = useSocket();
  
  const diag = useFileDialog();
  diag.onChange((files) => {
    if (!files) return;
    if (files.length <= 0) return;
    console.log(files)
    const file = files[0];
    socket.transfer({
      name: file.name,
      data: file,
      app: 'fileUpload',
      onProgress: (_sock, bytesSent, totalBytes) => {
        const progress = bytesSent / Math.max(1.0, totalBytes)
        console.log(`progress: ${progress}`);
      },
      onFinish: (_sock, ok) => {
        console.log(`Finished: ok=${ok}`);
      }
    })
    
  });
  const handleUpload = () => {
    diag.open({
      
    })
  }
  
  return () => {
    return <div>
      
        <button class="bg-green-500 text-white px-2 py-1" onClick={handleUpload}>Upload</button>
    </div>;
  }
})

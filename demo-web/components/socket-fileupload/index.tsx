import { useFileDialog } from "../../.nuxt/imports";

export const SocketFileUpload = defineComponent(() => {
  const socket = useSocket();
  const diag = useFileDialog();

  const uploadProgress = ref<number>(0);
  const isUploading = ref<boolean>(false);

  diag.onChange((files) => {
    if (!files) return;
    if (files.length <= 0) return;
    console.log(files);
    const file = files[0];
    uploadProgress.value = 0;
    isUploading.value = true;
    socket.transfer({
      name: file.name,
      data: file,
      app: "fileUpload",
      onProgress: (_sock, bytesSent, totalBytes) => {
        const progress = bytesSent / Math.max(1.0, totalBytes);
        uploadProgress.value = progress;
        console.log(`progress: ${progress}`);
      },
      onFinish: (_sock, ok) => {
        console.log(`Finished: ok=${ok}`);

        setTimeout(() => {
          isUploading.value = false;
          uploadProgress.value = 0.0;
        }, 1000);
      },
    });
  });
  const handleUpload = () => {
    diag.open({});
  };

  return () => {
    return (
      <div>
        <div class="grid grid-cols-[max-content_max-content]">
          <div class="p-1">
            <button
              class="bg-green-500 text-white px-2 py-2 hover:bg-green-400 cursor-pointer rounded-sm text-sm"
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
          <div class="p-1 w-[300px] grid items-center relative">
            <div class="w-full h-[2rem] bg-gray-200 border border-gray-300 grid items-center py-1">
              <div
                class="bg-blue-500 h-full grid items-center justify-center"
                style={{
                  width: `${uploadProgress.value * 100.0}%`,
                }}
              ></div>
            </div>
            {isUploading.value && (
              <div class={[
                "text-white font-semibold",
                "text-center absolute inset-0 w-full h-full",
                "grid items-center justify-center"
              ]}>{`${(uploadProgress.value * 100).toFixed(1)}%`}</div>
            )}
          </div>
        </div>
      </div>
    );
  };
});

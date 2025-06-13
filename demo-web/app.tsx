import { SocketCounter } from "@components/socket-counter";
import { SocketFileUpload } from "@components/socket-fileupload";

const DemoWrapper = defineComponent<{
  title: string;
}>((props, { slots }) => {
  return () => {
    return <div class="border border-gray-200 p-2">
      <div class="grid grid-auto-rows gap-1">
        <div class="font-semibold text-gray-900 text-lg py-2">
            { props.title }
        </div>
        <div>
            { slots.default ? slots.default() : '' }
        </div>
      </div>
    </div>;
  }
}, { props: ['title'] })


export default defineComponent(() => {
  
  return () => {
    return <div class="w-full h-full">
      <DemoWrapper title="Counter">
        <SocketCounter/>
      </DemoWrapper>
      <DemoWrapper title="File Upload">
        <SocketFileUpload/>
      </DemoWrapper>
    </div>;
  }
})

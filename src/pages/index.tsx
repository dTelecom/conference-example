import {generateRoomId} from "@/lib/client-utils"
import {Button} from "@/components/ui"
import {useRouter} from "next/router"

export default function IndexPage() {
  const {push} = useRouter()

  return (
    <section className="items-startpx-4 container mx-auto flex max-w-[680px] flex-1 flex-col pt-6 pb-8 md:py-10">
      <div className="mx-auto my-auto flex w-full flex-col items-center gap-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-5xl lg:text-5xl">
          Create a meeting
        </h1>
        <Button
          onClick={() => void push(`/room/${generateRoomId()}`)}
          variant={'default'}
        >
          Create room
        </Button>
      </div>
    </section>
  )
}

import {Icons} from "@/components/ui"
import Link from "next/link"

export function NavBar() {
  return (
    <header className="h-15 absolute top-0 z-40 w-full border-b border-b-zinc-200 bg-white px-4 dark:border-b-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto flex h-12 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link
            href="/"
            className="items-center space-x-2 md:flex"
          >
            <Icons.zap className="h-6 w-6"/>
          </Link>
        </div>
      </div>
    </header>
  )
}

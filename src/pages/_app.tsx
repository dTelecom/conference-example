import {NavBar} from "@/components/NavBar"
import {api} from "@/lib/api"
import '@livekit/components-styles'
import '@livekit/components-styles/prefabs'
import "@/styles/globals.css"
import {type AppType} from "next/app"
import {ThemeProvider} from "next-themes"

const MyApp: AppType = ({Component, pageProps}) => {
  return (
    <ThemeProvider forcedTheme={'dark'}>
      <main
        data-lk-theme="default"
      >
        <NavBar/>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default api.withTRPC(MyApp)

import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import { type AppType } from "next/app";
import { ThemeProvider } from "next-themes";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider forcedTheme={"dark"}>
      <main data-lk-theme="default">
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
};

export default MyApp;

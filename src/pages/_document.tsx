import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            property="description"
            content="dMeet is a free, open-source web app for audio/video conferences with a built-in Al translator. Create meetings, Invite friends, & Earn points. Powered by dTelecom."
          />

          <meta property="og:site_name" content="dMeet | Web3 Meeting App" />

          <meta property="og:image:type" content="image/png" />

          <meta property="og:image" content="/og.jpg" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin={""}
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.png" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

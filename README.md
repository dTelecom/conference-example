## Demo

Try it for free at https://dmeet.org

An open source video conferencing application built on dTelecom components and decentralized servers.

## Deploying

This demo is a Next.js app. You can deploy to your Vercel account with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dTelecom/conference-example&env=API_KEY,API_SECRET&envDescription=Sign%20up%20for%20an%20account%20at%20https://cloud.dtelecom.org%20and%20create%20an%20API%20key%20in%20the%20Project%20Settings%20UI)

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more about deploying to a production environment.

## Creating and connecting database

1. Open https://vercel.com/dashboard/stores
2. Click "Create" at Postgress (Beta)
3. Select storage type "Postgress" and press "Continue"
4. Type database name, select location and press "Create"
5. Press "Connect Project" in "Getting started" section, select your project
6. Redeploy your project

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:dTelecom/conference-example.git
cd conference-example
npm install
```

Create a new project at <https://cloud.dtelecom.org>. Then create a new key in your [project settings](https://cloud.dtelecom.org/settings).

Edit `.env.development` file to add your new API key and secret

```
API_KEY=<your api key>
API_SECRET=<your api secret>
```

To use webhooks locally add url pointed to deployment without protocol:

```
VERCEL_URL=<url>
```

Then run the development server:

```bash
npm run dev
```

You can test it by opening <http://localhost:3000> in a browser.

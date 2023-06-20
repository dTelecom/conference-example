## Deploying

This demo is a Next.js app. You can deploy to your Vercel account with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dTelecom/conference-example&env=API_KEY,API_SECRET&envDescription=Sign%20up%20for%20an%20account%20at%20https://test-cloud.dtelecom.org%20and%20create%20an%20API%20key%20in%20the%20Project%20Settings%20UI)

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more about deploying to a production environment.

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:dTelecom/conference-example.git
cd conference-example
npm install
```

Create a new project at <https://test-cloud.dtelecom.org>. Then create a new key in your [project settings](https://test-cloud.dtelecom.org/settings).

Edit `.env.development` file to add your new API key and secret

```
API_KEY=<your api key>
API_SECRET=<your api secret>
```

Then run the development server:

```bash
npm run dev
```

You can test it by opening <http://localhost:3000> in a browser.

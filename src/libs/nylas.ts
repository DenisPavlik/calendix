import Nylas from "nylas";

export const nylasConfig = {
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET ?? process.env.NYLAS_API_KEY,
  callbackUri: `${process.env.NEXT_PUBLIC_URL as string}/api/oauth/exchange`,
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

export const nylas = new Nylas({
  apiKey: nylasConfig.apiKey as string,
  apiUri: nylasConfig.apiUri,
});

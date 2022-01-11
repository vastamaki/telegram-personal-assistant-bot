import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: "POST /",
    },
  ],
  environment: {
    BOT_TOKEN: process.env.BOT_TOKEN,
  },
};

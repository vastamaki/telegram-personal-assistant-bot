import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [],
  environment: {
    BOT_TOKEN: process.env.BOT_TOKEN,
  },
};

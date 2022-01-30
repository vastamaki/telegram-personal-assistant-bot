import { CustomContext } from "@functions/handler/handler";

export default async (ctx: CustomContext) => {
  await ctx.telegram.setMyCommands([
    {
      command: "start",
      description: "Starts bot and registers your user",
    },
    {
      command: "set_location",
      description:
        "Allows user to store location and activate commands that are requiring location data",
    },
    {
      command: "weather",
      description:
        "Returns weather based on location stored using /set_location command",
    },
    {
      command: "set_rss",
      description: "Allows user to store rss urls for /rss command",
    },
    {
      command: "rss",
      description:
        "Returns titles and links of rss feeds that user has stored using /set_rss command",
    },
    {
      command: "empty",
      description: "Clears waiting state",
    },
    {
      command: "cmc",
      description:
        "Usage: /cmc add {symbol}, /cmc remove {symbol}, /cmc, returns cryptocurrency prices based on stored data to the user",
    },
    {
      command: "reload",
      description: "Reloads this list of commands",
    },
  ]);
};

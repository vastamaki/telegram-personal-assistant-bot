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
        "Returns weather based on location stored using /setLocation command",
    },
    {
      command: "empty",
      description: "Clears waiting state",
    },
    {
      command: "cmc",
      description:
        "Usage: /cmc add {symbol}, /cmc remove {symbol}, /cmc, returns cryptocurency prices based on stored data to the user",
    },
    {
      command: "reload",
      description: "Reloads this list of commands",
    },
  ]);
};

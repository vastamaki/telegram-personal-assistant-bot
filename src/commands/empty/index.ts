import * as ddb from "@libs/dynamodb";

export default async (ctx: any) => {
  const userId = ctx.update.message.from.id.toString();
  const typeToWait = await ddb.getWaitingFor({
    userId,
  });

  switch (typeToWait) {
    case "location":
      const user = await ddb.getUser({ userId });
      if (user?.location) {
        await ddb.removeLocation({ userId });
        await ddb.removeWaitingFor({ userId });
        await ctx.reply("Location removed!");
      } else {
        await ctx.reply("No location info to remove!");
      }
      break;
  }
};

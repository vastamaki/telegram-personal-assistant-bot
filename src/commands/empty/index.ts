import * as ddb from "@libs/dynamodb";
import { CustomContext } from "@functions/handler/handler";

export default async (ctx: CustomContext) => {
  const userId = ctx.data.user.id;
  const typeToWait = await ddb.getWaitingFor({
    userId,
  });

  switch (typeToWait) {
    case "location": {
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
    case "rss": {
      const user = await ddb.getUser({ userId });
      if (user?.rss?.length > 0) {
        await ddb.removeRss({ userId });
        await ddb.removeWaitingFor({ userId });
        await ctx.reply("Rss feed urls removed!");
      } else {
        await ctx.reply("No rss feed urls to remove!");
      }
      break;
    }
  }
};

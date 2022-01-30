import * as Joi from "joi";
import * as ddb from "@libs/dynamodb";
import { CustomContext } from "@functions/handler/handler";

const schema = Joi.array().items(
  Joi.string().uri({ scheme: ["http", "https"] })
);

export const handleSetRss = async (ctx: CustomContext) => {
  try {
    const { data } = ctx;
    const userId = data.user.id;

    const rssUrls = data.text
      .replace(" ", "\n")
      .split("\n")
      .map((url) => url.trim());

    try {
      await schema.validateAsync(rssUrls);
    } catch (error) {
      console.error(error);
      await ctx.reply(
        "Hmm, validation error happened with given rss feed urls..."
      );
      return;
    }

    await ddb.storeRss({ userId, rssUrls });
    await ddb.removeWaitingFor({ userId });
    await ctx.reply("Great, rss feed urls saved!");
  } catch (error) {
    console.error(error);
    await ctx.reply("Setting rss feed urls failed. :'(");
  }
};

export default async (ctx: CustomContext) => {
  const { data } = ctx;
  const userId = data.user.id;

  // waiting for rss, but user sent command -> remove waiting for
  if (await ddb.getWaitingFor({ userId })) {
    await ddb.removeWaitingFor({ userId });
    await ctx.reply("Setting rss feed urls cancelled.");
    return;
  }

  await ddb.storeWaitingFor({
    userId: userId,
    type: "rss",
  });
  await ctx.reply(
    "Ok, send your rss feed urls so we can save them for later use. Use line break or space to separate urls. Use /set_rss command again to cancel, /empty command to remove the current information."
  );
};

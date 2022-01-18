import { registerUser } from "@libs/dynamodb";
import { CustomContext } from "@functions/handler/handler";

export default async (ctx: CustomContext) => {
  const { data } = ctx;
  try {
    await registerUser({
      userId: data.user.id,
      username: data.user.username,
    });

    await ctx.reply("Hey there! You are now registered! :)");
  } catch (err) {
    if (err.code === "ConditionalCheckFailedException") {
      await ctx.reply("You are already registered! :)");
    } else {
      console.error(err);
      await ctx.reply("Oops.. Something went wrong :(");
    }
  }
};

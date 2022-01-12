import { registerUser } from "@libs/dynamodb";

export default async (ctx: any) => {
  try {
    await registerUser({
      userId: ctx.update.message.from.id.toString(),
      username: ctx.update.message.from.username,
    });

    await ctx.reply("Hey there! You are now registered! :)");
  } catch (err) {
    console.error(err);

    await ctx.reply("Oops.. Something went wrong :(");
  }
};

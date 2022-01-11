import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { Telegraf } from "telegraf";

// Project imports
import startCommand from "@commands/start";

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
});

const handler: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  bot.command("/start", async (ctx) => await startCommand(ctx));

  bot.on(
    "message",
    async (ctx) => await ctx.telegram.sendCopy(ctx.chat.id, ctx.message)
  );

  await bot.handleUpdate(event.body);

  return formatJSONResponse({
    message: `Ok!`,
  });
};

export const main = middyfy(handler);

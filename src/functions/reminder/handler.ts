import { Telegraf } from "telegraf";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
});

const handler: ValidatedEventAPIGatewayProxyEvent<any> = async (event: any) => {
  const { chatId, message } = event;
  await bot.telegram.sendMessage(chatId, message);

  return formatJSONResponse({
    message: `Ok!`,
  });
};

export const main = middyfy(handler);

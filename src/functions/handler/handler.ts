import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import * as ddb from "@libs/dynamodb";

import { Telegraf } from "telegraf";

// Project imports
import startCommand from "@commands/start";
import cmcCommand from "@commands/cmc-price";
import {
  default as setLocationCommand,
  handleSetLocation,
} from "@commands/setLocation";
import weatherCommand from "@commands/weather";
import emptyCommand from "@commands/empty";

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
});

const handler: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  bot.command("/start", async (ctx) => await startCommand(ctx));
  bot.command("/setLocation", async (ctx) => await setLocationCommand(ctx));
  bot.command("/weather", async (ctx) => await weatherCommand(ctx));

  bot.command("/empty", async (ctx) => await emptyCommand(ctx));

  bot.command("/cmc", async (ctx) => await cmcCommand(ctx));

  bot.on("message", async (ctx) => {
    // check if there are replys to wait for
    const typeToWait = await ddb.getWaitingFor({
      userId: ctx.update.message.from.id.toString(),
    });

    switch (typeToWait) {
      case "location":
        await handleSetLocation(ctx);
        break;
    }
    // ctx.telegram.sendCopy(ctx.chat.id, ctx.message)
  });

  await bot.handleUpdate(event.body);

  return formatJSONResponse({
    message: `Ok!`,
  });
};

export const main = middyfy(handler);

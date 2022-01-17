import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import * as ddb from "@libs/dynamodb";

import { Telegraf, Context } from "telegraf";

// Project imports
import startCommand from "@commands/start";
import cmcCommand from "@commands/cmc-price";
import {
  default as setLocationCommand,
  handleSetLocation,
} from "@commands/setLocation";
import weatherCommand from "@commands/weather";
import emptyCommand from "@commands/empty";
import reminderCommand from "@commands/reminder";

export class CustomContext extends Context {
  data: {
    messageId: string;
    date: Date;
    text: string;
    location: {
      longitude: string;
      latitude: string;
    };
    args: string[];
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  };
}

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: true },
  contextType: CustomContext,
});

const handler: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    bot.use((ctx, next) => {
      console.log(ctx);
      const {
        update: { message },
      } = ctx;
      ctx.data = {
        messageId: message.message_id,
        date: message.date,
        text: message.text,
        location: message.location || {},
        args: message.text?.split(" ").slice(1),
        user: {
          id: message.from.id.toString(),
          username: message.from.username,
          firstName: message.from.first_name,
          lastName: message.from.last_name,
        },
      };
      return next();
    });
    bot.command("/start", async (ctx) => await startCommand(ctx));
    bot.command("/setLocation", async (ctx) => await setLocationCommand(ctx));
    bot.command("/weather", async (ctx) => await weatherCommand(ctx));

    bot.command("/empty", async (ctx) => await emptyCommand(ctx));

    bot.command("/cmc", async (ctx) => await cmcCommand(ctx));

    bot.command("/remind", async (ctx) => await reminderCommand(ctx, event));

    bot.on("message", async (ctx) => {
      const { data } = ctx;
      // check if there are replys to wait for
      const typeToWait = await ddb.getWaitingFor({
        userId: data.user.id,
      });

      switch (typeToWait) {
        case "location":
          await handleSetLocation(ctx);
          break;
      }
    });

    await bot.handleUpdate(event.body);
  } catch (err) {
    console.error("UNKNOWN ERROR", err);
  }

  return formatJSONResponse({
    message: `Ok!`,
  });
};

export const main = middyfy(handler);

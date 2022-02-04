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
import { default as setRssCommand, handleSetRss } from "@commands/setRss";
import weatherCommand from "@commands/weather";
import rssCommand from "@commands/rss";
import emptyCommand from "@commands/empty";
import reminderCommand from "@commands/reminder";
import reloadCommand from "@commands/reload";

export class CustomContext extends Context {
  data: {
    messageId: string;
    date: Date;
    text: string;
    location: {
      longitude: number;
      latitude: number;
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
      } = ctx as any;
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
    bot.command("/set_location", async (ctx) => await setLocationCommand(ctx));
    bot.command("/weather", async (ctx) => await weatherCommand(ctx));
    bot.command("/set_rss", async (ctx) => await setRssCommand(ctx));
    bot.command("/rss", async (ctx) => await rssCommand(ctx));

    bot.command("/empty", async (ctx) => await emptyCommand(ctx));

    bot.command("/cmc", async (ctx) => await cmcCommand(ctx));

    bot.command("/remind", async (ctx) => await reminderCommand(ctx));

    bot.command("/reload", async (ctx) => {
      await reloadCommand(ctx);
      await ctx.reply("Commands reloaded!");
    });

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
        case "rss":
          await handleSetRss(ctx);
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

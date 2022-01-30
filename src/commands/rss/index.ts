import { CustomContext } from "@functions/handler/handler";
import { getRss } from "@libs/dynamodb";

const Parser = require("rss-parser");

interface IFeedItem {
  title: string;
  link: string;
}

interface IFeed {
  title: string;
  items: IFeedItem[];
}

const parser = new Parser();

export default async (ctx: CustomContext) => {
  try {
    const rssUrls = await getRss({ userId: ctx.data.user.id });

    if (rssUrls?.length === 0) {
      await ctx.reply(
        "You need to set up rss url feeds with /set_rss to use /rss command."
      );
      return;
    }

    const rssData: IFeed[] = await Promise.all(
      rssUrls.map(async (url) => {
        const { title, items }: IFeed | any = await parser.parseURL(url);
        return {
          title,
          items: items
            .slice(0, 3)
            .map(({ title, link }) => `${title}\n${link}`)
            .join("\n\n"),
        };
      })
    );

    const message = rssData
      .map(({ title, items }) => `*${title}*\n\n${items}`)
      .join("\n\n\n");

    await ctx.reply(message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error(error);
    await ctx.reply("Fetching information from rss failed :/");
  }
};

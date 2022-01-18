import {
  getCryptocurrencies,
  removeStoredCrypto,
  storeNewCrypto,
} from "@libs/dynamodb";

import { CustomContext } from "@functions/handler/handler";

const { CMC_API_KEY } = process.env;

import CoinMarketCap from "coinmarketcap-api";
const cmc_client = new CoinMarketCap(CMC_API_KEY);

export default async (ctx: CustomContext) => {
  const { data } = ctx;

  switch (data.args[0]) {
    case "add":
      await addCrypto(ctx);
      break;
    case "remove":
      await removeCrypto(ctx);
      break;
    default:
      await getCryptoValues(ctx);
      break;
  }
};

interface CoinMarketCapData {
  data: {
    [key: string]: CMCData;
  };
}

interface CMCData {
  name: string;
  quote: {
    USD: {
      price: number;
    };
  };
}

const getCryptoValues = async (ctx: CustomContext) => {
  const cryptos = await getCryptocurrencies({ userId: ctx.data.user.id });

  try {
    const { data }: CoinMarketCapData = await cmc_client.getQuotes({
      symbol: cryptos,
    });
    const message = `
    ${Object.keys(data)
      .map((key: string) => {
        const {
          name,
          quote: { USD },
        } = data[key];
        const price = USD.price < 1 ? USD.price : USD.price.toFixed(2);
        return `_${name} ${price}_`;
      })
      .join("\n")}
    `;

    await ctx.reply(message, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("Failed to get data for cryptocurrencies :/");
  }
};

const addCrypto = async (ctx: CustomContext) => {
  try {
    const { data }: CoinMarketCap = await cmc_client.getQuotes({
      symbol: ctx.data.args[1],
    });

    if (!data) {
      return ctx.reply(
        `Looks like ${ctx.data.args[1]} doesn't exist on CoinMarketCap yet :(`
      );
    }
    
    await storeNewCrypto({
      userId: ctx.data.user.id,
      symbol: ctx.data.args[1],
    });
    await ctx.reply(`I added ${ctx.data.args[1]} to your watchlist! :)`);
  } catch (err) {
    console.error(err);
    await ctx.reply(
      "Ooops... Failed to store new cryptocurrency to watchlist :("
    );
  }
};

const removeCrypto = async (ctx: CustomContext) => {
  try {
    await removeStoredCrypto({
      userId: ctx.data.user.id,
      symbol: ctx.data.args[1],
    });
    await ctx.reply(`I removed ${ctx.data.args[1]} from the watchlist! :)`);
  } catch (err) {
    console.error("FAILED TO REMOVE CRYPTOCURRENCY: ", err);
    await ctx.reply("Failed to remove crypto from watchlist :(");
  }
};

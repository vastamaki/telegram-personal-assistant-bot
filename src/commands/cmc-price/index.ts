import {
  getCryptocurrencies,
  removeStoredCrypto,
  storeNewCrypto,
} from "@libs/dynamodb";

const { CMC_API_KEY } = process.env;

import CoinMarketCap from "coinmarketcap-api";
const cmc_client = new CoinMarketCap(CMC_API_KEY);

export default async (ctx: any) => {
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

const getCryptoValues = async (ctx: any) => {
  const cryptos = await getCryptocurrencies({ userId: ctx.data.user.id });

  try {
    const { data } = await cmc_client.getQuotes({ symbol: cryptos });
    const message = `
    ${Object.keys(data)
      .map((key: any) => {
        const {
          name,
          quote: { USD },
        } = data[key];
        const price =
          USD.price < 1 ? USD.price : parseFloat(USD.price).toFixed(2);
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

const addCrypto = async (ctx: any) => {
  try {
    const { data } = await cmc_client.getQuotes({ symbol: ctx.data.args[1] });

    if (data) {
      await storeNewCrypto({
        userId: ctx.data.user.id,
        symbol: ctx.data.args[1],
      });
      await ctx.reply(`I added ${ctx.data.args[1]} to your watchlist! :)`);
    } else {
      await ctx.reply(
        `Looks like ${ctx.data.args[1]} doesn't exist on CoinMarketCap yet :(`
      );
    }
  } catch (err) {
    console.error(err);
    await ctx.reply(
      "Ooops... Failed to store new cryptocurrency to watchlist :("
    );
  }
};

const removeCrypto = async (ctx: any) => {
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

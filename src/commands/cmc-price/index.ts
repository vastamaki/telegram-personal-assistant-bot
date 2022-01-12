export default async (ctx: any) => {
  const {
    update: { message },
  } = ctx;

  const args = message.text.replace("/cmc", "").trim().split(" ");

  console.log(args);

  switch (args[0]) {
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

const getCryptoValues = async (ctx) => {
  await ctx.reply("get crypto values");
};

const addCrypto = async (ctx) => {
  await ctx.reply("Add new");
};

const removeCrypto = async (ctx) => {
  await ctx.reply("remove old");
};

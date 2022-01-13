import * as ddb from "@libs/dynamodb";
import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({
  provider: "google",
  apiKey: process.env.GOOGLE_GEOCODING_API_KEY,
});

export const handleSetLocation = async (ctx: any) => {
  try {
    const userId = ctx.update.message.from.id.toString();
    const { latitude, longitude } = ctx.update?.message?.location || {};

    if (!latitude || !longitude) {
      throw Error("Latitude and/or longitude missing");
    }

    const [{ city, country }] = (await geocoder.reverse({
      lat: latitude,
      lon: longitude,
    })) || [{}];

    if (!city || !country) {
      throw Error("Reverse goecoding failed");
    }

    await ddb.storeLocation({
      userId,
      location: { latitude, longitude, place: { city, country } },
    });
    await ddb.removeWaitingFor({ userId });
    await ctx.reply("Great, location saved!");
  } catch (error) {
    console.error();
    await ctx.reply("Setting location failed. :'(");
  }
};

export default async (ctx: any) => {
  const userId = ctx.update.message.from.id.toString();

  // waiting for location, but user sent command -> remove waiting for
  if (await ddb.getWaitingFor({ userId })) {
    await ddb.removeWaitingFor({ userId });
    await ctx.reply("Setting location cancelled.");
    return;
  }

  await ddb.storeWaitingFor({
    userId: ctx.update.message.from.id.toString(),
    type: "location",
  });
  await ctx.reply(
    "Ok, send your location so we can save it for later use. Use /setLocation command again to cancel, /empty command to remove the current information."
  );
};

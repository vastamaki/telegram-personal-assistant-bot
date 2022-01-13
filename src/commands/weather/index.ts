import { getUser } from "@libs/dynamodb";
import { getForecast } from "@libs/weather-api";

export default async (ctx: any) => {
  const user = await getUser({ userId: ctx.update.message.from.id.toString() });

  if (!user?.location) {
    await ctx.reply(
      "You need to set up the location with /setLocation to use /weather command."
    );
    return;
  }

  try {
    const { properties }: any = await getForecast(user.location);

    const airTemperatureUnit = properties.meta.units.air_temperature;
    const { data } = properties.timeseries[0] || {};
    const airTemperature: string =
      data.instant.details.air_temperature.toString();

    if (!airTemperature || !airTemperatureUnit) {
      throw Error("Temperature fetching failed");
    }

    const { city, country } = user.location.place;

    await ctx.reply(`
      ${city}, ${country}
      Temperature now: ${airTemperature} ${airTemperatureUnit}
    `);
  } catch (error) {
    console.error(error);
    await ctx.reply("Weather forecast fetching failed :/");
  }
};

import { CustomContext } from "@functions/handler/handler";
import { getUser } from "@libs/dynamodb";
import { getLegends, getForecast } from "@libs/weather-api";

export default async (ctx: CustomContext) => {
  try {
    const user = await getUser({ userId: ctx.data.user.id });

    if (!user?.location) {
      await ctx.reply(
        "You need to set up the location with /setLocation to use /weather command."
      );
      return;
    }

    const [forecast, legends]: any = await Promise.all([
      getForecast(user.location),
      getLegends(),
    ]);

    const { data } = forecast.properties.timeseries[0];

    const units = forecast.properties.meta.units;
    const details = data.instant.details;

    const weather = {
      airTemperature: {
        unit: units.air_temperature,
        value: details.air_temperature.toString(),
      },
      wind: {
        unit: units.wind_speed,
        value: details.wind_speed,
      },
      windOfGust: {
        value: details.wind_speed_of_gust,
      },
      nextSixHours: {
        value: legends[data.next_6_hours.summary.symbol_code].desc_en,
      },
    };

    const { city, country } = user.location.place;

    await ctx.reply(
      `${city}, ${country} 🌡️ 🌬️

      _* Air temperature: ${weather.airTemperature.value} ${weather.airTemperature.unit}_
      _* Wind: ${weather.wind.value} ${weather.wind.unit}_
      _* Wind of gust: ${weather.windOfGust.value} ${weather.wind.unit}_
      _* Next 6 hours: ${weather.nextSixHours.value}_`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("Weather forecast fetching failed :/");
  }
};

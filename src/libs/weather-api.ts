import fetch from "node-fetch";

const metnoUrl = "https://api.met.no/weatherapi/locationforecast/2.0/complete";
const userAgent = {
  appName: "TelegramPersonalAssistantBot",
  repo: "https://github.com/vastamaki/telegram-personal-assistant-bot",
};

export const getForecast = async ({ latitude, longitude }) => {
  return fetch(`${metnoUrl}?lat=${latitude}&lon=${longitude}`, {
    headers: {
      "User-Agent": Object.values(userAgent).join(" "),
      Accept: "application/json",
    },
  }).then((res) => res.json());
};

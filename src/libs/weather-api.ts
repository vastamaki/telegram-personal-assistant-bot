import fetch from "node-fetch";

const weatherApiUrl = "https://api.met.no/weatherapi/";
const endpoints = {
  forecast: "locationforecast/2.0/complete",
  legends: "weathericon/2.0/legends",
};

const userAgent = {
  appName: "TelegramPersonalAssistantBot",
  repo: "https://github.com/vastamaki/telegram-personal-assistant-bot",
};

const options = {
  headers: {
    "User-Agent": Object.values(userAgent).join(" "),
    Accept: "application/json",
  },
};

export const getForecast = async ({ latitude, longitude }) => {
  return fetch(
    `${weatherApiUrl + endpoints.forecast}?lat=${latitude}&lon=${longitude}`,
    options
  ).then((res) => res.json());
};

export const getLegends = async () => {
  return fetch(`${weatherApiUrl + endpoints.legends}`, options).then((res) =>
    res.json()
  );
};

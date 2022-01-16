import { default as nodeFetch } from "node-fetch";

export const fetch = async (url: string, options: {}): Promise<any> => {
  const rawResponse = await nodeFetch(url, options);
  return rawResponse.json();
};

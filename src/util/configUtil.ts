import { DestinationStream, LoggerOptions } from "pino";

type Logger = "system" | "client";
export interface Config {
  loggers: {
    [key in Logger]: LoggerOptions | DestinationStream | undefined;
  };
}

/**
 * Read and parse config from JSON file
 *
 * Requires `allow-read` for config file
 */
export const getConfig = function getConfigFromJSONFile(
  path: string,
): Config {
  const rawConfig = Deno.readTextFileSync(path);
  const parsedConfig = JSON.parse(rawConfig);

  return parsedConfig;
};

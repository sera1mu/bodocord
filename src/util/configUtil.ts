import { DestinationStream, LoggerOptions } from "pino";

/**
 * Logger name
 */
export type Logger = "system" | "client";

/**
 * Configuration file
 */
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

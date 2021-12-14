import { LoggerOptions, DestinationStream } from "pino";

type Logger = "system" | "client";
export interface Config {
  loggers: {
    [key in Logger]: LoggerOptions | DestinationStream | undefined;
  }
}

/**
 * Read and parse config from script
 *
 * Requires `allow-read` for config file
 */
export const getConfig = async function getConfigFromScript(
  filePath: string,
): Promise<Config> {
  const config = await import(filePath);
  // Re-parse because imported config includes `[object]`
  const parsedConfig = JSON.parse(JSON.stringify(config));

  return parsedConfig;
};

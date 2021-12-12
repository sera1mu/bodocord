import { LogConfig } from "std/log";

export interface Config {
  logConfig: LogConfig;
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

  return config;
};

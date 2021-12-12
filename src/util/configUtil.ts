import { LogConfig } from 'std/log';

export interface Config {
  logConfig: LogConfig;
}

/**
 * Read and parse config from file system
 * 
 * Requires `allow-read` for config file
 */
export const getConfig = function getConfigFromFileSystem(filePath: string): Config {
  const rawConfig = Deno.readTextFileSync(filePath);
  const parsedConfig = JSON.parse(rawConfig);

  return parsedConfig;
} 
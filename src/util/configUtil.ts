import { DestinationStream, LoggerOptions } from "pino";

export type Logger = "system" | "client";

export interface Config {
  /**
   * 各種ロガーの設定
   */
  loggers: {
    [key in Logger]: LoggerOptions | DestinationStream | undefined;
  };
  /**
   * BCDice API サーバーのホスト名
   */
  bcdiceAPIServer: string;
}

/**
 * 設定ファイルを取得
 *
 * Requires `allow-read`
 */
export const getConfig = function getConfigFromJSONFile(
  path: string,
): Config {
  const rawConfig = Deno.readTextFileSync(path);
  const parsedConfig = JSON.parse(rawConfig);

  return parsedConfig;
};

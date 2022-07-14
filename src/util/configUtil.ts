export interface Config {
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

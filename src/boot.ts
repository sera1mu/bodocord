import pino from "pino";
import { Intents } from "harmony";
import BodocordClient from "./discord/BodocordClient.ts";
import { Config, getConfig } from "./util/configUtil.ts";
import BCDiceAPIClient from "./bcdice/BCDiceAPIClient.ts";

let isAlreadyStartedShutdown = false;

/**
 * Bodocordが使用する環境変数
 */
interface EnvironmentVariables {
  /**
   * 設定ファイルのパス
   */
  BC_CONFIG: string;

  /**
   * 使用するBotのトークン
   */
  BC_TOKEN: string;
}

/**
 * 必要な環境変数を取得する
 *
 * Requires `allow-env`
 */
const getEnv =
  function getNecessaryEnvironmentVariables(): EnvironmentVariables {
    const BC_CONFIG = Deno.env.get("BC_CONFIG");
    if (typeof BC_CONFIG !== "string") {
      throw new Error(
        'Specify the config file path to environment variable "BC_CONFIG".',
      );
    }

    const BC_TOKEN = Deno.env.get("BC_TOKEN");
    if (typeof BC_TOKEN !== "string") {
      throw new Error(
        'Specify the client\'s token to environment variable "BC_TOKEN".',
      );
    }

    return {
      BC_CONFIG,
      BC_TOKEN,
    };
  };

/**
 * 正常にBotをシャットダウン
 * @param client
 * @param systemLogger
 */
const shutdown = function gracefullyShutdownBot(
  client: BodocordClient,
  systemLogger: pino.Logger,
): void {
  systemLogger.info("Shutting down...");

  client.destroy()
    .then(() => {
      systemLogger.info("Destroyed client.");
      systemLogger.info("Exit code is 0.");
    })
    .catch((err) => {
      systemLogger.error(err, "Failed to destroy client gracefully.");
      systemLogger.info("Exit code is 1.");
      Deno.exit(1);
    });
};

/**
 * Botを起動する
 */
const boot = async function bootBot(): Promise<
  { client: BodocordClient; config: Config; logger: pino.Logger }
> {
  const { BC_CONFIG, BC_TOKEN } = getEnv();
  const config = getConfig(BC_CONFIG);
  const logger = pino(config.loggers["system"]);
  const bcdiceClient = new BCDiceAPIClient(config.bcdiceAPIServer);
  const client = new BodocordClient(bcdiceClient, config.loggers["client"]);
  await client.connect(BC_TOKEN, Intents.None);

  Deno.addSignalListener("SIGTERM", () => {
    if(isAlreadyStartedShutdown) return;
    isAlreadyStartedShutdown = true;
    shutdown(client, logger);
  });
  Deno.addSignalListener("SIGINT", () => {
    if(isAlreadyStartedShutdown) return;
    isAlreadyStartedShutdown = true;
    shutdown(client, logger);
  });

  return { client, config, logger };
};

// Measure boot time
performance.mark("bootStart");
const { logger } = await boot();
performance.mark("bootEnd");

performance.measure(
  "boot",
  "bootStart",
  "bootEnd",
);

// Get boot time result
const bootTimeResult = performance.getEntriesByName("boot")[0];
const divisionMiliSeconds = 1000;

logger.info(`Done(${bootTimeResult.duration / divisionMiliSeconds} s)!`);

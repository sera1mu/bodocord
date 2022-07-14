import { Intents } from "harmony";
import * as log from "std/log";
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
 */
const shutdown = function gracefullyShutdownBot(
  client: BodocordClient,
  logger: log.Logger,
): void {
  logger.info("Shutting down...");

  client.destroy()
    .then(() => {
      logger.info("Destroyed client.");
      logger.info("Exit code is 0.");
    })
    .catch((err) => {
      logger.error("Failed to destroy client gracefully.", `err=${err}`);
      logger.info("Exit code is 1.");
      Deno.exit(1);
    });
};

/**
 * Botを起動する
 */
const boot = async function bootBot(): Promise<
  { client: BodocordClient; config: Config; logger: log.Logger }
> {
  const { BC_CONFIG, BC_TOKEN } = getEnv();
  const config = getConfig(BC_CONFIG);

  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler("INFO", {
        formatter: (logRecord) => {
          const datetime =
            `${logRecord.datetime.getFullYear()}/${logRecord.datetime.getMonth()}/${logRecord.datetime.getDate()} ${
              logRecord.datetime.getHours().toString().padStart(2, "0")
            }:${
              logRecord.datetime.getMinutes().toString().padStart(2, "0")
            }:${logRecord.datetime.getSeconds()}`;
          const output =
            `[${datetime}] [${logRecord.loggerName}/${logRecord.levelName}]${
              logRecord.args.length !== 0 ? " " + logRecord.args.join(",") : ""
            }: ${logRecord.msg}`;

          return output;
        },
      }),
    },
    loggers: {
      default: {
        level: "INFO",
        handlers: ["console"],
      },
      client: {
        level: "INFO",
        handlers: ["console"],
      },
    },
  });

  const logger = log.getLogger();
  const bcdiceClient = new BCDiceAPIClient(config.bcdiceAPIServer);
  const client = new BodocordClient(bcdiceClient, log.getLogger("client"));
  await client.connect(BC_TOKEN, Intents.None);

  Deno.addSignalListener("SIGTERM", () => {
    if (isAlreadyStartedShutdown) return;
    isAlreadyStartedShutdown = true;
    shutdown(client, logger);
  });
  Deno.addSignalListener("SIGINT", () => {
    if (isAlreadyStartedShutdown) return;
    isAlreadyStartedShutdown = true;
    shutdown(client, logger);
  });

  return { client, config, logger };
};

const startTime = performance.now();
const { client, logger } = await boot();
client.registerCommandPromise?.finally(() => {
  const endTime = performance.now();
  const divisionMiliseconds = 1000;
  logger.info(`Done(${(endTime - startTime) / divisionMiliseconds} s)!`);
});

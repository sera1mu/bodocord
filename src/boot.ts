import pino from "pino";
import { Intents } from "harmony";
import BodocordClient from "./structures/BodocordClient.ts";
import { Config, getConfig } from "./util/configUtil.ts";
import LinuxCommand from "./commands/LinuxCommand.ts";

/**
 * Bodocord necessary environment variables
 *
 * BC_CONFIG -> Config file path
 *
 * BC_TOKEN -> Client token
 */
interface EnvironmentVariables {
  BC_CONFIG: string;
  BC_TOKEN: string;
}

/**
 * Get the necessary environment variables
 *
 * Requires `allow-env` for `BC_CONFIG` and `BC_TOKEN`
 */
const getEnv =
  function getNecessaryEnvironmentVariables(): EnvironmentVariables {
    // Get BC_CONFIG
    const BC_CONFIG = Deno.env.get("BC_CONFIG");
    // When BC_CONFIG is not string (undefined)
    if (typeof BC_CONFIG !== "string") {
      // Throw error
      throw new Error(
        'Specify the config file path to environment variable "BC_CONFIG".',
      );
    }

    // Get BC_TOKEN
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
 * Shutdown bot gracefully
 * @param client Bot client
 * @param systemLogger
 */
const shutdown = async function gracefullyShutdownBot(
  client: BodocordClient,
  systemLogger: pino.Logger,
): Promise<void> {
  systemLogger.info("Shutting down...");

  try {
    // Destroy client
    await client.destroy();
    systemLogger.info("Destroyed client.");
  } catch (err) {
    systemLogger.error(err, "Failed to destroy client gracefully.");
    systemLogger.info("Exit code is 1.");
    Deno.exit(1);
  }

  systemLogger.info("Exit code is 0.");
};

/**
 * Boot the bot
 * @returns System logger
 */
const boot = async function bootBot(): Promise<
  { client: BodocordClient; config: Config; logger: pino.Logger }
> {
  // Get env
  const { BC_CONFIG, BC_TOKEN } = getEnv();

  // Get config
  const config = getConfig(BC_CONFIG);

  // Create logger
  const logger = pino(config.loggers["system"]);

  // Put together commands
  const commands = [
    new LinuxCommand(),
  ];

  // Create client
  const client = new BodocordClient(commands, config.loggers["client"]);

  // Connect gateway
  await client.connect(BC_TOKEN, Intents.None);

  // Add signal listeners (UNSTABLE)
  Deno.addSignalListener("SIGTERM", async () => {
    await shutdown(client, logger);
  });
  Deno.addSignalListener("SIGINT", async () => {
    await shutdown(client, logger);
  });

  return { client, config, logger };
};

// Measure boot time
performance.mark("bootStart");
const { client, config, logger } = await boot();
performance.mark("bootEnd");

performance.measure(
  "boot",
  "bootStart",
  "bootEnd",
);

// Get boot time result
const bootTimeResult = performance.getEntriesByName("boot")[0];
const divisionMiliSeconds = 1000;

// Log completed
logger.info(`Done(${bootTimeResult.duration / divisionMiliSeconds} s)!`);
logger.debug(bootTimeResult, "Boot measure result");

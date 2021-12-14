import { Client, ClientOptions, event } from "harmony";
import pino from "pino";
import LinuxCommand from "../commands/LinuxCommand.ts";

/**
 * Bodocord Discord gateway client
 */
export default class BodocordClient extends Client {
  readonly commands = [
    new LinuxCommand(),
  ];

  private readonly logger: pino.Logger;

  /**
   * @param loggerOptionsOrStream Pino logger
   * @param options Client options
   */
  constructor(
    loggerOptionsOrStream?: pino.LoggerOptions | pino.DestinationStream,
    options?: ClientOptions,
  ) {
    super(options);

    this.logger = pino(loggerOptionsOrStream);
  }

  @event()
  async ready(): Promise<void> {
    this.logger.info("Registering commands...");

    // Register commands
    await Promise.all(this.commands.map(async (command) => {
      await this.interactions.commands.create(command.commandPartial);
      this.logger.info(`Registered command ${command.commandPartial.name}`);
    }));

    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }
}

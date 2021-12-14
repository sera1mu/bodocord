import { Client, ClientOptions, event } from "harmony";
import pino from "pino";
import Command from "./Command.ts";

/**
 * Bodocord Discord gateway client
 */
export default class BodocordClient extends Client {
  readonly commands: Command[];

  private readonly logger: pino.Logger;

  /**
   * @param loggerOptionsOrStream Pino logger
   * @param options Client options
   */
  constructor(
    commands: Command[],
    loggerOptionsOrStream?: pino.LoggerOptions | pino.DestinationStream,
    options?: ClientOptions,
  ) {
    super(options);

    this.commands = commands;
    this.logger = pino(loggerOptionsOrStream);
  }

  @event()
  ready(): void {
    this.logger.info("Registering commands...");

    // Register commands
    this.commands.forEach(async (command) => {
      await this.interactions.commands.create(command.commandPartial);
      this.logger.info(`Registered command ${command.commandPartial.name}`);
    });

    this.logger.info("All commands registered.");

    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }
}

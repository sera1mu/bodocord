import { Client, ClientOptions, event, Interaction, slash } from "harmony";
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
    this.commands.map((command) => {
      this.interactions.commands.create(
        command.commandPartial,
      )
        .then(async (cmd) => this.logger.info(`Created command ${cmd.name}.`))
        .catch((err) =>
          this.logger.error(
            err,
            `Failed to create command ${command.commandPartial.name}`,
          )
        );
    });

    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }

  @slash()
  async linux(i: Interaction): Promise<void> {
    this.commands[0].run(i);
  }
}

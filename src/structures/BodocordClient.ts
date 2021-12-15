import { Client, ClientOptions, event, Interaction, slash } from "harmony";
import pino from "pino";
import LinuxCommand from "../commands/LinuxCommand.ts";
import Command from "./Command.ts";

interface Commands {
  linux: LinuxCommand;
  [key: string]: Command;
}

/**
 * Bodocord Discord gateway client
 */
export default class BodocordClient extends Client {
  readonly commands: Commands = {
    linux: new LinuxCommand(),
  };

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

  /**
   * Register slash commands
   */
  private registerCommands() {
    for (const key of Object.keys(this.commands)) {
      const command = this.commands[key];

      this.interactions.commands.create(
        command.commandPartial,
      )
        .then((cmd) => this.logger.info(`Created command ${cmd.name}.`))
        .catch((err) =>
          this.logger.error(
            err,
            `Failed to create command ${command.commandPartial.name}`,
          )
        );
    }
  }

  @event()
  async ready(): Promise<void> {
    this.logger.info("Registering commands...");

    // Register commands
    this.registerCommands();

    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }

  @slash()
  async linux(i: Interaction): Promise<void> {
    this.commands.linux.run(i);
  }
}

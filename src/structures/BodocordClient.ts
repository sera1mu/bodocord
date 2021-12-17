import {
  Client,
  ClientOptions,
  event,
  Interaction,
  InteractionResponseType,
  slash,
} from "harmony";
import pino from "pino";
import DiceCommand from "../commands/DiceCommand.ts";
import LinuxCommand from "../commands/LinuxCommand.ts";
import BCDiceAPIClient from "./BCDiceAPIClient.ts";
import Command from "./Command.ts";

interface Commands {
  linux: LinuxCommand;
  dice: DiceCommand;
  [key: string]: Command;
}

/**
 * Bodocord Discord gateway client
 */
export default class BodocordClient extends Client {
  readonly commands: Commands;

  private readonly bcdiceClient: BCDiceAPIClient;

  private readonly logger: pino.Logger;

  /**
   * @param loggerOptionsOrStream Pino logger
   * @param options Client options
   */
  constructor(
    bcdiceClient: BCDiceAPIClient,
    loggerOptionsOrStream?: pino.LoggerOptions | pino.DestinationStream,
    options?: ClientOptions,
  ) {
    super(options);

    this.bcdiceClient = bcdiceClient;
    this.logger = pino(loggerOptionsOrStream);
    this.commands = {
      linux: new LinuxCommand(),
      dice: new DiceCommand(bcdiceClient),
    };
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

  /**
   * Run command
   */
  private async runCommand(command: Command, i: Interaction): Promise<void> {
    // Check run method is undefined
    if (typeof command.run !== "undefined") {
      try {
        await command.run(i);
        this.logger.info({
          userId: i.user?.id,
          guildId: i.guild?.id,
          channelId: i.channel?.id,
          interactionId: i.id,
        }, `Runned command ${command.commandPartial.name}.`);
      } catch (err) {
        this.logger.error(
          {
            userId: i.user?.id,
            guildId: i.guild?.id,
            channelId: i.channel?.id,
            interactionId: i.id,
          },
          `Failed to run command ${command.commandPartial.name}: ${err.stack}`,
        );
      }
    } else {
      // Response run method is undefined
      i.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: "Sorry. This command cannot use now.",
      }).then(() => {
        throw new Error("The command run method is undefined.");
      })
        .catch((err) => {
          throw err;
        });
    }
  }

  @event()
  ready(): void {
    this.logger.info("Registering commands...");

    // Register commands
    this.registerCommands();

    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }

  @slash()
  async linux(i: Interaction): Promise<void> {
    await this.runCommand(this.commands.linux, i);
  }

  @slash()
  async dice(i: Interaction): Promise<void> {
    await this.runCommand(this.commands.dice, i);
  }
}

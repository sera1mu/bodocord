import {
  ApplicationCommand,
  Client,
  ClientOptions,
  event,
  Interaction,
  InteractionResponseType,
  slash,
} from "harmony";
import { Logger } from "std/log";
import BCDiceCommand from "../commands/BCDiceCommand.ts";
import DiceCommand from "../commands/DiceCommand.ts";
import LinuxCommand from "../commands/LinuxCommand.ts";
import CommandError from "../commands/CommandError.ts";
import BCDiceAPIClient from "../bcdice/BCDiceAPIClient.ts";
import Command from "../commands/Command.ts";

interface Commands {
  linux: LinuxCommand;
  dice: DiceCommand;
  bcdice: BCDiceCommand;
  [key: string]: Command;
}

export default class BodocordClient extends Client {
  registerCommandPromise?: Promise<void>;

  readonly commands: Commands;

  private readonly logger: Logger;

  constructor(
    bcdiceClient: BCDiceAPIClient,
    logger: Logger,
    options?: ClientOptions,
  ) {
    super(options);

    this.logger = logger;
    this.commands = {
      linux: new LinuxCommand(),
      dice: new DiceCommand(bcdiceClient),
      bcdice: new BCDiceCommand(bcdiceClient),
    };
  }

  /**
   * プロパティ `commands` にあるコマンドを登録
   */
  private registerCommands(): Promise<ApplicationCommand[]> {
    const promises: Promise<ApplicationCommand>[] = [];

    Object.keys(this.commands).forEach((key) => {
      const command = this.commands[key];
      promises.push(this.interactions.commands.create(command.commandPartial));
    });

    return Promise.all(promises);
  }

  private logCommandError(
    i: Interaction,
    message: string,
    err?: CommandError | Error,
  ) {
    const args = [
      `userId=${i.user?.id}`,
      `guildId=${i.guild?.id}`,
      `channelId=${i.channel?.id}`,
      `interactionId=${i.id}`,
      `err=${err?.message}`,
    ];

    if (err instanceof CommandError) args.push(`hash=${err.hash}`);

    this.logger.error(message, args);
  }

  private async runCommand(command: Command, i: Interaction): Promise<void> {
    if (typeof command.run === "undefined") {
      i.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: "Sorry. This command cannot use now.",
      }).then(() => {
        this.logCommandError(
          i,
          `Command ${command.commandPartial.name} run method is undefined.`,
        );
      });
    }

    try {
      await command.run(i);
      this.logger.info(
        `Runned command ${command.commandPartial.name}.`,
        `userId=${i.user?.id}`,
        `guildId=${i.guild?.id}`,
        `channelId=${i.channel?.id}`,
        `interactionId=${i.id}`,
      );
    } catch (err) {
      if (err instanceof CommandError) {
        this.logCommandError(
          i,
          `Failed to run command ${command.commandPartial.name}.`,
          err,
        );
      } else {
        this.logCommandError(
          i,
          `Failed to run command ${command.commandPartial.name}.`,
          err,
        );
      }
    }
  }

  @event()
  ready(): void {
    this.logger.info("Registering commands...");
    this.registerCommandPromise = this.registerCommands()
      .then((commands) => {
        this.logger.info(
          `Registered all commands: ${
            commands.map((command) => command.name).join(", ")
          }`,
        );
      })
      .catch((err) => {
        this.logger.error(`Failed to create command: ${err}`);
      })
      .finally(() => {
        this.logger.info(
          `Ready! Logged in as ${this.user?.tag}(${this.user?.id})`,
        );
      });
  }

  @slash()
  async linux(i: Interaction): Promise<void> {
    await this.runCommand(this.commands.linux, i);
  }

  @slash()
  async dice(i: Interaction): Promise<void> {
    await this.runCommand(this.commands.dice, i);
  }

  @slash()
  async bcdice(i: Interaction): Promise<void> {
    await this.runCommand(this.commands.bcdice, i);
  }
}

import {
  ApplicationCommand,
  Client,
  ClientOptions,
  event,
  Interaction,
  InteractionResponseType,
  slash,
} from "harmony";
import pino from "pino";
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

  private readonly bcdiceClient: BCDiceAPIClient;

  private readonly logger: pino.Logger;

  /**
   * @param loggerOptionsOrStream Pino logger
   * @param options
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
      bcdice: new BCDiceCommand(bcdiceClient),
    };
  }

  /**
   * プロパティ `commands` にあるコマンドを登録
   */
  private registerCommands(): Promise<ApplicationCommand[]> {
    const promises: Promise<ApplicationCommand>[] = [];

    Object.keys(this.commands).forEach(key => {
      const command = this.commands[key];
      promises.push(this.interactions.commands.create(command.commandPartial));
    });

    return Promise.all(promises);
  }

  private async runCommand(command: Command, i: Interaction): Promise<void> {
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
        if (err instanceof CommandError) {
          this.logger.error(
            {
              userId: i.user?.id,
              guildId: i.guild?.id,
              channelId: i.channel?.id,
              interactionId: i.id,
              hash: err.hash,
              err,
            },
            `Failed to run command ${command.commandPartial.name}.`,
          );
        } else {
          this.logger.error(
            {
              userId: i.user?.id,
              guildId: i.guild?.id,
              channelId: i.channel?.id,
              interactionId: i.id,
              hash: undefined,
              err,
            },
            `Failed to run command ${command.commandPartial.name}.`,
          );
        }
      }
    } else {
      // Response run method is undefined
      i.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: "Sorry. This command cannot use now.",
      }).then(() => {
        this.logger.error({
          userId: i.user?.id,
          guildId: i.guild?.id,
          channelId: i.channel?.id,
          interactionId: i.id,
          hash: undefined,
        }, "The command run method is undefined.");
      });
    }
  }

  @event()
  ready(): void {
    this.logger.info("Registering commands...");
    this.registerCommandPromise = this.registerCommands()
      .then((commands) => {
        this.logger.info(`Registered all commands: ${commands.map(command => command.name).join(", ")}`);
      })
      .catch((err) => {
        this.logger.error(`Failed to create command: ${err}`);
      })
      .finally(() => {
        this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
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

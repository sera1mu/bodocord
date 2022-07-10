import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Embed,
  Interaction,
  InteractionResponseType,
  SlashCommandInteraction,
} from "harmony";
import Command from "./Command.ts";
import { generateInteractionErrorHash } from "../util/hashUtil.ts";
import BCDiceAPIClient from "../bcdice/BCDiceAPIClient.ts";
import InternalErrorEmbed from "../discord/embeds/InternalErrorEmbed.ts";
import CommandError from "./CommandError.ts";
import BCDiceError from "../bcdice/BCDiceError.ts";
import ErrorEmbed from "../discord/embeds/ErrorEmbed.ts";

export default class BCDiceCommand extends Command {
  private readonly bcdice: BCDiceAPIClient;

  constructor(bcdice: BCDiceAPIClient) {
    super({
      // /bcdice [args...]
      name: "bcdice",
      description: "Use BCDice (e.g. Dice roll with BCDiceCommand)",
      type: ApplicationCommandType.CHAT_INPUT,
      options: [
        {
          name: "info",
          description: "Display information about the BCDice-API server",
          type: ApplicationCommandOptionType.SUB_COMMAND,
        },
        {
          // /bcdice systems [system?]
          name: "systems",
          description: "Display available or one game system",
          type: ApplicationCommandOptionType.SUB_COMMAND,
          options: [
            {
              name: "system",
              description: "ID of the game system to be displayed",
              type: ApplicationCommandOptionType.STRING,
              required: false,
            },
          ],
        },
        {
          // /bcdice roll [system] [command]
          name: "roll",
          description: "Roll the dice with BCDice command",
          type: ApplicationCommandOptionType.SUB_COMMAND,
          options: [
            {
              name: "system",
              description: "ID of the game system to be used",
              type: ApplicationCommandOptionType.STRING,
              required: true,
            },
            {
              name: "command",
              description: "BCDice command to execute",
              type: ApplicationCommandOptionType.STRING,
              required: true,
            },
          ],
        },
      ],
    });

    this.bcdice = bcdice;
  }

  private async handleInternalError(
    message: string,
    i: Interaction,
    cause?: Error,
  ): Promise<CommandError> {
    const hash = await generateInteractionErrorHash(i);
    const embed = new InternalErrorEmbed(hash);

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      embeds: [embed],
      ephemeral: true,
    });

    return new CommandError(hash, message, { cause: cause });
  }

  private async handleError(
    message: string,
    i: Interaction,
    cause?: Error,
  ): Promise<CommandError> {
    const hash = await generateInteractionErrorHash(i);
    const embed = new ErrorEmbed(message, hash);

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      embeds: [embed],
      ephemeral: true,
    });

    return new CommandError(hash, message, { cause: cause });
  }

  private async runInfoSubCommand(i: SlashCommandInteraction): Promise<void> {
    const versions = await this.bcdice.getAPIVersion()
      .catch(async (err) => {
        throw await this.handleInternalError(
          "Failed to get the versions of BCDice-API",
          i,
          err,
        );
      });

    const admin = await this.bcdice.getAPIAdmin()
      .catch(async (err) => {
        throw await this.handleInternalError(
          "Failed to get the admin information of BCDice-API",
          i,
          err,
        );
      });

    const embed = new Embed({
      title: `BCDice-API v${versions.api}`,
      description:
        "This server is used for die rolls and other purposes. Thank you to the administrators and developers.",
      fields: [
        {
          name: "API",
          value: `v${versions.api}`,
          inline: true,
        },
        {
          name: "BCDice",
          value: `v${versions.bcdice}`,
          inline: true,
        },
        {
          name: "Server URL",
          value: this.bcdice.prefixUrl instanceof URL
            ? this.bcdice.prefixUrl.toString()
            : this.bcdice.prefixUrl,
          inline: true,
        },
        {
          name: "Admin Name",
          value: admin.name,
          inline: true,
        },
        {
          name: "Site",
          value: admin.url,
          inline: true,
        },
        {
          name: "E-Mail",
          value: admin.email,
          inline: true,
        },
      ],
    });

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      embeds: [
        embed,
      ],
    });
  }

  private async runSystemsSubCommand(
    i: SlashCommandInteraction,
  ): Promise<void> {
    const option = i.options[0];
    if (typeof option === "undefined") {
      const embed = new Embed({
        title: "Availabe Game Systems",
        description: "See https://bcdice.org/systems/",
      });

      await i.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        embeds: [embed],
      });
    } else {
      const system = await this.bcdice.getGameSystem(option.value)
        .catch(async (err) => {
          if (err instanceof BCDiceError && err.code === "UNSUPPORTED_SYSTEM") {
            throw await this.handleError(
              "Specified system is unsupported. Please make sure your ID is correct.",
              i,
              err,
            );
          } else {
            throw await this.handleInternalError(
              "Failed to get the game system.",
              i,
              err,
            );
          }
        });

      const embed = new Embed({
        title: `${system.name}`,
        fields: [
          {
            name: "ID",
            value: system.id,
          },
          {
            name: "Command pattern",
            value: String(system.commandPattern),
          },
          {
            name: "Sort key",
            value: system.sortKey,
          },
          {
            name: "Help message",
            value: system.helpMessage,
          },
        ],
      });

      await i.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        embeds: [embed],
      });
    }
  }

  private async runRollSubCommand(i: SlashCommandInteraction): Promise<void> {
    const systemId = i.options[0].value;
    const command = i.options[1].value;

    const results = await this.bcdice.diceRoll(systemId, command)
      .catch(async (err) => {
        if (err instanceof BCDiceError) {
          if (err.code === "UNSUPPORTED_COMMAND") {
            throw await this.handleError(
              "Specified command is unsupported. Please make sure your command is correct.",
              i,
              err,
            );
          } else if (err.code === "UNSUPPORTED_SYSTEM") {
            throw await this.handleError(
              "Specified system is unsupported. Please make sure your ID is correct.",
              i,
              err,
            );
          } else {
            throw await this.handleInternalError(
              "Failed to roll the dice with BCDice.",
              i,
              err,
            );
          }
        } else {
          throw await this.handleInternalError(
            "Failed to roll the dice with BCDice.",
            i,
            err,
          );
        }
      });

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: `:game_die: ${results.text}`,
    });
  }

  async run(i: Interaction): Promise<void> {
    const slashInteraction = i as SlashCommandInteraction;

    switch (slashInteraction.subCommand) {
      case "info":
        await this.runInfoSubCommand(slashInteraction);
        break;
      case "systems":
        await this.runSystemsSubCommand(slashInteraction);
        break;
      case "roll":
        await this.runRollSubCommand(slashInteraction);
        break;
    }
  }
}

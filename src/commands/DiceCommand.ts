import {
  ApplicationCommandOptionType,
  Interaction,
  InteractionResponseType,
  SlashCommandInteraction,
} from "harmony";
import Command from "./Command.ts";
import BCDiceAPIClient from "../bcdice/BCDiceAPIClient.ts";
import CommandError from "./CommandError.ts";
import InternalErrorEmbed from "../discord/embeds/InternalErrorEmbed.ts";
import { generateInteractionErrorHash } from "../util/hashUtil.ts";

export default class DiceCommand extends Command {
  /**
   * BCDice-API Client
   */
  private readonly bcdice: BCDiceAPIClient;

  constructor(bcdice: BCDiceAPIClient) {
    super({
      name: "dice",
      description: "Roll the dice",
      options: [
        {
          name: "sides",
          description: "Number of sides of the dice",
          type: ApplicationCommandOptionType.INTEGER,
          maxValue: 1000,
          minValue: 2,
          required: false,
        },
      ],
    });

    this.bcdice = bcdice;
  }

  async run(i: Interaction): Promise<void> {
    const slashInteraction = i as SlashCommandInteraction;
    const sides = slashInteraction.options.length !== 0
      ? slashInteraction.options[0].value
      : 6;

    const results = await this.bcdice.diceRoll("DiceBot", `1D${sides}`)
      .catch(async (err) => {
        // UNSUPPORTED_COMMAND and UNSUPPORTED_SYSTEM are not possible,
        // so treat all as internal errors
        const hash = await generateInteractionErrorHash(i);
        const embed = new InternalErrorEmbed(hash);

        await i.respond({ embeds: [embed], ephemeral: true });
        throw new CommandError(hash, "Failed to roll the dice with BCDice.", {
          cause: err,
        });
      });

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: `:game_die: ${sides} sides Dice: ${results.rands[0].value}`,
    });
  }
}

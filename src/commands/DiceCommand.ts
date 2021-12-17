import {
  ApplicationCommandOptionType,
  Interaction,
  InteractionResponseType,
  SlashCommandInteraction,
} from "harmony";
import Command from "../structures/Command.ts";
import BCDiceAPIClient from "../structures/BCDiceAPIClient.ts";

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
    const results = await this.bcdice.diceRoll("DiceBot", `1D${sides}`);

    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: `:game_die: ${sides} sides Dice: ${results.rands[0].value}`,
    });
  }
}

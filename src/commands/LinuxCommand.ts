import { Interaction, InteractionResponseType } from "harmony";
import Command from "./Command.ts";

export default class LinuxCommand extends Command {
  constructor() {
    super({
      name: "linux",
      description: "Install browser in Linux",
      options: [],
    });
  }

  init(): void {}

  async run(i: Interaction): Promise<void> {
    await i.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: "https://tenor.com/bqvzR.gif",
    });
  }
}

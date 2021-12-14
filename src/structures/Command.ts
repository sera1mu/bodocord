import { ApplicationCommandPartial, Interaction } from "harmony";
import BodocordClient from "./BodocordClient.ts";

/**
 * Base of Slash command
 */
export default class Command {
  /**
   * Partial of slash command
   */
  readonly commandPartial: ApplicationCommandPartial;

  /**
   * @param commandPartial Partial of slash command
   */
  constructor(commandPartial: ApplicationCommandPartial) {
    this.commandPartial = commandPartial;
  }

  /**
   * Client runs when command initializing
   */
  init?(client: BodocordClient): Promise<void>;

  /**
   * Command action
   */
  run?(i: Interaction): void;
}

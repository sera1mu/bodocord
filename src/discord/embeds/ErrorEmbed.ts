import { Embed } from "harmony";

/**
 * Message Embed Object to display error information
 */
export default class ErrorEmbed extends Embed {
  /**
   * Error message
   *
   * It will be substituted into the description of Embed.
   */
  readonly message: string;

  /**
   * Hash value of the error
   */
  readonly hash: string;

  /**
   * @param message Error message
   * @param hash Error Hash (MD5)
   */
  constructor(message: string, hash: string) {
    super({
      title: "Error",
      description: message,
      footer: {
        text: `Error Hash: ${hash}`,
      },
    });

    this.setColor("crimson");
    this.message = message;
    this.hash = hash;
  }
}

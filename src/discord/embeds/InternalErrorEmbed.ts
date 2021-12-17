import ErrorEmbed from "./ErrorEmbed.ts";

/**
 * Message Embed Object to display internal error information
 */
export default class InternalErrorEmbed extends ErrorEmbed {
  /**
   * @param message Error message
   * @param hash Error Hash (MD5)
   */
  constructor(message: string, hash: string) {
    super(message, hash);

    this.title = "Internal Error";
  }
}

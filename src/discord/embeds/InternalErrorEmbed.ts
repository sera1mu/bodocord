import ErrorEmbed from "./ErrorEmbed.ts";

/**
 * Message Embed Object to display internal error information
 */
export default class InternalErrorEmbed extends ErrorEmbed {
  /**
   * @param message Error message
   * @param hash Error Hash (MD5)
   */
  constructor(hash: string) {
    const message = `An error has occurred within the server.
    Please try again in a few minutes.
    If you get this error again and again, please contact the administrator with the hash value in the footer.`;

    super(message, hash);

    this.title = "Internal Error";
  }
}

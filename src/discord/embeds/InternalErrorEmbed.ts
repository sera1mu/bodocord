import ErrorEmbed from "./ErrorEmbed.ts";

/**
 * 内部エラーを表示するためのDiscordのEmbed
 */
export default class InternalErrorEmbed extends ErrorEmbed {
  /**
   * @param hash エラーハッシュ (MD5)
   */
  constructor(hash: string) {
    const message = `An error has occurred within the server.
    Please try again in a few minutes.
    If you get this error again and again, please contact the administrator with the hash value in the footer.`;

    super(message, hash);

    this.setColor("firebrick");
    this.title = "Internal Error";
  }
}

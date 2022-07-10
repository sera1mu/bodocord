import { Embed } from "harmony";

/**
 * エラー情報を表示するためのDiscordのEmbed
 */
export default class ErrorEmbed extends Embed {
  readonly message: string;

  /**
   * ハッシュ(MD5)
   * 
   * エラーをログから簡単に見つけるための目印として使う
   * 
   * util/hashUtil.ts にある 関数 `generateHash` を使って生成してください。
   */
  readonly hash: string;

  /**
   * @param hash エラーハッシュ(MD5) 
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


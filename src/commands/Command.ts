import { ApplicationCommandPartial, Interaction } from "harmony";
import BodocordClient from "../discord/BodocordClient.ts";

/**
 * Slash Commandの基底クラス
 */
export default abstract class Command {
  readonly commandPartial: ApplicationCommandPartial;

  constructor(commandPartial: ApplicationCommandPartial) {
    this.commandPartial = commandPartial;
  }

  /**
   * クライアントがコマンドを初期化したときの処理
   */
  abstract init(client: BodocordClient): void | Promise<void>;

  /**
   * コマンドが実行されたときの処理
   */
  abstract run(i: Interaction): void | Promise<void>;
}

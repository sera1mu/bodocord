import { ApplicationCommandPartial, Interaction } from "harmony";
import BodocordClient from "../discord/BodocordClient.ts";

/**
 * Slash Commandの基底クラス
 */
export default class Command {
  readonly commandPartial: ApplicationCommandPartial;

  constructor(commandPartial: ApplicationCommandPartial) {
    this.commandPartial = commandPartial;
  }

  /**
   * クライアントがコマンドを初期化したときの処理
   */
  init?(client: BodocordClient): void | Promise<void>;

  /**
   * コマンドが実行されたときの処理
   */
  run?(i: Interaction): void | Promise<void>;
}

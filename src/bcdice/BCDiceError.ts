/**
 * BCDice Error code
 *
 * * `UNSUPPORTED_COMMAND` -> 正しくないコマンドです。構文を見直してください。
 * * `UNSUPPORTED_SYSTEM`  -> 存在しないゲームシステムです。ゲームシステム名が正しいか確認してください。
 * * `UNSUPPORTED_TABLE`   -> 正しくないテーブルです。構文を見直してください。
 * * `CONNECTION_ERROR`    -> 何らかの原因によってAPIとの通信に失敗しました。プロパティ `cause` から詳細なエラーを確認してください。
 * * `INCORRECT_RESPONSE`  -> レスポンスが正しくありません。APIが正常に動作しているか確認してください。
 * * `UNKNOWN`             -> 未確認のエラーです。プロパティ `cause` から詳細なエラーを確認してください。
 */
export type BCDiceErrorCode =
  | "UNSUPPORTED_COMMAND"
  | "UNSUPPORTED_SYSTEM"
  | "UNSUPPORTED_TABLE"
  | "CONNECTION_ERROR"
  | "INCORRECT_RESPONSE"
  | "UNKNOWN";

export interface BCDiceErrorInit {
  cause?: Error;
}

export default class BCDiceError extends Error {
  /**
   * エラーコード
   *
   * `BCDiceErrorCode` のコメントにそれぞれのコメントが何を意味するか書かれています。
   */
  readonly code: BCDiceErrorCode;

  constructor(
    code: BCDiceErrorCode,
    message?: string,
    init?: BCDiceErrorInit,
  ) {
    super(message, init);

    this.code = code;
  }
}

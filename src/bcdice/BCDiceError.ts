/**
 * BCDice Error code
 *
 * * `UNSUPPORTED_COMMAND` -> You are using an unsupported command. Review the syntax.
 * * `UNSUPPORTED_SYSTEM`  -> You are using an unsupported game system. Review the syntax.
 * * `UNSUPPORTED_TABLE`   -> You are using an unsupported original table. Review the syntax.
 * * `CONNECTION_ERROR`    -> Communication with the API has failed for some reason. Identify the cause from the error information.
 * * `INCORRECT_RESPONSE`  -> The response was incorrect. Check your connection.
 * * `UNKNOWN`             -> An unknown error has occurred. Identify the cause from the error information.
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
   * Error type
   *
   * See `BCDiceErrorCode` comment to know what the code mean.
   */
  readonly code: BCDiceErrorCode;

  /**
   * @param code Error code
   */
  constructor(
    code: BCDiceErrorCode,
    message?: string,
    init?: BCDiceErrorInit,
  ) {
    super(message, init);

    this.code = code;
  }
}

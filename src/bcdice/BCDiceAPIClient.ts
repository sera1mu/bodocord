import { HTTPError } from "ky";
import BCDiceOriginalTable from "./BCDiceOriginalTable.ts";
import BCDiceError from "./BCDiceError.ts";
import {
  APIAdmin,
  APIVersion,
  AvailableGameSystem,
  DiceRollResults,
  GameSystem,
  isAPIAdmin,
  isAPIVersion,
  isAvailableGameSystem,
  isDiceRollResults,
  isGameSystem,
  isOriginalTableResults,
  OriginalTableResults,
} from "./BCDiceAPITypes.ts";
import SimpleKyClient from "./SimpleKyClient.ts";

export default class BCDiceAPIClient {
  readonly prefixUrl: string | URL;

  private readonly webClient: SimpleKyClient;

  constructor(webClient: SimpleKyClient) {
    this.webClient = webClient;
    this.prefixUrl = webClient.prefixUrl;
  }

  async getAPIVersion(): Promise<APIVersion> {
    const json = await this.webClient.get("v2/version")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    if (!isAPIVersion(json)) {
      const causeError = new TypeError(
        `The syntax of the response is incorrect:\n${JSON.stringify(json)}`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        {
          cause: causeError,
        },
      );
    }

    return json;
  }

  /**
   * BCDice-APIの管理者情報を取得する
   */
  async getAPIAdmin(): Promise<APIAdmin> {
    const json = await this.webClient.get("v2/admin")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    if (!isAPIAdmin(json)) {
      const causeError = new TypeError(
        `The syntax of the response is incorrect:\n${JSON.stringify(json)}`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    return json;
  }

  async getAvailableGameSystems(): Promise<AvailableGameSystem[]> {
    // Get data
    const json = await this.webClient.get("v2/game_system")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    if (typeof json.game_system !== "undefined") {
      // すべてのゲームシステムが正しいことを確認
      for (const entry of json.game_system) {
        const newEntry = entry;

        newEntry.sortKey = newEntry.sort_key;
        delete newEntry.sort_key;

        if (!isAvailableGameSystem(entry)) {
          const causeError = new TypeError(
            `The syntax of the game system is incorrect:\n${
              JSON.stringify(entry)
            }`,
          );

          throw new BCDiceError(
            "INCORRECT_RESPONSE",
            "The game system is incorrect.",
            { cause: causeError },
          );
        }
      }
    } else {
      const causeError = new TypeError(
        `The syntax of the response is incorrect. Property game_system is undefined:\n${
          JSON.stringify(json)
        }`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    return json.game_system;
  }

  /**
   * 指定されたゲームシステムの情報を取得する
   */
  async getGameSystem(id: string): Promise<GameSystem> {
    const json = await this.webClient.get(`v2/game_system/${id}`)
      .catch((err) => {
        // 400 Bad Request はゲームシステムのIDが正しくないことを示している
        if (err instanceof HTTPError && err.response.status === 400) {
          throw new BCDiceError(
            "UNSUPPORTED_SYSTEM",
            "The specified game system is unsupported.",
            { cause: err },
          );
        } else {
          throw new BCDiceError(
            "CONNECTION_ERROR",
            "Failed to communicate with API.",
            { cause: err },
          );
        }
      });

    delete json.ok;

    if (typeof json.command_pattern === "undefined") {
      const causeError = new TypeError(
        `The syntax of the response is incorrect. Property command_pattern is undefined:\n${
          JSON.stringify(json)
        }`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    try {
      json.commandPattern = new RegExp(json.command_pattern);
    } catch (err) {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: err },
      );
    }

    json.sortKey = json.sort_key;
    json.helpMessage = json.help_message;

    delete json.command_pattern;
    delete json.sort_key;
    delete json.help_message;

    if (!isGameSystem(json)) {
      const causeError = new TypeError(
        `The syntax of the response is incorrect:\n${JSON.stringify(json)}`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    return json;
  }

  /**
   * ダイスを振る
   * @param id ゲームシステムのID
   * @param command ダイスロールのコマンド
   */
  async diceRoll(id: string, command: string): Promise<DiceRollResults> {
    const json = await this.webClient.get(`v2/game_system/${id}/roll`, {
      searchParams: {
        command,
      },
    }).catch(async (err) => {
      // 400 Bad Request はコマンドが正しくないか、ゲームシステムのIDが正しくないことを示している
      if (err instanceof HTTPError && err.response.status === 400) {
        const json = await err.response.json();

        switch (json.reason) {
          case "unsupported game system":
            throw new BCDiceError(
              "UNSUPPORTED_SYSTEM",
              "The specified game system is unsupported.",
              { cause: err },
            );

          case "unsupported command":
            throw new BCDiceError(
              "UNSUPPORTED_COMMAND",
              "The specified command is unsupported.",
              { cause: err },
            );
        }
      } else {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          { cause: err },
        );
      }
    });

    delete json.ok;

    if (!isDiceRollResults(json)) {
      const causeError = new TypeError(
        `The syntax of the response is incorrect:\n${JSON.stringify(json)}`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    return json;
  }

  async runOriginalTable(
    table: BCDiceOriginalTable,
  ): Promise<OriginalTableResults> {
    const parsedTable = table.toBCDiceText();

    const json = await this.webClient.post("v2/original_table", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `table=${parsedTable}`,
    }).catch((err) => {
      // 500 Internal Server Error はテーブルが正しくないことを示している
      if (err instanceof HTTPError && err.response.status === 500) {
        throw new BCDiceError(
          "UNSUPPORTED_TABLE",
          "The specified table is unsupported.",
          { cause: err },
        );
      } else {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          { cause: err },
        );
      }
    });

    delete json.ok;

    if (!isOriginalTableResults(json)) {
      const causeError = new TypeError(
        `The syntax of the response is incorrect:\n${JSON.stringify(json)}`,
      );

      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: causeError },
      );
    }

    return json;
  }
}

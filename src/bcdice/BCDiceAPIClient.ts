import { default as ky, HTTPError, Options } from "ky";
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

/**
 * BCDice-API Client
 */
export default class BCDiceAPIClient {
  readonly prefixUrl: string | URL;

  private readonly kyClient: ReturnType<typeof ky.create>;

  constructor(prefixUrl: string | URL) {
    this.prefixUrl = prefixUrl;

    this.kyClient = ky.create({
      prefixUrl,
    });
  }

  /**
   * Send GET request to specified URL and return JSON data
   */
  // deno-lint-ignore no-explicit-any
  private async getRequest(url: string, options?: Options): Promise<any> {
    const res = await this.kyClient.get(url, options);
    const json = await res.json();
    return json;
  }

  /**
   * Send POST request to specified URL and return JSON data
   */
  // deno-lint-ignore no-explicit-any
  private async postRequest(url: string, options?: Options): Promise<any> {
    const res = await this.kyClient.post(url, options);
    const json = await res.json();
    return json;
  }

  /**
   * Get BCDice-API version
   */
  async getAPIVersion(): Promise<APIVersion> {
    // Get data
    const json = await this.getRequest("v2/version")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    // Check JSON correctly
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
   * Get BCDice-API administrator data
   */
  async getAPIAdmin(): Promise<APIAdmin> {
    // Get data
    const json = await this.getRequest("v2/admin")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    // Check JSON correctly
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

  /**
   * Get available game systems
   */
  async getAvailableGameSystems(): Promise<AvailableGameSystem[]> {
    // Get data
    const json = await this.getRequest("v2/game_system")
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });

    // Check JSON correctly
    // Check game_system is not undefined
    if (typeof json.game_system !== "undefined") {
      // Check all systems is corrrect
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
   * Get specific game system
   *
   * @param id Game System ID
   */
  async getGameSystem(id: string): Promise<GameSystem> {
    // Get data
    const json = await this.getRequest(`v2/game_system/${id}`)
      .catch((err) => {
        // 400 Bad Request means game system unsupported
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

    // Remove `ok` property from JSON (It don't need)
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

    // Convert commandPattern to RegExp
    try {
      json.command_pattern = new RegExp(json.commandPattern);
    } catch (err) {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: err },
      );
    }

    // Check JSON correctly
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
   * Roll the dice
   * @param id Game System ID
   * @param command Dice roll command
   * @returns Results of dice roll
   */
  async diceRoll(id: string, command: string): Promise<DiceRollResults> {
    // Get data
    const json = await this.getRequest(`v2/game_system/${id}/roll`, {
      searchParams: {
        command,
      },
    }).catch(async (err) => {
      // 400 Bad Request means command unsupported or game system unsupported
      if (err instanceof HTTPError && err.response.status === 400) {
        // Parse to JSON
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

    // Remove `ok` property from JSON (It don't need)
    delete json.ok;

    // Check JSON correctly
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
    // Parse to text
    const parsedTable = table.toBCDiceText();

    // Get data
    const json = await this.postRequest("v2/original_table", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `table=${parsedTable}`,
    }).catch((err) => {
      // 500 Internal Server Error means table is unsupported
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

    // Remove `ok` property from JSON (It don't need)
    delete json.ok;

    // Check JSON correctly
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

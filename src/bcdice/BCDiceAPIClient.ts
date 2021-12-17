import { default as ky, HTTPError, Options } from "ky";
import BCDiceOriginalTable from "./BCDiceOriginalTable.ts";
import BCDiceError from "./BCDiceError.ts";

/**
 * BCDice-API Version
 */
export interface APIVersion {
  /**
   * BCDice-API version
   */
  api: string;

  /**
   * BCDice version
   */
  bcdice: string;
}

/**
 * Check arg is APIVersion
 */
export const isAPIVersion = function isArgAPIVersion(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is APIVersion {
  const exceptedKeysJSON = JSON.stringify(["api", "bcdice"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.api === "string" && typeof arg.bcdice === "string";
};

/**
 * BCDice-API administrator data
 */
export interface APIAdmin {
  /**
   * Administrator name
   */
  name: string;

  /**
   * The URL of page to see terms
   */
  url: string;

  /**
   * Administrator E-Mail address
   */
  email: string;
}

/**
 * Check arg is APIAdmin
 */
// deno-lint-ignore no-explicit-any
export const isAPIAdmin = function isArgAPIVersion(arg: any): arg is APIAdmin {
  const exceptedKeysJSON = JSON.stringify(["name", "url", "email"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.name === "string" && typeof arg.url === "string" &&
    typeof arg.email === "string";
};

/**
 * Entry of BCDice-API available game systems
 */
export interface AvailableGameSystem {
  /**
   * Game System ID
   */
  id: string;

  /**
   * Game System Name
   */
  name: string;

  /**
   * Key for sorting game system
   */
  sortKey: string;
}

/**
 * Check arg is GameSystemEntry
 */
export const isAvailableGameSystem = function isArgAvailableGameSystem(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is AvailableGameSystem {
  const exceptedKeysJSON = JSON.stringify(["id", "name", "sortKey"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.id === "string" && typeof arg.name === "string" &&
    typeof arg.sortKey === "string";
};

/**
 * BCDice-API game system
 */
export interface GameSystem {
  /**
   * Game System ID
   */
  id: string;

  /**
   * Game System Name
   */
  name: string;

  /**
   * Key for sorting game system
   */
  sortKey: string;

  /**
   * RegExp to check specified command is executable
   */
  commandPattern: RegExp;

  /**
   * Help message
   */
  helpMessage: string;
}

/**
 * Check arg is GameSystem
 */
export const isGameSystem = function isArgGameSystem(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is GameSystem {
  const exceptedKeysJSON = JSON.stringify([
    "id",
    "name",
    "sortKey",
    "commandPattern",
    "helpMessage",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.id === "string" && typeof arg.name === "string" &&
    typeof arg.sortKey === "string" && arg.commandPattern instanceof RegExp;
};

/**
 * BCDice-API one of dice roll
 */
export interface DiceRoll {
  /**
   * Kind of dice roll
   */
  kind: "normal" | "tens_d10" | "d9";

  /**
   * Number of dice roll
   */
  sides: number;

  /**
   * Result of dice roll
   */
  value: number;
}

/**
 * Check arg is DiceRoll
 */
// deno-lint-ignore no-explicit-any
export const isDiceRoll = function isArgDiceRoll(arg: any): arg is DiceRoll {
  const exceptedKeysJSON = JSON.stringify([
    "kind",
    "sides",
    "value",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));
  const isKindCorrect = typeof arg.kind === "string" && arg.kind === "normal" ||
    arg.kind === "tens_d10" || arg.kind === "d9";

  return exceptedKeysJSON === actualKeysJSON && isKindCorrect &&
    typeof arg.sides === "number" && typeof arg.value === "number";
};

/**
 * BCDice-API dice roll results
 */
export interface DiceRollResults {
  /**
   * Output of the command
   */
  text: string;

  /**
   * Whether this dice is secret
   */
  secret: boolean;

  /**
   * Whether this result is success
   */
  success: boolean;

  /**
   * Whether this result is failure
   */
  failure: boolean;

  /**
   * Whether this result is critical
   */
  critical: boolean;

  /**
   * Whether this result is fumble
   */
  fumble: boolean;

  /**
   * Details of this dice roll
   */
  rands: DiceRoll[];
}

/**
 * Check arg is DiceRollResults
 */
export const isDiceRollResults = function isArgDiceRollResults(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is DiceRollResults {
  const exceptedKeysJSON = JSON.stringify([
    "text",
    "secret",
    "success",
    "failure",
    "critical",
    "fumble",
    "rands",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  // Check arg.rands is iterable
  if (!(Array.isArray(arg.rands))) {
    return false;
  }

  // Check all rands is correct
  for (const rand of arg.rands) {
    if (!isDiceRoll(rand)) {
      return false;
    }
  }

  return exceptedKeysJSON === actualKeysJSON && typeof arg.text === "string" &&
    typeof arg.secret === "boolean" && typeof arg.success === "boolean" &&
    typeof arg.failure === "boolean" && typeof arg.critical === "boolean" &&
    typeof arg.fumble === "boolean"; // Testing rands don't need.
};

export interface OriginalTableResults {
  /**
   * Output of the command
   */
  text: string;

  /**
   * Details of this dice roll
   */
  rands: DiceRoll[];
}

/**
 * Check arg is OriginalTableResults
 */
export const isOriginalTableResults = function isArgOriginalTableResults(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is OriginalTableResults {
  const exceptedKeysJSON = JSON.stringify([
    "text",
    "rands",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg));

  if (!(Array.isArray(arg.rands))) {
    return false;
  }

  // Check all rands is correct
  for (const rand of arg.rands) {
    if (!isDiceRoll(rand)) {
      return false;
    }
  }

  return exceptedKeysJSON === actualKeysJSON && typeof arg.text === "string"; // Testing rands don't need.
};

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
    json.command_pattern = new RegExp(json.commandPattern);

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

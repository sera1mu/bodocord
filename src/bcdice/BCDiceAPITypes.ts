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

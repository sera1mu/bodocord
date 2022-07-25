export interface APIVersion {
  /**
   * BCDice-APIのバージョン
   */
  api: string;

  /**
   * BCDice自体のバージョン
   */
  bcdice: string;
}

export function isAPIVersion(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is APIVersion {
  const exceptedKeysJSON = JSON.stringify(["api", "bcdice"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.api === "string" && typeof arg.bcdice === "string";
}

/**
 * BCDice-API の管理者情報
 */
export interface APIAdmin {
  /**
   * 管理者名
   */
  name: string;

  /**
   * 利用規約のURL
   */
  url: string;

  /**
   * 管理者のメールアドレス
   */
  email: string;
}

// deno-lint-ignore no-explicit-any
export function isAPIAdmin(arg: any): arg is APIAdmin {
  const exceptedKeysJSON = JSON.stringify(["email", "name", "url"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.name === "string" && typeof arg.url === "string" &&
    typeof arg.email === "string";
}

export interface AvailableGameSystem {
  id: string;

  name: string;

  /**
   * ゲームシステム名をソートするためのキー
   */
  sortKey: string;
}

export function isAvailableGameSystem(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is AvailableGameSystem {
  const exceptedKeysJSON = JSON.stringify(["id", "name", "sortKey"]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.id === "string" && typeof arg.name === "string" &&
    typeof arg.sortKey === "string";
}

export interface GameSystem {
  id: string;

  name: string;

  /**
   * ゲームシステム名をソートするためのキー
   */
  sortKey: string;

  /**
   * 指定されたコマンドがこのゲームシステムで実行可能かをチェックするための正規表現
   */
  commandPattern: RegExp;

  /**
   * 使い方などの追加情報
   */
  helpMessage: string;
}

export function isGameSystem(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is GameSystem {
  const exceptedKeysJSON = JSON.stringify([
    "commandPattern",
    "helpMessage",
    "id",
    "name",
    "sortKey",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  return exceptedKeysJSON === actualKeysJSON &&
    typeof arg.id === "string" && typeof arg.name === "string" &&
    typeof arg.sortKey === "string" && arg.commandPattern instanceof RegExp;
}

export interface DiceRoll {
  /**
   * 振ったダイスの種類
   */
  kind: "normal" | "tens_d10" | "d9";

  /**
   * 存在するダイスの面の数
   */
  sides: number;

  /**
   * ダイスの出目
   */
  value: number;
}

// deno-lint-ignore no-explicit-any
export function isDiceRoll(arg: any): arg is DiceRoll {
  const exceptedKeysJSON = JSON.stringify([
    "kind",
    "sides",
    "value",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());
  const isKindCorrect = typeof arg.kind === "string" && arg.kind === "normal" ||
    arg.kind === "tens_d10" || arg.kind === "d9";

  return exceptedKeysJSON === actualKeysJSON && isKindCorrect &&
    typeof arg.sides === "number" && typeof arg.value === "number";
}

export interface DiceRollResults {
  /**
   * コマンドの実行結果
   */
  text: string;

  /**
   * このダイスがシークレットダイスか否か
   */
  secret: boolean;

  /**
   * このコマンドが成功したか否か
   */
  success: boolean;

  /**
   * このコマンドが失敗したか否か
   */
  failure: boolean;

  /**
   * このコマンドがクリティカル(決定的成功)か否か
   */
  critical: boolean;

  /**
   * このコマンドがファンブル(致命的失敗)か否か
   */
  fumble: boolean;

  /**
   * 実際に振られたダイス
   */
  rands: DiceRoll[];
}

export function isDiceRollResults(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is DiceRollResults {
  const exceptedKeysJSON = JSON.stringify([
    "critical",
    "failure",
    "fumble",
    "rands",
    "secret",
    "success",
    "text",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  if (!(Array.isArray(arg.rands))) {
    return false;
  }

  for (const rand of arg.rands) {
    if (!isDiceRoll(rand)) {
      return false;
    }
  }

  return exceptedKeysJSON === actualKeysJSON && typeof arg.text === "string" &&
    typeof arg.secret === "boolean" && typeof arg.success === "boolean" &&
    typeof arg.failure === "boolean" && typeof arg.critical === "boolean" &&
    typeof arg.fumble === "boolean";
}

export interface OriginalTableResults {
  /**
   * 実行結果
   */
  text: string;

  /**
   * 実際に振られたダイス
   */
  rands: DiceRoll[];
}

export function isOriginalTableResults(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is OriginalTableResults {
  const exceptedKeysJSON = JSON.stringify([
    "rands",
    "text",
  ]);
  const actualKeysJSON = JSON.stringify(Object.keys(arg).sort());

  if (!(Array.isArray(arg.rands))) {
    return false;
  }

  for (const rand of arg.rands) {
    if (!isDiceRoll(rand)) {
      return false;
    }
  }

  return exceptedKeysJSON === actualKeysJSON && typeof arg.text === "string";
}

import { HTTPError, Options } from "ky";
import { beforeAll, describe, it } from "std/testing/bdd";
import { assertRejects, assertStrictEquals } from "std/testing/asserts";
import BCDiceAPIClient from "./BCDiceAPIClient.ts";
import WebClient, { IWebClient } from "./SimpleKyClient.ts";
import BCDiceError from "./BCDiceError.ts";
import BCDiceOriginalTable from "./BCDiceOriginalTable.ts";

describe("BCDiceAPIClient", () => {
  type ReturnOptions = {
    isThrowHTTPError: boolean;
    statusCode: number;
    statusText: string;
    // deno-lint-ignore no-explicit-any
    responseObject: any;
  };

  class DummyWebClient implements IWebClient {
    readonly prefixUrl: string | URL;

    constructor(prefixUrl: string | URL) {
      this.prefixUrl = prefixUrl;
    }

    private generateHTTPError(
      url: string,
      responseBody: string,
      method: "GET" | "POST",
    ) {
      return new HTTPError(
        new Response(JSON.stringify(responseBody), {
          status: returnOptions.statusCode,
          statusText: returnOptions.statusText,
        }),
        new Request(new URL(`${this.prefixUrl}/${url}`)),
        {
          method,
          credentials: undefined,
          retry: {},
          prefixUrl: this.prefixUrl.toString(),
          onDownloadProgress: undefined,
        },
      );
    }

    // deno-lint-ignore require-await no-explicit-any
    async get(url: string, _options?: Options | undefined): Promise<any> {
      if (returnOptions.isThrowHTTPError) {
        throw this.generateHTTPError(
          url,
          returnOptions.responseObject,
          "GET",
        );
      }

      return returnOptions.responseObject;
    }

    // deno-lint-ignore require-await no-explicit-any
    async post(url: string, _options?: Options | undefined): Promise<any> {
      if (returnOptions.isThrowHTTPError) {
        throw this.generateHTTPError(
          url,
          returnOptions.responseObject,
          "POST",
        );
      }

      return returnOptions.responseObject;
    }
  }

  let returnOptions: ReturnOptions;
  let bcdiceAPIClient: BCDiceAPIClient;

  beforeAll(() => {
    returnOptions = {
      isThrowHTTPError: false,
      statusCode: 200,
      statusText: "OK",
      responseObject: {},
    };

    bcdiceAPIClient = new BCDiceAPIClient(
      (new DummyWebClient("https://example.com") as unknown) as WebClient,
    );
  });

  function setConnectionErrorMode() {
    returnOptions.isThrowHTTPError = true;
    returnOptions.statusCode = 503;
    returnOptions.statusText = "Service Unavailable";
  }

  function setOkResponseMode() {
    returnOptions.isThrowHTTPError = false;
    returnOptions.statusCode = 200;
    returnOptions.statusText = "OK";
  }

  function setIncorrectResponseMode() {
    setOkResponseMode();
    returnOptions.responseObject = {
      hogehoge: "fugafuga",
    };
  }

  describe("getAPIVersion", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAPIVersion(),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAPIVersion(),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        api: "x.x.x",
        bcdice: "y.y.y",
      };

      const actual = JSON.stringify(await bcdiceAPIClient.getAPIVersion());
      const excepted = JSON.stringify(returnOptions.responseObject);

      assertStrictEquals(actual, excepted);
    });
  });

  describe("getAPIAdmin", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAPIAdmin(),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAPIAdmin(),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        name: "hogehoge",
        url: "fugafuga",
        email: "foooooooo",
      };

      const actual = JSON.stringify(await bcdiceAPIClient.getAPIAdmin());
      const excepted = JSON.stringify(returnOptions.responseObject);

      assertStrictEquals(actual, excepted);
    });
  });

  describe("getAvailableGameSystems", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAvailableGameSystems(),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getAvailableGameSystems(),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("incorrectGameSystemResponse", async () => {
      setIncorrectResponseMode();
      returnOptions.responseObject = {
        game_system: [
          {
            id: 0,
            name: false,
            sort_key: [],
          },
        ],
      };

      await assertRejects(
        async () => await bcdiceAPIClient.getAvailableGameSystems(),
        BCDiceError,
        "The game system is incorrect.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        game_system: [
          {
            id: "hogehoge",
            name: "ほげほげ",
            sort_key: "ほけほけ",
          },
        ],
      };

      const actual = JSON.stringify(
        await bcdiceAPIClient.getAvailableGameSystems(),
      );
      const excepted = JSON.stringify(
        returnOptions.responseObject.game_system,
      );

      assertStrictEquals(actual, excepted);
    });
  });

  describe("getGameSystem", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getGameSystem("DiceBot"),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () => await bcdiceAPIClient.getGameSystem("DiceBot"),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("unsupportedSystem", async () => {
      returnOptions.isThrowHTTPError = true;
      returnOptions.statusCode = 400;
      returnOptions.statusText = "Bad Request";
      returnOptions.responseObject = {
        reason: "unsupported game system",
      };

      await assertRejects(
        async () => await bcdiceAPIClient.getGameSystem("hogehoge"),
        BCDiceError,
        "The specified game system is unsupported.",
      );
    });

    it("incorrectGameSystemResponse", async () => {
      setIncorrectResponseMode();
      returnOptions.responseObject = {
        ok: true,
        id: 999,
        name: false,
        sort_key: [],
        command_pattern: -5,
        help_message: 39,
      };

      await assertRejects(
        async () => await bcdiceAPIClient.getGameSystem("DiceBot"),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        ok: true,
        id: "hogehoge",
        name: "ほげほげ",
        sort_key: "ほけほけ",
        command_pattern: "ほげええ",
        help_message: "ほげえええ",
      };

      const actual = JSON.stringify(
        await bcdiceAPIClient.getGameSystem("DiceBot"),
      );
      const excepted = JSON.stringify(returnOptions.responseObject);

      assertStrictEquals(actual, excepted);
    });
  });

  describe("diceRoll", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () => await bcdiceAPIClient.diceRoll("DiceBot", "1D6"),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () => await bcdiceAPIClient.diceRoll("DiceBot", "1d6"),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("unsupportedSystem", async () => {
      returnOptions.isThrowHTTPError = true;
      returnOptions.statusCode = 400;
      returnOptions.statusText = "Bad Request";
      returnOptions.responseObject = {
        reason: "unsupported game system",
      };

      await assertRejects(
        async () => await bcdiceAPIClient.diceRoll("DiceBot", "1d6"),
        BCDiceError,
        "The specified game system is unsupported.",
      );
    });

    it("unsupportedCommand", async () => {
      returnOptions.isThrowHTTPError = true;
      returnOptions.statusCode = 400;
      returnOptions.statusText = "Bad Request";
      returnOptions.responseObject = {
        reason: "unsupported command",
      };

      await assertRejects(
        async () => await bcdiceAPIClient.diceRoll("DiceBot", "1d6"),
        BCDiceError,
        "The specified command is unsupported.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        ok: true,
        text: "hogehoge",
        secret: false,
        success: false,
        failure: false,
        critical: true,
        fumble: false,
        rands: [
          {
            kind: "normal",
            sides: 10,
            value: -1,
          },
        ],
      };

      const actual = JSON.stringify(
        await bcdiceAPIClient.diceRoll("DiceBot", "1d6"),
      );
      const excepted = JSON.stringify(returnOptions.responseObject);

      assertStrictEquals(actual, excepted);
    });
  });

  describe("runOriginalTable", () => {
    it("connectionError", async () => {
      setConnectionErrorMode();

      await assertRejects(
        async () =>
          await bcdiceAPIClient.runOriginalTable(
            new BCDiceOriginalTable({
              title: "hogehoge",
              command: "fugafuga",
              items: ["hoge", "fuga", "fooo"],
            }),
          ),
        BCDiceError,
        "Failed to communicate with API.",
      );
    });

    it("incorrectResponse", async () => {
      setIncorrectResponseMode();

      await assertRejects(
        async () =>
          await bcdiceAPIClient.runOriginalTable(
            new BCDiceOriginalTable({
              command: "hoge",
              title: "hogehoge",
              items: ["fuga"],
            }),
          ),
        BCDiceError,
        "The response is incorrect.",
      );
    });

    it("unsupportedTable", async () => {
      returnOptions.isThrowHTTPError = true;
      returnOptions.statusCode = 500;
      returnOptions.statusText = "Internal Server Error";

      await assertRejects(
        async () =>
          await bcdiceAPIClient.runOriginalTable(
            new BCDiceOriginalTable({
              command: "hoge",
              title: "hogehoge",
              items: ["fuga"],
            }),
          ),
        BCDiceError,
        "The specified table is unsupported.",
      );
    });

    it("success", async () => {
      setOkResponseMode();
      returnOptions.responseObject = {
        ok: true,
        text: "ほげ",
        rands: [
          {
            kind: "normal",
            sides: 6,
            value: 6,
          },
        ],
      };

      const actual = JSON.stringify(
        await bcdiceAPIClient.runOriginalTable(
          new BCDiceOriginalTable({
            command: "hoge",
            title: "hogehoge",
            items: ["fuga"],
          }),
        ),
      );
      const excepted = JSON.stringify(returnOptions.responseObject);

      assertStrictEquals(actual, excepted);
    });
  });
});

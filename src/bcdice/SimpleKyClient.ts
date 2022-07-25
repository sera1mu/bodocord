import { default as ky } from "ky";
import { Options } from "ky";

export interface IWebClient {
  /**
   * 指定されたURLにGETリクエストを送信する。レスポンスをJSONとしてパースして返す。
   * @returns JSONとしてパースされたレスポンス
   */
  // deno-lint-ignore no-explicit-any
  get(url: string, options?: Options): Promise<any>;

  /**
   * 指定されたURLにPOSTリクエストを送信する。レスポンスをJSONとしてパースして返す。
   * @returns JSONとしてパースされたレスポンス
   */
  // deno-lint-ignore no-explicit-any
  post(url: string, options?: Options): Promise<any>;
}

/**
 * KyによるGET/POSTを送信するクライアント
 */
export default class WebClient implements IWebClient {
  readonly prefixUrl: string | URL;

  private readonly kyClient: ReturnType<typeof ky.create>;

  constructor(prefixUrl: string | URL) {
    this.prefixUrl = prefixUrl;

    this.kyClient = ky.create({
      prefixUrl,
    });
  }

  async get(
    url: string,
    options?: Options | undefined,
    // deno-lint-ignore no-explicit-any
  ): Promise<any> {
    const res = await this.kyClient.get(url, options);
    const json = await res.json();
    return json;
  }

  async post(
    url: string,
    options?: Options | undefined,
    // deno-lint-ignore no-explicit-any
  ): Promise<any> {
    const res = await this.kyClient.post(url, options);
    const json = await res.json();
    return json;
  }
}

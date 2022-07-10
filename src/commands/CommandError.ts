export default class CommandError extends Error {
  /**
   * エラーハッシュ (MD5)
   * 
   * エラーを簡単にログから検索するために使用されます。
   */
  readonly hash: string;

  /**
   * @param hash エラーハッシュ (MD5)
   */
  constructor(hash: string, message?: string, options?: ErrorOptions) {
    super(message, options);

    this.hash = hash;
  }
}

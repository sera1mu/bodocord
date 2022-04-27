export default class CommandError extends Error {
  /**
   * Hash to identify the error from log (MD5)
   */
  readonly hash: string;

  /**
   * @param hash Error hash (MD5)
   */
  constructor(hash: string, message?: string, options?: ErrorOptions) {
    super(message, options);

    this.hash = hash;
  }
}

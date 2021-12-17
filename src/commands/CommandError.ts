export default class CommandError extends Error {
  /**
   * Hash to identify the error from log (MD5)
   */
  readonly hash: string;

  /**
   * @param hash Error hash (MD5)
   */
  constructor(hash: string, message?: string, init?: ErrorInit) {
    super(message, init);

    this.hash = hash;
  }
}

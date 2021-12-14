import { Client, ClientOptions, event } from "harmony";
import pino from "pino";

/**
 * Bodocord Discord gateway client
 */
export default class BodocordClient extends Client {
  private logger: pino.Logger;

  /**
   * @param loggerOptionsOrStream Pino logger
   * @param options Client options
   */
  constructor(
    loggerOptionsOrStream?: pino.LoggerOptions | pino.DestinationStream,
    options?: ClientOptions,
  ) {
    super(options);

    this.logger = pino(loggerOptionsOrStream);
  }

  @event()
  ready(): void {
    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }
}

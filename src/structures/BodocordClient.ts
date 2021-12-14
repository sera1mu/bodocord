import { Client, ClientOptions, event } from "harmony";
import { DestinationStream, LoggerOptions, pino } from "pino";

export default class BodocordClient extends Client {
  private logger: pino.Logger;

  constructor(
    loggerOptionsOrStream?: LoggerOptions | DestinationStream,
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

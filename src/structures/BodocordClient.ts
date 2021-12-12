import { Client, ClientOptions, event } from "harmony";

import { Logger } from "std/log";

export default class BodocordClient extends Client {
  logger: Logger;

  constructor(logger: Logger, options?: ClientOptions) {
    super(options);

    this.logger = logger;
  }

  @event()
  ready(): void {
    this.logger.info(`Ready! Logged in as ${this.user?.tag}(${this.user?.id})`);
  }
}

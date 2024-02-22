import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";

@injectable()
export class ServiceBusGetProductByIdHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
  ) {
    super();
  }

  async executeFunction(context: Context, mySbMsg): Promise<void> {
    try {
      this.logger.info(`Service Bus trigger ServiceBusGetProductByIdHandler- ${JSON.stringify(mySbMsg)} `);


      this.logger.info(`ServiceBusGetProductByIdHandler handled successfully- ${JSON.stringify(mySbMsg)} `);
    } catch (err) {
      this.logger.error(`Error in ServiceBusGetProductByIdHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

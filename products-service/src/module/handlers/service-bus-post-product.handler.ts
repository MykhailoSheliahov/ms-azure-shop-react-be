import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";

@injectable()
export class ServiceBusPostProductHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  async executeFunction(context: Context, mySbMsg): Promise<void> {
    try {
      this.logger.info(`Service Bus trigger ServiceBusPostProductHandler - ${JSON.stringify(context.bindings.message)} `);

      const { count, price, ...productItem } = mySbMsg[0]

      const product = {
        ...productItem,
        count: Number(count),
        price: Number(price),
      }

      await this.productsService.createProduct(product)

      this.logger.info(`ServiceBusPostProductHandler handled successfully`);
    } catch (err) {
      this.logger.error(`Error in ServiceBusPostProductHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

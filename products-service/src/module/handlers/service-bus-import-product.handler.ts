import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";

@injectable()
export class ServiceBusImportProductHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  async executeFunction(context: Context, mySbMsg): Promise<void> {
    try {
      this.logger.info(`Service Bus trigger ServiceBusImportProductHandler - ${JSON.stringify(mySbMsg)} `);

      const { count, price, ...productItem } = mySbMsg

      const product = {
        ...productItem,
        count: Number(count),
        price: Number(price),
      }

      await this.productsService.createProduct(product)

      this.logger.info(`ServiceBusImportProductHandler handled successfully product - ${JSON.stringify(product)} `);
    } catch (err) {
      this.logger.error(`Error in ServiceBusImportProductHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";

@injectable()
export class HttpGetProductsTotalHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('HTTP trigger HttpGetProductsTotalHandler function processed a request.');

      const totalItems = await this.productsService.getProductsTotal();

      context.res = { body: totalItems };
    } catch (err) {
      this.logger.error(`Error in HttpGetProductsTotalHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

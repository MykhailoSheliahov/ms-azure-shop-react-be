import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";

@injectable()
export class HttpGetProductsListHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('HTTP trigger HttpGetProductsListHandler function processed a request.');

      const products = await this.productsService.getProducts();
      
      context.res = { body: products };
    } catch (err) {
      this.logger.error(`Error in HttpGetProductByIdHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

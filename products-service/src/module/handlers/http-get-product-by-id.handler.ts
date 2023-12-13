import { injectable } from "inversify";
import { Context } from "@azure/functions";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";
import { AppConfigService } from "../services/appConfig.service";

@injectable()
export class HttpGetProductByIdHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
    private readonly appConfigService: AppConfigService
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('HTTP trigger HttpGetProductByIdHandler function processed a request.');

      const res = await this.appConfigService.getAppConfig('WEBSITE_CONTENTSHARE')
      const product = await this.productsService.getProductById(context.req.params.id)

      context.res = { body: product };
    } catch (err) {
      this.logger.error(`Error in HttpGetProductByIdHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

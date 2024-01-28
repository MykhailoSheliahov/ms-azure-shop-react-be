import { injectable } from "inversify";
import { Context } from "@azure/functions";
import { faker } from '@faker-js/faker';

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { ProductsService } from "../services/products.service";
import { isDataValid } from './../utils';
import { serviceBus } from "./service-bus.handler";
import { EventType, Topic } from "../constants";

@injectable()
export class HttpPostProductsHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('HTTP trigger HttpPostProductsHandler function processed a request.');
      const id = context.req.body.id ? context.req.body.id : faker.string.uuid();

      const data = {
        ...context.req.body,
        id
      }

      if (!isDataValid(data)) {
        throw ({ statusCode: 400, message: 'Product data is invalid' });
      }

      await serviceBus(Topic.productUpdates, data, {
        eventType: EventType.productItemCreated,
      })

      this.logger.info(`HttpPostProductsHandler handled successfully`);
    } catch (err) {
      this.logger.error(`Error in HttpPostProductsHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

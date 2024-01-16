import { injectable } from "inversify";
import { BlobServiceClient, } from "@azure/storage-blob";
import { Context } from "@azure/functions";
import { parse } from "csv-parse/sync";
import { faker } from '@faker-js/faker';

import { ProductUI } from './../types'
import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { isDataValid } from "../utils";
import { ProductsService } from "../services/products.service";
import { UPLOAD_FILE_CONTAINER, PARSE_FILE_CONTAINER } from "../constants";

@injectable()
export class BlobImportProductsFromFileHandler extends BaseHandler {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('Blob trigger BlobImportProductsFromFileHandler function processed a request.');

      const records = parse(context.bindings.blob, {
        columns: true,
        skip_empty_lines: true,
      });
      this.logger.info(`BlobImportProductsFromFileHandler - ${JSON.stringify(records)}`);

      await Promise.all(records.map(async (item: ProductUI) => {
        const id = item.id ? item.id : faker.string.uuid();

        const data = {
          ...item,
          id,
          price: Number(item.price),
          count: Number(item.count)
        }

        if (!isDataValid(data)) {
          throw ({ statusCode: 400, message: 'Product data is invalid' });
        }

        await this.productsService.createProduct(data)
        this.logger.info(`Record created - ${JSON.stringify(data)}`);
      }))


      const fullPath = context.bindingData.blobTrigger;
      const regex = /[^/]*\.csv$/
      const blobName = fullPath.match(regex)[0]

      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT);

      const srcContainerClient = blobServiceClient.getContainerClient(UPLOAD_FILE_CONTAINER);
      const destContainerClient = blobServiceClient.getContainerClient(PARSE_FILE_CONTAINER);

      if (!(await destContainerClient.exists())) {
        await destContainerClient.create();
        this.logger.info(`${PARSE_FILE_CONTAINER} container created successfully.`);
      }

      const srcBlobClient = srcContainerClient.getBlobClient(blobName);
      const destBlobClient = destContainerClient.getBlobClient(blobName);

      // Copy the blob
      const poller = await destBlobClient.beginCopyFromURL(srcBlobClient.url);
      await poller.pollUntilDone();
      this.logger.info(`${blobName} blob copied successfully.`);

      // Delete the source blob
      await srcBlobClient.delete();
      this.logger.info(`${blobName} blob deleted from '${UPLOAD_FILE_CONTAINER}' and moved to '${PARSE_FILE_CONTAINER}' container.`);
    } catch (err) {
      this.logger.error(`Error in BlobImportProductsFromFileHandler - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

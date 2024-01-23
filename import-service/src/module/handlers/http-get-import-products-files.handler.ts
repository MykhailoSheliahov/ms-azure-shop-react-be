import { injectable } from "inversify";
import { Context } from "@azure/functions";
import { generateBlobSASQueryParameters, BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions } from "@azure/storage-blob";

import { BaseHandler } from "../../common/handlers/base.handler";
import { Logger } from "../../common/logger/logger";
import { UPLOAD_FILE_CONTAINER } from "../constants";

@injectable()
export class HttpGetImportProductsFiles extends BaseHandler {
  constructor(
    private readonly logger: Logger,
  ) {
    super();
  }

  async executeFunction(context: Context, ...args: any[]): Promise<void> {
    try {
      this.logger.info('HTTP trigger HttpGetImportProductsFiles function processed a request.');

      const blobName = context.req.query.name as string;

      if (!blobName) {
        context.res = {
          status: 400,
          body: "Name is not provided",
        };
        return;
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT);
      const containerClient = blobServiceClient.getContainerClient(UPLOAD_FILE_CONTAINER);

      if (!(await containerClient.exists())) {
        await containerClient.create();
        this.logger.info(`Container created -${UPLOAD_FILE_CONTAINER}`);
      }

      const blobClient = containerClient.getBlobClient(blobName);

      const permissions = BlobSASPermissions.parse("rw"); 
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 15);
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: UPLOAD_FILE_CONTAINER,
          blobName,
          permissions,
          startsOn: new Date(),
          expiresOn: expiryDate,
        },
        // @ts-ignore
        new StorageSharedKeyCredential(containerClient.accountName, (containerClient.credential as StorageSharedKeyCredential)!.accountKey)
      ).toString();

      const sasUrl = blobClient.url + "?" + sasToken;
      this.logger.info(`sasUrl created - '${JSON.stringify(UPLOAD_FILE_CONTAINER)}' `)

      context.res = {
        status: 200,
        body: sasUrl
      };
    } catch (err) {
      this.logger.error(`Error in HttpGetImportProductsFiles - ${JSON.stringify(err)}`);

      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
  }
}

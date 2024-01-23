import { AzureFunction } from "@azure/functions"
import {makeHandler} from "../src/common/inversify/make-handler";
import { BlobImportProductsFromFileHandler } from "../src/module/handlers/blob-import-products-from-file.handler";

const blobTrigger: AzureFunction = makeHandler(BlobImportProductsFromFileHandler)
export default blobTrigger;
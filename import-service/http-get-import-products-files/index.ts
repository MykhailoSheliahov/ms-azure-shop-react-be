import { AzureFunction } from "@azure/functions"

import { makeHandler } from "../src/common/inversify/make-handler";
import { HttpGetImportProductsFiles } from "../src/module/handlers/http-get-import-products-files.handler";

const httpTrigger: AzureFunction = makeHandler(HttpGetImportProductsFiles)
export default httpTrigger;

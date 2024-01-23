import { AzureFunction } from "@azure/functions"

import { makeHandler } from "../src/common/inversify/make-handler";
import { HttpPostProductsHandler } from "../src/module/handlers/https-post-product.handler";

const httpTrigger: AzureFunction = makeHandler(HttpPostProductsHandler)
export default httpTrigger;

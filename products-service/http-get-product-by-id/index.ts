import { AzureFunction } from "@azure/functions"

import { makeHandler } from "../src/common/inversify/make-handler";
import { HttpGetProductByIdHandler } from "../src/module/handlers/http-get-product-by-id.handler";

const httpTrigger: AzureFunction = makeHandler(HttpGetProductByIdHandler)
export default httpTrigger;

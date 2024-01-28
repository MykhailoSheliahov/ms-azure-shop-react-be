import { AzureFunction } from "@azure/functions"
import {makeHandler} from "../src/common/inversify/make-handler";

import { ServiceBusImportProductHandler } from "../src/module/handlers/service-bus-import-product.handler";

const serviceBusTrigger: AzureFunction = makeHandler(ServiceBusImportProductHandler)
export default serviceBusTrigger;

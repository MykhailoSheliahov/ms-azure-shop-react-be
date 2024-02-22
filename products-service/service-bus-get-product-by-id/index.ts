import { AzureFunction } from "@azure/functions"
import {makeHandler} from "../src/common/inversify/make-handler";

import { ServiceBusGetProductByIdHandler } from "../src/module/handlers/service-bus-get-product-by-id.handler";

const serviceBusTrigger: AzureFunction = makeHandler(ServiceBusGetProductByIdHandler)
export default serviceBusTrigger;

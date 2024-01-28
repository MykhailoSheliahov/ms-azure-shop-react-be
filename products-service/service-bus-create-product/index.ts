import { AzureFunction } from "@azure/functions"
import {makeHandler} from "../src/common/inversify/make-handler";

import { ServiceBusPostProductHandler } from "../src/module/handlers/service-bus-post-product.handler";

const serviceBusTrigger: AzureFunction = makeHandler(ServiceBusPostProductHandler)
export default serviceBusTrigger;

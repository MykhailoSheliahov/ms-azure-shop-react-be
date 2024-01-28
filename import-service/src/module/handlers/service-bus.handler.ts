import { ServiceBusClient } from "@azure/service-bus";
import { faker } from '@faker-js/faker';

import { ServiceBusMessage, ServiceBusParams } from "../types";
import { Topic } from "../constants";

const serviceBusClient = new ServiceBusClient(process.env.CONNECTION_SERVICE_BUS);

export const serviceBus = async (topic: Topic, body: object, params: ServiceBusParams): Promise<void> => {
  const sender = serviceBusClient.createSender(topic);

  const message: ServiceBusMessage = {
    messageId: faker.string.uuid(),
    body,
    params,
  };

  await sender.sendMessages(message);
};

import { appContainer } from "../inversify/container";
import { CosmosClient } from "@azure/cosmos";

export const COSMOS_DB = 'COSMOS_DB';

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

appContainer
  .bind(COSMOS_DB)
  .toDynamicValue(async () => {
    const client = new CosmosClient({ endpoint, key });

    return client.database('products-db')
  });

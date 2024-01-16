import { inject, injectable } from "inversify";
import { Database, Container } from "@azure/cosmos";

import { Product } from "../types";
import { COSMOS_DB } from "../../common/cosmos/cosmos-database";

@injectable()
export class ProductsRepository {
  public readonly container: Container;

  constructor(@inject(COSMOS_DB) private readonly database: Database) {
    this.container = database.container('products')
  }

  async upsertProduct(product: Product): Promise<void> {
    try {
      await this.container.items.upsert(product);
    } catch (err) {
      throw err;
    }
  }
}

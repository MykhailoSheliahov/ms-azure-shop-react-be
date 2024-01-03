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

  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.container.items.query(`SELECT * FROM c`).fetchAll();
      return response.resources.map(({ id, title, description, price }) => ({ id, title, description, price }))
    } catch (err) {
      throw err;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.container.item(id, id).read();
      const {
        id: ids,
        title,
        description,
        price
      } = response.resource;

      return {
        id: ids,
        title,
        description,
        price,
      }
    } catch (err) {
      throw err;
    }
  }

  async upsertProduct(product: Product): Promise<void> {
    try {
      await this.container.items.upsert(product);
    } catch (err) {
      throw err;
    }
  }
}

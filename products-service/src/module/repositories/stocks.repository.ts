import { inject, injectable } from "inversify";
import { Container, Database } from "@azure/cosmos";

import { Stock } from "../types";
import { COSMOS_DB } from "../../common/cosmos/cosmos-database";

@injectable()
export class StocksRepository {
  public readonly container: Container;

  constructor(@inject(COSMOS_DB) private readonly database: Database) {
    this.container = database.container('stocks')
  }

  async getStockForProduct(productId: string): Promise<Stock> {
    try {
      const item = await this.container.item(productId, productId).read();
      const { id,
        product_id,
        count } = item.resource;
      return { id, product_id, count }
    } catch (err) {
      throw err;
    }
  }

  async getStockCountForProducts(): Promise<number> {
    try {
      const item = await this.container.items.query(`SELECT VALUE COUNT(c.id) FROM c WHERE c.count > 0`).fetchAll();
      return item.resources[0];
    } catch (err) {
      throw err;
    }
  }

  async upsertStock(stock: Stock): Promise<void> {
    try {
      await this.container.items.upsert(stock);
    } catch (err) {
      throw err;
    }
  }
}

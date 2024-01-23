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

  async upsertStock(stock: Stock): Promise<void> {
    try {
      await this.container.items.upsert(stock);
    } catch (err) {
      throw err;
    }
  }
}

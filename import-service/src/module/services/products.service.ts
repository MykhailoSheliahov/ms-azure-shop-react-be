import { injectable } from "inversify";

import { ProductUI } from "../types";
import { ProductsRepository } from "../repositories/products.repository";
import { StocksRepository } from "../repositories/stocks.repository";

@injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly stocksRepository: StocksRepository,
  ) { }

  async createProduct(product: ProductUI): Promise<void> {
    try {
      const { count, id, ...productItem } = product

      const productToSave = { ...productItem, id }
      const stockToSave = { id, product_id: id, count }

      await this.productsRepository.upsertProduct(productToSave);
      await this.stocksRepository.upsertStock(stockToSave);
    } catch (err) {
      throw err;
    }
  }
}

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

  async getProducts(): Promise<ProductUI[]> {
    try {
      const products = await this.productsRepository.getProducts();

      if (!products) {
        throw ({ statusCode: 500, message: "Error during receiving products" });
      }

      return Promise.all(products.map(async (product) => {
        const stock = await this.stocksRepository.getStockForProduct(product.id);

        return {
          ...product,
          count: stock?.count || 0
        }
      }))
    } catch (err) {
      throw err;
    }
  }

  async getProductsTotal(): Promise<number> {
    try {
      const productsCounts = await this.stocksRepository.getStockCountForProducts();

      if (!productsCounts) {
        throw ({ statusCode: 500, message: "Error during receiving products count" });
      }

      return productsCounts;
    } catch (err) {
      throw err;
    }
  }

  async getProductById(id: string): Promise<ProductUI> {
    try {
      const product = await this.productsRepository.getProductById(id);

      if (!product) {
        throw ({ statusCode: 404, message: `There is no product with id - ${id}` });
      }

      const stock = await this.stocksRepository.getStockForProduct(product.id);

      return {
        ...product,
        count: stock?.count || 0
      }
    } catch (err) {
      throw err;
    }
  }

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

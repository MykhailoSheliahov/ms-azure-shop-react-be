import { injectable } from "inversify";

import { Product } from "../types";
import { ProductsRepository } from "../repositories/products.repository";

@injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
  ) { }

  async getProducts(): Promise<Product[]> {
    return await this.productsRepository.getProducts();
  }

  async getProductById(id: string): Promise<Product> {
    return await this.productsRepository.getProductById(id);
  }
}

import { injectable } from "inversify";

import { Product } from "../types";
import { productList } from "./product.mock";

@injectable()
export class ProductsRepository {
  constructor() { }

  async getProducts(): Promise<Product[]> {
    try {
      const getProducts = new Promise<Product[]>(res => res(productList));
      const products = await getProducts;

      if (!products) {
        throw ({ statusCode: 500, message: "Error during receiving products" });
      }

      return products;
    } catch (err) {
      throw err;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const getProductById = new Promise<Product>(res => {
        const product = productList.find((p: Product) => p.id === id);

        if (!product) {
          throw ({ statusCode: 404, message: `There is no product with id - ${id}` });
        }

        res(product);
      });

      const product = await getProductById;

      return product;
    } catch (err) {
      throw err;
    }
  }
}

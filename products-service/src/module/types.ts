export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
}

export type ProductUI = {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export type Stock = {
  id: string;
  product_id: string;
  count: number;
}

import { ProductUI } from './types'

export const UPLOAD_FILE_CONTAINER = 'uploaded'
export const PARSE_FILE_CONTAINER = 'parsed'

export const PRODUCT_MOCK: ProductUI = {
  "id": "5912bec7-2345-42d7-a9da-20058725c04b",
  "title": "Rose silver",
  "description": "Urbs cresco dolore approbo. Cubicularis cultellus sunt quasi amo deserunt clamo stillicidium spiculum. Atque possimus summopere comitatus caute.",
  "price": 517,
  "count": 10,
}

export enum EventType {
  productCreated = "sb-subscription-product-batch-created",
}

export enum Topic {
  productUpdates = "sb-topic-products-updates",
}

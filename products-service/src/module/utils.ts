import { ProductUI } from './types'
import { PRODUCT_MOCK } from './constants'

export const isDataValid = (payload: ProductUI | any): boolean => {
  const isAllParamsExist = Object.keys(payload as ProductUI).every(p => p in PRODUCT_MOCK);

  if (!isAllParamsExist) {
    return false;
  }

  return typeof payload.id === 'string' &&
    typeof payload.title === 'string' &&
    typeof payload.description === 'string' &&
    typeof payload.price === 'number' &&
    typeof payload.count === 'number'
}

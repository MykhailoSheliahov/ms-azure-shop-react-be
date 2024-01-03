import { faker } from '@faker-js/faker';

import { Product } from './../types';

export function createRandomProduct(): Product {
  return {
    id: faker.string.uuid(),
    title: faker.company.name(),
    description: faker.lorem.paragraph(),
    price: faker.number.int()
  };
}

export const productList: Product[] = faker.helpers.multiple(createRandomProduct, {
  count: 5,
});

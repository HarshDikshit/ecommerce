import { type SchemaTypeDefinition } from 'sanity'
import { categoryType } from './categoryType'
import { addressType } from './addressType'
import { productType } from './productType'
import { orderType } from './orderType'
import { carouselTypes } from './carouselTypes'
import { commentTypes } from './commentTypes'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [carouselTypes, categoryType, addressType, productType, orderType, commentTypes],
}


import { defineQuery } from "groq";

export const categoryQuery =
  defineQuery(`*[_type == "category" && !defined(parent)]{
  _id,
  title,
  slug,
  "parent": parent->title,
  "imageUrl": image.asset->url
}`);

export const carouselQuery =
  defineQuery(`*[_type == "carousel"] | order(_createdAt asc)  {
  _id,
  title,
  subtitle,
  buttonText,
  buttonVariant,
  buttonLink,
  "imageUrl": image.asset->url
}`);

export const productQuery =
  defineQuery(`*[_type == "product"] | order(createdAt desc) [0...$quantity] {
  _id,
  name,
  slug,
  price,
  discount,
  stock,
  status,
  description,
  "images": images[].asset->url
}`);

// sanity/lib/queries.ts
// export const filterProductsQuery = (filters: {
//   bead?: string[];
//   purpose?: string[];
//   category?: string[];
//   minPrice?: number;
//   maxPrice?: number;
//   sort?: string;
// }) => {
//   let conditions: string[] = [];

//   // bead filter
//   if (filters.bead?.length) {
//     conditions.push(
//       `count(bead[@ in ${JSON.stringify(
//         filters.bead.map((b) => b.toLowerCase())
//       )}]) > 0`
//     );
//   }

//   // purpose filter
//   if (filters.purpose?.length) {
//     conditions.push(
//       `count(purpose[@ in ${JSON.stringify(
//         filters.purpose.map((p) => p.toLowerCase())
//       )}]) > 0`
//     );
//   }

//   // price filter
//   if (filters.minPrice !== undefined) {
//     conditions.push(`price >= ${filters.minPrice}`);
//   }
//   if (filters.maxPrice !== undefined) {
//     conditions.push(`price <= ${filters.maxPrice}`);
//   }

//   let query = `*[_type == "product"${
//     conditions.length ? " && " + conditions.join(" && ") : ""
//   }]{
//     _id,
//     name,
//     "slug": slug.current,
//     price,
//     discount,
//     stock,
//     bead,
//     purpose,
//     createdAt,
//     "images": images[].asset->url
//   }`;

//   // sorting
//   switch (filters.sort) {
//     case "alphabetical":
//       query += " | order(name asc)";
//       break;
//     case "latest":
//       query += " | order(createdAt desc)";
//       break;
//     case "price":
//       query += " | order(price asc)";
//       break;
//     default:
//       query += " | order(createdAt desc)";
//   }

//   return query;
// };

export const filterProductsQuery = (filters: {
  bead?: string[];
  purpose?: string[];
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}) => {
  let conditions: string[] = [];

  // bead filter
  if (filters.bead?.length) {
    conditions.push(
      `count(bead[@ in ${JSON.stringify(
        filters.bead.map((b) => b.toLowerCase())
      )}]) > 0`
    );
  }

  // purpose filter
  if (filters.purpose?.length) {
    conditions.push(
      `count(purpose[@ in ${JSON.stringify(
        filters.purpose.map((p) => p.toLowerCase())
      )}]) > 0`
    );
  }

  // category filter (using category.slug.current)
  if (filters.category?.length) {
    conditions.push(
      `count(categories[@._ref in ${JSON.stringify(filters.category)}]) > 0`
    );
  }

  // price filter
  if (filters.minPrice !== undefined) {
    conditions.push(`price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= ${filters.maxPrice}`);
  }

  // base query
  let query = `*[_type == "product"${
    conditions.length ? " && " + conditions.join(" && ") : ""
  }]{
    _id,
    name,
    "slug": slug.current,
    price,
    discount,
    stock,
    bead,
    purpose,
    createdAt,
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    "images": images[].asset->url
  }`;

  // sorting
  switch (filters.sort) {
    case "alphabetical":
      query += " | order(name asc)";
      break;
    case "latest":
      query += " | order(createdAt desc)";
      break;
    case "price":
      query += " | order(price asc)";
      break;
    default:
      query += " | order(createdAt desc)";
  }

  return query;
};

export const GALLERY_COLLAGE = defineQuery(`
  *[_type == "product" && isGallery == true] | order(createdAt desc)[0...$quantity] {
    _id,
    name,
    "slug": slug.current,
    "galleryImage": galleryImage.asset->url
  }
`);

export const PRODUCT_BY_SLUG_QUERY = defineQuery(
  `*[_type == 'product' && slug.current == $slug] | order(name asc)[0]`
);

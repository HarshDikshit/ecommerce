import { sanityFetch } from "../lib/live"
import { carouselQuery, categoryQuery, GALLERY_COLLAGE, PRODUCT_BY_SLUG_QUERY, productQuery } from "./query"

interface ProductFilter {
  status?: string[];
  purpose?: string[];
  bead?: string[];
  categoryId?: string;
}

const getProducts = async (
  quantity?: number,
  filters?: ProductFilter
) => {
  try {
    let filterString = "";

    if (filters) {
      const conditions: string[] = [];

      if (filters.status?.length) {
        conditions.push(`count(status[@ in $status]) > 0`);
      }

      if (filters.purpose?.length) {
        conditions.push(`count(purpose[@ in $purpose]) > 0`);
      }

      if (filters.bead?.length) {
        conditions.push(`count(bead[@ in $bead]) > 0`);
      }

      if (filters.categoryId) {
        conditions.push(`category._ref == $categoryId`);
      }

      if (conditions.length) {
        filterString = " && " + conditions.join(" && ");
      }
    }

    const query = quantity ?
     `*[_type == "product"${filterString}] | order(createdAt desc) [0...$quantity] {
      _id,
      name,
      slug,
      price,
      discount,
      stock,
      status,
      purpose,
      bead,
      category-> { _id, name },
      description,
      "images": images[].asset->url
    }` 
  : `*[_type == "product"${filterString}] | order(createdAt desc){
      _id,
      name,
      slug,
      price,
      discount,
      stock,
      status,
      purpose,
      bead,
      category-> { _id, name },
      description,
      "images": images[].asset->url
    }`;

    const { data } = await sanityFetch({
      query,
      params: {
        quantity,
        status: filters?.status,
        purpose: filters?.purpose,
        bead: filters?.bead,
        categoryId: filters?.categoryId,
      },
    });

    return data ?? [];
  } catch (error) {
    console.log("Error fetching products:", error);
    return [];
  }
};

const getAllCategories = async ()=> {
    try {
        const {data} = await sanityFetch({query: categoryQuery })
        return data  ?? [];
    } catch (error) {
        console.log("Error fetching all categories:", error);
        return [];
    }
}
const getAllSlides = async ()=> {
    try {
        const {data} = await sanityFetch({query: carouselQuery
         })
        return data  ?? [];
    } catch (error) {
        console.log("Error fetching all slides:", error);
        return [];
    }
}
const getProductBySlug = async (slug: string)=> {
    try {
        const {data} = await sanityFetch({query: PRODUCT_BY_SLUG_QUERY, params: {slug,}
         })
        return data  ?? [];
    } catch (error) {
        console.log("Error fetching products by slug:", error);
        return [];
    }
}
const getGalleryProducts = async (quantity: number)=> {
    try {
        const {data} = await sanityFetch({query: GALLERY_COLLAGE, params: {quantity,}
         })
        return data  ?? [];
    } catch (error) {
        console.log("Error fetching gallery Products:", error);
        return [];
    }
}

export {getProducts, getAllCategories, getAllSlides, getProductBySlug, getGalleryProducts}
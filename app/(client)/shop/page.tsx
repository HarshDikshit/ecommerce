"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { client } from "@/sanity/lib/client";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { filterProductsQuery } from "@/sanity/queries/query";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Parse search params from URL ---
  const initialFilters = {
    bead: searchParams.get("bead")?.split(",") || [],
    purpose: searchParams.get("purpose")?.split(",") || [],
    category: searchParams.get("category")?.split(",") || [],
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 5000,
    sort: searchParams.get("sort") || "latest",
  };

 const [filters, setFilters] = useState(initialFilters);

// Keep filters in sync with URL search params
useEffect(() => {
  const newFilters = {
    bead: searchParams.get("bead")?.split(",") || [],
    purpose: searchParams.get("purpose")?.split(",") || [],
    category: searchParams.get("category")?.split(",") || [], 
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 5000,
    sort: searchParams.get("sort") || "latest",
  };
  setFilters(newFilters);
}, [searchParams]);

// Keep URL in sync when filters change
useEffect(() => {
  const params = new URLSearchParams();

  if (filters.bead.length > 0) params.set("bead", filters.bead.join(","));
  if (filters.purpose.length > 0) params.set("purpose", filters.purpose.join(","));
  if (filters.category.length > 0) {
  params.set("category", filters.category.join(","));
  };
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort) params.set("sort", filters.sort);

  router.replace(`?${params.toString()}`);
}, [filters, router]);


  // --- Fetch products whenever filters change ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const query = filterProductsQuery(filters);
      const data = await client.fetch(query);
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <FilterSidebar filters={filters} setFilters={setFilters} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 flex-1">
        {loading ? (
          <p>Loading...</p>
        ) : products.length > 0 ? (
          products.map((p) => <ProductCard key={p._id} product={p} />)
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
}

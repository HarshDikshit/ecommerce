"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Star, Tag, Package } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/router";
import { client } from "@/sanity/lib/client";

// Mock data for demonstration - replace with your actual Sanity client
const mockProducts = [
  {
    _id: "1",
    name: "Rudraksha Meditation Beads",
    slug: { current: "rudraksha-meditation-beads" },
    price: 89.99,
    discount: 10,
    description: "Sacred Rudraksha beads for meditation and spiritual practice",
    images: [
      {
        asset: {
          url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
        },
      },
    ],
    categories: [{ title: "Meditation" }],
    bead: ["rudraksha"],
    purpose: ["peace", "balance"],
    status: ["New Arrival"],
    stock: 15,
    averageRating: 4.5,
  },
  {
    _id: "2",
    name: "Karungali Protection Bracelet",
    slug: { current: "karungali-protection-bracelet" },
    price: 129.99,
    discount: 0,
    description: "Powerful Karungali beads for protection and positive energy",
    images: [
      {
        asset: {
          url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300",
        },
      },
    ],
    categories: [{ title: "Bracelets" }],
    bead: ["karungali"],
    purpose: ["protection", "courage"],
    status: ["Hot", "Best Seller"],
    stock: 8,
    averageRating: 4.8,
  },
  {
    _id: "3",
    name: "Rose Quartz Love Necklace",
    slug: { current: "rose-quartz-love-necklace" },
    price: 199.99,
    discount: 15,
    description:
      "Beautiful Rose Quartz necklace for attracting love and harmony",
    images: [
      {
        asset: {
          url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
        },
      },
    ],
    categories: [{ title: "Necklaces" }],
    bead: ["rose-quartz"],
    purpose: ["love", "balance"],
    status: ["New Arrival"],
    stock: 12,
    averageRating: 4.3,
  },
  {
    _id: "4",
    name: "Pyrite Wealth Mala",
    slug: { current: "pyrite-wealth-mala" },
    price: 299.99,
    discount: 20,
    description:
      "Golden Pyrite mala beads for attracting wealth and prosperity",
    images: [
      {
        asset: {
          url: "https://images.unsplash.com/photo-1506629905496-00be5b89ff18?w=300",
        },
      },
    ],
    categories: [{ title: "Mala" }],
    bead: ["pyrite"],
    purpose: ["wealth", "courage"],
    status: ["Best Seller"],
    stock: 5,
    averageRating: 4.7,
  },
];

// Debounce hook for performance
const useDebounce = (value: any, delay: any) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchDialog = ({ isOpen, onClose, onProductSelect }: any) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Mock search function - replace with your Sanity GROQ query
  const searchProducts = async (searchQuery: any = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    const groqQuery = `*[_type == "product" && (
    name match $searchQuery + "*" ||
    description match $searchQuery + "*" ||
    categories[]->title match $searchQuery + "*" ||
    bead[] match $searchQuery + "*" ||
    purpose[] match $searchQuery + "*"
  )]{
    _id,
    name,
    slug,
    price,
    discount,
    description,
    "images": images[].asset->url,
    categories[]->{title},
    bead,
    purpose,
    status,
    stock,
    averageRating
  }[0...10]`;

    const filtered = await client.fetch(groqQuery, { searchQuery });
    setResults(filtered);
    setIsLoading(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleProductClick(results[selectedIndex]);
    }
  };

  const handleProductClick = (product: any) => {
    onProductSelect?.(product);
    onClose();
    setQuery("");
    setResults([]);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-3 h-3 fill-yellow-400/50 text-yellow-400"
        />
      );
    }

    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-x-4 top-20 mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products by name, category, bead type, or purpose..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-lg outline-none text-black placeholder-gray-500"
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-3" />
            )}
            <Button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          {/* Search Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {query && !isLoading && results.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try searching with different keywords</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((product: any, index: any) => {
                  const discountedPrice = calculateDiscountedPrice(
                    product.price,
                    product.discount
                  );
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ?
                          "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4">
                        {product.images?.[0] ?
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        : <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        }
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {product.description}
                        </p>

                        {/* Categories and Tags */}
                        <div className="flex items-center gap-2 mb-2">
                          {product.categories?.[0] && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                              {product.categories[0].title}
                            </span>
                          )}
                          {product.status?.slice(0, 1).map((status: string) => (
                            <span
                              key={status}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium"
                            >
                              {status}
                            </span>
                          ))}
                        </div>

                        {/* Bead Types and Purposes */}
                        <div className="flex items-center gap-1 mb-2">
                          {product.bead?.slice(0, 2).map((bead: string) => (
                            <span
                              key={bead}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {bead}
                            </span>
                          ))}
                          {product.purpose
                            ?.slice(0, 2)
                            .map((purpose: string) => (
                              <span
                                key={purpose}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs"
                              >
                                {purpose}
                              </span>
                            ))}
                        </div>

                        {/* Rating */}
                        {product.averageRating && (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center">
                              {renderStars(product.averageRating)}
                            </div>
                            <span className="text-xs text-gray-500">
                              ({product.averageRating})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right ml-4">
                        <div className="flex flex-col items-end">
                          <div className="font-bold text-gray-900">
                            ${discountedPrice.toFixed(2)}
                          </div>
                          {product.discount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                                -{product.discount}%
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {product.stock > 0 ?
                              <span className="text-green-600">
                                In stock ({product.stock})
                              </span>
                            : <span className="text-red-600">Out of stock</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Tips */}
          {!query && (
            <div className="px-4 py-6 border-t border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-2">Search Tips</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • Search by product name: &quot;Rudraksha&quot;, &quot;Rose
                  Quartz&quot;
                </p>
                <p>
                  • Find by purpose: &quot;peace&quot;, &quot;wealth&quot;,
                  &quot;protection&quot;
                </p>
                <p>
                  • Filter by bead type: &quot;karungali&quot;,
                  &quot;pyrite&quot;, &quot;sandalwood&quot;
                </p>
                <p>
                  • Browse categories: &quot;meditation&quot;,
                  &quot;bracelets&quot;, &quot;necklaces&quot;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage component
const SearchDialogHandler = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleProductSelect = (product: any) => {
    console.log("Selected product:", product);
    // Navigate to product page or handle selection
    // router.push(`/products/${product.slug.current}`);
  };

  return (
    <div>
      <Search
        onClick={() => setIsSearchOpen(true)}
        className="w-5 h-5 hover:text-[var(--saffron)]"
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default SearchDialogHandler;

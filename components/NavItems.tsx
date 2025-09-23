"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { Button } from "./ui/button";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import SearchDialogHandler from "./SearchBar";
import FavoriteButton from "./FavoriteButton";
import CartIcon from "./CartIcon";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

// React Query implementation with Sanity client
const useQuery = (key: any, queryFn: any, options: any = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedData = localStorage.getItem(`query-${JSON.stringify(key)}`);

    if (cachedData && options.staleTime) {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < options.staleTime) {
        setData(parsed.data);
        setIsLoading(false);
        return;
      }
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await queryFn();
        setData(result);

        // Cache the result
        localStorage.setItem(
          `query-${JSON.stringify(key)}`,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(key), options.staleTime]);

  return { data, isLoading, error };
};

const ProductCard = ({ product }: any) => (
  <div  className="group p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer">
    <a href={`/product/${product?.slug?.current}`} className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        {product.images?.[0] && (
          <img
            src={product?.images?.[0] || "/api/placeholder/64/64"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          ₹{product.price?.toLocaleString()}
        </p>
        {product.status && product.status.length > 0 && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2">
            {product.status[0]}
          </span>
        )}
      </div>
    </a>
  </div>
);

const DesktopDropdown = ({ title, products, isLoading, isVisible, setIsVisible }: any) => (
  <div
    onMouseLeave={() => setIsVisible(false)}
    className={`absolute top-full left-0 w-screen bg-white shadow-xl border-t z-40 transition-all duration-300 ease-in-out ${
      isVisible ?
        "opacity-100 visible translate-y-0"
      : "opacity-0 invisible -translate-y-2 pointer-events-none"
    }`}
  >
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
      </div>

      {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-4 p-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products?.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      }
    </div>
  </div>
);

const MobileDropdown = ({ products, isLoading, isOpen }: any) => (
  <div
    className={`overflow-hidden transition-all duration-300 ease-in-out ${
      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
    }`}
  >
    <div className="pl-4 pr-2 py-4 bg-gray-50">
      {isLoading ?
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      : <div className="space-y-4 max-h-64 overflow-y-auto">
          {products?.slice(0, 4).map((product: any) => (
            <div
              key={product._id}
              className="flex items-start space-x-3 hover:bg-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {product.images?.[0] && (
                  <img
                    src={product?.images?.[0] || "/api/placeholder/48/48"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h5>
                <p className="text-xs text-gray-500">
                  ₹{product.price?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  </div>
);

const DesktopNavItem = ({ title, query }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const { data: products, isLoading } = useQuery(
    [title.toLowerCase(), query],
    () => client.fetch(query),
    { staleTime: 5 * 60 * 1000 }
  );

  return (
    <div
      className="z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
          isHovered ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
        }`}
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isHovered ? "rotate-180" : ""
          }`}
        />
      </button>
      <DesktopDropdown
        title={title}
        products={products}
        isLoading={isLoading}
        isVisible={isHovered}
        setIsVisible={setIsHovered}
      />
    </div>
  );
};

const MobileNavItem = ({ title, query }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: products, isLoading } = useQuery(
    [title.toLowerCase(), query],
    () => client.fetch(query),
    { staleTime: 5 * 60 * 1000 }
  );

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <MobileDropdown
        title={title}
        products={products}
        isLoading={isLoading}
        isOpen={isOpen}
      />
    </div>
  );
};

const NavbarItems = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      title: "Rudraksha",
      query: `*[_type == "product" && bead match ["rudraksha"]] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, bead, purpose
      }[0...12]`,
    },
    {
      title: "Gems",
      query: `*[_type == "product" && "Gems" in categories[]->title] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, purpose
      }[0...12]`,
    },
    {
      title: "Spiritual Jewellery",
      query: `*[_type == "product" && "Spiritual Jewellery" in categories[]->title] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, bead, purpose
      }[0...12]`,
    },
    {
      title: "Pyrite Stones",
      query: `*[_type == "product" && bead match ["pyrite"]] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, bead, purpose
      }[0...12]`,
    },
    {
      title: "New Arrivals",
      query: `*[_type == "product" && status match ["New Arrival"]] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, bead, purpose
      }[0...12]`,
    },
    {
      title: "Hot Products",
      query: `*[_type == "product" && status match ["Hot"]] {
        _id, name, slug, price, "images": images[].asset->url, categories[]-> { title }, status, bead, purpose
      }[0...12]`,
    },
  ];

  const { isSignedIn } = useUser();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="relative">
      <nav className="bg-white shadow-sm sticky top-0 z-[9999] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className=" flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Divine Gems
              </div>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
              <div className=" flex items-center space-x-1">
                {navItems.map((item) => (
                  <DesktopNavItem
                    key={item.title}
                    title={item.title}
                    query={item.query}
                  />
                ))}
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
                <button aria-label="Search">
                </button>
                
                  <SearchDialogHandler />
                <FavoriteButton showProduct={false} />
                <CartIcon />
                {isSignedIn ?
                  <UserButton />
                : <SignInButton mode="modal">
                    <button className="clerk-button lg:inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">Sign In</button>
                  </SignInButton>
                }
              </div>

              <Link
                href="/shop"
                className="hidden lg:inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 ml-2"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Now
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isMobileMenuOpen ?
                  <X className="w-6 h-6" />
                : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/80 z-[9998]">
          <div className="mobile-menu-container bg-white w-full max-w-sm h-full shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex pt-20 items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              <div className="py-2">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.title}
                    title={item.title}
                    query={item.query}
                  />
                ))}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <a
                  href="/shop"
                  className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarItems;

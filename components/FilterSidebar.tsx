"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Filter, X, ChevronDown } from "lucide-react";
import { client } from "@/sanity/lib/client";

interface FilterSidebarProps {
  filters: {
    bead: string[];
    purpose: string[];
    category: string[]; 
    minPrice: number;
    maxPrice: number;
    sort: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      bead: string[];
      purpose: string[];
      category: string[]; 
      minPrice: number;
      maxPrice: number;
      sort: string;
    }>
  >;
}

// Options
const purposes = [
  "Health",
  "Wealth",
  "Peace",
  "Love",
  "Protection",
  "Balance",
  "Courage",
];
const beads = [
  "Rudraksha",
  "Karungali",
  "Pyrite",
  "Sandalwood",
  "Tulsi",
  "Sphatik",
  "Rose Quartz",
];

export default function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const [open, setOpen] = useState(true); // Sidebar toggle (desktop)

  // Toggle helper
  const toggleSelection = (
  type: "purpose" | "bead" | "category",
  value: string
) => {
  setFilters((prev) => {
    const list = [...prev[type]];
    if (list.includes(value)) {
      return { ...prev, [type]: list.filter((x) => x !== value) };
    } else {
      return { ...prev, [type]: [...list, value] };
    }
  });
};


  const removeFilter = (type: "purpose" | "bead", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((x) => x !== value),
    }));
  };

  // Filter UI (shared between mobile & desktop)
  const FilterOptions = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {(filters.purpose.length > 0 || filters.bead.length > 0 || filters.category.length > 0) && (
  <div className="flex flex-wrap gap-2 text-sm">
    {filters.purpose.map((p) => (
      <span key={p} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded">
        {p}
        <X size={14} className="cursor-pointer" onClick={() => removeFilter("purpose", p)} />
      </span>
    ))}
    {filters.bead.map((b) => (
      <span key={b} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded">
        {b}
        <X size={14} className="cursor-pointer" onClick={() => removeFilter("bead", b)} />
      </span>
    ))}
    {filters.category.map((cId) => {
      const cat = categories.find((c) => c._id === cId);
      return (
        <span key={cId} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded">
          {cat?.title || "Unknown"}
          <X
            size={14}
            className="cursor-pointer"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                category: prev.category.filter((x) => x !== cId),
              }))
            }
          />
        </span>
      );
    })}
  </div>
      )}


      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <label key={c._id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.category.includes(c._id)}
                onCheckedChange={() => toggleSelection("category", c._id)}
              />
              {c.title}
            </label>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <h3 className="font-semibold mb-2">Purpose</h3>
        <div className="grid grid-cols-2 gap-2">
          {purposes.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.purpose.includes(p)}
                onCheckedChange={() => toggleSelection("purpose", p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      {/* Beads */}
      <div>
        <h3 className="font-semibold mb-2">Bead</h3>
        <div className="grid grid-cols-2 gap-2">
          {beads.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.bead.includes(b)}
                onCheckedChange={() => toggleSelection("bead", b)}
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold mb-2">Price Range</h3>

        <Slider
          min={0}
          max={5000}
          step={50}
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={(val: number[]) =>
            setFilters((prev) => ({
              ...prev,
              minPrice: val[0],
              maxPrice: val[1],
            }))
          }
          className="w-full"
        />

        <div className="flex justify-between text-sm mt-2">
          <span className="px-2 py-1 bg-gray-100 rounded-md">
            ₹{filters.minPrice}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-md">
            ₹{filters.maxPrice}
          </span>
        </div>
      </div>
    </div>
  );

  const [categories, setCategories] = useState<{_id: string; title: string}[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    const data = await client.fetch(`*[_type == "category"]{_id, title}`);
    setCategories(data);
  };
  fetchCategories();
}, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col gap-4 w-64">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setOpen(!open)}
        >
          <Filter size={18} /> {open ? "Hide Filters" : "Show Filters"}
        </Button>

        {open && (
          <div className="border rounded-md p-4 shadow-sm animate-in fade-in slide-in-from-left">
            <FilterOptions />
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={18} /> Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-4">
            <FilterOptions />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Sorting (shared for all screens) */}
      <div className="flex justify-end md:justify-start mt-4 md:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Sort <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={filters.sort}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, sort: val }))
              }
            >
              <DropdownMenuRadioItem value="alphabetical">
                Alphabetical
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="latest">
                Latest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price">
                Price
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  variant: string;
  price: number;
  discount: number;
  images: string[];
}

interface ProductSliderProps {
  products: Product[];
  variant: string;
  description: string;
  descriptionPosition: 'left' | 'right';
}

export default function ProductSlider({ products, variant, description, descriptionPosition }: ProductSliderProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };

  return (
    <section className="product-section">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl mb-6 text-center capitalize">{variant}</h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {descriptionPosition === 'left' && (
            <div className="lg:w-1/3 text-center lg:text-left">
              <p className="text-[var(--emerald)]">{description}</p>
            </div>
          )}
          <div className="relative w-full lg:w-2/3">
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--gold)] text-[var(--maroon)] p-2 rounded-full z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div ref={sliderRef} className="product-slider">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--gold)] text-[var(--maroon)] p-2 rounded-full z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          {descriptionPosition === 'right' && (
            <div className="lg:w-1/3 text-center lg:text-right">
              <p className="text-[var(--emerald)]">{description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
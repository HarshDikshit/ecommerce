"use client";
import { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import clsx from "clsx";
import Carousel from "./skeleton/Carousel";

const SLIDE_DURATION = 5000; // ms

// ✅ Fix: Properly type the variants and use correct ease syntax
const textVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" // ✅ Use string instead of array
    },
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    transition: { 
      duration: 0.5, 
      ease: "easeIn" // ✅ Use string instead of array
    }
  },
};

// ✅ Better type for slides prop
interface Slide {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: "filled" | "outlined";
}

interface HeroProps {
  slides: Slide[];
}

export default function Hero({ slides }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const activeIndexRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // ✅ Improvement: Extract RAF logic into separate function for clarity
  const step = useRef((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;

    if (!pausedRef.current) {
      const elapsed = accumulatedRef.current + (timestamp - startTimeRef.current);
      
      if (elapsed >= SLIDE_DURATION) {
        const next = (activeIndexRef.current + 1) % slides.length;
        activeIndexRef.current = next;
        setActiveIndex(next);
        accumulatedRef.current = 0;
        startTimeRef.current = timestamp;
        setProgress(0);
      } else {
        setProgress(elapsed);
      }
    }
    
    rafRef.current = requestAnimationFrame(step.current);
  });

  // Start RAF loop
  useEffect(() => {
    startTimeRef.current = 0;
    accumulatedRef.current = 0;
    rafRef.current = requestAnimationFrame(step.current);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [slides.length]);

  // ✅ Improvement: Use useCallback for event handlers to prevent unnecessary re-renders
  const handleMouseEnter = useRef(() => {
    if (!pausedRef.current) {
      const now = performance.now();
      if (startTimeRef.current) {
        accumulatedRef.current += now - startTimeRef.current;
      }
      startTimeRef.current = 0;
      setPaused(true);
    }
  });

  const handleMouseLeave = useRef(() => {
    if (pausedRef.current) {
      startTimeRef.current = performance.now();
      setPaused(false);
    }
  });

  const handleIndicatorClick = (idx: number) => {
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    accumulatedRef.current = 0;
    startTimeRef.current = performance.now();
    setProgress(0);
  };

  // ✅ Early return with better fallback
  if (!slides?.length) {
    return <Carousel />;
  }

  const currentSlide = slides[activeIndex];

  return (
    <div
      className="relative w-full h-[80vh] overflow-hidden"
      onMouseEnter={handleMouseEnter.current}
      onMouseLeave={handleMouseLeave.current}
    >
      {/* Background Image */}
      <img
        src={currentSlide.imageUrl}
        alt={currentSlide.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-start px-6 ml-6 mt-12">
        <motion.h1
          key={`title-${activeIndex}`}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
        >
          {currentSlide.title}
        </motion.h1>
        
        <motion.p
          key={`subtitle-${activeIndex}`}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mt-4 text-lg md:text-2xl text-slate-200 max-w-2xl"
        >
          {currentSlide.subtitle}
        </motion.p>

        {currentSlide.buttonText && (
          <motion.a
            key={`button-${activeIndex}`}
            href={currentSlide.buttonLink}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={clsx(
              "mt-6 px-6 py-3 rounded-full font-medium transition-all",
              currentSlide.buttonVariant === "filled"
                ? "bg-[#800000] text-white hover:bg-[#990000]"
                : "border border-white text-white hover:bg-white hover:text-black"
            )}
          >
            {currentSlide.buttonText}
          </motion.a>
        )}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, idx) => {
          const widthPct = idx === activeIndex 
            ? Math.min(100, (progress / SLIDE_DURATION) * 100)
            : 0;
            
          return (
            <button
              key={idx}
              onClick={() => handleIndicatorClick(idx)}
              className="w-10 h-2 rounded-full bg-white/30 cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white transition-[width] duration-100"
                style={{ width: `${widthPct}%` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
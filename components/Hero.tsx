"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { client } from "@/sanity/lib/client";
import { carouselQuery } from "@/sanity/queries/query";
import Carousel from "./skeleton/Carousel";

const SLIDE_DURATION = 5000; // 5s per slide

// Variants for animating text elements
const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.5, ease: "easeIn" } },
};

export default function Hero({slides}: {slides:any}) {
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slides from Sanity
 

  // Auto slide logic
  useEffect(() => {
    if (!paused && slides.length > 0) {
      timerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }, SLIDE_DURATION);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, paused, slides]);

  if (slides.length === 0) {
    return (
      <Carousel/>
    );
  }

  return (
    <div
      className="relative w-full h-[80vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image (no fade, just switch) */}
      <img
        src={slides[activeIndex].imageUrl}
        alt={slides[activeIndex].title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Animated Content */}
      <div className="absolute inset-0 flex flex-col items-start ml-6 mt-12 justify-start px-6">
        <motion.h1
          key={`title-${activeIndex}`}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
        >
          {slides[activeIndex].title}
        </motion.h1>

        <motion.p
          key={`subtitle-${activeIndex}`}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mt-4 text-lg md:text-2xl text-slate-200 max-w-2xl"
        >
          {slides[activeIndex].subtitle}
        </motion.p>

        {slides[activeIndex].buttonText && (
          <motion.a
            key={`button-${activeIndex}`}
            href={slides[activeIndex].buttonLink}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={clsx(
              "mt-6 px-6 py-3 rounded-full font-medium transition-all",
              slides[activeIndex].buttonVariant === "filled"
                ? "bg-[#800000] text-white hover:bg-[#990000]"
                : "border border-white text-white hover:bg-white hover:text-black"
            )}
          >
            {slides[activeIndex].buttonText}
          </motion.a>
        )}
      </div>

      {/* Progress Indicators (bars with loader effect) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="w-10 h-2 rounded-full bg-white/30 cursor-pointer relative overflow-hidden"
          >
            {idx === activeIndex && (
              <motion.div
                key={activeIndex}
                className="absolute top-0 left-0 h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: paused ? 0 : SLIDE_DURATION / 1000,
                  ease: "linear",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

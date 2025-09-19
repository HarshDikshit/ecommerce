"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import Carousel from "./skeleton/Carousel";

const SLIDE_DURATION = 5000; // ms

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.5, ease: "easeIn" } },
};

export default function Hero({ slides }: { slides: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // ms elapsed for active slide

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const activeIndexRef = useRef<number>(0); // 👈 mirror of activeIndex

  // keep refs in sync
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // RAF loop
  const step = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;

    if (!pausedRef.current) {
      const elapsed =
        accumulatedRef.current + (timestamp - startTimeRef.current);
      if (elapsed >= SLIDE_DURATION) {
        // advance immediately
        const next = (activeIndexRef.current + 1) % slides.length;
        activeIndexRef.current = next; // update ref immediately
        setActiveIndex(next);
        accumulatedRef.current = 0;
        startTimeRef.current = timestamp;
        setProgress(0);
      } else {
        setProgress(elapsed);
      }
    }
    rafRef.current = requestAnimationFrame(step);
  };

  // start RAF once
  useEffect(() => {
    startTimeRef.current = 0;
    accumulatedRef.current = 0;
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const handleMouseEnter = () => {
    if (!pausedRef.current) {
      const now = performance.now();
      if (startTimeRef.current) {
        accumulatedRef.current += now - startTimeRef.current;
      }
      startTimeRef.current = 0;
      setPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pausedRef.current) {
      startTimeRef.current = performance.now();
      setPaused(false);
    }
  };

  const handleIndicatorClick = (idx: number) => {
    activeIndexRef.current = idx; // 👈 keep in sync
    setActiveIndex(idx);
    accumulatedRef.current = 0;
    startTimeRef.current = performance.now();
    setProgress(0);
  };

  if (!slides || slides.length === 0) return <Carousel />;

  return (
    <div
      className="relative w-full h-[80vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background */}
      <img
        src={slides[activeIndex].imageUrl}
        alt={slides[activeIndex].title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Content */}
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

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, idx) => {
          const widthPct =
            idx === activeIndex
              ? Math.min(100, (progress / SLIDE_DURATION) * 100)
              : 0;
          return (
            <div
              key={idx}
              onClick={() => handleIndicatorClick(idx)}
              className="w-10 h-2 rounded-full bg-white/30 cursor-pointer relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 h-full bg-white transition-[width] duration-100"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

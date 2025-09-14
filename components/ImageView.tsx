"use client";
import { internalGroqTypeReferenceTo, SanityImageCrop, SanityImageHotspot } from '@/sanity.types';
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react";
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

interface Props {
    images?: Array<{
        asset?: {
            _ref: string;
            _type: "reference";
            _weak?: boolean;
            [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
        };
        hotspot?: SanityImageHotspot;
        crop?: SanityImageCrop;
        _type: "image";
        _key: string;
    }>;
    isStock?: number | undefined;
}

const ImageView = ({ images = [], isStock }: Props) => {
    const [index, setIndex] = useState(0);

    // derive active from index
    const active = images[index];

    const goPrev = () => {
        setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1)); // loop around
    };

    const goNext = () => {
        setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0)); // loop around
    };

    return (
        <div className='w-full md:w-1/2 space-y-2 md:space-y-4'>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={active?._key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className='relative w-full max-h-[550px] min-h-[450px] border border-black/10 rounded-md group overflow-hidden'
                >
                    {active && (
                        <Image
                            src={urlFor(active).url()}
                            alt='productImage'
                            width={700}
                            height={700}
                            priority
                            className={`w-full h-full object-contain group-hover:scale-110 hoverEffect rounded-md ${
                                isStock === 0 ? "opacity-50" : ""
                            }`}
                        />
                    )}

                    {/* Left Arrow */}
                    <FaAngleLeft
                        size={50}
                        onClick={goPrev}
                        className='absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 cursor-pointer border-2 border-black/20 rounded-lg p-3 z-10 text-white/70 hover:text-white hover:bg-black/50'
                    />

                    {/* Right Arrow */}
                    <FaAngleRight
                        size={50}
                        onClick={goNext}
                        className='absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 cursor-pointer border-2 border-black/20 rounded-lg p-3 z-10 text-white/70 hover:text-white hover:bg-black/50'
                    />
                </motion.div>
            </AnimatePresence>

            {/* Thumbnails */}
            <div className='relative grid grid-cols-6 gap-2 h-20 md:h-24'>
                {images.map((image, i) => (
                    <div
                        key={image._key}
                        onClick={() => setIndex(i)}
                        className={`border-2 rounded-md overflow-hidden cursor-pointer ${
                            index === i ? "border-black opacity-100" : "border-muted opacity-80"
                        }`}
                    >
                        <Image
                            src={urlFor(image).url()}
                            alt={`Thumbnail ${image._key}`}
                            width={100}
                            height={100}
                            className='h-full w-full object-contain overflow-hidden'
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageView;

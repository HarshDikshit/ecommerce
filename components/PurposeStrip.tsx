"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Scale, Activity, DollarSign, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

const purposes = [
  { name: "Health", icon: Activity },
  { name: "Wealth", icon: DollarSign },
  { name: "Peace", icon: MessageSquare },
  { name: "Love", icon: Heart },
  { name: "Protection", icon: Shield },
  { name: "Balance", icon: Scale },
  { name: "Courage", icon: Sparkles },
];

export default function PurposeStrip() {
  return (
    <section className=" py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
        Shop By Purpose
      </h2>

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
        {purposes.map((purpose, index) => {
          const Icon = purpose.icon;
          return (
            <Link key={index} href={`/shop?purpose=${String(purpose.name)}`}>
            <motion.div
              key={purpose.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center cursor-pointer space-y-3"
            >
                <div className="flex flex-col items-center justify-center w-28 h-28 rounded-md bg-gradient-to-b from-red-700 to-black/10 shadow-md hover:shadow-xl hover:scale-105 transition transform duration-300">
              <Icon className="w-8 h-8 text-white mb-2" />
                </div>
                <span className="text-white text-sm font-medium">{purpose.name}</span>
            </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

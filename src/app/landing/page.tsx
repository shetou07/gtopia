// src/app/landing/page.tsx

/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const GtopiaLanding = () => {
  const sectionRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 50;
      const y = (e.clientY - window.innerHeight / 2) / 50;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen w-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Dynamic Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,0,0.1)_1px,_transparent_1px)] bg-[length:40px_40px]" />

          {/* Animated Sphere */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: mousePosition.x,
              y: mousePosition.y,
              scale: [1, 1.05, 1],
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              x: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
          >
            <div className="relative w-[600px] h-[600px]">
              {/* Multiple rotating circles for 3D effect */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-red-500/20"
                  animate={{
                    rotateX: 360,
                    rotateY: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${i * 30}deg) rotateY(${i * 30}deg)`,
                  }}
                />
              ))}

              {/* Glowing core */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-yellow-500/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 flex flex-col justify-center items-center h-full text-center -translate-y-[30%]"
        >
          <div className="max-w-4xl px-4">
            {/* Floating logo with glow effect */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-red-500 to-yellow-500 opacity-50 scale-110" />
              <img
                src="/G.svg"
                alt="Gtopia Logo"
                width={150}
                height={150}
                className="mx-auto mb-2 relative z-10"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-8xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
            >
              GTOPIA
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-400">
                A Top G Republica
              </h2>
              <h3 className="text-2xl font-semibold mb-2 text-gray-200">
                The Very First Decentralized Digital Nation on Solana
              </h3>
              <p className="text-xl mb-6 text-gray-300 max-w-3xl mx-auto">
                Digital Sovereignty through Blockchain, NFTs and AI Powered
                Governance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center space-x-6"
            >
              <WalletMultiButton className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full transition duration-300 shadow-2xl" />
              <motion.a
                href="#explore"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 rounded-full transition duration-300"
              >
                Explore Gtopia
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section
        id="explore"
        className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black px-12 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
            >
              Redefine your Digital Existence
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-4xl mx-auto"
            >
              GTOPIA isn&apos;t just a platform, it&apos;s a revolutionary
              ecosystem where blockchain meets ambition
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Land Ownership Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-500">
                    Digital Land Ownership
                  </h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Own unique, blockchain-verified land parcels as NFTs. Each
                  plot is a piece of digital real estate with verifiable
                  ownership.
                </p>
                <Link href="/landMap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-300"
                  >
                    Buy Land
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Citizenship Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-500">
                    Exclusive Citizenship
                  </h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Become a digital citizen with an NFT that grants governance
                  rights, exclusive perks, and a stake in our decentralized
                  nation.
                </p>
                <Link href="/citizenship">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-300"
                  >
                    Get Citizenship
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* AI Assistant Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2v-2.311a6 6 0 00-3.637-5.445L12 10.5l-2.363 1.744A6 6 00-3.637-5.445L12 10.5l-2.363 1.744A6 6 0 007 16.689V19a2 2 0 002 2zM16 6a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-500">
                    AI Powered Interactions
                  </h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Our advanced AI chatbot assists you in real-time, helping with
                  transactions, answering queries, and guiding your digital
                  journey.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300"
                >
                  Chat Assistant
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="bg-black py-24 px-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,0,0.05)_1px,_transparent_1px)] bg-[length:30px_30px]" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-yellow-500/10"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
            >
              Our Revolutionary Ecosystem
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-4xl mx-auto"
            >
              Powered by Solana, driven by innovation, governed by our community
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 text-yellow-500">
                Blockchain-Powered Governance
              </h3>
              <ul className="space-y-4 text-gray-300 text-lg">
                {[
                  "Transparent, decentralized decision-making",
                  "Every citizen has a voice through blockchain voting",
                  "Real-time proposal submissions and voting",
                  "NFT-based citizenship with governance rights",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <span className="mr-4 text-red-500">✦</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 p-8 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h4 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                Technical Foundation
              </h4>
              <div className="grid grid-cols-2 gap-4 text-gray-300">
                {[
                  {
                    title: "Blockchain",
                    color: "blue",
                    items: ["Solana Network", "High-speed transactions"],
                  },
                  {
                    title: "Frontend",
                    color: "green",
                    items: ["React.js", "Tailwind CSS"],
                  },
                  {
                    title: "Backend",
                    color: "purple",
                    items: ["Anchor Framework", "Metaplex Standards"],
                  },
                  {
                    title: "AI",
                    color: "pink",
                    items: ["GPT-4 Powered", "Intelligent Interactions"],
                  },
                ].map(({ title, color, items }) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h5 className={`font-bold text-${color}-400 mb-2`}>
                      {title}
                    </h5>
                    {items.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2">
              GTOPIA
            </h4>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex space-x-6 items-center"
          >
            <a href="#" className="text-gray-300 hover:text-white transition">
              Whitepaper
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition">
              Community
            </a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
            >
              Join Now
            </motion.a>
          </motion.div>
        </div>
        <div className="text-center mt-8 text-gray-500 border-t border-gray-800 pt-8">
          <p>© 2025 GTOPIA. All rights reserved.</p>
          <p className="text-sm mt-2">A Top G Republica</p>
        </div>
      </footer>
    </div>
  );
};

export default GtopiaLanding;

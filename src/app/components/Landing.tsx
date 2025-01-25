/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const GtopiaLanding = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const geometry = new THREE.SphereGeometry(8, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      wireframe: true,
      opacity: 0.7,
      transparent: true,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(ambientLight, pointLight);

    camera.position.z = 20;

    const animateGlobe = () => {
      requestAnimationFrame(animateGlobe);
      globe.rotation.y += 0.003;
      globe.scale.set(
        1 + Math.sin(Date.now() * 0.001) * 0.1, // Increased the scale factor from 0.02 to 0.05
        1 + Math.sin(Date.now() * 0.001) * 0.1, // Increased the scale factor from 0.02 to 0.05
        1 + Math.sin(Date.now() * 0.001) * 0.1 // Increased the scale factor from 0.02 to 0.05
      );
      renderer.render(scene, camera);
    };

    animateGlobe();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen w-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 z-0 w-full h-full"
        />

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 flex flex-col justify-center items-center h-full text-center -translate-y-[30%]"
        >
          <div className="max-w-4xl px-4">
            <img
              src="/G.svg"
              alt="Gtopia Logo"
              width={150}
              height={150}
              className="mx-auto mb-2"
            />
            <h1 className="text-8xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              GTOPIA
            </h1>
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

            <div className="flex justify-center space-x-6">
              <WalletMultiButton className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full transition duration-300 shadow-2xl" />
              <motion.a
                href="#explore"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 rounded-full transition duration-300"
              >
                Explore Gtopia
              </motion.a>
            </div>
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
            <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              Redefine your Digital Existence
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              GTOPIA isn&apos;t just a platform, it&apos;s a revolutionary
              ecosystem where blockchain meets ambition
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Land Ownership */}
            <div className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group">
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
                Own unique, blockchain-verified land parcels as NFTs. Each plot
                is a piece of digital real estate with verifiable ownership.
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

            {/* Citizenship */}
            <div className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group">
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-600 text-white px-6 py-3 rounded-full hover:bg-yellow-700 transition duration-300"
              >
                Get Citizenship
              </motion.button>
            </div>

            {/* AI Assistant */}
            <div className="bg-gray-900/50 p-8 rounded-2xl hover:bg-gray-800/70 transition duration-300 group">
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2v-2.311a6 6 0 00-3.637-5.445L12 10.5l-2.363 1.744A6 6 0 007 16.689V19a2 2 0 002 2zM16 6a4 4 0 11-8 0 4 4 0 018 0z"
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
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="bg-black py-24 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              Our Revolutionary Ecosystem
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Powered by Solana, driven by innovation, governed by our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-yellow-500">
                Blockchain-Powered Governance
              </h3>
              <ul className="space-y-4 text-gray-300 text-lg">
                <li className="flex items-center">
                  <span className="mr-4 text-red-500">✦</span>
                  Transparent, decentralized decision-making
                </li>
                <li className="flex items-center">
                  <span className="mr-4 text-red-500">✦</span>
                  Every citizen has a voice through blockchain voting
                </li>
                <li className="flex items-center">
                  <span className="mr-4 text-red-500">✦</span>
                  Real-time proposal submissions and voting
                </li>
                <li className="flex items-center">
                  <span className="mr-4 text-red-500">✦</span>
                  NFT-based citizenship with governance rights
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/50 p-8 rounded-2xl">
              <h4 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                Technical Foundation
              </h4>
              <div className="grid grid-cols-2 gap-4 text-gray-300">
                <div>
                  <h5 className="font-bold text-blue-400 mb-2">Blockchain</h5>
                  <p>Solana Network</p>
                  <p>High-speed transactions</p>
                </div>
                <div>
                  <h5 className="font-bold text-green-400 mb-2">Frontend</h5>
                  <p>React.js</p>
                  <p>Tailwind CSS</p>
                </div>
                <div>
                  <h5 className="font-bold text-purple-400 mb-2">Backend</h5>
                  <p>Anchor Framework</p>
                  <p>Metaplex Standards</p>
                </div>
                <div>
                  <h5 className="font-bold text-pink-400 mb-2">AI</h5>
                  <p>GPT-4 Powered</p>
                  <p>Intelligent Interactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2">
              GTOPIA
            </h4>
          </div>
          <div className="flex space-x-6 items-center">
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
          </div>
        </div>
        <div className="text-center mt-8 text-gray-500 border-t border-gray-800 pt-8">
          <p>© 2024 GTOPIA. All rights reserved.</p>
          <p className="text-sm mt-2">A Top G Republica</p>
        </div>
      </footer>
    </div>
  );
};

export default GtopiaLanding;

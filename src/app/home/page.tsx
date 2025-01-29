/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

// src/app/home/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import {
  Sword,
  Users,
  ShoppingBag,
  MessageCircle,
  Globe2,
  Trophy,
} from "lucide-react";
import VisaTimer from "../components/VisaTimer";

const HomePage = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Late Night";
  };
  const [visaExpiry, setVisaExpiry] = useState<string | null>(null);

  useEffect(() => {
    const storedExpiry = localStorage.getItem("visaExpiry");
    if (storedExpiry) {
      setVisaExpiry(storedExpiry);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header - Moved outside the hero section */}
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 px-8 py-4 ">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src="/G.svg" alt="Gtopia Logo" width={80} height={80} />
          <WalletMultiButton className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full" />
        </div>
      </div>
      {visaExpiry && <VisaTimer expiryTime={visaExpiry} />}

      <div className="pt-24">
        <div className="bg-gradient-to-br from-black via-red-900/20 to-black px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              {getGreeting()}, G
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              Your journey to greatness continues here. Access exclusive
              content, connect with like minded individuals, and elevate your
              success.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* The Real World */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-900/30 to-black p-8 rounded-2xl border border-red-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <Globe2 className="w-8 h-8 text-red-500 mr-4" />
              <h3 className="text-2xl font-bold text-red-500">
                The Real World
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Access exclusive courses, mentorship programs, and real-world
              business opportunities.
            </p>
            <motion.div
              className="w-full aspect-square bg-gradient-to-br from-red-900/20 to-black rounded-xl mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/real-world-icon.jpg"
                alt="Real World"
                className="w-3/4 h-3/4 object-cover"
              />
            </motion.div>
            <Link href="/real-world">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition">
                Enter The Real World
              </button>
            </Link>
          </motion.div>

          {/* War Room */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-900/30 to-black p-8 rounded-2xl border border-yellow-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <Sword className="w-8 h-8 text-yellow-500 mr-4" />
              <h3 className="text-2xl font-bold text-yellow-500">War Room</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Join elite discussions, strategy sessions, and network with
              successful entrepreneurs.
            </p>
            <motion.div
              className="w-full aspect-square bg-gradient-to-br from-yellow-900/20 to-black rounded-xl mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/war-room-icon.jpg"
                alt="War Room"
                className="w-3/4 h-3/4 object-cover"
              />
            </motion.div>
            <Link href="/war-room">
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full transition">
                Enter War Room
              </button>
            </Link>
          </motion.div>

          {/* Top G NFT Mall */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/30 to-black p-8 rounded-2xl border border-blue-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <ShoppingBag className="w-8 h-8 text-blue-500 mr-4" />
              <h3 className="text-2xl font-bold text-blue-500">
                Top G NFT Mall
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Exclusive NFT collections, digital assets, and limited edition
              releases.
            </p>
            <motion.div
              className="w-full aspect-square bg-gradient-to-br from-blue-900/20 to-black rounded-xl mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/nft-mall-icon.jpg"
                alt="NFT Mall"
                className="w-3/4 h-3/4 object-cover"
              />
            </motion.div>
            <Link href="/nft-mall">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition">
                Browse Collection
              </button>
            </Link>
          </motion.div>

          {/* Chat with Top G */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-900/30 to-black p-8 rounded-2xl border border-purple-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <MessageCircle className="w-8 h-8 text-purple-500 mr-4" />
              <h3 className="text-2xl font-bold text-purple-500">
                Chat with Top G
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Get personalized advice and insights directly from Andrew Tate's
              AI.
            </p>
            <motion.div
              className="aspect-square bg-gradient-to-br from-purple-900/20 to-black rounded-xl mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/andrew-avator.png"
                alt="Andrew Tate Avatar"
                className="w-3/4 h-3/4 object-cover rounded-xl"
              />
            </motion.div>
            <Link href="/chat-topg">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition">
                Start Chat
              </button>
            </Link>
          </motion.div>

          {/* Chat with Tristan */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-900/30 to-black p-8 rounded-2xl border border-green-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <MessageCircle className="w-8 h-8 text-green-500 mr-4" />
              <h3 className="text-2xl font-bold text-green-500">
                Chat with Tristan
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Connect with Tristan's AI for unique perspectives and guidance.
            </p>
            <motion.div
              className="aspect-square bg-gradient-to-br from-green-900/20 to-black rounded-xl mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/tristan-avatar.jpeg"
                alt="Tristan Tate Avatar"
                className="w-3/4 h-3/4 object-cover rounded-xl"
              />
            </motion.div>
            <Link href="/chat-tristan">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition">
                Start Chat
              </button>
            </Link>
          </motion.div>

          {/* Achievements & Rankings */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-900/30 to-black p-8 rounded-2xl border border-orange-900/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center mb-6">
              <Trophy className="w-8 h-8 text-orange-500 mr-4" />
              <h3 className="text-2xl font-bold text-orange-500">
                Top G Leaderboard
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Track your progress, earn achievements, and compete with other
              members.
            </p>
            <motion.div
              className="bg-gradient-to-br from-orange-900/20 to-black p-6 rounded-xl mb-6"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-500">Your Rank:</span>
                <span className="text-2xl font-bold text-orange-400">#42</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-500">Achievement Score:</span>
                <span className="text-2xl font-bold text-orange-400">
                  1,337
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 my-4" />
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">🏃 Daily Streak: 7 days</span>
                  <span className="text-orange-400">+100 pts</span>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 mb-4" />
              <div>
                <h4 className="text-orange-500 font-semibold mb-2">
                  Top Performers
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">🥇 Alex_Trading</span>
                    <span className="text-orange-400">2,541 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">🥈 CryptoKing</span>
                    <span className="text-orange-400">2,312 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">🥉 MindsetGuru</span>
                    <span className="text-orange-400">2,105 pts</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <Link href="/leaderboard">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition">
                View Rankings
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 mb-4 md:mb-0">
            © 2024 GTOPIA. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link
              href="/support"
              className="text-gray-300 hover:text-white transition"
            >
              Support
            </Link>
            <Link
              href="/terms"
              className="text-gray-300 hover:text-white transition"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-gray-300 hover:text-white transition"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

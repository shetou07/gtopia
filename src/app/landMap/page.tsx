/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/landMap/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { Globe2, Coins, Map, Lock } from "lucide-react";
import idl from "./gtopia_land.json" assert { type: "json" };
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey("d2NAY7hLDwJfxsDG59qFB4sQzFTf7P7Ws6Aj3VdyE6F");

// Status color mapping with gradients for a more premium look
const LAND_COLORS = {
  "for-sale":
    "bg-gradient-to-br from-yellow-500/70 to-yellow-600/70 hover:from-yellow-400 hover:to-yellow-500",
  "for-rent":
    "bg-gradient-to-br from-blue-500/70 to-blue-600/70 hover:from-blue-400 hover:to-blue-500",
  owned:
    "bg-gradient-to-br from-gray-500/30 to-gray-600/30 opacity-50 cursor-not-allowed",
  available:
    "bg-gradient-to-br from-green-500/70 to-green-600/70 hover:from-green-400 hover:to-green-500",
};

interface LandPlotAccount {
  startX: number;
  startY: number;
  width: number;
  height: number;
  isForSale: boolean;
  owner: web3.PublicKey;
  pricePerUnit: number;
}

interface ProgramAccounts {
  landPlotAccount: {
    all(): Promise<
      Array<{
        publicKey: web3.PublicKey;
        account: LandPlotAccount;
      }>
    >;
  };
}

type LandProgram = Program<Idl> & {
  account: ProgramAccounts;
};

const LandMap: React.FC = () => {
  const [landParcels, setLandParcels] = useState<any[]>([]);
  interface Parcel {
    id: string;
    publicKey: anchor.web3.PublicKey;
    x: number;
    y: number;
    width: number;
    height: number;
    status: "for-sale" | "owned" | "for-rent" | "available";
    owner: anchor.web3.PublicKey;
    pricePerUnit: number;
  }

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [program, setProgram] = useState<LandProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { connection } = useConnection();
  const wallet = useWallet();

  // Initialize Anchor program
  useEffect(() => {
    if (wallet?.publicKey && wallet?.signTransaction && connection) {
      const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
      });
      const landProgram = new Program(idl as any, provider);
      setProgram(landProgram as LandProgram);
    }
  }, [wallet, connection]);

  // Fetch land parcels
  const fetchLandParcels = async () => {
    if (!program) return;
    setIsLoading(true);

    try {
      const landAccounts = await program.account.landPlotAccount.all();

      const parsedParcels = landAccounts.map((account: any) => ({
        id: account.publicKey.toBase58(),
        publicKey: account.publicKey,
        x: account.account.startX.toNumber(),
        y: account.account.startY.toNumber(),
        width: account.account.width.toNumber(),
        height: account.account.height.toNumber(),
        status: account.account.isForSale ? "for-sale" : "owned",
        owner: account.account.owner,
        pricePerUnit: account.account.isForSale
          ? account.account.pricePerUnit.toNumber()
          : 0,
      }));

      setLandParcels(parsedParcels);
    } catch (error) {
      console.error("Error fetching land parcels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLandParcels();
  }, [program]);

  const buyLand = async (parcel: Parcel) => {
    if (!program || !wallet.publicKey) return;

    try {
      const newLandPlotKeypair = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .buyLand({
          purchaseStartX: parcel.x,
          purchaseStartY: parcel.y,
          purchaseWidth: parcel.width,
          purchaseHeight: parcel.height,
        })
        .accounts({
          originalPlot: parcel.publicKey,
          newPlot: newLandPlotKeypair.publicKey,
          buyer: wallet.publicKey,
          currentOwner: parcel.owner,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newLandPlotKeypair])
        .rpc();

      console.log("Land purchased successfully:", tx);
      await fetchLandParcels();
      setSelectedParcel(null);
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Globe2 className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
              Gtopia Land
            </h1>
          </div>
          <WalletMultiButton className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-900/30 to-black p-6 rounded-xl border border-red-900/30"
            >
              <div className="flex items-center space-x-4">
                <Map className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-gray-400">Total Parcels</p>
                  <p className="text-2xl font-bold text-white">
                    {landParcels.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-900/30 to-black p-6 rounded-xl border border-yellow-900/30"
            >
              <div className="flex items-center space-x-4">
                <Coins className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-gray-400">For Sale</p>
                  <p className="text-2xl font-bold text-white">
                    {landParcels.filter((p) => p.status === "for-sale").length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-900/30 to-black p-6 rounded-xl border border-purple-900/30"
            >
              <div className="flex items-center space-x-4">
                <Lock className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-gray-400">Owned Parcels</p>
                  <p className="text-2xl font-bold text-white">
                    {landParcels.filter((p) => p.status === "owned").length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Land Grid and Details */}
          <div className="grid md:grid-cols-[3fr,1fr] gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-gray-800"
            >
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                Land Marketplace
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-10 gap-2">
                  {landParcels.map((parcel: Parcel) => (
                    <motion.div
                      key={parcel.id}
                      className={`
                        ${LAND_COLORS[parcel.status]}
                        h-14 w-14 rounded-lg cursor-pointer
                        transition-all duration-300 ease-in-out
                        ${
                          selectedParcel?.id === parcel.id
                            ? "ring-2 ring-white"
                            : ""
                        }
                      `}
                      onClick={() => setSelectedParcel(parcel)}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {selectedParcel && (
                <motion.div
                  key={selectedParcel.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-gray-800"
                >
                  <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    Land Details
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-lg">
                      <p className="text-gray-400">Location</p>
                      <p className="text-xl font-bold text-white">
                        ({selectedParcel.x}, {selectedParcel.y})
                      </p>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg">
                      <p className="text-gray-400">Size</p>
                      <p className="text-xl font-bold text-white">
                        {selectedParcel.width} x {selectedParcel.height}
                      </p>
                    </div>
                    {selectedParcel.status === "for-sale" && (
                      <div className="bg-black/50 p-4 rounded-lg">
                        <p className="text-gray-400">Price Per Unit</p>
                        <p className="text-xl font-bold text-white">
                          {selectedParcel.pricePerUnit} SOL
                        </p>
                      </div>
                    )}
                    {selectedParcel.status === "for-sale" && (
                      <motion.button
                        onClick={() => buyLand(selectedParcel)}
                        className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Buy Land
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandMap;

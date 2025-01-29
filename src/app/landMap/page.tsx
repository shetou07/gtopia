/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Program,
  AnchorProvider,
  web3,
  ProgramAccount,
} from "@project-serum/anchor";
import BN from "bn.js";
import { motion } from "framer-motion";
import { Globe2, ShoppingBag, Key, Clock, Lock, MapPin } from "lucide-react";
import idl from "./gtopia_land.json";

const PROGRAM_ID = new web3.PublicKey(
  "d2NAY7hLDwJfxsDG59qFB4sQzFTf7P7Ws6Aj3VdyE6F"
);

const LandMarketplace = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program | null>(null);
  const [myLands, setMyLands] = useState<ProgramAccount[]>([]);
  const [listedLands, setListedLands] = useState<ProgramAccount[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<ProgramAccount | null>(null);
  const [createForm, setCreateForm] = useState({
    startX: "",
    startY: "",
    width: "",
    height: "",
  });
  const [listForm, setListForm] = useState({
    startX: "",
    startY: "",
    width: "",
    height: "",
    price: "",
  });
  const [rentForm, setRentForm] = useState({
    startX: "",
    startY: "",
    width: "",
    height: "",
    price: "",
    duration: "",
  });

  useEffect(() => {
    if (wallet.publicKey && wallet.signTransaction) {
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = new Program(idl as any, PROGRAM_ID, provider);
      setProgram(program as Program);
      fetchLands();
    }
  }, [wallet.publicKey, connection]);

  const fetchLands = async () => {
    if (!program) return;
    try {
      const lands = await program.account.landPlot.all();
      const myLands = lands.filter(
        (land) =>
          wallet.publicKey &&
          (land.account.owner as web3.PublicKey).toString() ===
            wallet.publicKey.toString()
      );
      const listed = lands.filter(
        (land) => land.account.isForSale || land.account.isForRent
      );
      setMyLands(myLands);
      setListedLands(listed);
    } catch (error) {
      console.error("Error fetching lands:", error);
    }
  };

  const createLandPlot = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!program || !wallet.publicKey) return;

    try {
      // Add this line
      const landPlotKeypair = web3.Keypair.generate();

      const tx = await program.methods
        .createLandPlot(
          new BN(createForm.startX),
          new BN(createForm.startY),
          new BN(createForm.width),
          new BN(createForm.height)
        )
        .accounts({
          // Update this line
          landPlot: landPlotKeypair.publicKey,
          creator: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        // Add these lines
        .signers([landPlotKeypair])
        .rpc();

      // Add these lines
      console.log("Transaction signature:", tx);
      await connection.confirmTransaction(tx);

      await fetchLands();
      setCreateForm({ startX: "", startY: "", width: "", height: "" });
    } catch (error) {
      console.error("Error creating land:", error);
    }
  };

  const findMatchingLandPlot = (
    startX: string,
    startY: string,
    width: string,
    height: string
  ) => {
    return myLands.find(
      (land) =>
        land.account.startX.toString() === startX &&
        land.account.startY.toString() === startY &&
        land.account.width.toString() === width &&
        land.account.height.toString() === height
    );
  };

  const listForSale = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!program || !wallet.publicKey) return;

    try {
      // Find the matching land plot
      const matchingPlot = findMatchingLandPlot(
        listForm.startX,
        listForm.startY,
        listForm.width,
        listForm.height
      );

      if (!matchingPlot) {
        console.error("No matching land plot found with these coordinates");
        return;
      }

      console.log("Found matching plot:", matchingPlot.publicKey.toString());

      const tx = await program.methods
        .listForSale(
          new BN(listForm.startX),
          new BN(listForm.startY),
          new BN(listForm.width),
          new BN(listForm.height),
          new BN(listForm.price)
        )
        .accounts({
          landPlot: matchingPlot.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      console.log("List for sale transaction signature:", tx);
      await connection.confirmTransaction(tx);
      await fetchLands();
      setListForm({ startX: "", startY: "", width: "", height: "", price: "" });
    } catch (error) {
      console.error("Error listing land:", error);
    }
  };

  // Update the listForRent function
  const listForRent = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!program || !wallet.publicKey) return;

    try {
      // Find the matching land plot
      const matchingPlot = findMatchingLandPlot(
        rentForm.startX,
        rentForm.startY,
        rentForm.width,
        rentForm.height
      );

      if (!matchingPlot) {
        console.error("No matching land plot found with these coordinates");
        return;
      }

      console.log(
        "Found matching plot for rent:",
        matchingPlot.publicKey.toString()
      );

      const tx = await program.methods
        .listForRent(
          new BN(rentForm.startX),
          new BN(rentForm.startY),
          new BN(rentForm.width),
          new BN(rentForm.height),
          new BN(rentForm.price)
        )
        .accounts({
          landPlot: matchingPlot.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      console.log("List for rent transaction signature:", tx);
      await connection.confirmTransaction(tx);
      await fetchLands();
      setRentForm({
        startX: "",
        startY: "",
        width: "",
        height: "",
        price: "",
        duration: "",
      });
    } catch (error) {
      console.error("Error listing land for rent:", error);
    }
  };

  const buyLand = async (land: ProgramAccount) => {
    if (!program || !wallet.publicKey) return;

    try {
      const newPlotKeypair = web3.Keypair.generate();

      const tx = await program.methods
        .buyLand(
          land.account.saleStartX,
          land.account.saleStartY,
          land.account.saleWidth,
          land.account.saleHeight
        )
        .accounts({
          originalPlot: land.publicKey,
          newPlot: newPlotKeypair.publicKey,
          buyer: wallet.publicKey,
          currentOwner: land.account.owner,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([newPlotKeypair])
        .rpc();

      console.log("Buy transaction signature:", tx);
      await connection.confirmTransaction(tx);
      await fetchLands();
    } catch (error) {
      console.error("Error buying land:", error);
    }
  };

  const rentLand = async (land: ProgramAccount) => {
    if (!program || !wallet.publicKey) return;

    try {
      const tx = await program.methods
        .rentLand(
          land.account.rentalStartX,
          land.account.rentalStartY,
          land.account.rentalWidth,
          land.account.rentalHeight,
          new BN(rentForm.duration || "30") // default 30 days if not specified
        )
        .accounts({
          landPlot: land.publicKey,
          renter: wallet.publicKey,
          owner: land.account.owner,
        })
        .rpc();

      console.log("Rent transaction signature:", tx);
      await connection.confirmTransaction(tx);
      await fetchLands();
    } catch (error) {
      console.error("Error renting land:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Globe2 className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold">GTopia Land</h1>
          </div>
          <WalletMultiButton className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full" />
        </div>
      </div>

      <div className="pt-24 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900/30 to-black p-8 rounded-2xl border border-red-900/30 mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Virtual Land Marketplace
            </h2>
            <p className="text-xl text-gray-300">
              Own, trade, and rent premium virtual real estate in the GTopia
              metaverse.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Land Plot */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-purple-900/30 to-black p-8 rounded-2xl border border-purple-900/30 h-[350px] flex flex-col"
            >
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-purple-500 mr-3" />
                <h3 className="text-2xl font-bold">Create Land Plot</h3>
              </div>
              <form onSubmit={createLandPlot} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Start X"
                    value={createForm.startX}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, startX: e.target.value })
                    }
                    className="bg-black/50 border border-purple-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Start Y"
                    value={createForm.startY}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, startY: e.target.value })
                    }
                    className="bg-black/50 border border-purple-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={createForm.width}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, width: e.target.value })
                    }
                    className="bg-black/50 border border-purple-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={createForm.height}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, height: e.target.value })
                    }
                    className="bg-black/50 border border-purple-900 rounded-lg p-3 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition"
                >
                  Create Plot
                </button>
              </form>
            </motion.div>

            {/* My Lands */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-blue-900/30 to-black p-8 rounded-2xl border border-blue-900/30 h-[350px] flex flex-col"
            >
              <div className="flex items-center mb-6">
                <Key className="w-6 h-6 text-blue-500 mr-3" />
                <h3 className="text-2xl font-bold">My Lands</h3>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1">
                {myLands.map((land, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-black/50 border border-blue-900/50 rounded-lg p-4 ${
                      selectedPlot?.publicKey.toString() ===
                      land.publicKey.toString()
                        ? "border-2 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedPlot(land);
                      // Auto-fill both sale and rent forms when a plot is selected
                      const plotData = {
                        startX: land.account.startX.toString(),
                        startY: land.account.startY.toString(),
                        width: land.account.width.toString(),
                        height: land.account.height.toString(),
                      };

                      setListForm({
                        ...plotData,
                        price: "",
                      });

                      setRentForm({
                        ...plotData,
                        price: "",
                        duration: "",
                      });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-blue-400">Plot #{index + 1}</p>
                        <p className="text-sm text-gray-400">
                          {land.account.width.toString()}x
                          {land.account.height.toString()} at (
                          {land.account.startX.toString()},{" "}
                          {land.account.startY.toString()})
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {land.account.isForSale && (
                          <span className="bg-green-900/50 text-green-400 text-sm px-2 py-1 rounded">
                            For Sale
                          </span>
                        )}
                        {land.account.isForRent && (
                          <span className="bg-yellow-900/50 text-yellow-400 text-sm px-2 py-1 rounded">
                            For Rent
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* List For Sale */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-green-900/30 to-black p-8 rounded-2xl border border-green-900/30 h-[350px] flex flex-col"
            >
              <div className="flex items-center mb-6">
                <ShoppingBag className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-2xl font-bold">List For Sale</h3>
              </div>
              <form onSubmit={listForSale} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Start X"
                    value={listForm.startX}
                    onChange={(e) =>
                      setListForm({ ...listForm, startX: e.target.value })
                    }
                    className="bg-black/50 border border-green-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Start Y"
                    value={listForm.startY}
                    onChange={(e) =>
                      setListForm({ ...listForm, startY: e.target.value })
                    }
                    className="bg-black/50 border border-green-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={listForm.width}
                    onChange={(e) =>
                      setListForm({ ...listForm, width: e.target.value })
                    }
                    className="bg-black/50 border border-green-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={listForm.height}
                    onChange={(e) =>
                      setListForm({ ...listForm, height: e.target.value })
                    }
                    className="bg-black/50 border border-green-900 rounded-lg p-3 text-white"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Price per unit"
                  value={listForm.price}
                  onChange={(e) =>
                    setListForm({ ...listForm, price: e.target.value })
                  }
                  className="w-full bg-black/50 border border-green-900 rounded-lg p-3 text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
                >
                  List Plot
                </button>
              </form>
            </motion.div>

            {/* List For Rent */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-yellow-900/30 to-black p-8 rounded-2xl border border-yellow-900/30 h-[350px] flex flex-col"
            >
              <div className="flex items-center mb-6">
                <Clock className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-2xl font-bold">List For Rent</h3>
              </div>
              <form onSubmit={listForRent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Start X"
                    value={rentForm.startX}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, startX: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Start Y"
                    value={rentForm.startY}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, startY: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={rentForm.width}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, width: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={rentForm.height}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, height: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price per unit"
                    value={rentForm.price}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, price: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Duration (days)"
                    value={rentForm.duration}
                    onChange={(e) =>
                      setRentForm({ ...rentForm, duration: e.target.value })
                    }
                    className="bg-black/50 border border-yellow-900 rounded-lg p-3 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full transition"
                >
                  List for Rent
                </button>
              </form>
            </motion.div>

            {/* Marketplace Listings */}
            <motion.div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-red-900/30 to-black p-8 rounded-2xl border border-red-900/30">
              <div className="flex items-center mb-6">
                <ShoppingBag className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-2xl font-bold">Marketplace Listings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listedLands.map((land, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/50 border border-red-900/50 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-red-400">
                          Plot #{index + 1}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Size: {land.account.width.toString()}x
                          {land.account.height.toString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          Location: ({land.account.startX.toString()},{" "}
                          {land.account.startY.toString()})
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {land.account.isForSale && (
                          <span className="bg-green-900/50 text-green-400 text-sm px-3 py-1 rounded-full">
                            For Sale
                          </span>
                        )}
                        {land.account.isForRent && (
                          <span className="bg-yellow-900/50 text-yellow-400 text-sm px-3 py-1 rounded-full">
                            For Rent
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {land.account.isForSale && (
                        <div>
                          <p className="text-sm text-gray-400">
                            Sale Price per Unit
                          </p>
                          <p className="text-lg font-bold text-white">
                            ◎ {land.account.pricePerUnit.toString()}
                          </p>
                          <button
                            onClick={() => buyLand(land)}
                            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition"
                          >
                            Buy Now
                          </button>
                        </div>
                      )}

                      {land.account.isForRent && (
                        <div>
                          <p className="text-sm text-gray-400">
                            Rental Price per Unit/Day
                          </p>
                          <p className="text-lg font-bold text-white">
                            ◎ {land.account.rentalPrice.toString()}
                          </p>
                          <button
                            onClick={() => rentLand(land)}
                            className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition"
                          >
                            Rent Now
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-12 py-8">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-500 mb-4 md:mb-0">
                  © 2024 GTopia Land. All rights reserved.
                </div>
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Terms
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Support
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandMarketplace;

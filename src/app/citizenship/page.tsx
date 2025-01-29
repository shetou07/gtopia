/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// src/app/citizenship/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IDL from "./gtopia_citizenship.json";
import { AlertCircle, Check, Clock, Crown } from "lucide-react";

const PROGRAM_ID = new PublicKey(
  "FgRcLXK5WsX8BPPhzyBpMtg5sVSCSDBaMN3ARWgxWbuc"
);

const SOL_TO_LAMPORTS = 1000000000; // 1e9

// Define a function to find the state PDA
const findStatePDA = async (programId: PublicKey) => {
  const [statePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("state")],
    PROGRAM_ID
  );
  return statePDA;
};
// Define functions to find citizenship and visa PDAs
const findCitizenshipPDA = async (owner: PublicKey, programId: PublicKey) => {
  const [citizenshipPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("citizenship"), owner.toBuffer()],
    PROGRAM_ID
  );
  return citizenshipPDA;
};

const findVisaPDA = async (owner: PublicKey, programId: PublicKey) => {
  const [visaPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("visa"), owner.toBuffer()],
    PROGRAM_ID
  );
  return visaPDA;
};

const CitizenshipInterface = () => {
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isSenior, setIsSenior] = useState(false);
  const [visaDuration, setVisaDuration] = useState("24");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statePDA, setStatePDA] = useState<PublicKey | null>(null);
  const [prices, setPrices] = useState({
    normalCitizenship: "1000000000", // 1 SOL
    seniorCitizenship: "2000000000", // 2 SOL
    normalVisa: "10000000", // 0.01 SOL per hour
    seniorVisa: "20000000", // 0.02 SOL per hour
  });
  // New state for SOL inputs
  const [solPrices, setSolPrices] = useState({
    normalCitizenship: "1",
    seniorCitizenship: "2",
    normalVisa: "0.01",
    seniorVisa: "0.02",
  });
  // Convert SOL to lamports
  const solToLamports = (sol: string) => {
    try {
      const value = parseFloat(sol);
      if (isNaN(value)) return "0";
      return Math.floor(value * SOL_TO_LAMPORTS).toString();
    } catch {
      return "0";
    }
  };

  // Convert lamports to SOL
  const lamportsToSol = (lamports: string) => {
    try {
      const value = parseInt(lamports);
      if (isNaN(value)) return "0";
      return (value / SOL_TO_LAMPORTS).toString();
    } catch {
      return "0";
    }
  };

  // Handle SOL input changes
  const handleSolPriceChange = (field: any, value: any) => {
    setSolPrices((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update the lamport prices
    setPrices((prev) => ({
      ...prev,
      [field]: solToLamports(value),
    }));
  };

  // Add this helper function at the top of your CitizenshipInterface component
  const handleTransactionError = (error: any) => {
    console.error("Transaction error:", error);

    // Check for specific error types
    if (error.message?.includes("Attempt to debit an account")) {
      return "Insufficient SOL balance in wallet. Please ensure you have enough SOL to complete this transaction.";
    }

    if (error.message?.includes("Transaction simulation failed")) {
      try {
        // Try to parse the error logs
        const logs = error.logs || [];
        if (logs.length > 0) {
          return `Transaction failed: ${logs[logs.length - 1]}`;
        }
      } catch (e) {
        // If parsing fails, return the original error
        return error.message;
      }
    }

    return error.message || "An error occurred during the transaction";
  };

  useEffect(() => {
    const initProvider = async () => {
      if (window.solana?.isPhantom) {
        try {
          await window.solana.connect();
          const connection = new Connection(
            "https://api.devnet.solana.com",
            "confirmed"
          );
          const provider = new AnchorProvider(connection, window.solana, {
            commitment: "confirmed",
          });
          setProvider(provider);

          const program = new Program(IDL as any, PROGRAM_ID, provider);
          setProgram(program);

          // Add these lines:
          const statePDA = await findStatePDA(PROGRAM_ID);
          setStatePDA(statePDA);
        } catch (err) {
          console.error("Failed to initialize provider:", err);
          setError("Failed to connect to wallet");
        }
      }
    };
    initProvider();
  }, []);

  const initialize = async () => {
    setError(null);
    setLoading(true);

    if (!program || !provider) {
      setError("Program not initialized");
      setLoading(false);
      return;
    }

    try {
      // Get the state PDA
      const statePDA = await findStatePDA(program.programId);

      console.log("Initializing with state PDA:", statePDA.toString());
      console.log("Authority:", provider.wallet.publicKey.toString());

      const tx = await program.methods
        .initialize(
          new BN(prices.normalCitizenship),
          new BN(prices.seniorCitizenship),
          new BN(prices.normalVisa),
          new BN(prices.seniorVisa)
        )
        .accounts({
          state: statePDA,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Program initialized! Transaction:", tx);
    } catch (err: any) {
      console.error("Initialization error:", err);
      setError(err.message || "Failed to initialize program");
    } finally {
      setLoading(false);
    }
  };

  // Add error display to your UI
  const ErrorDisplay = () => {
    if (!error) return null;
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  };

  const purchaseCitizenship = async () => {
    setError(null);
    setLoading(true);

    if (!program || !provider || !statePDA) {
      setError("Program not initialized");
      setLoading(false);
      return;
    }

    try {
      const citizenshipPDA = await findCitizenshipPDA(
        provider.wallet.publicKey,
        program.programId
      );

      const price = isSenior
        ? Number(prices.seniorCitizenship)
        : Number(prices.normalCitizenship);

      // Check balance before attempting transaction
      const balance = await provider.connection.getBalance(
        provider.wallet.publicKey
      );
      if (balance < price) {
        setError(
          `Insufficient SOL balance. You need ${price / 1e9} SOL but have ${
            balance / 1e9
          } SOL. Wallet address: ${provider.wallet.publicKey.toString()}`
        );
        setLoading(false);
        return;
      }

      await program.methods
        .purchaseCitizenship(isSenior)
        .accounts({
          state: statePDA,
          citizenship: citizenshipPDA,
          authority: provider.wallet.publicKey,
          payer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Citizenship purchased successfully!");
    } catch (err: any) {
      setError(handleTransactionError(err));
    } finally {
      setLoading(false);
    }
  };

  const purchaseVisa = async () => {
    setError(null);
    setLoading(true);

    if (!program || !provider || !statePDA) {
      setError("Program not initialized");
      setLoading(false);
      return;
    }

    try {
      const visaPDA = await findVisaPDA(
        provider.wallet.publicKey,
        program.programId
      );

      const pricePerHour = isSenior
        ? Number(prices.seniorVisa)
        : Number(prices.normalVisa);
      const totalPrice = pricePerHour * parseInt(visaDuration);

      // Check balance before attempting transaction
      const balance = await provider.connection.getBalance(
        provider.wallet.publicKey
      );
      if (balance < totalPrice) {
        setError(
          `Insufficient SOL balance. You need ${
            totalPrice / 1e9
          } SOL but have ${balance / 1e9} SOL`
        );
        setLoading(false);
        return;
      }

      await program.methods
        .purchaseVisa(isSenior, new BN(visaDuration))
        .accounts({
          state: statePDA,
          visa: visaPDA,
          authority: provider.wallet.publicKey,
          payer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Visa purchased successfully!");
    } catch (err: any) {
      setError(handleTransactionError(err));
    } finally {
      setLoading(false);
    }
  };

  // Admin section JSX
  const AdminSection = () => (
    <Card className="mt-8 bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl text-yellow-500">
          Administrator Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">
              Normal Citizenship Price (SOL)
            </label>
            <input
              type="number"
              step="0.000000001" // Allow for precise SOL values
              value={solPrices.normalCitizenship}
              onChange={(e) =>
                handleSolPriceChange("normalCitizenship", e.target.value)
              }
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
            />
            <p className="text-xs text-gray-400 mt-1">
              {prices.normalCitizenship} lamports
            </p>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">
              Senior Citizenship Price (SOL)
            </label>
            <input
              type="number"
              step="0.000000001"
              value={solPrices.seniorCitizenship}
              onChange={(e) =>
                handleSolPriceChange("seniorCitizenship", e.target.value)
              }
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
            />
            <p className="text-xs text-gray-400 mt-1">
              {prices.seniorCitizenship} lamports
            </p>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">
              Normal Visa Price (SOL/hour)
            </label>
            <input
              type="number"
              step="0.000000001"
              value={solPrices.normalVisa}
              onChange={(e) =>
                handleSolPriceChange("normalVisa", e.target.value)
              }
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
            />
            <p className="text-xs text-gray-400 mt-1">
              {prices.normalVisa} lamports
            </p>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">
              Senior Visa Price (SOL/hour)
            </label>
            <input
              type="number"
              step="0.000000001"
              value={solPrices.seniorVisa}
              onChange={(e) =>
                handleSolPriceChange("seniorVisa", e.target.value)
              }
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
            />
            <p className="text-xs text-gray-400 mt-1">
              {prices.seniorVisa} lamports
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={initialize}
          disabled={loading}
          className={`w-full ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-bold py-4 px-8 rounded-xl transition duration-300`}
        >
          {loading ? "Initializing..." : "Initialize Program"}
        </motion.button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
            GTOPIA Citizenship Portal
          </h1>
          <p className="text-xl text-gray-300">
            Begin your journey as a citizen of the digital nation
          </p>
        </div>
        <ErrorDisplay />

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Wallet Connection */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">
                Connect Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WalletMultiButton className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-2xl" />
            </CardContent>
          </Card>

          {/* Citizenship Type */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">
                Citizenship Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSenior(false)}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    !isSenior
                      ? "border-red-500 bg-red-500/20"
                      : "border-gray-700 hover:border-red-500/50"
                  }`}
                >
                  <Check
                    className={`w-8 h-8 mb-2 ${
                      !isSenior ? "text-red-500" : "text-gray-600"
                    }`}
                  />
                  <h3 className="text-lg font-bold">Standard</h3>
                  <p className="text-sm text-gray-400">
                    {Number(prices.normalCitizenship) / 1e9} SOL
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSenior(true)}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    isSenior
                      ? "border-yellow-500 bg-yellow-500/20"
                      : "border-gray-700 hover:border-yellow-500/50"
                  }`}
                >
                  <Crown
                    className={`w-8 h-8 mb-2 ${
                      isSenior ? "text-yellow-500" : "text-gray-600"
                    }`}
                  />
                  <h3 className="text-lg font-bold">Senior</h3>
                  <p className="text-sm text-gray-400">
                    {Number(prices.seniorCitizenship) / 1e9} SOL
                  </p>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Citizenship Purchase */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">
                Purchase Citizenship
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Become a permanent citizen of GTOPIA with full governance rights
                and exclusive benefits.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={purchaseCitizenship}
                disabled={loading}
                className={`w-full ${
                  loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                } text-white font-bold py-4 px-8 rounded-xl transition duration-300`}
              >
                {loading ? "Purchasing..." : "Purchase Citizenship"}
              </motion.button>
            </CardContent>
          </Card>

          {/* Visa Purchase */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">
                Purchase Visa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={visaDuration}
                  onChange={(e) => setVisaDuration(e.target.value)}
                  min="1"
                  max="720"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Cost:{" "}
                  {(parseInt(visaDuration) *
                    (isSenior
                      ? Number(prices.seniorVisa)
                      : Number(prices.normalVisa))) /
                    1e9}{" "}
                  SOL
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={purchaseVisa}
                disabled={loading}
                className={`w-full ${
                  loading
                    ? "bg-yellow-400"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } text-white font-bold py-4 px-8 rounded-xl transition duration-300`}
              >
                {loading ? "Purchasing..." : "Purchase Visa"}
              </motion.button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Section */}
        {/* <AdminSection /> */}
      </div>
    </div>
  );
};

export default CitizenshipInterface;

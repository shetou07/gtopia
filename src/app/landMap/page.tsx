// src/app/landMap/page.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor";
import idl from "../../programs/land/target/idl/gtopia_land.json";

// Color mapping for land statuses
const LAND_COLORS = {
  "for-sale": "bg-yellow-500/70 hover:bg-yellow-500",
  "for-rent": "bg-blue-500/70 hover:bg-blue-500",
  owned: "bg-gray-500/30 opacity-50 cursor-not-allowed",
  available: "bg-green-500/70 hover:bg-green-500",
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
    status: "for-sale" | "owned";
    owner: anchor.web3.PublicKey;
    pricePerUnit: number;
  }

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [program, setProgram] = useState<anchor.Program | null>(null);

  const { connection } = useConnection();
  const wallet = useWallet();

  // Initialize Anchor program
  useEffect(() => {
    if (wallet?.publicKey && wallet?.signTransaction && connection) {
      const provider = new anchor.AnchorProvider(
        connection,
        wallet as unknown as anchor.Wallet,
        {
          preflightCommitment: "processed",
        }
      );

      const programId = new anchor.web3.PublicKey(
        "puwD5S1FtQFqhxNTAq7EEjGzz3hoWnyNRHmx4wAZzTo"
      );
      const landProgram = new Program<Idl>(
        idl as unknown as anchor.Idl,
        provider
      );
      setProgram(landProgram);
    }
  }, [wallet, connection]);

  // Define a type for the land plot account based on your IDL
  interface LandPlotAccount {
    owner: anchor.web3.PublicKey;
    startX: anchor.BN;
    startY: anchor.BN;
    width: anchor.BN;
    height: anchor.BN;
    isForSale: boolean;
    pricePerUnit: anchor.BN;
  }

  // Fetch land parcels
  const fetchLandParcels = async () => {
    if (!program) return;

    try {
      const landAccounts = (await (program.account as any)[
        "landPlotAccount"
      ].all()) as {
        publicKey: anchor.web3.PublicKey;
        account: LandPlotAccount;
      }[];

      const parsedParcels = landAccounts.map((account) => ({
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
    }
  };

  useEffect(() => {
    fetchLandParcels();
  }, [program]);

  // Land interaction methods
  const buyLand = async (parcel: any) => {
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
          currentOwner: parcel.owner, // Use the original owner's public key
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newLandPlotKeypair])
        .rpc();

      console.log("Land purchased:", tx);
      fetchLandParcels();
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  // Render parcel actions
  const renderParcelActions = () => {
    if (!selectedParcel) return null;

    const actionButtons = {
      "for-sale": {
        label: "Buy Land",
        action: () => buyLand(selectedParcel),
        color: "bg-yellow-600",
      },
      owned: {
        label: "Already Owned",
        action: () => {},
        color: "bg-gray-600 cursor-not-allowed",
      },
    };

    const currentAction =
      actionButtons[selectedParcel.status] || actionButtons["owned"];

    return (
      <div className="bg-black/80 p-6 rounded-xl space-y-4">
        <h3 className="text-2xl font-bold text-white">Land Parcel Details</h3>
        <div>
          <p className="text-white">
            Location: ({selectedParcel.x}, {selectedParcel.y})
          </p>
          <p className="text-white">
            Size: {selectedParcel.width} x {selectedParcel.height}
          </p>
          {selectedParcel.pricePerUnit && (
            <p className="text-white">
              Price: {selectedParcel.pricePerUnit} tokens/unit
            </p>
          )}
        </div>
        <motion.button
          onClick={currentAction.action}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full text-white py-3 rounded-lg ${currentAction.color}`}
          disabled={currentAction.color.includes("cursor-not-allowed")}
        >
          {currentAction.label}
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white p-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[3fr,1fr] gap-8">
        <div className="bg-gray-900/50 rounded-2xl p-6">
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Gtopia Land
          </h2>
          <div className="grid grid-cols-10 gap-2">
            {landParcels.map((parcel: Parcel) => (
              <motion.div
                key={parcel.id}
                className={`
                  ${LAND_COLORS[parcel.status]} 
                  h-12 w-12 cursor-pointer rounded-sm
                  transition-all duration-300 ease-in-out
                `}
                onClick={() => setSelectedParcel(parcel)}
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </div>
        </div>

        <div>
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" />
          {renderParcelActions()}
        </div>
      </div>
    </div>
  );
};

export default LandMap;

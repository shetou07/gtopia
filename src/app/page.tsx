/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

// Import your IDL
const IDL = {
  // ... your existing IDL ...
  version: "0.1.0",
  name: "gtopia_land",
  instructions: [
    {
      name: "initializeCountry",
      accounts: [
        { name: "country", isMut: true, isSigner: false },
        { name: "grid", isMut: true, isSigner: false },
        { name: "paymentMint", isMut: false, isSigner: false },
        { name: "treasury", isMut: false, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [{ name: "args", type: { defined: "InitializeCountryArgs" } }],
    },
    {
      name: "purchaseLand",
      accounts: [
        { name: "country", isMut: true, isSigner: false },
        { name: "grid", isMut: true, isSigner: false },
        { name: "landPlot", isMut: true, isSigner: true },
        { name: "buyerToken", isMut: true, isSigner: false },
        { name: "treasuryToken", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "associatedTokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "args", type: { defined: "PurchaseLandArgs" } }],
    },
    {
      name: "splitPlot",
      accounts: [
        { name: "grid", isMut: true, isSigner: false },
        { name: "originalPlot", isMut: true, isSigner: false },
        { name: "newPlot", isMut: true, isSigner: true },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "args", type: { defined: "SplitPlotArgs" } }],
    },
    {
      name: "mergePlots",
      accounts: [
        { name: "grid", isMut: true, isSigner: false },
        { name: "plotA", isMut: true, isSigner: false },
        { name: "plotB", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "CountryState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "width", type: "u64" },
          { name: "height", type: "u64" },
          { name: "totalUnits", type: "u64" },
          { name: "unitsSold", type: "u64" },
          { name: "paymentMint", type: "publicKey" },
          { name: "pricePerUnit", type: "u64" },
          { name: "treasury", type: "publicKey" },
          { name: "regions", type: { vec: { defined: "Region" } } },
        ],
      },
    },
    {
      name: "GridState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "occupiedCoordinates",
            type: { vec: { defined: "CoordinateMapping" } },
          },
          {
            name: "regionPlots",
            type: { vec: { defined: "RegionMapping" } },
          },
        ],
      },
    },
    {
      name: "LandPlot",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "startX", type: "u64" },
          { name: "startY", type: "u64" },
          { name: "width", type: "u64" },
          { name: "height", type: "u64" },
          { name: "isListed", type: "bool" },
          { name: "pricePerUnit", type: "u64" },
          { name: "timestamp", type: "i64" },
          { name: "neighbors", type: { vec: "publicKey" } },
          { name: "regionId", type: "u64" },
        ],
      },
    },
  ],
  types: [
    {
      name: "CoordinateMapping",
      type: {
        kind: "struct",
        fields: [
          { name: "x", type: "u64" },
          { name: "y", type: "u64" },
          { name: "plot", type: "publicKey" },
        ],
      },
    },
    {
      name: "RegionMapping",
      type: {
        kind: "struct",
        fields: [
          { name: "regionId", type: "u64" },
          { name: "plots", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "Region",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "u64" },
          { name: "name", type: "string" },
          { name: "plots", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "InitializeCountryArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "width", type: "u64" },
          { name: "height", type: "u64" },
          { name: "pricePerUnit", type: "u64" },
        ],
      },
    },
    {
      name: "PurchaseLandArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "startX", type: "u64" },
          { name: "startY", type: "u64" },
          { name: "width", type: "u64" },
          { name: "height", type: "u64" },
        ],
      },
    },
    {
      name: "SplitPlotArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "splitX", type: "u64" },
          { name: "splitY", type: "u64" },
          { name: "width", type: "u64" },
          { name: "height", type: "u64" },
        ],
      },
    },
  ],
  events: [
    {
      name: "CountryInitialized",
      fields: [
        { name: "authority", type: "publicKey", index: false },
        { name: "width", type: "u64", index: false },
        { name: "height", type: "u64", index: false },
        { name: "paymentMint", type: "publicKey", index: false },
      ],
    },
    {
      name: "LandPurchased",
      fields: [
        { name: "buyer", type: "publicKey", index: false },
        { name: "plot", type: "publicKey", index: false },
        { name: "startX", type: "u64", index: false },
        { name: "startY", type: "u64", index: false },
        { name: "width", type: "u64", index: false },
        { name: "height", type: "u64", index: false },
        { name: "price", type: "u64", index: false },
      ],
    },
    {
      name: "PlotSplit",
      fields: [
        { name: "originalPlot", type: "publicKey", index: false },
        { name: "newPlot", type: "publicKey", index: false },
        { name: "splitX", type: "u64", index: false },
        { name: "splitY", type: "u64", index: false },
        { name: "width", type: "u64", index: false },
        { name: "height", type: "u64", index: false },
      ],
    },
    {
      name: "PlotsMerged",
      fields: [
        { name: "plotA", type: "publicKey", index: false },
        { name: "plotB", type: "publicKey", index: false },
        { name: "newX", type: "u64", index: false },
        { name: "newY", type: "u64", index: false },
        { name: "newWidth", type: "u64", index: false },
        { name: "newHeight", type: "u64", index: false },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidDimensions",
      msg: "Invalid country dimensions",
    },
    {
      code: 6001,
      name: "OutOfBounds",
      msg: "Land coordinates out of bounds",
    },
    { code: 6002, name: "LandOccupied", msg: "Land is already occupied" },
    { code: 6003, name: "NotOwner", msg: "Not the land owner" },
    { code: 6004, name: "InvalidPlot", msg: "Invalid plot dimensions" },
    { code: 6005, name: "CalculationError", msg: "Calculation error" },
    { code: 6006, name: "InvalidSplit", msg: "Invalid split parameters" },
    { code: 6007, name: "PlotsNotAdjacent", msg: "Plots are not adjacent" },
    {
      code: 6008,
      name: "NonContiguousPlot",
      msg: "Plot is not contiguous",
    },
    { code: 6009, name: "InvalidPayment", msg: "Invalid payment amount" },
    { code: 6010, name: "InsufficientFunds", msg: "Insufficient funds" },
    { code: 6011, name: "InvalidRegion", msg: "Invalid region" },
    { code: 6012, name: "AlreadyListed", msg: "Plot is already listed" },
    { code: 6013, name: "NotListed", msg: "Plot is not listed" },
    { code: 6014, name: "InvalidPrice", msg: "Invalid price" },
  ],
};

// Create a wrapper component for the initialization logic
function InitializeButton() {
  const { publicKey, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const initializeCountry = async () => {
    if (!publicKey || !wallet) {
      setMessage("Please connect wallet first");
      return;
    }

    try {
      setLoading(true);
      setMessage("Initializing country...");

      const connection = new web3.Connection(endpoint);
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as unknown as anchor.Wallet,
        { commitment: "processed" }
      );

      const programId = new web3.PublicKey(
        "4AxDhKc6HoRmtUnjHFup9x6uEyd8byg2EVwZUa9vzSgy"
      );
      const program = new Program(IDL as any, programId, provider);

      // Create PDAs
      const [countryPDA] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("country")],
        program.programId
      );

      const [gridPDA] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("grid")],
        program.programId
      );

      // Create a new SPL token mint
      const paymentMint = await createMint(
        connection,
        provider.wallet as unknown as web3.Keypair,
        provider.wallet.publicKey,
        null,
        6, // 6 decimals
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create treasury token account
      const treasury = await getOrCreateAssociatedTokenAccount(
        connection,
        provider.wallet as unknown as web3.Keypair,
        paymentMint,
        publicKey
      );

      const width = new anchor.BN(100_000);
      const height = new anchor.BN(100_000);
      const pricePerUnit = new anchor.BN(1000000);

      const tx = await program.methods
        .initializeCountry({
          width,
          height,
          pricePerUnit,
        })
        .accounts({
          country: countryPDA,
          grid: gridPDA,
          paymentMint: paymentMint,
          treasury: treasury.address,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setMessage(
        `Success! Transaction: ${tx}\nPayment Mint: ${paymentMint.toBase58()}\nTreasury: ${treasury.address.toBase58()}`
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setMessage(`Error: ${err.toString()}`);
      } else {
        setMessage(`Error: ${String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={initializeCountry}
        disabled={loading || !publicKey}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Initialize Country"}
      </button>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm break-words">{message}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                <div className="max-w-md mx-auto">
                  <div className="divide-y divide-gray-200">
                    <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                      <h1 className="text-2xl font-bold mb-8">
                        Gtopia Land Testing
                      </h1>

                      <div className="mb-8">
                        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
                      </div>

                      <InitializeButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

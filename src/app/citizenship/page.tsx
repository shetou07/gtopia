/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { useEffect, useState } from "react";
import IDL from "../../programs/citizenship/target/idl/gtopia_citizenship.json";

// You'll need to replace this with your actual program ID
const PROGRAM_ID = new PublicKey(
  "FAASs3638wEGwWxhp8EkaDuU2ENV1r4c1nJPN9fHLGtp"
);

const CitizenshipTest = () => {
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program | null>(null);

  // Form states
  const [normalPrice, setNormalPrice] = useState("1000000000"); // 1 SOL
  const [seniorPrice, setSeniorPrice] = useState("2000000000"); // 2 SOL
  const [normalVisaPrice, setNormalVisaPrice] = useState("10000000"); // 0.01 SOL per hour
  const [seniorVisaPrice, setSeniorVisaPrice] = useState("20000000"); // 0.02 SOL per hour
  const [visaDuration, setVisaDuration] = useState("24");
  const [isSenior, setIsSenior] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (window.solana?.isPhantom) {
        await window.solana.connect();
        const connection = new Connection("http://localhost:8899", "confirmed");
        const provider = new AnchorProvider(connection, window.solana, {
          commitment: "confirmed",
        });
        setProvider(provider);

        const program = new Program(IDL as any, PROGRAM_ID, provider);
        setProgram(program);
      } else {
        alert("Please install Phantom wallet!");
      }
    };

    initProvider();
  }, []);

  const initialize = async () => {
    if (!program || !provider) return;

    try {
      const statePDA = Keypair.generate();

      await program.methods
        .initialize(
          new BN(normalPrice),
          new BN(seniorPrice),
          new BN(normalVisaPrice),
          new BN(seniorVisaPrice)
        )
        .accounts({
          state: statePDA.publicKey,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([statePDA])
        .rpc();

      alert("Program initialized!");
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const purchaseCitizenship = async () => {
    if (!program || !provider) return;

    try {
      const citizenshipPDA = Keypair.generate();

      await program.methods
        .purchaseCitizenship(isSenior)
        .accounts({
          state: program.programId, // You'll need to fetch the actual state PDA
          citizenship: citizenshipPDA.publicKey,
          authority: provider.wallet.publicKey,
          payer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([citizenshipPDA])
        .rpc();

      alert("Citizenship purchased!");
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const purchaseVisa = async () => {
    if (!program || !provider) return;

    try {
      const visaPDA = Keypair.generate();

      await program.methods
        .purchaseVisa(isSenior, new BN(visaDuration))
        .accounts({
          state: program.programId, // You'll need to fetch the actual state PDA
          visa: visaPDA.publicKey,
          authority: provider.wallet.publicKey,
          payer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([visaPDA])
        .rpc();

      alert("Visa purchased!");
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Citizenship Program Tester</h1>

      <div className="mb-6">
        <h2 className="text-xl mb-2">Initialize Program</h2>
        <div className="space-y-2">
          <input
            type="text"
            value={normalPrice}
            onChange={(e) => setNormalPrice(e.target.value)}
            placeholder="Normal Citizenship Price (lamports)"
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            value={seniorPrice}
            onChange={(e) => setSeniorPrice(e.target.value)}
            placeholder="Senior Citizenship Price (lamports)"
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            value={normalVisaPrice}
            onChange={(e) => setNormalVisaPrice(e.target.value)}
            placeholder="Normal Visa Price per Hour (lamports)"
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            value={seniorVisaPrice}
            onChange={(e) => setSeniorVisaPrice(e.target.value)}
            placeholder="Senior Visa Price per Hour (lamports)"
            className="block w-full p-2 border rounded"
          />
          <button
            onClick={initialize}
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Initialize
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-2">Purchase Options</h2>
        <div className="space-y-2">
          <label className="block">
            <input
              type="checkbox"
              checked={isSenior}
              onChange={(e) => setIsSenior(e.target.checked)}
              className="mr-2"
            />
            Senior Status
          </label>

          <input
            type="number"
            value={visaDuration}
            onChange={(e) => setVisaDuration(e.target.value)}
            placeholder="Visa Duration (hours)"
            className="block w-full p-2 border rounded"
          />

          <button
            onClick={purchaseCitizenship}
            className="w-full p-2 bg-green-500 text-white rounded"
          >
            Purchase Citizenship
          </button>

          <button
            onClick={purchaseVisa}
            className="w-full p-2 bg-yellow-500 text-white rounded"
          >
            Purchase Visa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenshipTest;

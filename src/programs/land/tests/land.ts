/* eslint-disable @typescript-eslint/no-unused-vars */
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GtopiaLand } from "../target/types/gtopia_land";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from 'chai';

describe("gtopia_land", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GtopiaLand as Program<GtopiaLand>;
  
  // Test accounts
  let gridAccount: anchor.web3.Keypair;
  let buyerToken: anchor.web3.PublicKey;
  let treasuryToken: anchor.web3.PublicKey;
  let mint: anchor.web3.PublicKey;
  let landPlot: anchor.web3.Keypair;
  
  // Constants from the program
  const COUNTRY_WIDTH = 1_000_000;
  const COUNTRY_HEIGHT = 1_000_000;
  const BASE_PRICE_PER_UNIT = 1_000_000;

  before(async () => {
    // Initialize grid state account
    gridAccount = anchor.web3.Keypair.generate();
    const gridSize = 1000000; // Adjust based on your needs
    
    await program.methods
      .initialize()
      .accounts({
        grid: gridAccount.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gridAccount])
      .rpc();

    // Create token mint
    mint = await createMint(
      provider.connection,
      await provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    // Create token accounts
    buyerToken = await createAccount(
      provider.connection,
      await provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    treasuryToken = await createAccount(
      provider.connection,
      await provider.wallet.payer,
      mint,
      program.programId
    );

    // Mint some tokens to buyer
    await mintTo(
      provider.connection,
      await provider.wallet.payer,
      mint,
      buyerToken,
      provider.wallet.publicKey,
      1000000000000 // Large amount for testing
    );
  });

  it("Can purchase land", async () => {
    const landPlot = anchor.web3.Keypair.generate();
    const startX = 100;
    const startY = 100;
    const width = 10;
    const height = 10;

    await program.methods
      .purchaseLand({
        startX: new anchor.BN(startX),
        startY: new anchor.BN(startY),
        width: new anchor.BN(width),
        height: new anchor.BN(height),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: landPlot.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([landPlot])
      .rpc();

    const plot = await program.account.landPlot.fetch(landPlot.publicKey);
    expect(plot.owner.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(plot.startX.toNumber()).to.equal(startX);
    expect(plot.startY.toNumber()).to.equal(startY);
    expect(plot.width.toNumber()).to.equal(width);
    expect(plot.height.toNumber()).to.equal(height);
  });

  it("Can transfer land", async () => {
    const newOwner = anchor.web3.Keypair.generate();
    const landPlot = anchor.web3.Keypair.generate();
    
    // First purchase the land
    await program.methods
      .purchaseLand({
        startX: new anchor.BN(200),
        startY: new anchor.BN(200),
        width: new anchor.BN(10),
        height: new anchor.BN(10),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: landPlot.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([landPlot])
      .rpc();

    // Then transfer it
    await program.methods
      .transferLand({
        amount: new anchor.BN(0), // Amount is not used in the current implementation
      })
      .accounts({
        landPlot: landPlot.publicKey,
        seller: provider.wallet.publicKey,
        buyer: newOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const plot = await program.account.landPlot.fetch(landPlot.publicKey);
    expect(plot.owner.toString()).to.equal(newOwner.publicKey.toString());
  });

  it("Can split land plot", async () => {
    const originalPlot = anchor.web3.Keypair.generate();
    const newPlot = anchor.web3.Keypair.generate();
    
    // First purchase a large plot
    await program.methods
      .purchaseLand({
        startX: new anchor.BN(300),
        startY: new anchor.BN(300),
        width: new anchor.BN(20),
        height: new anchor.BN(20),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: originalPlot.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([originalPlot])
      .rpc();

    // Then split it
    await program.methods
      .splitPlot({
        splitX: new anchor.BN(300),
        splitY: new anchor.BN(300),
        width: new anchor.BN(10),
        height: new anchor.BN(10),
      })
      .accounts({
        grid: gridAccount.publicKey,
        originalPlot: originalPlot.publicKey,
        newPlot: newPlot.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([newPlot])
      .rpc();

    const original = await program.account.landPlot.fetch(originalPlot.publicKey);
    const split = await program.account.landPlot.fetch(newPlot.publicKey);
    
    expect(split.width.toNumber()).to.equal(10);
    expect(split.height.toNumber()).to.equal(10);
    expect(original.width.toNumber()).to.equal(10);
  });

  it("Can merge adjacent plots", async () => {
    const plotA = anchor.web3.Keypair.generate();
    const plotB = anchor.web3.Keypair.generate();
    
    // Purchase first plot
    await program.methods
      .purchaseLand({
        startX: new anchor.BN(400),
        startY: new anchor.BN(400),
        width: new anchor.BN(10),
        height: new anchor.BN(10),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: plotA.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([plotA])
      .rpc();

    // Purchase adjacent plot
    await program.methods
      .purchaseLand({
        startX: new anchor.BN(410),
        startY: new anchor.BN(400),
        width: new anchor.BN(10),
        height: new anchor.BN(10),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: plotB.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([plotB])
      .rpc();

    // Merge the plots
    await program.methods
      .mergePlots()
      .accounts({
        grid: gridAccount.publicKey,
        plotA: plotA.publicKey,
        plotB: plotB.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const mergedPlot = await program.account.landPlot.fetch(plotA.publicKey);
    expect(mergedPlot.width.toNumber()).to.equal(20);
    expect(mergedPlot.height.toNumber()).to.equal(10);
  });

  it("Cannot purchase occupied land", async () => {
    const landPlot1 = anchor.web3.Keypair.generate();
    const landPlot2 = anchor.web3.Keypair.generate();
    const startX = 500;
    const startY = 500;

    // Purchase first plot
    await program.methods
      .purchaseLand({
        startX: new anchor.BN(startX),
        startY: new anchor.BN(startY),
        width: new anchor.BN(10),
        height: new anchor.BN(10),
      })
      .accounts({
        grid: gridAccount.publicKey,
        landPlot: landPlot1.publicKey,
        buyerToken,
        treasuryToken,
        buyer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([landPlot1])
      .rpc();

    // Try to purchase same plot
    try {
      await program.methods
        .purchaseLand({
          startX: new anchor.BN(startX),
          startY: new anchor.BN(startY),
          width: new anchor.BN(10),
          height: new anchor.BN(10),
        })
        .accounts({
          grid: gridAccount.publicKey,
          landPlot: landPlot2.publicKey,
          buyerToken,
          treasuryToken,
          buyer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([landPlot2])
        .rpc();
      
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error.toString()).to.include("Land is already occupied");
    }
  });
});
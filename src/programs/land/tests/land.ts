import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GtopiaLand } from "../target/types/gtopia_land";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import assert from "assert";

describe("gtopia-land", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GtopiaLand as Program<GtopiaLand>;

  // Create keypairs before running tests
  const payer = anchor.web3.Keypair.generate();
  const treasuryWallet = anchor.web3.Keypair.generate();

  // Common variables
  let paymentMint: PublicKey;
  let countryPDA: PublicKey;
  let gridPDA: PublicKey;
  let treasuryToken: PublicKey;
  let buyerToken: PublicKey;

  // Test specific variables
  let landPlotPDA: PublicKey;
  let newPlotPDA: PublicKey;

  before(async () => {
    try {
      // Request airdrop for payer
      const signature = await provider.connection.requestAirdrop(
        payer.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      const latestBlockHash = await provider.connection.getLatestBlockhash();
      await provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

      // Request airdrop for provider wallet
      const signature2 = await provider.connection.requestAirdrop(
        provider.wallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );

      await provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature2,
      });

      // Find PDAs
      [countryPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("country")],
        program.programId
      );

      [gridPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("grid")],
        program.programId
      );

      // Create payment mint
      paymentMint = await createMint(
        provider.connection,
        payer,
        payer.publicKey,
        null,
        6
      );

      // Create treasury token account
      treasuryToken = await createAccount(
        provider.connection,
        payer,
        paymentMint,
        treasuryWallet.publicKey
      );

      // Create buyer token account
      buyerToken = await createAccount(
        provider.connection,
        payer,
        paymentMint,
        provider.wallet.publicKey
      );

      // Mint tokens to buyer
      await mintTo(
        provider.connection,
        payer,
        paymentMint,
        buyerToken,
        payer.publicKey,
        1000000000 // 1000 tokens with 6 decimals
      );
    } catch (err) {
      console.error("Before hook error:", err);
      throw err;
    }
  });

  describe("Initialize Country", () => {
    it("should initialize a new country with valid dimensions", async () => {
      const width = new anchor.BN(100_000);
      const height = new anchor.BN(100_000);
      const pricePerUnit = new anchor.BN(1000000); // 1 token per unit

      try {
        const tx = await program.methods
          .initializeCountry({
            width,
            height,
            pricePerUnit,
          })
          .accounts({
            country: countryPDA,
            grid: gridPDA,
            paymentMint,
            treasury: treasuryWallet.publicKey,
            authority: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([])
          .rpc();

        console.log("Initialize Country transaction:", tx);

        // Verify country state
        const country = await program.account.countryState.fetch(countryPDA);
        assert.ok(country.width.eq(width));
        assert.ok(country.height.eq(height));
        assert.ok(country.pricePerUnit.eq(pricePerUnit));
      } catch (err) {
        console.error("Error:", err);
        throw err;
      }
    });

    it("should fail with invalid dimensions", async () => {
      const width = new anchor.BN(1000);
      const height = new anchor.BN(1000);
      const pricePerUnit = new anchor.BN(1000000);

      try {
        await program.methods
          .initializeCountry({
            width,
            height,
            pricePerUnit,
          })
          .accounts({
            country: countryPDA,
            grid: gridPDA,
            paymentMint,
            treasury: treasuryWallet.publicKey,
            authority: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([])
          .rpc();
        assert.fail("Should have failed with invalid dimensions");
      } catch (err) {
        assert.ok(err.toString().includes("InvalidDimensions"));
      }
    });
  });

  describe("Purchase Land", () => {
    it("should successfully purchase a valid plot", async () => {
      const plotArgs = {
        startX: new anchor.BN(1000),
        startY: new anchor.BN(1000),
        width: new anchor.BN(100),
        height: new anchor.BN(100),
      };

      [landPlotPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("plot"),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from(plotArgs.startX.toString()),
          Buffer.from(plotArgs.startY.toString()),
        ],
        program.programId
      );

      try {
        const tx = await program.methods
          .purchaseLand(plotArgs)
          .accounts({
            country: countryPDA,
            grid: gridPDA,
            landPlot: landPlotPDA,
            buyerToken,
            treasuryToken,
            buyer: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("Purchase Land transaction:", tx);

        // Verify plot state
        const plot = await program.account.landPlot.fetch(landPlotPDA);
        assert.ok(plot.startX.eq(plotArgs.startX));
        assert.ok(plot.startY.eq(plotArgs.startY));
        assert.ok(plot.width.eq(plotArgs.width));
        assert.ok(plot.height.eq(plotArgs.height));
      } catch (err) {
        console.error("Error:", err);
        throw err;
      }
    });

    it("should fail to purchase an already occupied plot", async () => {
      const plotArgs = {
        startX: new anchor.BN(1000),
        startY: new anchor.BN(1000),
        width: new anchor.BN(100),
        height: new anchor.BN(100),
      };

      try {
        await program.methods
          .purchaseLand(plotArgs)
          .accounts({
            country: countryPDA,
            grid: gridPDA,
            landPlot: landPlotPDA,
            buyerToken,
            treasuryToken,
            buyer: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with land occupied error");
      } catch (err) {
        assert.ok(err.toString().includes("LandOccupied"));
      }
    });
  });

  describe("Split Plot", () => {
    it("should successfully split a plot", async () => {
      const splitArgs = {
        splitX: new anchor.BN(1000),
        splitY: new anchor.BN(1000),
        width: new anchor.BN(50),
        height: new anchor.BN(50),
      };

      [newPlotPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("plot"),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from(splitArgs.splitX.toString()),
          Buffer.from(splitArgs.splitY.toString()),
        ],
        program.programId
      );

      try {
        const tx = await program.methods
          .splitPlot(splitArgs)
          .accounts({
            grid: gridPDA,
            originalPlot: landPlotPDA,
            newPlot: newPlotPDA,
            owner: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("Split Plot transaction:", tx);

        // Verify new plot state
        const newPlot = await program.account.landPlot.fetch(newPlotPDA);
        assert.ok(newPlot.startX.eq(splitArgs.splitX));
        assert.ok(newPlot.startY.eq(splitArgs.splitY));
        assert.ok(newPlot.width.eq(splitArgs.width));
        assert.ok(newPlot.height.eq(splitArgs.height));
      } catch (err) {
        console.error("Error:", err);
        throw err;
      }
    });
  });

  describe("Merge Plots", () => {
    it("should successfully merge adjacent plots", async () => {
      try {
        const tx = await program.methods
          .mergePlots()
          .accounts({
            grid: gridPDA,
            plotA: landPlotPDA,
            plotB: newPlotPDA,
            owner: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("Merge Plots transaction:", tx);

        // Verify merged plot state
        const mergedPlot = await program.account.landPlot.fetch(landPlotPDA);
        assert.ok(mergedPlot.width.eq(new anchor.BN(100))); // Original width
        assert.ok(mergedPlot.height.eq(new anchor.BN(100))); // Original height
      } catch (err) {
        console.error("Error:", err);
        throw err;
      }
    });
  });
});

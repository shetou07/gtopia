import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Citizenship } from "../target/types/citizenship";

describe("citizenship", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Citizenship as Program<Citizenship>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});

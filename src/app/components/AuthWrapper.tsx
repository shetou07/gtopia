/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useRouter } from "next/navigation";

// Import your IDL and program ID
const PROGRAM_ID = new PublicKey(
  "FgRcLXK5WsX8BPPhzyBpMtg5sVSCSDBaMN3ARWgxWbuc"
);

const findCitizenshipPDA = async (owner: PublicKey, programId: PublicKey) => {
  const [citizenshipPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("citizenship"), owner.toBuffer()],
    programId
  );
  return citizenshipPDA;
};

const findVisaPDA = async (owner: PublicKey, programId: PublicKey) => {
  const [visaPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("visa"), owner.toBuffer()],
    programId
  );
  return visaPDA;
};

type AuthType = "citizenship" | "visa" | "any";
type UserLevel = "normal" | "senior";
type RequiredAuth = {
  type: AuthType;
  level?: UserLevel;
};

interface AuthStatus {
  isCitizen: boolean;
  isVisaHolder: boolean;
  isSeniorCitizen: boolean;
  isSeniorVisa: boolean;
  visaExpiry?: Date;
}

const AuthWrapper = ({
  children,
  requiredAuth = { type: "any" },
  IDL,
}: {
  children: React.ReactNode;
  requiredAuth?: RequiredAuth;
  IDL: any;
}) => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isCitizen: false,
    isVisaHolder: false,
    isSeniorCitizen: false,
    isSeniorVisa: false,
  });

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!connected || !publicKey) {
        setIsAuthorized(false);
        router.push("/citizenship");
        return;
      }

      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );
        const provider = new AnchorProvider(connection, window.solana, {
          commitment: "confirmed",
        });
        const program = new Program(IDL, PROGRAM_ID, provider);

        // Check citizenship status
        const citizenshipPDA = await findCitizenshipPDA(publicKey, PROGRAM_ID);
        let citizenshipStatus = {
          exists: false,
          isSenior: false,
        };

        try {
          const citizenshipAccount = await program.account.citizenship.fetch(
            citizenshipPDA
          );
          citizenshipStatus = {
            exists: true,
            isSenior: (citizenshipAccount as any)?.isSenior || false,
          };
        } catch (e) {
          // Citizenship doesn't exist
        }

        // Check visa status
        const visaPDA = await findVisaPDA(publicKey, PROGRAM_ID);
        let visaStatus = {
          exists: false,
          isSenior: false,
          expiry: null as Date | null,
        };

        try {
          const visaAccount = await program.account.visa.fetch(visaPDA);
          const expiryTime = localStorage.getItem("visaExpiry");
          const expiry = expiryTime ? new Date(expiryTime) : null;
          const isValid = expiry ? expiry.getTime() > Date.now() : false;

          visaStatus = {
            exists: isValid,
            isSenior: (visaAccount as any).isSenior,
            expiry: expiry,
          };
        } catch (e) {
          // Visa doesn't exist or has expired
        }

        // Update auth status
        const newAuthStatus: AuthStatus = {
          isCitizen: citizenshipStatus.exists,
          isVisaHolder: visaStatus.exists,
          isSeniorCitizen: citizenshipStatus.isSenior,
          isSeniorVisa: visaStatus.isSenior,
          visaExpiry: visaStatus.expiry || undefined,
        };

        setAuthStatus(newAuthStatus);

        // Determine authorization based on requirements
        let authorized = false;
        switch (requiredAuth.type) {
          case "citizenship":
            authorized =
              citizenshipStatus.exists &&
              (!requiredAuth.level ||
                (requiredAuth.level === "senior"
                  ? citizenshipStatus.isSenior
                  : true));
            break;
          case "visa":
            authorized =
              visaStatus.exists &&
              (!requiredAuth.level ||
                (requiredAuth.level === "senior" ? visaStatus.isSenior : true));
            break;
          case "any":
            authorized =
              (citizenshipStatus.exists || visaStatus.exists) &&
              (!requiredAuth.level ||
                (citizenshipStatus.exists
                  ? citizenshipStatus.isSenior
                  : visaStatus.isSenior));
            break;
        }

        setIsAuthorized(authorized);

        if (!authorized) {
          router.push("/citizenship");
        } else {
          // Store detailed user status in localStorage
          localStorage.setItem(
            "userStatus",
            JSON.stringify({
              type: citizenshipStatus.exists ? "citizenship" : "visa",
              level:
                (citizenshipStatus.exists && citizenshipStatus.isSenior) ||
                (visaStatus.exists && visaStatus.isSenior)
                  ? "senior"
                  : "normal",
              visaExpiry: visaStatus.expiry,
            })
          );
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
        setIsAuthorized(false);
        router.push("/citizenship");
      }

      setLoading(false);
    };

    checkAuthorization();

    // Set up wallet change listener
    const walletListener = window.solana?.on(
      "accountChanged",
      checkAuthorization
    );

    return () => {
      if (walletListener) {
        window.solana?.removeListener("accountChanged", checkAuthorization);
      }
    };
  }, [connected, publicKey, requiredAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Make auth status available to children through context
  return isAuthorized ? (
    <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>
  ) : null;
};

// Create and export AuthContext for use in child components
export const AuthContext = React.createContext<AuthStatus>({
  isCitizen: false,
  isVisaHolder: false,
  isSeniorCitizen: false,
  isSeniorVisa: false,
});

export const useAuth = () => React.useContext(AuthContext);

export default AuthWrapper;

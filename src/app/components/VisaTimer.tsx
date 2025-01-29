import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface VisaTimerProps {
  expiryTime: string;
}

const VisaTimer: React.FC<VisaTimerProps> = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        router.push("/citizenship");
        return "0:00:00";
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, router]);

  return (
    <div className="fixed top-24 right-8 bg-gradient-to-r from-red-900/50 to-red-800/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-red-500/30 shadow-lg">
      <Clock className="w-4 h-4 text-red-400" />
      <span className="font-mono text-red-300">{timeLeft}</span>
    </div>
  );
};

export default VisaTimer;

// src/app/page.tsx

import React from "react";
import GtopiaLanding from "./components/Landing";
// import LandMap from "./landMap/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-blue-900/20 opacity-90"></div>
      <div className="relative z-10 text-center">
        <GtopiaLanding />
        {/* <LandMap /> */}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
}

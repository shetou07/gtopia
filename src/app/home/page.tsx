// src/app/home/page.tsx
"use client";

import HomePage from "./HomePageContent";
import AuthWrapper from "../components/AuthWrapper";
import IDL from "../citizenship/gtopia_citizenship.json";

const HomePageWrapper = () => {
  return (
    <AuthWrapper
      requiredAuth={{ type: "any" }} // Updated to match new interface
      IDL={IDL}
    >
      <HomePage />
    </AuthWrapper>
  );
};

export default HomePageWrapper;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LandingPage } from "./LandingPage";
import { ProfileSetup } from "./ProfileSetup";
import { MainApp } from "./MainApp";
import { PublicTradingProfile } from "./PublicTradingProfile";
import { PublicTradeableCards } from "./PublicTradeableCards";
import { PublicWantList } from "./PublicWantList";

function AuthenticatedApp() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.profiles.getCurrentUserProfile);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <ProfileSetup />;
  }

  return <MainApp />;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public trading profile routes */}
        <Route path="/trade/:username" element={<PublicTradingProfile />} />
        <Route path="/trade/:username/cards" element={<PublicTradeableCards />} />
        <Route path="/trade/:username/wants" element={<PublicWantList />} />
        
        {/* Main app routes */}
        <Route path="/" element={
          <>
            <Unauthenticated>
              <LandingPage />
            </Unauthenticated>
            <Authenticated>
              <AuthenticatedApp />
            </Authenticated>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

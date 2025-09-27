import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import CognitiveTests from "./pages/CognitiveTests";
import TestResults from "./pages/TestResults";
import PuzzleHub from "./pages/PuzzleHub";
import DailyPuzzle from "./pages/DailyPuzzle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="web-health-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/history" element={<History />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/cognitive-tests" element={<CognitiveTests />} />
                <Route path="/test-results/:sessionId" element={<TestResults />} />
                <Route path="/puzzle-hub" element={<PuzzleHub />} />
                <Route path="/daily-puzzle/:puzzleId" element={<DailyPuzzle />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

function Header() {
  const [phone, setPhone] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthState = () => {
    const v = localStorage.getItem("guardian_medics_user");
    setPhone(v);
    
    if (v) {
      const profileData = localStorage.getItem("guardian_medics_user_profile");
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserName(profile.fullName);
      }
    } else {
      setUserName(null);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  // Check auth state when location changes (after navigation)
  useEffect(() => {
    checkAuthState();
  }, [location]);

  // Listen for custom auth state change events
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("guardian_medics_user");
    localStorage.removeItem("guardian_medics_user_profile");
    setPhone(null);
    setUserName(null);
    
    // Dispatch custom event to update header immediately
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">Detect Neural Dementia</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {phone ? (
            <>
              <Link
                to="/my-profile"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My Profile
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Detect Neural Dementia · AI-Powered Health Assessment
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

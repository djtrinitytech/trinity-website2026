import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Teams from "./pages/Teams";
import Gallery from "./pages/Gallery";
import Sponsors from "./pages/Sponsors";
import Leaderboard from "./pages/Leaderboard";
import Registrations from "./pages/Registrations";
import Contact from "./pages/Contact";
import Announcements from "./pages/Announcements";
import "./App.css";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#050b18] text-white selection:bg-[#dc9d4a]/30 selection:text-[#f3cf9b] app-root">
        {/* Global Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col pt-[76px] main-route-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/announcements" element={<Announcements />} />
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

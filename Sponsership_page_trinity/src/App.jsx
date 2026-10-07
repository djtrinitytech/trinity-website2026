import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SponsorshipPage from './pages/SponsorshipPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <SponsorshipPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../utils/useAuth";
import Header from "../components/Header";
import WelcomeModal from "../components/WelcomeModal";
import CryptoPrediction from "../components/CryptoPrediction";
import UserPredictionHistory from "../components/UserPredictionHistory";
import PriceDisplay from "../components/price-display";

export default function HomePage() {
  const { isAuthenticated, refreshConnection } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("predict");
  const [prices, setPrices] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [autoFetch, setAutoFetch] = useState(true);

  // Check if user is new (for welcome modal)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Check wallet connection on mount (only once)
  useEffect(() => {
    if (isAuthenticated) {
      refreshConnection();
    }
  }, []); // Empty dependency array to run only once

  // Fetch current prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        const btcData = data.find((item) => item.symbol === "BTCUSDT");
        const ethData = data.find((item) => item.symbol === "ETHUSDT");

        setPrices({
          btc: {
            current: parseFloat(btcData.lastPrice),
            changePercentage: parseFloat(btcData.priceChangePercent),
          },
          eth: {
            current: parseFloat(ethData.lastPrice),
            changePercentage: parseFloat(ethData.priceChangePercent),
          },
        });

        setPriceLoading(false);
      } catch (error) {
        setPriceError(error.message);
        setPriceLoading(false);
      }
    };

    // Only fetch if auto-fetch is enabled
    if (autoFetch) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000);
      return () => clearInterval(interval);
    }
  }, [autoFetch]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const manualRefresh = async () => {
    setPriceLoading(true);
    setPriceError(null);
    
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      const btcData = data.find((item) => item.symbol === "BTCUSDT");
      const ethData = data.find((item) => item.symbol === "ETHUSDT");

      setPrices({
        btc: {
          current: parseFloat(btcData.lastPrice),
          changePercentage: parseFloat(btcData.priceChangePercent),
        },
        eth: {
          current: parseFloat(ethData.lastPrice),
          changePercentage: parseFloat(ethData.priceChangePercent),
        },
      });

      setPriceLoading(false);
    } catch (error) {
      setPriceError(error.message);
      setPriceLoading(false);
    }
  };

  const tabs = [
    { id: "predict", name: "Make Prediction", icon: "fas fa-brain" },
    { id: "history", name: "My History", icon: "fas fa-history" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Live Market Prices Section */}
          <section className="space-y-6">
            {/* Price controls */}
            <div className="flex justify-end space-x-3">
              {!autoFetch && (
                <button
                  onClick={manualRefresh}
                  disabled={priceLoading}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className={`fas fa-sync-alt mr-2 ${priceLoading ? 'animate-spin' : ''}`}></i>
                  {priceLoading ? 'Refreshing...' : 'Refresh Prices'}
                </button>
              )}
              
              <button
                onClick={() => setAutoFetch(!autoFetch)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  autoFetch
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <i className={`fas ${autoFetch ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                {autoFetch ? 'Pause Auto Updates' : 'Resume Auto Updates'}
              </button>
            </div>
            
            <PriceDisplay
              prices={prices}
              loading={priceLoading}
              error={priceError}
            />
          </section>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1">
            <nav className="flex space-x-1" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === "predict" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    AI-Powered Crypto Prediction
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Use advanced LSTM neural networks to predict Bitcoin and Ethereum prices. 
                    Your predictions are automatically stored on the Skale blockchain for transparency.
                  </p>
                </div>
                <CryptoPrediction />
              </div>
            )}

            {activeTab === "history" && (
              <UserPredictionHistory />
            )}
          </div>
        </div>
      </main>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal} 
      />
    </div>
  );
}
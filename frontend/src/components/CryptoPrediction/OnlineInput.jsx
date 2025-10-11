"use client";
import { useState } from "react";
import { useHistoricalData } from "../../utils/usePrediction";

export default function OnlineInput({ cryptoType, onSequenceUpdate }) {
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  
  const { 
    data: historicalData, 
    isLoading, 
    error, 
    refetch 
  } = useHistoricalData(cryptoType, false);

  const handleFetchData = async () => {
    setIsFetching(true);
    try {
      const result = await refetch();
      if (result.data) {
        onSequenceUpdate(result.data);
        setLastFetched(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const cryptoInfo = {
    btc: { name: "Bitcoin", symbol: "BTC", color: "from-orange-400 to-orange-600" },
    eth: { name: "Ethereum", symbol: "ETH", color: "from-blue-400 to-blue-600" }
  };

  const info = cryptoInfo[cryptoType];
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fetch Online Data
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Automatically fetch the last 60 days of {info.name} price data from CoinGecko
        </p>
      </div>

      {/* Crypto Info Card */}
      <div className={`bg-gradient-to-r ${info.color} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`fab fa-${cryptoType === 'btc' ? 'bitcoin' : 'ethereum'} text-2xl`}></i>
            </div>
            <div>
              <h5 className="text-xl font-bold">{info.name}</h5>
              <p className="text-white/80">{info.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Data Source</p>
            <p className="font-semibold">CoinGecko API</p>
          </div>
        </div>
      </div>

      {/* Fetch Button */}
      <div className="text-center">
        <button
          onClick={handleFetchData}
          disabled={loading}
          className={`px-8 py-4 bg-gradient-to-r ${info.color} text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Fetching Data...
            </div>
          ) : (
            <div className="flex items-center">
              <i className="fas fa-download mr-3"></i>
              Fetch {info.symbol} Price Data
            </div>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <i className="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
            <div>
              <h5 className="font-medium text-red-800 dark:text-red-200">
                Failed to Fetch Data
              </h5>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error.message || 'Unable to fetch historical data from CoinGecko'}
              </p>
            </div>
          </div>
        </div>
      )}

      {historicalData && lastFetched && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex">
            <i className="fas fa-check-circle text-green-500 mr-3 mt-0.5"></i>
            <div>
              <h5 className="font-medium text-green-800 dark:text-green-200">
                Data Successfully Loaded
              </h5>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Fetched {historicalData.length} daily prices for {info.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Last updated: {lastFetched.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          About This Data
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Fetches last 60 days of daily closing prices</li>
          <li>• Data is sourced from CoinGecko's free API</li>
          <li>• Prices are in USD</li>
          <li>• Data is automatically formatted for AI prediction</li>
        </ul>
      </div>
    </div>
  );
}
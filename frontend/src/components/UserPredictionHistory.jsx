"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../utils/useAuth";
import { predictionStorage } from "../utils/predictionStorage";

export default function UserPredictionHistory() {
  const { user, isAuthenticated } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPredictions();
    }
  }, [isAuthenticated, user]);

  // Listen for prediction updates
  useEffect(() => {
    const handlePredictionUpdate = () => {
      if (user?.address) {
        loadPredictions();
      }
    };

    // Listen for custom events from the prediction storage
    window.addEventListener('predictionSaved', handlePredictionUpdate);
    
    return () => {
      window.removeEventListener('predictionSaved', handlePredictionUpdate);
    };
  }, [user?.address]);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      console.log('UserPredictionHistory debug:', {
        isAuthenticated,
        user,
        userAddress: user?.address
      });

      if (!user?.address) {
        console.log('No user address - clearing predictions');
        setPredictions([]);
        setStats(null);
        return;
      }

      // Load predictions from local storage
      const userPredictions = predictionStorage.getUserPredictions(user.address);
      const userStats = predictionStorage.getUserStats(user.address);
      
      console.log('Loaded predictions for', user.address, ':', {
        count: userPredictions.length,
        predictions: userPredictions,
        stats: userStats
      });
      
      setPredictions(userPredictions);
      setStats(userStats);
    } catch (error) {
      console.error("Failed to load predictions:", error);
      setPredictions([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHash = (hash) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getAccuracyColor = (prediction) => {
    if (prediction.accuracy !== null) {
      if (prediction.accuracy >= 95) return "text-green-600";
      if (prediction.accuracy >= 85) return "text-yellow-600";
      return "text-red-600";
    }
    // If no accuracy but has valid prediction, show as completed (blue)
    if (prediction.prediction && prediction.prediction > 0) {
      return "text-blue-600";
    }
    // Truly pending
    return "text-gray-500";
  };

  const getAccuracyIcon = (prediction) => {
    if (prediction.accuracy !== null) {
      if (prediction.accuracy >= 95) return "fas fa-check-circle";
      if (prediction.accuracy >= 85) return "fas fa-exclamation-circle";
      return "fas fa-times-circle";
    }
    // If no accuracy but has valid prediction, show as completed
    if (prediction.prediction && prediction.prediction > 0) {
      return "fas fa-check";
    }
    // Truly pending
    return "fas fa-clock";
  };

  const filteredAndSortedPredictions = predictions
    .filter(pred => filterBy === "all" || pred.crypto_type === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at) - new Date(a.created_at);
        case "accuracy":
          const accA = a.accuracy || 0;
          const accB = b.accuracy || 0;
          return accB - accA;
        case "crypto":
          return a.crypto_type.localeCompare(b.crypto_type);
        default:
          return 0;
      }
    });

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-lock text-white text-2xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Sign In Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please sign in with your wallet to view your prediction history
        </p>
        <a
          href="/account/signin"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          <i className="fas fa-wallet mr-2"></i>
          Sign In with MetaMask
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Prediction History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connected: {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-6)}` : 'Not connected'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {predictions.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all your prediction history? This cannot be undone.')) {
                  predictionStorage.clearUserPredictions(user.address);
                  loadPredictions();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear All
            </button>
          )}
          
          <button
            onClick={loadPredictions}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.total}</div>
            <div className="text-sm text-blue-700 dark:text-blue-400">Total Predictions</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.completed}</div>
            <div className="text-sm text-green-700 dark:text-green-400">Completed</div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.pending}</div>
            <div className="text-sm text-gray-700 dark:text-gray-400">Processing</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {stats.avgAccuracy ? `${stats.avgAccuracy.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-400">Avg Accuracy</div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Crypto
          </label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Cryptocurrencies</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Date (Newest First)</option>
            <option value="accuracy">Accuracy</option>
            <option value="crypto">Cryptocurrency</option>
          </select>
        </div>
      </div>

      {/* Predictions List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading predictions...</p>
        </div>
      ) : filteredAndSortedPredictions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-gray-400 text-2xl"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Predictions Yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Make your first prediction to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    prediction.crypto_type === 'BTC' 
                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' 
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                  }`}>
                    <i className={`fab fa-${prediction.crypto_type === 'BTC' ? 'bitcoin' : 'ethereum'}`}></i>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {prediction.crypto_type} Prediction
                      </h5>
                      {prediction.input_method && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          prediction.input_method === 'manual' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          prediction.input_method === 'csv' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        }`}>
                          {prediction.input_method.toUpperCase()}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(prediction.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Predicted: {formatPrice(prediction.prediction)}
                      </span>
                      
                      {prediction.actual_price && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Actual: {formatPrice(prediction.actual_price)}
                        </span>
                      )}
                      
                      <code className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {formatHash(prediction.tx_hash)}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${getAccuracyColor(prediction)}`}>
                    <i className={getAccuracyIcon(prediction)}></i>
                    <span className="text-sm font-medium">
                      {prediction.accuracy ? `${prediction.accuracy.toFixed(1)}%` : (prediction.prediction && prediction.prediction > 0 ? 'Completed' : 'Pending')}
                    </span>
                  </div>
                  
                  <a
                    href={`https://giant-half-dual-testnet.explorer.testnet.skalenodes.com/tx/${prediction.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 inline-block"
                  >
                    View Transaction <i className="fas fa-external-link-alt ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
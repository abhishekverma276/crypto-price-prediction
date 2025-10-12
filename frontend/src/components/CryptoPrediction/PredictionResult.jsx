"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../utils/useAuth";
import { predictionStorage } from "../../utils/predictionStorage";
import ErrorDisplay from "../ErrorDisplay";
import LoadingDisplay from "../LoadingDisplay";
import ConfidenceDisplay from "../ConfidenceDisplay";

// Simple icon components as fallbacks
const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default function PredictionResult({ prediction, cryptoType, inputData, inputMethod }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const savedPredictionRef = useRef(null);

  // Save prediction to local storage when a new prediction is received
  useEffect(() => {
    const predictionPrice = prediction?.price || prediction?.prediction;
    const txHash = prediction?.transaction?.hash || prediction?.tx_hash;
    
    // Create a unique key for this prediction to avoid duplicates
    const predictionKey = prediction?.predictionId || `${user?.address}-${cryptoType}-${predictionPrice}-${txHash}`;
    
    // Skip if we've already saved this exact prediction
    if (savedPredictionRef.current === predictionKey) {
      console.log('Skipping duplicate prediction save:', predictionKey);
      return;
    }
    
    if (prediction && user?.address && predictionPrice) {
      const predictionData = {
        crypto_type: cryptoType.toUpperCase(),
        prediction: predictionPrice,
        tx_hash: txHash || null,
        input_method: inputMethod || 'manual',
        input_data: inputData || null
      };

      console.log('Saving prediction:', predictionData);
      const saved = predictionStorage.savePrediction(user.address, predictionData);
      
      if (saved) {
        savedPredictionRef.current = predictionKey;
        console.log('Prediction saved successfully with key:', predictionKey);
      }
    } else {
      console.log('Not saving prediction - missing requirements:', {
        hasPrediction: !!prediction,
        hasUserAddress: !!user?.address,
        hasPrice: !!predictionPrice
      });
    }
  }, [prediction, user?.address, cryptoType, inputMethod]);

  // Reset the saved prediction ref when prediction changes completely
  useEffect(() => {
    if (!prediction) {
      savedPredictionRef.current = null;
    }
  }, [prediction]);

  if (!prediction) return null;

  const cryptoInfo = {
    btc: { name: "Bitcoin", symbol: "BTC", color: "from-orange-400 to-orange-600", icon: "fab fa-bitcoin" },
    eth: { name: "Ethereum", symbol: "ETH", color: "from-blue-400 to-blue-600", icon: "fab fa-ethereum" }
  };

  const info = cryptoInfo[cryptoType] || cryptoInfo.btc;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatHash = (hash) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getExplorerUrl = (hash) => {
    // Updated Skale explorer URL for giant-half-dual-testnet
    return `https://giant-half-dual-testnet.explorer.testnet.skalenodes.com/tx/${hash}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${info.color} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`${info.icon} text-2xl`}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold">Prediction Complete</h3>
              <p className="text-white/80">{info.name} Price Forecast</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Next Day Price</p>
            <p className="text-2xl font-bold">{formatPrice(prediction.price || prediction.prediction)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Price Display */}
        <div className="text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              AI Predicted Price for Tomorrow
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatPrice(prediction.price || prediction.prediction)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {info.symbol}/USD
            </p>
          </div>
        </div>

        {/* Confidence Intervals */}
        {prediction.confidence && (
          <ConfidenceDisplay 
            confidence={prediction.confidence}
            prediction={prediction.price || prediction.prediction}
            cryptoType={cryptoType}
          />
        )}

        {/* Transaction Info */}
        {prediction.tx_hash && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  <i className="fas fa-check-circle mr-2"></i>
                  Stored on Blockchain
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Your prediction has been successfully recorded on the Skale network
                </p>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600 dark:text-green-400">
                    TX Hash:
                  </span>
                  <code className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {formatHash(prediction.tx_hash)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(prediction.tx_hash)}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    title="Copy full hash"
                  >
                    <i className="fas fa-copy text-xs"></i>
                  </button>
                </div>
              </div>
              
              <a
                href={getExplorerUrl(prediction.tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                View on Explorer
              </a>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              Prediction Details
            </span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
          </button>
          
          {isExpanded && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Model Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    LSTM Neural Network
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cryptocurrency</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {prediction.crypto_type || cryptoType.toUpperCase()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Prediction Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Network</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Skale Network
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Disclaimer
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This prediction is generated by an AI model and should not be considered as financial advice. 
                  Cryptocurrency prices are highly volatile and unpredictable.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
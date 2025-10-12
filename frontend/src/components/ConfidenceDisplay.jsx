"use client";
import { useState } from 'react';

// Simple icon components as fallbacks
const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ConfidenceDisplay = ({ confidence, prediction, cryptoType }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!confidence) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const confidenceBarWidth = Math.max(10, Math.min(100, confidence.confidence_score));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Prediction Confidence
          </h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Main Confidence Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            AI Confidence Level
          </span>
          <span className={`text-sm font-medium ${getConfidenceColor(confidence.confidence_score)}`}>
            {getConfidenceLabel(confidence.confidence_score)}
          </span>
        </div>
        
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              confidence.confidence_score >= 80 
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : confidence.confidence_score >= 60
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'  
                : 'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${confidenceBarWidth}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-blue-700 dark:text-blue-300">
          <span>0%</span>
          <span className="font-medium">{confidence.confidence_score.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Prediction Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lower Bound (95%)</p>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            {formatPrice(confidence.confidence_95_lower)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-blue-100 dark:bg-blue-800 rounded-lg border border-blue-300 dark:border-blue-600">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Prediction</p>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {formatPrice(prediction)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Upper Bound (95%)</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatPrice(confidence.confidence_95_upper)}
          </p>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Confidence Intervals
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">80% Range:</span>
                  <span className="font-mono text-blue-900 dark:text-blue-100">
                    {formatPrice(confidence.confidence_80_lower)} - {formatPrice(confidence.confidence_80_upper)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">95% Range:</span>
                  <span className="font-mono text-blue-900 dark:text-blue-100">
                    {formatPrice(confidence.confidence_95_lower)} - {formatPrice(confidence.confidence_95_upper)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Std Deviation:</span>
                  <span className="font-mono text-blue-900 dark:text-blue-100">
                    ±{formatPrice(confidence.std)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Technical Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Samples:</span>
                  <span className="font-mono text-blue-900 dark:text-blue-100">
                    {confidence.num_samples}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Method:</span>
                  <span className="text-blue-900 dark:text-blue-100">
                    {confidence.fallback ? 'Estimated' : 'Monte Carlo'}
                  </span>
                </div>
                {confidence.fallback && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    Using estimated confidence due to model limitations
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Risk Assessment
            </h4>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {confidence.confidence_score >= 80 ? (
                <p>
                  <span className="font-medium text-green-600 dark:text-green-400">Low Risk:</span> 
                  The model shows high confidence in this prediction. However, crypto markets remain inherently volatile.
                </p>
              ) : confidence.confidence_score >= 60 ? (
                <p>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">Medium Risk:</span> 
                  The prediction has moderate confidence. Consider the wider confidence intervals when making decisions.
                </p>
              ) : (
                <p>
                  <span className="font-medium text-red-600 dark:text-red-400">High Risk:</span> 
                  Low confidence prediction. The actual price may vary significantly from the prediction.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
        <strong>Note:</strong> Confidence intervals represent the model's uncertainty, not market guarantees. 
        Cryptocurrency prices are highly volatile and unpredictable.
      </div>
    </div>
  );
};

export default ConfidenceDisplay;
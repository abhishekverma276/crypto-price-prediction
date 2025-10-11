"use client";

export default function PredictButton({ onPredict, isLoading, disabled, onReset }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={onPredict}
            disabled={disabled || isLoading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
              disabled || isLoading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Predicting...
              </div>
            ) : (
              <div className="flex items-center">
                <i className="fas fa-brain mr-3"></i>
                Generate Prediction
              </div>
            )}
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="px-6 py-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            <i className="fas fa-redo mr-2"></i>
            Reset
          </button>
        </div>

        {disabled && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please provide a valid 60-point price sequence to generate prediction
          </p>
        )}

        {isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Processing data through LSTM neural network...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          How It Works
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Advanced LSTM neural network analyzes your price sequence</li>
          <li>• Model predicts the next day's closing price</li>
          <li>• Results are automatically stored on Skale blockchain</li>
          <li>• Transaction hash provided for verification</li>
        </ul>
      </div>
    </div>
  );
}
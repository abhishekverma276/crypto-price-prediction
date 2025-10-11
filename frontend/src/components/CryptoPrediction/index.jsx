"use client";
import { useState } from "react";
import CryptoSelector from "./CryptoSelector";
import InputMethodSelector from "./InputMethodSelector";
import ManualInput from "./ManualInput";
import UploadInput from "./UploadInput";
import OnlineInput from "./OnlineInput";
import ChartPreview from "./ChartPreview";
import PredictButton from "./PredictButton";
import PredictionResult from "./PredictionResult";
import { usePrediction, generateSequenceFromValues } from "../../utils/usePrediction";

export default function CryptoPrediction() {
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [inputMethod, setInputMethod] = useState("manual");
  const [sequence, setSequence] = useState([]);
  const [isSequenceValid, setIsSequenceValid] = useState(false);
  
  const { predict, isLoading, error, lastPrediction, reset } = usePrediction();

  const handleSequenceUpdate = (newSequence) => {
    setSequence(newSequence);
    setIsSequenceValid(newSequence.length === 60 && newSequence.every(val => typeof val === 'number' && val > 0));
  };

  const handlePredict = async () => {
    if (!isSequenceValid) {
      alert('Please provide a valid 60-point sequence');
      return;
    }

    try {
      await predict(selectedCrypto, sequence);
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  const handleReset = () => {
    setSequence([]);
    setIsSequenceValid(false);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Crypto Selector */}
      <CryptoSelector
        selectedCrypto={selectedCrypto}
        onSelect={setSelectedCrypto}
      />

      {/* Input Method Selector */}
      <InputMethodSelector
        selectedMethod={inputMethod}
        onSelect={setInputMethod}
      />

      {/* Input Components */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {inputMethod === "manual" && (
          <ManualInput
            cryptoType={selectedCrypto}
            onSequenceUpdate={handleSequenceUpdate}
            sequence={sequence}
          />
        )}
        
        {inputMethod === "upload" && (
          <UploadInput
            onSequenceUpdate={handleSequenceUpdate}
          />
        )}
        
        {inputMethod === "online" && (
          <OnlineInput
            cryptoType={selectedCrypto}
            onSequenceUpdate={handleSequenceUpdate}
          />
        )}
      </div>

      {/* Chart Preview */}
      {sequence.length > 0 && (
        <ChartPreview
          data={sequence}
          cryptoType={selectedCrypto}
        />
      )}

      {/* Predict Button */}
      <PredictButton
        onPredict={handlePredict}
        isLoading={isLoading}
        disabled={!isSequenceValid}
        onReset={handleReset}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Prediction Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Result */}
      {lastPrediction && (
        <PredictionResult
          prediction={lastPrediction}
          cryptoType={selectedCrypto}
          inputData={sequence}
          inputMethod={inputMethod}
        />
      )}
    </div>
  );
}
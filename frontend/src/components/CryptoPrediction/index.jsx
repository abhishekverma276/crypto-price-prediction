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
import ErrorDisplay from "../ErrorDisplay";
import LoadingDisplay from "../LoadingDisplay";
import EnhancedChart from "../EnhancedChart";
import { usePrediction, generateSequenceFromValues, useBackendHealth } from "../../utils/usePrediction";

export default function CryptoPrediction() {
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [inputMethod, setInputMethod] = useState("manual");
  const [sequence, setSequence] = useState([]);
  const [isSequenceValid, setIsSequenceValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);
  
  const { 
    predict, 
    validateInput, 
    isLoading, 
    error, 
    lastPrediction, 
    predictionHistory, 
    reset,
    errorMessage 
  } = usePrediction();
  
  const { data: backendHealth } = useBackendHealth();

  const handleSequenceUpdate = (newSequence) => {
    setSequence(newSequence);
    
    // Validate the sequence
    const validation = validateInput(newSequence);
    setIsSequenceValid(validation.valid);
    setValidationErrors(validation.valid ? null : validation);
  };

  const handlePredict = async () => {
    if (!isSequenceValid) {
      // Show validation errors instead of alert
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
    setValidationErrors(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Backend Health Status */}
      {backendHealth && !backendHealth.isHealthy && (
        <ErrorDisplay
          error={{
            code: 'BACKEND_UNAVAILABLE',
            message: `Backend service is ${backendHealth.error || 'unavailable'}`,
            getUserFriendlyMessage: () => 'The prediction service is currently unavailable. Please try again later.'
          }}
          className="mb-4"
        />
      )}

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

        {/* Validation Errors */}
        {validationErrors && (
          <ErrorDisplay
            error={{
              code: 'VALIDATION_ERROR',
              message: 'Input validation failed',
              details: { details: validationErrors.errors },
              getUserFriendlyMessage: () => 'Please fix the input data issues below:'
            }}
            className="mt-4"
          />
        )}
      </div>

      {/* Enhanced Chart Preview */}
      {sequence.length > 0 && isSequenceValid && (
        <EnhancedChart
          historicalData={sequence}
          prediction={lastPrediction?.prediction}
          cryptoType={selectedCrypto}
          title="Input Data Analysis"
          showStatistics={true}
          height={350}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <LoadingDisplay 
          message="AI is analyzing your data"
          subMessage={`Generating ${selectedCrypto.toUpperCase()} price prediction...`}
          showProgress={true}
          estimatedTime={5}
        />
      )}

      {/* Predict Button */}
      {!isLoading && (
        <PredictButton
          onPredict={handlePredict}
          isLoading={isLoading}
          disabled={!isSequenceValid}
          onReset={handleReset}
        />
      )}

      {/* Prediction Error */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handlePredict}
          onDismiss={() => reset()}
        />
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
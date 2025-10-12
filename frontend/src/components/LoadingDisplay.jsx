"use client";
import { useState, useEffect } from 'react';

const LoadingDisplay = ({ 
  message = "Processing your request...", 
  subMessage = "",
  showProgress = false,
  estimatedTime = null,
  className = ""
}) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress if estimatedTime is provided
  useEffect(() => {
    if (showProgress && estimatedTime) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (estimatedTime * 10); // Update every 100ms
          return prev < 90 ? prev + increment : prev;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showProgress, estimatedTime]);

  const predictionSteps = [
    "Validating input data",
    "Loading AI model", 
    "Analyzing price patterns",
    "Generating prediction",
    "Storing on blockchain"
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % predictionSteps.length);
      }, 1000);
      return () => clearInterval(stepInterval);
    }
  }, [showProgress]);

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {/* Animated Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      {/* Main Message */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium text-gray-900">
          {message}{dots}
        </h3>
        {subMessage && (
          <p className="mt-1 text-sm text-gray-600">{subMessage}</p>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {predictionSteps[currentStep]}
            </span>
            {estimatedTime && (
              <span className="text-sm text-gray-500">
                ~{estimatedTime}s
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {showProgress && (
        <div className="flex items-center space-x-2 mt-4">
          {predictionSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
              }`}></div>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-16">
                {step.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Estimated completion time */}
      {estimatedTime && (
        <p className="text-xs text-gray-500 mt-3">
          This usually takes {estimatedTime} seconds
        </p>
      )}
    </div>
  );
};

export default LoadingDisplay;
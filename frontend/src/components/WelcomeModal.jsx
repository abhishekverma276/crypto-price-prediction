"use client";
import { useState, useEffect } from "react";

export default function WelcomeModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Crypto Predictor",
      content: "Use advanced LSTM neural networks to predict Bitcoin and Ethereum prices.",
      icon: "fas fa-chart-line"
    },
    {
      title: "Connect Your Wallet",
      content: "Sign in with MetaMask to save your predictions on the blockchain.",
      icon: "fas fa-wallet"
    },
    {
      title: "Input Price Data",
      content: "Enter data manually, upload CSV, or fetch from CoinGecko automatically.",
      icon: "fas fa-upload"
    },
    {
      title: "Get Predictions",
      content: "Our AI models will predict future prices and store results on Skale network.",
      icon: "fas fa-brain"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className={`${steps[currentStep].icon} text-white text-2xl`}></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-500'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}
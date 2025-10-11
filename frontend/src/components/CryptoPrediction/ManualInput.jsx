"use client";
import { useState, useEffect } from "react";

const generateMockData = (cryptoType) => {
  const basePrice = cryptoType === "btc" ? 45000 : 2800;
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 60; i++) {
    const volatility = (Math.random() - 0.5) * 0.05; // ±5% daily volatility
    const trend = Math.sin(i / 10) * 0.002; // Small cyclical trend
    currentPrice = currentPrice * (1 + volatility + trend);
    data.push(parseFloat(currentPrice.toFixed(2)));
  }
  
  return data;
};

export default function ManualInput({ cryptoType, onSequenceUpdate, sequence }) {
  const [values, setValues] = useState(Array(60).fill(""));
  const [errors, setErrors] = useState(Array(60).fill(""));
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(60 / itemsPerPage);

  useEffect(() => {
    if (sequence.length === 60) {
      setValues(sequence.map(val => val.toString()));
    }
  }, [sequence]);

  const validateValue = (value, index) => {
    if (!value.trim()) return "Required";
    const num = parseFloat(value);
    if (isNaN(num)) return "Must be a number";
    if (num <= 0) return "Must be positive";
    return "";
  };

  const handleValueChange = (index, value) => {
    const newValues = [...values];
    const newErrors = [...errors];
    
    newValues[index] = value;
    newErrors[index] = validateValue(value, index);
    
    setValues(newValues);
    setErrors(newErrors);
    
    // Update sequence if all values are valid
    const validValues = newValues.map(val => {
      const num = parseFloat(val);
      return isNaN(num) || num <= 0 ? null : num;
    });
    
    const hasAllValues = validValues.every(val => val !== null);
    if (hasAllValues) {
      onSequenceUpdate(validValues);
    } else {
      onSequenceUpdate([]);
    }
  };

  const handleAutoFill = () => {
    const mockData = generateMockData(cryptoType);
    setValues(mockData.map(val => val.toString()));
    setErrors(Array(60).fill(""));
    onSequenceUpdate(mockData);
  };

  const handleClear = () => {
    setValues(Array(60).fill(""));
    setErrors(Array(60).fill(""));
    onSequenceUpdate([]);
    setCurrentPage(0);
  };

  const getCurrentPageItems = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, 60);
    return { startIndex, endIndex };
  };

  const { startIndex, endIndex } = getCurrentPageItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manual Price Entry
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter 60 consecutive daily prices for {cryptoType.toUpperCase()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAutoFill}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            <i className="fas fa-magic mr-2"></i>
            Auto Fill
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            <i className="fas fa-trash mr-2"></i>
            Clear
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(values.filter(v => v && !validateValue(v)).length / 60) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {values.filter(v => v && !validateValue(v)).length} / 60 values entered
      </p>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: endIndex - startIndex }, (_, i) => {
          const index = startIndex + i;
          return (
            <div key={index} className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Day {index + 1}
              </label>
              <input
                type="number"
                step="0.01"
                value={values[index]}
                onChange={(e) => handleValueChange(index, e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                  errors[index]
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Price"
              />
              {errors[index] && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors[index]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
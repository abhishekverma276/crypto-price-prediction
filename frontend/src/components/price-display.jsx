"use client";
import React, { useState, useEffect } from "react";

function PriceDisplay({ prices, loading, error }) {
  const [chartData, setChartData] = useState({
    btc: Array.from({ length: 24 }).fill(0),
    eth: Array.from({ length: 24 }).fill(0),
  });

  const [animatedPrices, setAnimatedPrices] = useState({
    btc: 0,
    eth: 0
  });

  useEffect(() => {
    if (prices?.btc?.history) {
      setChartData({
        btc: prices.btc.history,
        eth: prices.eth.history,
      });
    }
    
    // Generate mock 24h data for demonstration
    if (prices?.btc?.current) {
      const btcBase = prices.btc.current;
      const ethBase = prices.eth?.current || 3000;
      
      const generateMockData = (basePrice) => {
        return Array.from({ length: 24 }, (_, i) => {
          const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
          return basePrice * (1 + variation);
        });
      };
      
      setChartData({
        btc: generateMockData(btcBase),
        eth: generateMockData(ethBase),
      });
    }
  }, [prices]);

  // Animate price changes
  useEffect(() => {
    if (prices?.btc?.current) {
      const animatePrice = (key, targetPrice) => {
        const startPrice = animatedPrices[key];
        const diff = targetPrice - startPrice;
        const duration = 1000; // 1 second
        const steps = 60; // 60fps
        let currentStep = 0;

        const interval = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          const currentPrice = startPrice + (diff * progress);
          
          setAnimatedPrices(prev => ({
            ...prev,
            [key]: currentPrice
          }));

          if (currentStep >= steps) {
            clearInterval(interval);
          }
        }, duration / steps);
      };

      animatePrice('btc', prices.btc.current);
      if (prices.eth?.current) {
        animatePrice('eth', prices.eth.current);
      }
    }
  }, [prices?.btc?.current, prices?.eth?.current]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num?.toFixed(2);
  };

  const formatPercentage = (percentage) => {
    const value = percentage?.toFixed(2) || 0;
    const isPositive = value >= 0;
    return {
      value: Math.abs(value),
      isPositive,
      className: isPositive ? "text-green-500" : "text-red-500",
      bgClassName: isPositive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      icon: isPositive ? "fas fa-arrow-up" : "fas fa-arrow-down"
    };
  };

  const cryptoData = {
    btc: {
      name: "Bitcoin",
      symbol: "BTC",
      icon: "fab fa-bitcoin",
      gradient: "from-orange-400 via-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconColor: "text-orange-500",
      volume: "2.1B", // Mock data
      marketCap: "1.2T", // Mock data
      rank: 1
    },
    eth: {
      name: "Ethereum", 
      symbol: "ETH",
      icon: "fab fa-ethereum",
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-500",
      volume: "12.5B", // Mock data
      marketCap: "367B", // Mock data
      rank: 2
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
        <div className="flex items-center">
          <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Price Data</h3>
            <p className="text-red-600 text-sm">Please check your connection and try again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["btc", "eth"].map((coin) => {
          const crypto = cryptoData[coin];
          const priceData = prices?.[coin];
          const currentPrice = animatedPrices[coin] || priceData?.current || 0;
          const percentageData = formatPercentage(priceData?.changePercentage);

          return (
            <div
              key={coin}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${crypto.bgGradient} opacity-5`}></div>
              
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="text-gray-600 dark:text-gray-300">Updating...</span>
                  </div>
                </div>
              )}

              <div className="relative p-4 z-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${crypto.gradient} flex items-center justify-center shadow-lg`}>
                      <i className={`${crypto.icon} text-white text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{crypto.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}/USD</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-full">
                          #{crypto.rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 24h Change */}
                  {priceData?.changePercentage && (
                    <div className={`px-2 py-1 rounded-lg border ${percentageData.bgClassName}`}>
                      <div className="flex items-center space-x-1">
                        <i className={`${percentageData.icon} text-xs ${percentageData.className}`}></i>
                        <span className={`text-xs font-semibold ${percentageData.className}`}>
                          {percentageData.value}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {currentPrice ? formatPrice(currentPrice) : "--"}
                  </div>
                  {priceData?.changePercentage && (
                    <div className={`text-xs ${percentageData.className}`}>
                      {percentageData.isPositive ? "+" : "-"}${formatLargeNumber(Math.abs((priceData.current * priceData.changePercentage) / 100))} today
                    </div>
                  )}
                </div>

                {/* Chart */}
                {chartData[coin].length > 0 && chartData[coin].some(val => val > 0) && (
                  <div className="mb-4">
                    <div className="h-16 w-full">
                      <svg viewBox="0 0 100 20" className="w-full h-full">
                        <defs>
                          <linearGradient id={`gradient-${coin}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={coin === 'btc' ? '#f97316' : '#3b82f6'} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={coin === 'btc' ? '#f97316' : '#3b82f6'} stopOpacity="0.05"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Area fill */}
                        <path
                          d={`M 0,20 L ${chartData[coin]
                            .map((price, index) => {
                              const maxPrice = Math.max(...chartData[coin]);
                              const minPrice = Math.min(...chartData[coin]);
                              const normalizedPrice = minPrice === maxPrice ? 10 : 
                                ((price - minPrice) / (maxPrice - minPrice)) * 15 + 2;
                              return `${(index / (chartData[coin].length - 1)) * 100},${20 - normalizedPrice}`;
                            })
                            .join(" L ")} L 100,20 Z`}
                          fill={`url(#gradient-${coin})`}
                        />
                        
                        {/* Line */}
                        <path
                          d={`M ${chartData[coin]
                            .map((price, index) => {
                              const maxPrice = Math.max(...chartData[coin]);
                              const minPrice = Math.min(...chartData[coin]);
                              const normalizedPrice = minPrice === maxPrice ? 10 : 
                                ((price - minPrice) / (maxPrice - minPrice)) * 15 + 2;
                              return `${(index / (chartData[coin].length - 1)) * 100},${20 - normalizedPrice}`;
                            })
                            .join(" L ")}`}
                          fill="none"
                          stroke={coin === 'btc' ? '#f97316' : '#3b82f6'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>24h ago</span>
                      <span>Now</span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Market Cap</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">${crypto.marketCap}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">24h Volume</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">${crypto.volume}</div>
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
    </div>
  );
}

export default PriceDisplay;
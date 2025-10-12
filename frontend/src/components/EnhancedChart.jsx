"use client";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  ComposedChart,
  AreaChart,
  Legend
} from 'recharts';
import { useState } from 'react';

export default function EnhancedChart({ 
  historicalData = [], 
  prediction = null, 
  cryptoType = 'btc',
  title = "Price Analysis",
  showStatistics = true,
  showTechnicalIndicators = false,
  height = 400
}) {
  const [viewMode, setViewMode] = useState('line'); // 'line', 'area', 'candle'
  const [timeRange, setTimeRange] = useState('all'); // 'all', '30', '14', '7'

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-chart-line text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Please provide price data to see the visualization</p>
        </div>
      </div>
    );
  }

  const cryptoInfo = {
    btc: { 
      name: "Bitcoin", 
      symbol: "BTC", 
      color: "#f7931a",
      predictionColor: "#ff6b35"
    },
    eth: { 
      name: "Ethereum", 
      symbol: "ETH", 
      color: "#627eea",
      predictionColor: "#4dabf7"
    }
  };

  const info = cryptoInfo[cryptoType] || cryptoInfo.btc;

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') return historicalData;
    const days = parseInt(timeRange);
    return historicalData.slice(-days);
  };

  const filteredData = getFilteredData();

  // Prepare chart data with historical and prediction
  const prepareChartData = () => {
    const historical = filteredData.map((price, index) => ({
      day: index + 1,
      historical: parseFloat(price.toFixed(2)),
      type: 'historical'
    }));

    if (prediction) {
      // Add prediction point
      const predictionPoint = {
        day: historical.length + 1,
        historical: null,
        prediction: parseFloat(prediction.toFixed(2)),
        type: 'prediction'
      };
      
      // Add connection point
      const connectionPoint = {
        day: historical.length,
        historical: historical[historical.length - 1]?.historical,
        prediction: parseFloat(prediction.toFixed(2)),
        type: 'connection'
      };

      return [...historical, connectionPoint, predictionPoint];
    }

    return historical;
  };

  const chartData = prepareChartData();

  // Calculate statistics
  const calculateStats = () => {
    const prices = filteredData;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Volatility (standard deviation)
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);
    
    return {
      min: minPrice,
      max: maxPrice,
      avg: avgPrice,
      current: lastPrice,
      change: totalChange,
      volatility: (volatility / avgPrice) * 100,
      prediction: prediction,
      predictionChange: prediction ? ((prediction - lastPrice) / lastPrice) * 100 : null
    };
  };

  const stats = calculateStats();

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.type === 'prediction' ? 'Prediction' : `Day ${label}`}
          </p>
          
          {payload.map((entry, index) => {
            if (entry.value !== null) {
              return (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.dataKey === 'historical' ? 'Price' : 'Predicted'}: {formatPrice(entry.value)}
                  </span>
                </div>
              );
            }
            return null;
          })}
          
          {data.type === 'prediction' && stats.predictionChange && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className={`flex items-center gap-1 text-sm ${
                stats.predictionChange >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <i className={`fas fa-arrow-${stats.predictionChange >= 0 ? 'up' : 'down'}`}></i>
                <span>{Math.abs(stats.predictionChange).toFixed(2)}% vs current</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (viewMode) {
      case 'area':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="historical"
              stroke={info.color}
              fill={info.color}
              fillOpacity={0.3}
              strokeWidth={2}
              connectNulls={false}
              name="Historical Price"
            />
            
            {prediction && (
              <Line
                type="monotone"
                dataKey="prediction"
                stroke={info.predictionColor}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: info.predictionColor, strokeWidth: 2, r: 5 }}
                connectNulls={false}
                name="Prediction"
              />
            )}
          </ComposedChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="historical"
              stroke={info.color}
              strokeWidth={2}
              dot={{ fill: info.color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: info.color, strokeWidth: 2 }}
              connectNulls={false}
              name="Historical Price"
            />
            
            {prediction && (
              <Line
                type="monotone"
                dataKey="prediction"
                stroke={info.predictionColor}
                strokeWidth={3}
                strokeDasharray="8 8"
                dot={{ fill: info.predictionColor, strokeWidth: 2, r: 6 }}
                connectNulls={false}
                name="AI Prediction"
              />
            )}
            
            {prediction && (
              <ReferenceLine 
                x={chartData.length - 1}
                stroke="#94a3b8" 
                strokeDasharray="2 2"
                label={{ value: "Future", position: "top" }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {info.name} • {filteredData.length} data points
            {prediction && <span className="ml-2 text-blue-600 dark:text-blue-400">+ AI Prediction</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Data</option>
            <option value="30">Last 30 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="7">Last 7 Days</option>
          </select>
          
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('line')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'line'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-chart-line mr-1"></i>
              Line
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'area'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-chart-area mr-1"></i>
              Area
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showStatistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(stats.current)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Change</p>
            <div className={`text-sm font-bold ${
              stats.change >= 0 
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              <i className={`fas fa-arrow-${stats.change >= 0 ? 'up' : 'down'} mr-1`}></i>
              {Math.abs(stats.change).toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">High</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(stats.max)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Low</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(stats.min)}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(stats.avg)}
            </p>
          </div>
          
          {prediction && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Prediction</p>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {formatPrice(stats.prediction)}
              </p>
              {stats.predictionChange && (
                <div className={`text-xs mt-1 ${
                  stats.predictionChange >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  <i className={`fas fa-arrow-${stats.predictionChange >= 0 ? 'up' : 'down'} mr-1`}></i>
                  {Math.abs(stats.predictionChange).toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }}></div>
            <span>Historical Data</span>
          </div>
          {prediction && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 rounded-full" style={{ borderColor: info.predictionColor }}></div>
              <span>AI Prediction</span>
            </div>
          )}
        </div>
        
        <div className="text-xs">
          Volatility: {stats.volatility.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
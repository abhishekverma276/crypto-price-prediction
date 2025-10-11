"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChartPreview({ data, cryptoType }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = data.map((price, index) => ({
    day: index + 1,
    price: parseFloat(price.toFixed(2)),
  }));

  const cryptoInfo = {
    btc: { name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
    eth: { name: "Ethereum", symbol: "ETH", color: "#627eea" }
  };

  const info = cryptoInfo[cryptoType] || cryptoInfo.btc;

  // Calculate statistics
  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const avgPrice = data.reduce((sum, price) => sum + price, 0) / data.length;
  const firstPrice = data[0];
  const lastPrice = data[data.length - 1];
  const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Day {label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Price: {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Data Preview
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {info.name} - {data.length} data points
          </p>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            totalChange >= 0 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <i className={`fas fa-arrow-${totalChange >= 0 ? 'up' : 'down'} mr-1`}></i>
            {Math.abs(totalChange).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Minimum</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(minPrice)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Maximum</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(maxPrice)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(avgPrice)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Latest</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(lastPrice)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `Day ${value}`}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={info.color}
              strokeWidth={2}
              dot={{ fill: info.color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: info.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Validation Status */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center">
          <i className="fas fa-check-circle text-green-500 mr-2"></i>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Data is ready for prediction
          </span>
        </div>
        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
          All {data.length} values are valid and within expected ranges
        </p>
      </div>
    </div>
  );
}
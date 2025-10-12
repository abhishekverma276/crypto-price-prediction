"use client";
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const SystemStatus = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { data: backendHealth } = useQuery({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/health`);
      return response.json();
    },
    refetchInterval: 30000,
    retry: 1
  });

  const { data: cacheStats } = useQuery({
    queryKey: ['cache-stats'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/cache/stats`);
      return response.json();
    },
    refetchInterval: 10000,
    retry: 1,
    enabled: isVisible
  });

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show System Status"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          System Status
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Backend</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              backendHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-900 dark:text-white">
              {backendHealth?.status === 'healthy' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Model Status */}
        {backendHealth?.models && (
          <div className="space-y-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Models</span>
            {Object.entries(backendHealth.models).map(([crypto, status]) => (
              <div key={crypto} className="flex items-center justify-between pl-2">
                <span className="text-xs text-gray-500 dark:text-gray-500">{crypto}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    status.available ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {status.available ? 'Ready' : 'Error'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blockchain Status */}
        {backendHealth?.blockchain && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Blockchain</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                backendHealth.blockchain.connected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs text-gray-900 dark:text-white">
                {backendHealth.blockchain.connected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        {cacheStats && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Cache</span>
              <span className="text-xs text-gray-900 dark:text-white">
                {cacheStats.cache.entries} entries
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Requests</span>
              <span className="text-xs text-gray-900 dark:text-white">
                {cacheStats.rate_limiter.total_requests}
              </span>
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-1 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-gray-600 dark:text-gray-400">Latency</div>
              <div className="font-medium text-gray-900 dark:text-white">~2.1s</div>
            </div>
            <div className="text-center p-1 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-gray-600 dark:text-gray-400">Uptime</div>
              <div className="font-medium text-gray-900 dark:text-white">99.9%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SystemStatus;
"use client";
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>Crypto Price Predictor</title>
        <meta name="description" content="AI-powered cryptocurrency price prediction using LSTM neural networks" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" sizes="32x32" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
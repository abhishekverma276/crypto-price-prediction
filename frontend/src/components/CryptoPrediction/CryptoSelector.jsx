"use client";

const cryptoOptions = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "fab fa-bitcoin",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-500"
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: "fab fa-ethereum",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500"
  }
];

export default function CryptoSelector({ selectedCrypto, onSelect }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Select Cryptocurrency
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cryptoOptions.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => onSelect(crypto.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedCrypto === crypto.id
                ? `border-transparent bg-gradient-to-r ${crypto.color} text-white shadow-lg`
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedCrypto === crypto.id 
                  ? "bg-white/20" 
                  : `${crypto.bgColor} text-white`
              }`}>
                <i className={`${crypto.icon} text-lg`}></i>
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  selectedCrypto === crypto.id 
                    ? "text-white" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {crypto.name}
                </div>
                <div className={`text-sm ${
                  selectedCrypto === crypto.id 
                    ? "text-white/80" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {crypto.symbol}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
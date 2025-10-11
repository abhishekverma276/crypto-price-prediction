"use client";

const inputMethods = [
  {
    id: "manual",
    name: "Manual Entry",
    description: "Enter 60 price values manually",
    icon: "fas fa-keyboard",
    color: "from-green-400 to-green-600"
  },
  {
    id: "upload",
    name: "CSV Upload",
    description: "Upload a CSV file with price data",
    icon: "fas fa-upload",
    color: "from-purple-400 to-purple-600"
  },
  {
    id: "online",
    name: "Fetch Online",
    description: "Get last 60 days from CoinGecko",
    icon: "fas fa-download",
    color: "from-blue-400 to-blue-600"
  }
];

export default function InputMethodSelector({ selectedMethod, onSelect }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Choose Input Method
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inputMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedMethod === method.id
                ? `border-transparent bg-gradient-to-r ${method.color} text-white shadow-lg`
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                selectedMethod === method.id 
                  ? "bg-white/20" 
                  : "bg-gray-200 dark:bg-gray-600"
              }`}>
                <i className={`${method.icon} text-lg ${
                  selectedMethod === method.id 
                    ? "text-white" 
                    : "text-gray-600 dark:text-gray-300"
                }`}></i>
              </div>
              <div>
                <div className={`font-semibold mb-1 ${
                  selectedMethod === method.id 
                    ? "text-white" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {method.name}
                </div>
                <div className={`text-sm ${
                  selectedMethod === method.id 
                    ? "text-white/80" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {method.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
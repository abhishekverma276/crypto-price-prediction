"use client";
import { useState } from 'react';

// Simple icon components as fallbacks
const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorDisplay = ({ error, onRetry, onDismiss, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!error) return null;

  const getErrorSeverity = (errorCode) => {
    const criticalErrors = ['MODEL_UNAVAILABLE', 'BACKEND_UNAVAILABLE', 'NETWORK_ERROR'];
    const warningErrors = ['VALIDATION_ERROR', 'RATE_LIMITED'];
    
    if (criticalErrors.includes(errorCode)) return 'critical';
    if (warningErrors.includes(errorCode)) return 'warning';
    return 'info';
  };

  const severity = getErrorSeverity(error.code);
  
  const severityStyles = {
    critical: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-100 hover:bg-red-200 text-red-800'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500', 
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
    }
  };

  const styles = severityStyles[severity];
  const IconComponent = severity === 'critical' ? ExclamationTriangleIcon : InformationCircleIcon;

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <IconComponent className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${styles.icon}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm">
                {severity === 'critical' ? 'Prediction Failed' : 
                 severity === 'warning' ? 'Input Issue' : 'Information'}
              </h3>
              <p className="mt-1 text-sm">
                {error.getUserFriendlyMessage ? error.getUserFriendlyMessage() : error.message}
              </p>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-3 flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-5 rounded"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Error Details */}
          {(error.details?.details || error.code) && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-xs px-2 py-1 rounded ${styles.button} transition-colors`}
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>
              
              {isExpanded && (
                <div className="mt-2 p-3 bg-white bg-opacity-50 rounded border text-xs font-mono">
                  <div><strong>Error Code:</strong> {error.code}</div>
                  {error.timestamp && (
                    <div><strong>Time:</strong> {new Date(error.timestamp).toLocaleString()}</div>
                  )}
                  {error.details?.details && Array.isArray(error.details.details) && (
                    <div className="mt-2">
                      <strong>Details:</strong>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {error.details.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`text-sm px-3 py-1 rounded ${styles.button} transition-colors`}
              >
                Try Again
              </button>
            )}
            
            {error.code === 'VALIDATION_ERROR' && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`text-sm px-3 py-1 rounded ${styles.button} transition-colors`}
              >
                Fix Input
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
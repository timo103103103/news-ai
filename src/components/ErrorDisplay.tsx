import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Server, XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'network' | 'validation' | 'server' | 'generic';
  retryLabel?: string;
  dismissible?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  type = 'generic',
  retryLabel = 'Try Again',
  dismissible = true
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'server':
        return <Server className="w-5 h-5 text-red-500" />;
      case 'validation':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'Network Error';
      case 'server':
        return 'Server Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Error';
    }
  };

  const getErrorMessage = () => {
    if (type === 'network') {
      return 'Unable to connect to the analysis server. Please check your internet connection and try again.';
    }
    if (type === 'server') {
      return 'The analysis server is temporarily unavailable. Please try again in a few moments.';
    }
    return error;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getErrorIcon()}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              {getErrorTitle()}
            </h4>
            <p className="text-sm text-red-700">
              {getErrorMessage()}
            </p>
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors ml-2"
            aria-label="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {onRetry && (
        <div className="mt-3 flex items-center space-x-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {retryLabel}
          </button>
          <span className="text-xs text-red-600">
            or try a different input method
          </span>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
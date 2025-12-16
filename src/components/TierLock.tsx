import { Lock, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface TierLockProps {
  feature: string;
  className?: string;
  children?: React.ReactNode;
}

export function TierLock({ feature, className = '', children }: TierLockProps) {
  const { canAccess, getUpgradeMessage, getUpgradeCTA } = useSubscription();
  const navigate = useNavigate();
  
  const hasAccess = canAccess(feature);
  
  // ✅ SECURE: Don't render premium content at all if user doesn't have access
  if (!hasAccess) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 min-h-[300px]">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">Premium Feature</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-md text-center leading-relaxed">
            {getUpgradeMessage(feature)}
          </p>
          <button 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => navigate('/pricing')}
          >
            {getUpgradeCTA(feature)}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }
  
  // ✅ SECURE: Only render actual content if user has access
  return <>{children}</>;
}

interface UpgradeBannerProps {
  feature: string;
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  const { getUpgradeMessage, getUpgradeCTA, canAccess } = useSubscription();
  const navigate = useNavigate();
  
  // Don't show banner if user already has access
  if (canAccess(feature)) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Unlock More Insights</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">{getUpgradeMessage(feature)}</p>
          </div>
        </div>
        <button 
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
          onClick={() => navigate('/pricing')}
        >
          {getUpgradeCTA(feature)}
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
}
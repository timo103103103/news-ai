import { Lock, TrendingUp, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface TierLockProps {
  feature: string;
  className?: string;
  children?: React.ReactNode;
}

export function TierLock({ feature, className = '', children }: TierLockProps) {
  const { canAccess, getUpgradeMessage, getUpgradeCTA } = useSubscription();
  
  const hasAccess = canAccess(feature);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gray-100 bg-opacity-90 rounded-lg flex flex-col items-center justify-center z-10 backdrop-blur-sm">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3 mx-auto">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Premium Feature</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-xs">{getUpgradeMessage(feature)}</p>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            onClick={() => {
              if (typeof (window as any).trackCTAClick === 'function') {
                (window as any).trackCTAClick(`upgrade_${feature}`);
              }
              // Add navigation to pricing page logic here
              // e.g., window.location.href = '/pricing';
            }}
          >
            {getUpgradeCTA(feature)}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
}

interface UpgradeBannerProps {
  feature: string;
  targetTier: 'monthly' | 'premium';
}

export function UpgradeBanner({ feature, targetTier }: UpgradeBannerProps) {
  const { getUpgradeMessage, getUpgradeCTA } = useSubscription();
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Unlock More Insights</h4>
            <p className="text-xs text-blue-700">{getUpgradeMessage(feature)}</p>
          </div>
        </div>
        <button 
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
          onClick={() => {
            if (typeof (window as any).trackCTAClick === 'function') {
              (window as any).trackCTAClick(`upgrade_${feature}_${targetTier}`);
            }
            // Add navigation to pricing page logic here
            // e.g., window.location.href = '/pricing';
          }}
        >
          {getUpgradeCTA(feature)}
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
}
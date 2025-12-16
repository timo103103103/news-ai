import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

interface SubscriptionManagerProps {
  showManageButton?: boolean;
  compact?: boolean;
}

export default function SubscriptionManager({ showManageButton = true, compact = false }: SubscriptionManagerProps) {
  const { tier, billingCycle, scansUsed, scansLimit, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for subscription ID in URL after successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      checkSubscriptionStatus(sessionId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSubscriptionStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/subscription-status?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        await refreshSubscription();
        setSubscriptionId(data.subscriptionId);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (response.ok) {
        await refreshSubscription();
        setSubscriptionId(null);
        alert('Subscription cancelled successfully. You will continue to have access until the end of your billing period.');
      } else {
        alert('Failed to cancel subscription. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling your subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'starter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'business':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" aria-label="Free Tier" />;
      case 'starter':
        return <Zap className="w-4 h-4 text-blue-500" aria-label="Starter Tier" />;
      case 'pro':
        return <Crown className="w-4 h-4 text-purple-500" aria-label="Pro Tier" />;
      case 'business':
        return <Crown className="w-4 h-4 text-amber-500" aria-label="Business Tier" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" aria-label="Free Tier" />;
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'starter':
        return 'Starter';
      case 'pro':
        return 'Pro Analyst';
      case 'business':
        return 'Business';
      case 'free':
      default:
        return 'Free';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getTierIcon(tier)}
        <span className={`text-sm font-medium ${getTierColor(tier).split(' ')[1]}`}>
          {getTierName(tier)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/70 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your subscription plan</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getTierColor(tier)}`}>
          {getTierIcon(tier)}
          <span>{getTierName(tier).toUpperCase()}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
          <span className="font-medium text-gray-900 dark:text-white">{getTierName(tier)}</span>
        </div>

        {billingCycle && tier !== 'free' && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-600 dark:text-gray-400">Billing Cycle</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{billingCycle}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-600 dark:text-gray-400">Scans This Month</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {scansUsed} / {scansLimit}
          </span>
        </div>

        {tier !== 'free' && (
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700 dark:text-green-400">Active</span>
            </div>
          </div>
        )}

        {/* Progress bar for scans */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Scan Usage</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round((scansUsed / scansLimit) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                scansUsed / scansLimit > 0.9 ? 'bg-red-500' :
                scansUsed / scansLimit > 0.7 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((scansUsed / scansLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {showManageButton && (
          <div className="pt-4 space-y-2">
            {tier !== 'business' && (
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                {tier === 'free' ? 'Upgrade to Paid Plan' : 'Upgrade Plan'}
              </button>
            )}
            
            {tier !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {tier === 'free' && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            <strong>Upgrade to unlock advanced features:</strong> Market impact analysis, motive detection, manipulation scoring, and unlimited article reports.
          </p>
        </div>
      )}

      {scansUsed / scansLimit > 0.8 && tier !== 'business' && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Running low on scans!</strong> You've used {scansUsed} of {scansLimit} scans this month. 
            {tier === 'free' && ' Upgrade for more capacity.'} 
            {tier !== 'free' && ' Consider upgrading or purchasing a scan pack.'}
          </p>
        </div>
      )}
    </div>
  );
}
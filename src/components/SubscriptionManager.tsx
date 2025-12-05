import { useState, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionManagerProps {
  showManageButton?: boolean;
  compact?: boolean;
}

export default function SubscriptionManager({ showManageButton = true, compact = false }: SubscriptionManagerProps) {
  const { tier, setTier } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

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
        setTier(data.tier);
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
    
    setLoading(true);
    try {
      // This is a mock. In a real app, this would hit your backend API.
      // const response = await fetch('/api/stripe/cancel-subscription', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ subscriptionId }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = { ok: true }; // Mock success

      if (response.ok) {
        setTier('free');
        setSubscriptionId(null);
        alert('Subscription cancelled successfully. You will continue to have access until the end of your billing period.');
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling your subscription.');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" aria-label="Free Tier" />;
      case 'monthly':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" aria-label="Monthly Tier" />;
      case 'premium':
        return <div className="w-2 h-2 bg-purple-500 rounded-full" aria-label="Premium Tier" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" aria-label="Free Tier" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getTierIcon(tier)}
        <span className={`text-sm font-medium capitalize ${getTierColor(tier).split(' ')[1]}`}>
          {tier}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
            <p className="text-sm text-gray-600">Manage your subscription plan</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
          {tier.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Current Plan</span>
          <span className="font-medium capitalize">{tier}</span>
        </div>

        {tier !== 'free' && (
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700">Active</span>
            </div>
          </div>
        )}

        {showManageButton && (
          <div className="pt-4 space-y-2">
            {tier !== 'premium' && (
              <button
                onClick={() => window.location.href = '/pricing'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                Upgrade Plan
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Upgrade to unlock advanced features:</strong> Full PESTLE analysis, motive heatmaps, and unlimited article reports.
          </p>
        </div>
      )}
    </div>
  );
}
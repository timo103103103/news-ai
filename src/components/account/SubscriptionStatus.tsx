import { useState } from 'react';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

interface SubscriptionDetails {
  plan: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodLast4?: string;
}

interface SubscriptionStatusProps {
  subscription: SubscriptionDetails;
  onRefresh: () => void;
}

const SubscriptionStatus = ({ subscription, onRefresh }: SubscriptionStatusProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const getPlanDetails = (plan: SubscriptionTier) => {
    const plans = {
      free: { name: 'Free Plan', price: '$0', features: ['Basic summaries', 'Limited PESTLE analysis', 'Community support'] },
      monthly: { name: 'Monthly Plan', price: '$9.99', features: ['Full PESTLE analysis', 'Motive analysis', 'Email support'] },
      premium: { name: 'Premium Plan', price: '$19.99', features: ['All Monthly features', 'Party impact analysis', 'Stock impact analysis', 'Manipulation detection', 'Priority support'] },
    };
    return plans[plan];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'trial':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleUpgrade = async (targetPlan: SubscriptionTier) => {
    try {
      setIsUpgrading(true);
      const response = await fetch('/api/account/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (!response.ok) throw new Error('Upgrade failed');
      
      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe checkout
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to initiate upgrade. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const planDetails = getPlanDetails(subscription.plan);
  const renewalDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscription.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{planDetails.name}</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{planDetails.price}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span></p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {subscription.status === 'active' ? 'Renews on' : 'Ends on'} {renewalDate}
            </p>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your subscription will cancel at the end of this billing period
              </p>
            )}
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Plan Features:</h5>
            <ul className="space-y-1">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {subscription.plan === 'free' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Ready to upgrade?</h4>
          <p className="text-blue-700 dark:text-blue-300 mb-4">Unlock advanced features with our paid plans.</p>
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={isUpgrading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{isUpgrading ? 'Processing...' : 'Upgrade to Monthly'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {subscription.plan === 'monthly' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Go Premium!</h4>
          <p className="text-purple-700 dark:text-purple-300 mb-4">Get access to all features including party impact analysis and stock impact tracking.</p>
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={isUpgrading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{isUpgrading ? 'Processing...' : 'Upgrade to Premium'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
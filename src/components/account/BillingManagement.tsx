import { useState } from 'react';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';
import { CreditCard, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface SubscriptionDetails {
  plan: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodLast4?: string;
}

interface BillingManagementProps {
  subscription: SubscriptionDetails;
  onRefresh: () => void;
}

const BillingManagement = ({ subscription, onRefresh }: BillingManagementProps) => {
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleManageBilling = async () => {
    try {
      setIsManagingBilling(true);
      const response = await fetch('/api/account/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create portal session');
      
      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Customer Portal
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsManagingBilling(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      const response = await fetch('/api/account/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      onRefresh(); // Refresh the data
      setShowCancelConfirm(false);
      alert('Your subscription has been canceled. You will continue to have access until the end of your current billing period.');
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  const planNames = {
    free: 'Free Plan',
    monthly: 'Monthly Plan',
    premium: 'Premium Plan'
  };

  const renewalDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Current Billing Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Plan</h4>
            <p className="text-gray-600 dark:text-gray-400">{planNames[subscription.plan]}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Billing Date</h4>
            <p className="text-gray-600 dark:text-gray-400">{renewalDate}</p>
          </div>
          
          {subscription.paymentMethodLast4 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Method</h4>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">•••• {subscription.paymentMethodLast4}</span>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
            <div className="flex items-center space-x-2">
              {subscription.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`text-sm font-medium ${
                subscription.status === 'active' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Actions */}
      <div className="space-y-4">
        <button
          onClick={handleManageBilling}
          disabled={isManagingBilling || subscription.plan === 'free'}
          className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>{isManagingBilling ? 'Loading...' : 'Manage Billing'}</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        {subscription.status === 'active' && subscription.plan !== 'free' && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={isCanceling}
            className="w-full md:w-auto px-6 py-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCanceling ? 'Processing...' : 'Cancel Subscription'}
          </button>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Your subscription is set to cancel on {renewalDate}. You will continue to have access until then.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription? You will continue to have access until {renewalDate}.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCanceling ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
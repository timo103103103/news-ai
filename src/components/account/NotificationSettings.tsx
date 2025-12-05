import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save, X, Check } from 'lucide-react';

interface NotificationSettings {
  email: {
    analysisComplete: boolean;
    subscriptionUpdates: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
  };
  push: {
    enabled: boolean;
    analysisComplete: boolean;
    subscriptionUpdates: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface NotificationSettingsProps {
  userId: string;
}

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      analysisComplete: true,
      subscriptionUpdates: true,
      marketingEmails: false,
      securityAlerts: true,
    },
    push: {
      enabled: false,
      analysisComplete: false,
      subscriptionUpdates: false,
    },
    frequency: 'immediate',
  });
  
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, [userId]);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`/api/account/notifications?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notification settings');
      
      const data = await response.json();
      setSettings(data);
      setOriginalSettings(data);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      // Use default settings if fetch fails
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/account/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, settings }),
      });

      if (!response.ok) throw new Error('Failed to save notification settings');
      
      setOriginalSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
  };

  const updateEmailSetting = (key: keyof typeof settings.email, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value,
      },
    }));
  };

  const updatePushSetting = (key: keyof typeof settings.push, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value,
      },
    }));
  };

  const updateFrequency = (frequency: typeof settings.frequency) => {
    setSettings(prev => ({
      ...prev,
      frequency,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Analysis Complete</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when your analysis is ready</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.analysisComplete}
                onChange={(e) => updateEmailSetting('analysisComplete', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Subscription Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your subscription</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.subscriptionUpdates}
                onChange={(e) => updateEmailSetting('subscriptionUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive product updates and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.marketingEmails}
                onChange={(e) => updateEmailSetting('marketingEmails', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Security Alerts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Important security notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.securityAlerts}
                onChange={(e) => updateEmailSetting('securityAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Push Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.push.enabled}
                onChange={(e) => updatePushSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.push.enabled && (
            <>
              <div className="flex items-center justify-between pl-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Analysis Complete</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get push notifications for completed analyses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.analysisComplete}
                    onChange={(e) => updatePushSetting('analysisComplete', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pl-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Subscription Updates</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Push notifications for subscription changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push.subscriptionUpdates}
                    onChange={(e) => updatePushSetting('subscriptionUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Frequency</h3>
        </div>

        <div className="space-y-3">
          {[
            { value: 'immediate', label: 'Immediate', description: 'Receive notifications as soon as they occur' },
            { value: 'daily', label: 'Daily Digest', description: 'Get a daily summary of notifications' },
            { value: 'weekly', label: 'Weekly Digest', description: 'Receive a weekly summary of notifications' },
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={settings.frequency === option.value}
                onChange={(e) => updateFrequency(e.target.value as typeof settings.frequency)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{option.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {hasChanges && (
        <div className="flex space-x-4">
          <button
            onClick={handleResetSettings}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel Changes</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;